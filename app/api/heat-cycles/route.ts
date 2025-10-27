import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { heatCyclesTable, progesteroneReminders, animals } from '@/lib/db/schema';
import { auth } from '@/lib/auth/config';
import {
  successResponse,
  errorResponse,
  createdResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { eq, and, desc } from 'drizzle-orm';
import { addDays } from 'date-fns';
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
    const conditions = [eq(heatCyclesTable.breederId, session.user.id)];
    
    if (status) {
      conditions.push(eq(heatCyclesTable.status, status));
    }
    if (bitchId) {
      conditions.push(eq(heatCyclesTable.bitchId, bitchId));
    }

    // Fetch heat cycles with bitch details
    const cycles = await db
      .select({
        id: heatCyclesTable.id,
        breederId: heatCyclesTable.breederId,
        bitchId: heatCyclesTable.bitchId,
        startDate: heatCyclesTable.startDate,
        endDate: heatCyclesTable.endDate,
        currentDay: heatCyclesTable.currentDay,
        status: heatCyclesTable.status,
        breedingMethod: heatCyclesTable.breedingMethod,
        estimatedOvulationDay: heatCyclesTable.estimatedOvulationDay,
        estimatedOvulationDate: heatCyclesTable.estimatedOvulationDate,
        estimatedWhelpingDate: heatCyclesTable.estimatedWhelpingDate,
        notes: heatCyclesTable.notes,
        createdAt: heatCyclesTable.createdAt,
        updatedAt: heatCyclesTable.updatedAt,
        bitch: {
          id: animals.id,
          name: animals.name,
          breed: animals.breedId,
          profilePhotoUrl: animals.profileImageUrl,
          registeredName: animals.registeredName,
        },
      })
      .from(heatCyclesTable)
      .leftJoin(animals, eq(heatCyclesTable.bitchId, animals.id))
      .where(and(...conditions))
      .orderBy(desc(heatCyclesTable.startDate))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: db.$count(heatCyclesTable.id) })
      .from(heatCyclesTable)
      .where(and(...conditions));

    return successResponse({
      cycles,
      total: count,
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
      .select({ id: heatCyclesTable.id })
      .from(heatCyclesTable)
      .where(
        and(
          eq(heatCyclesTable.bitchId, bitchId),
          eq(heatCyclesTable.status, 'active')
        )
      )
      .limit(1);

    if (existingCycle) {
      return errorResponse('This bitch already has an active heat cycle', 409);
    }

    // Create heat cycle
    const [heatCycle] = await db
      .insert(heatCyclesTable)
      .values({
        breederId: session.user.id,
        bitchId,
        startDate,
        currentDay: 1,
        status: 'active',
        breedingMethod,
      })
      .returning();

    // Calculate Day 5 reminder date (4 days after start)
    const firstTestDate = addDays(new Date(startDate), 4);

    // Create Day 5 reminder
    try {
      await db.insert(progesteroneReminders).values({
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
