import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { breedingRecords } from '@/lib/db/schema';
import { auth } from '@/lib/auth/config';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateBreedingRecordSchema = z.object({
  breedingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  breedingMethod: z.enum(['natural', 'ai_fresh', 'ai_chilled', 'ai_frozen', 'tci', 'surgical']).optional(),
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
 * PATCH /api/breeding-records/[id]
 * Update a breeding record
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validation = updateBreedingRecordSchema.safeParse(body);
    
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues);
    }

    const updates = validation.data;

    // Verify the record belongs to the breeder
    const [existingRecord] = await db
      .select()
      .from(breedingRecords)
      .where(
        and(
          eq(breedingRecords.id, id),
          eq(breedingRecords.breederId, session.user.id)
        )
      )
      .limit(1);

    if (!existingRecord) {
      return errorResponse('Breeding record not found or does not belong to you', 404);
    }

    // Update the record
    const [updatedRecord] = await db
      .update(breedingRecords)
      .set({
        breedingDate: updates.breedingDate ?? existingRecord.breedingDate,
        breedingMethod: updates.breedingMethod ?? existingRecord.breedingMethod,
        studId: updates.studId ?? existingRecord.studId,
        studName: updates.studName ?? existingRecord.studName,
        studRegistration: updates.studRegistration ?? existingRecord.studRegistration,
        semenQuality: updates.semenQuality ?? existingRecord.semenQuality,
        motility: updates.motility ?? existingRecord.motility,
        concentration: updates.concentration?.toString() ?? existingRecord.concentration,
        progesteroneLevelAtBreeding: updates.progesteroneLevelAtBreeding?.toString() ?? existingRecord.progesteroneLevelAtBreeding,
        notes: updates.notes ?? existingRecord.notes,
      })
      .where(eq(breedingRecords.id, id))
      .returning();

    return successResponse({
      record: updatedRecord,
      message: 'Breeding record updated successfully',
    });

  } catch (error) {
    console.error('Error in PATCH /api/breeding-records/[id]:', error);
    return serverErrorResponse('Failed to update breeding record');
  }
}

/**
 * DELETE /api/breeding-records/[id]
 * Delete a breeding record
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    // Verify the record belongs to the breeder
    const [recordToDelete] = await db
      .select()
      .from(breedingRecords)
      .where(
        and(
          eq(breedingRecords.id, id),
          eq(breedingRecords.breederId, session.user.id)
        )
      )
      .limit(1);

    if (!recordToDelete) {
      return errorResponse('Breeding record not found or does not belong to you', 404);
    }

    // Delete the record
    await db
      .delete(breedingRecords)
      .where(eq(breedingRecords.id, id));

    return successResponse({
      message: 'Breeding record deleted successfully',
    });

  } catch (error) {
    console.error('Error in DELETE /api/breeding-records/[id]:', error);
    return serverErrorResponse('Failed to delete breeding record');
  }
}
