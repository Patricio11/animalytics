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
import { calculateProgesteroneRating } from '@/lib/calculations/progesterone-calculator';
import { calculateConceptionRating } from '@/lib/calculations/conception-rating';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const calculateSchema = z.object({
  // Progesterone calculator data
  progesterone: z
    .object({
      laboratory: z.enum(['VIDAS', 'IDEXX']),
      unit: z.enum(['nanograms', 'nanomoles']),
      breedingMethod: z.enum(['natural_ai', 'tci', 'surgical_ai', 'frozen']),
      readings: z.array(
        z.object({
          day: z.number().min(0).max(5),
          value: z.number(),
        })
      ),
    })
    .optional(),

  // Conception calculator data (all 9 wizard steps)
  conception: z
    .object({
      breed: z.string().optional(),
      dogBreed: z.string().optional(),
      bitchInformation: z.any().optional(),
      bitchHistory: z.any().optional(),
      litterHistory: z.any().optional(),
      dogHistory: z.any().optional(),
      breederHistory: z.any().optional(),
      semenInformation: z.any().optional(),
      semenQuality: z.any().optional(),
      semenAssessment: z.any().optional(),
    })
    .optional(),
});

// ============================================================================
// POST /api/matings/[id]/calculate - Run progesterone + conception calculations
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    // Verify mating exists and belongs to user
    const existing = await db.query.matings.findFirst({
      where: and(eq(matings.id, id), eq(matings.userId, session.user.id)),
    });

    if (!existing) {
      return notFoundResponse('Mating not found');
    }

    const body = await request.json();

    // Validate request body
    const validation = calculateSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(
        validation.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
      );
    }

    const { progesterone, conception } = validation.data;

    let progesteroneResult: any = null;
    let conceptionResult: any = null;
    let overallRating: number | null = null;

    // ========================================================================
    // 1. Calculate Progesterone Rating (if provided)
    // ========================================================================

    if (progesterone) {
      progesteroneResult = calculateProgesteroneRating({
        laboratory: progesterone.laboratory,
        unit: progesterone.unit,
        breedingMethod: progesterone.breedingMethod,
        readings: progesterone.readings,
      });
    }

    // ========================================================================
    // 2. Calculate Conception Rating (if provided)
    // ========================================================================

    if (conception) {
      conceptionResult = calculateConceptionRating({
        breed: conception.breed,
        dogBreed: conception.dogBreed,
        bitchInformation: conception.bitchInformation,
        bitchHistory: conception.bitchHistory,
        litterHistory: conception.litterHistory,
        dogHistory: conception.dogHistory,
        breederHistory: conception.breederHistory,
        semenInformation: conception.semenInformation,
        semenQuality: conception.semenQuality,
        semenAssessment: conception.semenAssessment,
      });
    }

    // ========================================================================
    // 3. Calculate Overall Rating (weighted average)
    // ========================================================================

    if (progesteroneResult && conceptionResult) {
      // Both calculations present - weighted average
      // Progesterone: 40%, Conception: 60%
      overallRating =
        progesteroneResult.rating * 10 * 0.4 + conceptionResult.overallRating * 0.6;
    } else if (progesteroneResult) {
      // Only progesterone
      overallRating = progesteroneResult.rating * 10;
    } else if (conceptionResult) {
      // Only conception
      overallRating = conceptionResult.overallRating;
    }

    // ========================================================================
    // 4. Update Mating Record with Results
    // ========================================================================

    const updated = await db
      .update(matings)
      .set({
        progesteroneRating: progesteroneResult
          ? progesteroneResult.rating * 10
          : null,
        conceptionRating: conceptionResult
          ? conceptionResult.overallRating
          : null,
        overallRating,
        informationAccuracy: conceptionResult
          ? conceptionResult.informationAccuracy
          : null,
        calculationData: {
          ...(existing.calculationData || {}),
          ...conception,
        },
        ratingBreakdown: conceptionResult?.breakdown || null,
        updatedAt: new Date(),
      })
      .where(and(eq(matings.id, id), eq(matings.userId, session.user.id)))
      .returning();

    // ========================================================================
    // 5. Return Complete Results
    // ========================================================================

    return successResponse(
      {
        mating: updated[0],
        progesterone: progesteroneResult
          ? {
              rating: progesteroneResult.rating,
              ratingPercentage: progesteroneResult.rating * 10,
              trend: progesteroneResult.trend,
              pattern: progesteroneResult.pattern,
              recommendation: progesteroneResult.recommendation,
              optimalBreedingWindow: progesteroneResult.optimalBreedingWindow,
            }
          : null,
        conception: conceptionResult
          ? {
              overallRating: conceptionResult.overallRating,
              informationAccuracy: conceptionResult.informationAccuracy,
              breakdown: conceptionResult.breakdown,
              totalWeight: conceptionResult.totalWeight,
              missingWeight: conceptionResult.missingWeight,
            }
          : null,
        overall: {
          rating: overallRating,
          hasProgesterone: !!progesteroneResult,
          hasConception: !!conceptionResult,
        },
      },
      'Calculations completed successfully'
    );
  } catch (error) {
    console.error('Error calculating ratings:', error);
    return serverErrorResponse('Failed to calculate ratings');
  }
}
