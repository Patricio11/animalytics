import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { animals, manualPedigreeEntries } from '@/lib/db/schema/animals';
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

const updateAnimalSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  breedId: z.string().optional(),
  sex: z.enum(['male', 'female']).optional(),
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
  isActive: z.boolean().optional(),
  isDeceased: z.boolean().optional(),
  deceasedDate: z.string().optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
  // Breeder information
  breederMode: z.enum(['self', 'select', 'manual']).optional(),
  breederId: z.string().optional(),
  breederName: z.string().optional(),
  breederRegistrationNumber: z.string().optional(),
  // Owner information
  ownerMode: z.enum(['self', 'select', 'manual']).optional(),
  ownerId: z.string().optional(),
  ownerName: z.string().optional(),
  ownerRegistrationNumber: z.string().optional(),
  // Parent information
  sireId: z.string().optional(),
  damId: z.string().optional(),
  sireRegistrationNumber: z.string().optional(),
  sireRegisteredName: z.string().optional(),
  damRegistrationNumber: z.string().optional(),
  damRegisteredName: z.string().optional(),
});

// ============================================================================
// GET /api/animals/[id] - Get single animal with all related data
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

    const animal = await db.query.animals.findFirst({
      where: and(
        eq(animals.id, id),
        eq(animals.userId, session.user.id)
      ),
      with: {
        breed: true,
        // Owner and Breeder information
        owner: {
          columns: {
            id: true,
            name: true,
          },
        },
        breeder: {
          columns: {
            id: true,
            name: true,
          },
        },
        // Parent relations (if in system)
        sire: {
          columns: {
            id: true,
            name: true,
            registeredName: true,
            registrationNumber: true,
          },
        },
        dam: {
          columns: {
            id: true,
            name: true,
            registeredName: true,
            registrationNumber: true,
          },
        },
        // Manual pedigree entries (if parents not in system)
        manualPedigreeEntries: {
          where: (entries, { eq }) => eq(entries.generation, 1), // Only get direct parents
        },
        // Photos (from animalPhotos table)
        photos: {
          orderBy: (photos, { asc }) => [asc(photos.displayOrder)],
        },
        // Documents
        documents: {
          orderBy: (docs, { desc }) => [desc(docs.uploadedAt)],
        },
        // Feeding plans
        feedingPlans: {
          orderBy: (plans, { desc }) => [desc(plans.createdAt)],
        },
        // Semen assessments (for dogs)
        semenAssessments: {
          orderBy: (assessments, { desc }) => [
            desc(assessments.assessmentDate),
          ],
        },
        // Seasons (for bitches)
        seasons: {
          orderBy: (seasons, { desc }) => [desc(seasons.startDate)],
        },
        // Litters (for bitches) - use specific relation name
        littersAsBitch: {
          orderBy: (litters, { desc }) => [desc(litters.matingDate)],
        },
        // Health records
        healthRecords: {
          orderBy: (records, { desc }) => [desc(records.recordDate)],
        },
        // Reminders
        reminders: {
          orderBy: (reminders, { desc }) => [desc(reminders.dueDate)],
        },
      },
    });

    if (!animal) {
      return notFoundResponse('Animal not found');
    }

    return successResponse(animal);
  } catch (error) {
    console.error('Error fetching animal:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return serverErrorResponse('Failed to fetch animal');
  }
}

// ============================================================================
// PATCH /api/animals/[id] - Update animal
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
    const body = await request.json();

    // Validate request body
    const validation = updateAnimalSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(
        validation.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
      );
    }

    const validatedData = validation.data;

    // Prepare update data with proper type conversions
    const updateData: any = {};
    
    // Copy validated fields
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.breedId !== undefined) updateData.breedId = validatedData.breedId;
    if (validatedData.sex !== undefined) updateData.sex = validatedData.sex;
    if (validatedData.dateOfBirth !== undefined) updateData.dateOfBirth = validatedData.dateOfBirth;
    if (validatedData.microchipNumber !== undefined) updateData.microchipNumber = validatedData.microchipNumber;
    if (validatedData.registrationNumber !== undefined) updateData.registrationNumber = validatedData.registrationNumber;
    if (validatedData.color !== undefined) updateData.color = validatedData.color;
    if (validatedData.markings !== undefined) updateData.markings = validatedData.markings;
    if (validatedData.profileImageUrl !== undefined) updateData.profileImageUrl = validatedData.profileImageUrl;
    if (validatedData.bio !== undefined) updateData.bio = validatedData.bio;
    if (validatedData.temperament !== undefined) updateData.temperament = validatedData.temperament;
    if (validatedData.healthStatus !== undefined) updateData.healthStatus = validatedData.healthStatus;
    if (validatedData.isBreedingActive !== undefined) updateData.isBreedingActive = validatedData.isBreedingActive;
    if (validatedData.isChampion !== undefined) updateData.isChampion = validatedData.isChampion;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
    if (validatedData.isDeceased !== undefined) updateData.isDeceased = validatedData.isDeceased;
    if (validatedData.deceasedDate !== undefined) updateData.deceasedDate = validatedData.deceasedDate;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;
    if (validatedData.location !== undefined) updateData.location = validatedData.location;
    
    // Convert numbers to strings for decimal fields
    if (validatedData.weight !== undefined) updateData.weight = String(validatedData.weight);
    if (validatedData.height !== undefined) updateData.height = String(validatedData.height);
    
    // Handle titles array (jsonb field)
    if (validatedData.titles !== undefined) updateData.titles = validatedData.titles;
    
    // Handle breeder information
    if (validatedData.breederMode === 'self') {
      updateData.breederId = session.user.id;
      updateData.breederName = null;
      updateData.breederRegistrationNumber = null;
    } else if (validatedData.breederMode === 'manual') {
      updateData.breederId = null;
      updateData.breederName = validatedData.breederName || null;
      updateData.breederRegistrationNumber = validatedData.breederRegistrationNumber || null;
    } else if (validatedData.breederMode === 'select' && validatedData.breederId) {
      updateData.breederId = validatedData.breederId;
      updateData.breederName = null;
      updateData.breederRegistrationNumber = null;
    }
    
    // Handle owner information
    if (validatedData.ownerMode === 'self') {
      updateData.ownerId = session.user.id;
      updateData.ownerName = null;
      updateData.ownerRegistrationNumber = null;
    } else if (validatedData.ownerMode === 'manual') {
      updateData.ownerId = null;
      updateData.ownerName = validatedData.ownerName || null;
      updateData.ownerRegistrationNumber = validatedData.ownerRegistrationNumber || null;
    } else if (validatedData.ownerMode === 'select' && validatedData.ownerId) {
      updateData.ownerId = validatedData.ownerId;
      updateData.ownerName = null;
      updateData.ownerRegistrationNumber = null;
    }
    
    // Handle parent information (sire/dam)
    if (validatedData.sireId !== undefined) updateData.sireId = validatedData.sireId || null;
    if (validatedData.damId !== undefined) updateData.damId = validatedData.damId || null;
    
    // Always update timestamp
    updateData.updatedAt = new Date();

    // Update animal
    const updated = await db
      .update(animals)
      .set(updateData)
      .where(
        and(eq(animals.id, id), eq(animals.userId, session.user.id))
      )
      .returning();

    if (!updated.length) {
      return notFoundResponse('Animal not found');
    }

    // Handle manual pedigree entries (for parents not in system)
    // Delete existing manual entries for this animal (generation 1 = direct parents)
    await db
      .delete(manualPedigreeEntries)
      .where(
        and(
          eq(manualPedigreeEntries.animalId, id),
          eq(manualPedigreeEntries.generation, 1)
        )
      );

    // Create new manual entries if provided
    const manualEntries: Array<typeof manualPedigreeEntries.$inferInsert> = [];
    
    if (validatedData.sireRegistrationNumber && validatedData.sireRegisteredName) {
      manualEntries.push({
        animalId: id,
        userId: session.user.id,
        position: 'sire',
        generation: 1,
        name: validatedData.sireRegisteredName,
        registeredName: validatedData.sireRegisteredName,
        registrationNumber: validatedData.sireRegistrationNumber,
      });
    }
    
    if (validatedData.damRegistrationNumber && validatedData.damRegisteredName) {
      manualEntries.push({
        animalId: id,
        userId: session.user.id,
        position: 'dam',
        generation: 1,
        name: validatedData.damRegisteredName,
        registeredName: validatedData.damRegisteredName,
        registrationNumber: validatedData.damRegistrationNumber,
      });
    }
    
    if (manualEntries.length > 0) {
      await db.insert(manualPedigreeEntries).values(manualEntries);
    }

    return successResponse(updated[0], 'Animal updated successfully');
  } catch (error) {
    console.error('Error updating animal:', error);
    return serverErrorResponse('Failed to update animal');
  }
}

// ============================================================================
// DELETE /api/animals/[id] - Delete animal
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

    const deleted = await db
      .delete(animals)
      .where(
        and(eq(animals.id, id), eq(animals.userId, session.user.id))
      )
      .returning();

    if (!deleted.length) {
      return notFoundResponse('Animal not found');
    }

    return successResponse(null, 'Animal deleted successfully');
  } catch (error) {
    console.error('Error deleting animal:', error);
    return serverErrorResponse('Failed to delete animal');
  }
}
