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
import { eq, desc, and, gte, lte } from 'drizzle-orm';
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
    message: 'Breeding method is required',
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
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Build where clause
    let whereConditions: any[] = [eq(matings.userId, session.user.id)];

    // Filter by bitch
    if (bitchId) {
      whereConditions.push(eq(matings.bitchId, bitchId));
    }

    // Filter by status
    if (status) {
      whereConditions.push(eq(matings.status, status as any));
    }

    // Filter by date range (mating date)
    if (fromDate) {
      whereConditions.push(gte(matings.matingDate, fromDate));
    }
    if (toDate) {
      whereConditions.push(lte(matings.matingDate, toDate));
    }

    const whereClause = whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0];

    const userMatings = await db.query.matings.findMany({
      where: whereClause,
      with: {
        bitch: {
          columns: {
            id: true,
            name: true,
            sex: true,
            dateOfBirth: true,
            profileImageUrl: true,
            breedId: true,
          },
          with: {
            breed: true,
            photos: true,
          },
        },
        dog: {
          columns: {
            id: true,
            name: true,
            sex: true,
            dateOfBirth: true,
            profileImageUrl: true,
            breedId: true,
          },
          with: {
            breed: true,
            photos: true,
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
        validation.error.issues.map((err) => ({
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
