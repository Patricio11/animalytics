import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { heatCycles, heatCycleReminders, animals, heatCycleProgesteroneReadings } from '@/lib/db/schema';
import { tasks } from '@/lib/db/schema/tasks';
import { auth } from '@/lib/auth/config';
import { addDays, format, differenceInDays } from 'date-fns';
import { successResponse, createdResponse, unauthorizedResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api/response';
import { eq, and, desc, count } from 'drizzle-orm';
import { z } from 'zod';
import type { 
  CreateHeatCycleRequest,
  CreateHeatCycleResponse 
} from '@/lib/types/heat-cycle';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createHeatCycleSchema = z.object({
  bitchId: z.string().uuid('Invalid bitch ID'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  breedingMethod: z.enum(['natural_ai', 'frozen']),
});

/**
 * GET /api/heat-cycles
 * Get all heat cycles for the authenticated breeder
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as 'active' | 'completed' | 'cancelled' | null;
    const bitchId = searchParams.get('bitchId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query conditions
    const conditions = [eq(heatCycles.breederId, session.user.id)];
    
    if (status) {
      conditions.push(eq(heatCycles.status, status));
    }
    if (bitchId) {
      conditions.push(eq(heatCycles.bitchId, bitchId));
    }

    // Fetch heat cycles with bitch details
    const cycles = await db
      .select({
        id: heatCycles.id,
        breederId: heatCycles.breederId,
        bitchId: heatCycles.bitchId,
        startDate: heatCycles.startDate,
        endDate: heatCycles.endDate,
        currentDay: heatCycles.currentDay,
        status: heatCycles.status,
        breedingMethod: heatCycles.breedingMethod,
        estimatedOvulationDay: heatCycles.estimatedOvulationDay,
        estimatedOvulationDate: heatCycles.estimatedOvulationDate,
        estimatedWhelpingDate: heatCycles.estimatedWhelpingDate,
        notes: heatCycles.notes,
        createdAt: heatCycles.createdAt,
        updatedAt: heatCycles.updatedAt,
        bitch: {
          id: animals.id,
          name: animals.name,
          breed: animals.breedId,
          profilePhotoUrl: animals.profileImageUrl,
          registeredName: animals.registeredName,
        },
      })
      .from(heatCycles)
      .leftJoin(animals, eq(heatCycles.bitchId, animals.id))
      .where(and(...conditions))
      .orderBy(desc(heatCycles.startDate))
      .limit(limit)
      .offset(offset);

    // Fetch readings for each cycle
    const cyclesWithReadings = await Promise.all(
      cycles.map(async (cycle) => {
        const readings = await db
          .select()
          .from(heatCycleProgesteroneReadings)
          .where(eq(heatCycleProgesteroneReadings.heatCycleId, cycle.id))
          .orderBy(desc(heatCycleProgesteroneReadings.day));

        return {
          ...cycle,
          readings,
        };
      })
    );

    // Get total count
    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(heatCycles)
      .where(and(...conditions));

    return successResponse({
      cycles: cyclesWithReadings,
      total: totalCount,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
    });

  } catch (error) {
    console.error('Error in GET /api/heat-cycles:', error);
    return serverErrorResponse('Failed to fetch heat cycles');
  }
}

/**
 * POST /api/heat-cycles
 * Create a new heat cycle
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createHeatCycleSchema.safeParse(body);
    
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues);
    }

    const { bitchId, startDate, breedingMethod } = validation.data;

    // Verify the bitch belongs to the breeder and is female
    const [animal] = await db
      .select({ id: animals.id, sex: animals.sex })
      .from(animals)
      .where(
        and(
          eq(animals.id, bitchId),
          eq(animals.userId, session.user.id)
        )
      )
      .limit(1);

    if (!animal) {
      return errorResponse('Animal not found or does not belong to you', 404);
    }

    if (animal.sex !== 'female') {
      return validationErrorResponse([{
        field: 'bitchId',
        message: 'Selected animal must be female'
      }]);
    }

    // Check for existing active cycle for this bitch
    const [existingCycle] = await db
      .select({ id: heatCycles.id })
      .from(heatCycles)
      .where(
        and(
          eq(heatCycles.bitchId, bitchId),
          eq(heatCycles.status, 'active')
        )
      )
      .limit(1);

    if (existingCycle) {
      return errorResponse('This bitch already has an active heat cycle', 409);
    }

    // Create heat cycle
    // Always start at Day 1 - currentDay will update when readings are added
    const [heatCycle] = await db
      .insert(heatCycles)
      .values({
        breederId: session.user.id,
        bitchId,
        startDate,
        currentDay: 1, // Always start at Day 1
        status: 'active',
        breedingMethod,
      })
      .returning();

    // Calculate Day 5 reminder date (4 days after start)
    const firstTestDate = addDays(new Date(startDate), 4);

    // Get bitch name for task/reminder
    const [bitchData] = await db
      .select({ name: animals.name })
      .from(animals)
      .where(eq(animals.id, bitchId))
      .limit(1);
    
    const bitchName = bitchData?.name || 'Unknown';

    // Create Day 5 reminder
    try {
      await db.insert(heatCycleReminders).values({
        heatCycleId: heatCycle.id,
        breederId: session.user.id,
        reminderType: 'test_due',
        dueDate: firstTestDate.toISOString().split('T')[0],
        dueTime: '09:00:00',
        title: 'First Progesterone Test Due',
        message: 'Day 5 progesterone test is due for your bitch. This is the first test to establish a baseline.',
        priority: 'high',
        channels: ['email', 'in_app'],
      });
    } catch (reminderError) {
      console.error('Error creating reminder:', reminderError);
      // Don't fail the request, just log the error
    }

    // Create Day 5 task
    try {
      await db.insert(tasks).values({
        userId: session.user.id,
        type: 'event',
        title: `Progesterone Test - ${bitchName} (Day 5)`,
        description: 'First progesterone test to establish baseline. This is crucial for timing breeding.',
        animalId: bitchId,
        dueDate: format(firstTestDate, 'yyyy-MM-dd'),
        dueTime: '09:00',
        priority: 'high',
        notes: `Heat cycle started on ${format(new Date(startDate), 'MMM dd, yyyy')}. Heat Cycle ID: ${heatCycle.id}`,
        taskData: {
          eventType: 'progesterone_test',
          progesteroneTestData: {
            heatCycleId: heatCycle.id,
            cycleDay: 5,
            autoGenerated: true,
          },
        },
      });
    } catch (taskError) {
      console.error('Error creating task:', taskError);
      // Don't fail the request, just log the error
    }

    const response: CreateHeatCycleResponse = {
      heatCycle: {
        id: heatCycle.id,
        breederId: heatCycle.breederId,
        bitchId: heatCycle.bitchId,
        startDate: new Date(heatCycle.startDate),
        currentDay: heatCycle.currentDay,
        status: heatCycle.status,
        breedingMethod: heatCycle.breedingMethod,
        createdAt: new Date(heatCycle.createdAt),
        updatedAt: new Date(heatCycle.updatedAt),
      },
      firstReminderDate: firstTestDate,
    };

    return createdResponse(response);

  } catch (error) {
    console.error('Error in POST /api/heat-cycles:', error);
    return serverErrorResponse('Failed to create heat cycle');
  }
}
