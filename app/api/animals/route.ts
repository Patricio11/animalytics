import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { animals, manualPedigreeEntries } from '@/lib/db/schema/animals';
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
  sex: z.enum(['male', 'female']),
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
  location: z.string().optional(),
  
  // Parent information (relational or manual)
  sireId: z.string().optional(),
  damId: z.string().optional(),
  sireRegistrationNumber: z.string().optional(),
  sireRegisteredName: z.string().optional(),
  damRegistrationNumber: z.string().optional(),
  damRegisteredName: z.string().optional(),
  
  // Breeder and Owner information
  breederMode: z.enum(['self', 'select', 'manual']).optional(),
  breederId: z.string().optional(),
  breederName: z.string().optional(),
  breederRegistrationNumber: z.string().optional(),
  ownerMode: z.enum(['self', 'select', 'manual']).optional(),
  ownerId: z.string().optional(),
  ownerName: z.string().optional(),
  ownerRegistrationNumber: z.string().optional(),
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
    const global = searchParams.get('global') === 'true';

    // Build where clause - filter by user unless global search is requested
    let whereClause = global ? undefined : eq(animals.userId, session.user.id);

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
        photos: true,
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
        validation.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
      );
    }

    const validatedData = validation.data;

    // Create animal - map only fields that exist in the database schema
    const newAnimal = await db
      .insert(animals)
      .values({
        userId: session.user.id,
        name: validatedData.name,
        registeredName: validatedData.registeredName,
        breedId: validatedData.breedId,
        sex: validatedData.sex,
        dateOfBirth: validatedData.dateOfBirth,
        microchipNumber: validatedData.microchipNumber,
        registrationNumber: validatedData.registrationNumber,
        weight: validatedData.weight?.toString(),
        height: validatedData.height?.toString(),
        color: validatedData.color,
        markings: validatedData.markings,
        profileImageUrl: validatedData.profileImageUrl,
        bio: validatedData.bio,
        temperament: validatedData.temperament,
        healthStatus: validatedData.healthStatus,
        isBreedingActive: validatedData.isBreedingActive,
        isChampion: validatedData.isChampion,
        titles: validatedData.titles,
        notes: validatedData.notes,
        location: validatedData.location,
        sireId: validatedData.sireId,
        damId: validatedData.damId,
        
        // Breeder information - set breederId to current user if mode is 'self'
        breederId: validatedData.breederMode === 'self' ? session.user.id : validatedData.breederId,
        breederName: validatedData.breederMode === 'manual' ? validatedData.breederName : undefined,
        breederRegistrationNumber: validatedData.breederMode === 'manual' ? validatedData.breederRegistrationNumber : undefined,
        
        // Owner information - set ownerId to current user if mode is 'self'
        ownerId: validatedData.ownerMode === 'self' ? session.user.id : validatedData.ownerId,
        ownerName: validatedData.ownerMode === 'manual' ? validatedData.ownerName : undefined,
        ownerRegistrationNumber: validatedData.ownerMode === 'manual' ? validatedData.ownerRegistrationNumber : undefined,
      })
      .returning();

    const createdAnimal = newAnimal[0];

    // Create manual pedigree entries for parents if provided manually
    // This ensures they appear in the pedigree tree properly
    // Check for registrationNumber and registeredName (not name - name is deprecated)
    if (validatedData.sireRegistrationNumber && validatedData.sireRegisteredName && !validatedData.sireId) {
      console.log('📝 Creating manual pedigree entry for sire:', validatedData.sireRegisteredName);
      try {
        await db.insert(manualPedigreeEntries).values({
          animalId: createdAnimal.id,
          userId: session.user.id,
          position: 'sire',
          generation: 1,
          name: validatedData.sireRegisteredName, // Use registered name as name
          registeredName: validatedData.sireRegisteredName,
          registrationNumber: validatedData.sireRegistrationNumber,
          sex: 'male',
          notes: 'Created during animal registration',
        });
        console.log('✅ Manual sire entry created');
      } catch (error) {
        console.error('Failed to create manual sire entry:', error);
        // Don't fail the whole operation
      }
    }

    if (validatedData.damRegistrationNumber && validatedData.damRegisteredName && !validatedData.damId) {
      console.log('📝 Creating manual pedigree entry for dam:', validatedData.damRegisteredName);
      try {
        await db.insert(manualPedigreeEntries).values({
          animalId: createdAnimal.id,
          userId: session.user.id,
          position: 'dam',
          generation: 1,
          name: validatedData.damRegisteredName, // Use registered name as name
          registeredName: validatedData.damRegisteredName,
          registrationNumber: validatedData.damRegistrationNumber,
          sex: 'female',
          notes: 'Created during animal registration',
        });
        console.log('✅ Manual dam entry created');
      } catch (error) {
        console.error('Failed to create manual dam entry:', error);
        // Don't fail the whole operation
      }
    }

    return createdResponse(createdAnimal, 'Animal created successfully');
  } catch (error) {
    console.error('Error creating animal:', error);
    return serverErrorResponse('Failed to create animal');
  }
}
