import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { 
  heatCycles, 
  breedingRecords,
  animals,
  heatCycleProgesteroneReadings
} from '@/lib/db/schema';
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
import { differenceInDays } from 'date-fns';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createBreedingRecordSchema = z.object({
  heatCycleId: z.string().uuid('Invalid heat cycle ID'),
  breedingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  breedingMethod: z.enum(['natural', 'ai_fresh', 'ai_chilled', 'ai_frozen', 'tci', 'surgical']),
  studId: z.string().uuid().optional(),
  studName: z.string().optional(),
  studRegistration: z.string().optional(),
  semenQuality: z.string().optional(),
  motility: z.number().int().min(0).max(100).optional(),
  concentration: z.number().optional(),
  progesteroneLevelAtBreeding: z.number().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/breeding-records
 * Fetch breeding records with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const heatCycleId = searchParams.get('heatCycleId');

    // Build where conditions
    const whereConditions = heatCycleId
      ? and(
          eq(breedingRecords.breederId, session.user.id),
          eq(breedingRecords.heatCycleId, heatCycleId)
        )
      : eq(breedingRecords.breederId, session.user.id);

    // Build query
    const records = await db
      .select({
        id: breedingRecords.id,
        heatCycleId: breedingRecords.heatCycleId,
        breedingDate: breedingRecords.breedingDate,
        breedingDay: breedingRecords.breedingDay,
        breedingMethod: breedingRecords.breedingMethod,
        studId: breedingRecords.studId,
        studName: breedingRecords.studName,
        studRegistration: breedingRecords.studRegistration,
        semenQuality: breedingRecords.semenQuality,
        motility: breedingRecords.motility,
        concentration: breedingRecords.concentration,
        progesteroneLevelAtBreeding: breedingRecords.progesteroneLevelAtBreeding,
        notes: breedingRecords.notes,
        createdAt: breedingRecords.createdAt,
        stud: animals,
      })
      .from(breedingRecords)
      .leftJoin(animals, eq(breedingRecords.studId, animals.id))
      .where(whereConditions)
      .orderBy(desc(breedingRecords.breedingDate));

    return successResponse({
      records,
      total: records.length,
    });

  } catch (error) {
    console.error('Error in GET /api/breeding-records:', error);
    return serverErrorResponse('Failed to fetch breeding records');
  }
}

/**
 * POST /api/breeding-records
 * Create a new breeding record
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
    const validation = createBreedingRecordSchema.safeParse(body);
    
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues);
    }

    const {
      heatCycleId,
      breedingDate,
      breedingMethod,
      studId,
      studName,
      studRegistration,
      semenQuality,
      motility,
      concentration,
      progesteroneLevelAtBreeding,
      notes
    } = validation.data;

    // Verify the heat cycle belongs to the breeder
    const [heatCycle] = await db
      .select()
      .from(heatCycles)
      .where(
        and(
          eq(heatCycles.id, heatCycleId),
          eq(heatCycles.breederId, session.user.id)
        )
      )
      .limit(1);

    if (!heatCycle) {
      return errorResponse('Heat cycle not found or does not belong to you', 404);
    }

    // Calculate breeding day
    const daysDiff = differenceInDays(new Date(breedingDate), new Date(heatCycle.startDate));
    const breedingDay = daysDiff + 1;

    // Get progesterone level at breeding if not provided
    let progesteroneLevel = progesteroneLevelAtBreeding;
    if (!progesteroneLevel) {
      // Find the closest reading to the breeding date
      const readings = await db
        .select()
        .from(heatCycleProgesteroneReadings)
        .where(eq(heatCycleProgesteroneReadings.heatCycleId, heatCycleId))
        .orderBy(heatCycleProgesteroneReadings.day);

      if (readings.length > 0) {
        // Find closest reading by day
        const closestReading = readings.reduce((prev, curr) => {
          const prevDiff = Math.abs(prev.day - breedingDay);
          const currDiff = Math.abs(curr.day - breedingDay);
          return currDiff < prevDiff ? curr : prev;
        });
        progesteroneLevel = parseFloat(closestReading.progesteroneLevel);
      }
    }

    // Create breeding record
    const [record] = await db
      .insert(breedingRecords)
      .values({
        heatCycleId,
        breederId: session.user.id,
        breedingDate,
        breedingDay,
        breedingMethod,
        studId: studId || null,
        studName: studName || null,
        studRegistration: studRegistration || null,
        semenQuality: semenQuality || null,
        motility: motility || null,
        concentration: concentration?.toString() || null,
        progesteroneLevelAtBreeding: progesteroneLevel?.toString() || null,
        notes: notes || null,
      })
      .returning();

    return createdResponse({
      record,
      message: 'Breeding record created successfully',
    });

  } catch (error) {
    console.error('Error in POST /api/breeding-records:', error);
    return serverErrorResponse('Failed to create breeding record');
  }
}
