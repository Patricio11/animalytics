import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { matings } from '@/lib/db/schema/matings';
import { auth } from '@/lib/auth/config';
import {
  successResponse,
  createdResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createMatingSchema = z.object({
  bitchId: z.string().min(1, 'Bitch is required'),
  dogId: z.string().optional(),
  frozenSemenId: z.string().optional(),
  matingDate: z.string().min(1, 'Mating date is required'),
  breedingMethod: z.enum(['natural_ai', 'tci', 'surgical_ai', 'frozen'], {
    required_error: 'Breeding method is required',
  }),
  semenType: z.string().optional(),
  notes: z.string().optional(),
  // Wizard data (optional, can be added later)
  calculationData: z.any().optional(),
});

// ============================================================================
// GET /api/matings - List all matings for current user
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const bitchId = searchParams.get('bitchId');
    const status = searchParams.get('status');

    // Build where clause
    let whereClause: any = eq(matings.userId, session.user.id);

    // TODO: Add filtering by bitchId and status when needed

    const userMatings = await db.query.matings.findMany({
      where: whereClause,
      with: {
        bitch: {
          with: {
            breed: true,
          },
        },
        dog: {
          with: {
            breed: true,
          },
        },
        frozenSemen: true,
      },
      orderBy: [desc(matings.matingDate)],
    });

    return successResponse(userMatings, undefined, {
      total: userMatings.length,
    });
  } catch (error) {
    console.error('Error fetching matings:', error);
    return serverErrorResponse('Failed to fetch matings');
  }
}

// ============================================================================
// POST /api/matings - Create new mating
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // Validate request body
    const validation = createMatingSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(
        validation.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
      );
    }

    const validatedData = validation.data;

    // Validate that either dogId or frozenSemenId is provided
    if (!validatedData.dogId && !validatedData.frozenSemenId) {
      return validationErrorResponse([
        {
          field: 'dogId',
          message: 'Either dog or frozen semen must be selected',
        },
      ]);
    }

    // Create mating
    const newMating = await db
      .insert(matings)
      .values({
        ...validatedData,
        userId: session.user.id,
        status: 'planned',
      })
      .returning();

    return createdResponse(newMating[0], 'Mating created successfully');
  } catch (error) {
    console.error('Error creating mating:', error);
    return serverErrorResponse('Failed to create mating');
  }
}
