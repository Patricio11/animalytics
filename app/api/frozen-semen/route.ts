import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { frozenSemen } from '@/lib/db/schema/animals';
import { auth } from '@/lib/auth/config';
import {
  successResponse,
  createdResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { eq, and, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createFrozenSemenSchema = z.object({
  sourceAnimalId: z.string().min(1, 'Source animal is required'),
  batchIdentifier: z.string().min(1, 'Batch identifier is required'),
  collectionDate: z.string().min(1, 'Collection date is required'),
  clinic: z.string().optional(),
  storageLocation: z.string().optional(),
  strawCount: z.number().int().positive('Number of straws must be positive'),
  strawsRemaining: z.number().int().min(0, 'Straws remaining cannot be negative').optional(),
  qualityRating: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  motility: z.number().min(0).max(100).optional(),
  concentration: z.number().positive().optional(),
  morphology: z.number().min(0).max(100).optional(),
  volume: z.number().positive().optional(),
  notes: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

// ============================================================================
// GET /api/frozen-semen - List all frozen semen batches for current user
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sourceAnimalId = searchParams.get('sourceAnimalId');

    // Build where clause
    let whereConditions: any[] = [eq(frozenSemen.userId, session.user.id)];

    // Filter by status
    if (status) {
      if (status === 'available') {
        whereConditions.push(
          and(
            eq(frozenSemen.isAvailable, true),
            sql`${frozenSemen.strawsRemaining} > 0`
          )
        );
      } else if (status === 'low_stock') {
        whereConditions.push(
          and(
            eq(frozenSemen.isAvailable, true),
            sql`${frozenSemen.strawsRemaining} > 0`,
            sql`${frozenSemen.strawsRemaining} <= 5`
          )
        );
      } else if (status === 'depleted') {
        whereConditions.push(sql`${frozenSemen.strawsRemaining} = 0`);
      } else if (status === 'inactive') {
        whereConditions.push(eq(frozenSemen.isAvailable, false));
      }
    }

    // Filter by source animal
    if (sourceAnimalId) {
      whereConditions.push(eq(frozenSemen.sourceAnimalId, sourceAnimalId));
    }

    const whereClause = whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0];

    const batches = await db.query.frozenSemen.findMany({
      where: whereClause,
      with: {
        sourceAnimal: {
          with: {
            breed: true,
          },
        },
      },
      orderBy: [desc(frozenSemen.collectionDate)],
    });

    return successResponse(batches, undefined, {
      total: batches.length,
      totalStraws: batches.reduce((sum, b) => sum + (b.strawsRemaining || 0), 0),
    });
  } catch (error) {
    console.error('Error fetching frozen semen batches:', error);
    return serverErrorResponse('Failed to fetch frozen semen batches');
  }
}

// ============================================================================
// POST /api/frozen-semen - Create new frozen semen batch
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // Validate request body
    const validation = createFrozenSemenSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(
        validation.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
      );
    }

    const validatedData = validation.data;

    // If strawsRemaining not provided, default to strawCount
    const strawsRemaining = validatedData.strawsRemaining ?? validatedData.strawCount;

    // Auto-calculate quality rating if lab parameters provided
    let qualityRating = validatedData.qualityRating;
    if (!qualityRating && validatedData.motility && validatedData.concentration && validatedData.morphology) {
      const motilityScore =
        validatedData.motility >= 80 ? 4 : validatedData.motility >= 70 ? 3 : validatedData.motility >= 50 ? 2 : 1;
      const concentrationScore =
        validatedData.concentration >= 500 ? 4 : validatedData.concentration >= 300 ? 3 : validatedData.concentration >= 200 ? 2 : 1;
      const morphologyScore =
        validatedData.morphology >= 85 ? 4 : validatedData.morphology >= 80 ? 3 : validatedData.morphology >= 60 ? 2 : 1;

      const avgScore = (motilityScore + concentrationScore + morphologyScore) / 3;
      qualityRating = avgScore >= 3.5 ? 'excellent' : avgScore >= 2.5 ? 'good' : avgScore >= 1.5 ? 'fair' : 'poor';
    }

    // Create frozen semen batch
    const newBatch = await db
      .insert(frozenSemen)
      .values({
        userId: session.user.id,
        sourceAnimalId: validatedData.sourceAnimalId,
        batchIdentifier: validatedData.batchIdentifier,
        collectionDate: validatedData.collectionDate,
        clinic: validatedData.clinic,
        storageLocation: validatedData.storageLocation,
        strawCount: validatedData.strawCount,
        strawsRemaining,
        qualityRating: qualityRating || 'good',
        isAvailable: validatedData.isAvailable ?? true,
        notes: validatedData.notes,
        motility: validatedData.motility !== undefined ? String(validatedData.motility) : undefined,
        concentration: validatedData.concentration,
        morphology: validatedData.morphology !== undefined ? String(validatedData.morphology) : undefined,
        volume: validatedData.volume !== undefined ? String(validatedData.volume) : undefined,
      })
      .returning();

    return createdResponse(newBatch[0], 'Frozen semen batch created successfully');
  } catch (error) {
    console.error('Error creating frozen semen batch:', error);
    return serverErrorResponse('Failed to create frozen semen batch');
  }
}
