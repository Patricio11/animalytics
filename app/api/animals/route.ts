import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { animals } from '@/lib/db/schema/animals';
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
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createAnimalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  registeredName: z.string().optional(),
  breedId: z.string().min(1, 'Breed is required'),
  sex: z.enum(['male', 'female'], { required_error: 'Sex is required' }),
  dateOfBirth: z.string().optional(),
  microchipNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  color: z.string().optional(),
  markings: z.string().optional(),
  profileImageUrl: z.string().url().optional().or(z.literal('')),
  bio: z.string().optional(),
  temperament: z.string().optional(),
  healthStatus: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  isBreedingActive: z.boolean().optional(),
  isChampion: z.boolean().optional(),
  titles: z.array(z.string()).optional(),
  notes: z.string().optional(),
  
  // Parent information (relational or manual)
  sireId: z.string().optional(),
  damId: z.string().optional(),
  sireName: z.string().optional(),
  sireRegisteredName: z.string().optional(),
  damName: z.string().optional(),
  damRegisteredName: z.string().optional(),
});

// ============================================================================
// GET /api/animals - List all animals for current user
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const sex = searchParams.get('sex');
    const isActive = searchParams.get('isActive');
    const isBreedingActive = searchParams.get('isBreedingActive');

    // Build where clause
    let whereClause = eq(animals.userId, session.user.id);

    if (sex === 'male' || sex === 'female') {
      whereClause = and(whereClause, eq(animals.sex, sex)) as any;
    }

    if (isActive !== null) {
      whereClause = and(
        whereClause,
        eq(animals.isActive, isActive === 'true')
      ) as any;
    }

    if (isBreedingActive !== null) {
      whereClause = and(
        whereClause,
        eq(animals.isBreedingActive, isBreedingActive === 'true')
      ) as any;
    }

    const userAnimals = await db.query.animals.findMany({
      where: whereClause,
      with: {
        breed: true,
      },
      orderBy: [desc(animals.createdAt)],
    });

    return successResponse(userAnimals, undefined, {
      total: userAnimals.length,
    });
  } catch (error) {
    console.error('Error fetching animals:', error);
    return serverErrorResponse('Failed to fetch animals');
  }
}

// ============================================================================
// POST /api/animals - Create new animal
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // Validate request body
    const validation = createAnimalSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(
        validation.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
      );
    }

    const validatedData = validation.data;

    // Create animal
    const newAnimal = await db
      .insert(animals)
      .values({
        ...validatedData,
        userId: session.user.id,
      })
      .returning();

    return createdResponse(newAnimal[0], 'Animal created successfully');
  } catch (error) {
    console.error('Error creating animal:', error);
    return serverErrorResponse('Failed to create animal');
  }
}
