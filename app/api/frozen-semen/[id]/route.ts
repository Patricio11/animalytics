import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { frozenSemen, frozenSemenUsage } from '@/lib/db/schema/animals';
import { auth } from '@/lib/auth/config';
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateFrozenSemenSchema = z.object({
  batchIdentifier: z.string().optional(),
  collectionDate: z.string().optional(),
  clinic: z.string().optional(),
  storageLocation: z.string().optional(),
  strawCount: z.number().int().positive().optional(),
  strawsRemaining: z.number().int().min(0).optional(),
  qualityRating: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  motility: z.string().optional(),
  concentration: z.number().positive().optional(),
  morphology: z.string().optional(),
  volume: z.string().optional(),
  notes: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

// ============================================================================
// GET /api/frozen-semen/[id] - Get single frozen semen batch
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const batch = await db.query.frozenSemen.findFirst({
      where: and(eq(frozenSemen.id, id), eq(frozenSemen.userId, session.user.id)),
      with: {
        sourceAnimal: {
          with: {
            breed: true,
          },
        },
      },
    });

    if (!batch) {
      return notFoundResponse('Frozen semen batch not found');
    }

    // Fetch usage history separately (no direct relation defined)
    const usageHistory = await db
      .select()
      .from(frozenSemenUsage)
      .where(eq(frozenSemenUsage.frozenSemenId, id))
      .orderBy(desc(frozenSemenUsage.usageDate));

    return successResponse({ ...batch, usageHistory });
  } catch (error) {
    console.error('Error fetching frozen semen batch:', error);
    return serverErrorResponse('Failed to fetch frozen semen batch');
  }
}

// ============================================================================
// PATCH /api/frozen-semen/[id] - Update frozen semen batch
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    // Verify batch exists and belongs to user
    const existing = await db.query.frozenSemen.findFirst({
      where: and(eq(frozenSemen.id, id), eq(frozenSemen.userId, session.user.id)),
    });

    if (!existing) {
      return notFoundResponse('Frozen semen batch not found');
    }

    const body = await request.json();

    // Validate request body
    const validation = updateFrozenSemenSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(
        validation.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
      );
    }

    const validatedData = validation.data;

    // Validate strawsRemaining doesn't exceed numberOfStraws
    if (validatedData.strawsRemaining !== undefined && validatedData.numberOfStraws !== undefined) {
      if (validatedData.strawsRemaining > validatedData.numberOfStraws) {
        return validationErrorResponse([
          {
            field: 'strawsRemaining',
            message: 'Straws remaining cannot exceed total number of straws',
          },
        ]);
      }
    } else if (validatedData.strawsRemaining !== undefined) {
      if (validatedData.strawsRemaining > existing.strawCount) {
        return validationErrorResponse([
          {
            field: 'strawsRemaining',
            message: 'Straws remaining cannot exceed total number of straws',
          },
        ]);
      }
    }

    // Update batch
    const updated = await db
      .update(frozenSemen)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(and(eq(frozenSemen.id, id), eq(frozenSemen.userId, session.user.id)))
      .returning();

    return successResponse(updated[0], 'Frozen semen batch updated successfully');
  } catch (error) {
    console.error('Error updating frozen semen batch:', error);
    return serverErrorResponse('Failed to update frozen semen batch');
  }
}

// ============================================================================
// DELETE /api/frozen-semen/[id] - Delete frozen semen batch
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    // Verify batch exists and belongs to user
    const existing = await db.query.frozenSemen.findFirst({
      where: and(eq(frozenSemen.id, id), eq(frozenSemen.userId, session.user.id)),
    });

    if (!existing) {
      return notFoundResponse('Frozen semen batch not found');
    }

    // Delete batch
    await db
      .delete(frozenSemen)
      .where(and(eq(frozenSemen.id, id), eq(frozenSemen.userId, session.user.id)));

    return successResponse(null, 'Frozen semen batch deleted successfully');
  } catch (error) {
    console.error('Error deleting frozen semen batch:', error);
    return serverErrorResponse('Failed to delete frozen semen batch');
  }
}
