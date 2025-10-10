import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { matings } from '@/lib/db/schema/matings';
import { auth } from '@/lib/auth/config';
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateMatingSchema = z.object({
  matingDate: z.string().optional(),
  breedingMethod: z.enum(['natural_ai', 'tci', 'surgical_ai', 'frozen']).optional(),
  semenType: z.string().optional(),
  status: z.enum(['planned', 'confirmed', 'unsuccessful', 'resulted_in_litter']).optional(),
  notes: z.string().optional(),
  calculationData: z.any().optional(),
  ratingBreakdown: z.any().optional(),
  progesteroneRating: z.number().optional(),
  conceptionRating: z.number().optional(),
  overallRating: z.number().optional(),
  informationAccuracy: z.number().optional(),
});

// ============================================================================
// GET /api/matings/[id] - Get single mating with all related data
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    const mating = await db.query.matings.findFirst({
      where: and(eq(matings.id, params.id), eq(matings.userId, session.user.id)),
      with: {
        bitch: {
          with: {
            breed: true,
            seasons: {
              orderBy: (seasons, { desc }) => [desc(seasons.startDate)],
              limit: 1,
            },
          },
        },
        dog: {
          with: {
            breed: true,
          },
        },
        frozenSemen: {
          with: {
            sourceAnimal: {
              with: {
                breed: true,
              },
            },
          },
        },
      },
    });

    if (!mating) {
      return notFoundResponse('Mating not found');
    }

    return successResponse(mating);
  } catch (error) {
    console.error('Error fetching mating:', error);
    return serverErrorResponse('Failed to fetch mating');
  }
}

// ============================================================================
// PATCH /api/matings/[id] - Update mating
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // Validate request body
    const validation = updateMatingSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(
        validation.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
      );
    }

    const validatedData = validation.data;

    // Update mating
    const updated = await db
      .update(matings)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(and(eq(matings.id, params.id), eq(matings.userId, session.user.id)))
      .returning();

    if (!updated.length) {
      return notFoundResponse('Mating not found');
    }

    return successResponse(updated[0], 'Mating updated successfully');
  } catch (error) {
    console.error('Error updating mating:', error);
    return serverErrorResponse('Failed to update mating');
  }
}

// ============================================================================
// DELETE /api/matings/[id] - Delete mating
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    const deleted = await db
      .delete(matings)
      .where(and(eq(matings.id, params.id), eq(matings.userId, session.user.id)))
      .returning();

    if (!deleted.length) {
      return notFoundResponse('Mating not found');
    }

    return successResponse(null, 'Mating deleted successfully');
  } catch (error) {
    console.error('Error deleting mating:', error);
    return serverErrorResponse('Failed to delete mating');
  }
}
