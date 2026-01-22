import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animals } from '@/lib/db/schema/animals';
import { users } from '@/lib/db/schema/users';
import { auth } from '@/lib/auth/config';
import { eq, and } from 'drizzle-orm';
import { createAdminAuditLog } from '@/lib/services/admin-audit';
import { z } from 'zod';

/**
 * Helper to check admin authorization
 */
async function checkAdminAuth(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  if (!session?.user) {
    return { authorized: false, session: null };
  }
  
  const userRole = (session.user as any).role;
  if (userRole !== 'admin') {
    return { authorized: false, session: null };
  }
  
  return { authorized: true, session };
}

/**
 * Animal update schema
 */
const updateAnimalSchema = z.object({
  name: z.string().min(1).optional(),
  registeredName: z.string().optional(),
  breedId: z.string().optional(),
  sex: z.enum(['male', 'female']).optional(),
  dateOfBirth: z.string().optional(),
  microchipNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  color: z.string().optional(),
  markings: z.string().optional(),
  weight: z.number().optional(),
  profileImageUrl: z.string().optional(),
  bio: z.string().optional(),
  healthStatus: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  isBreedingActive: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/admin/users/[id]/animals/[animalId]
 * Get specific animal details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; animalId: string }> }
) {
  try {
    const { authorized } = await checkAdminAuth(request);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: userId, animalId } = await params;

    const animal = await db.query.animals.findFirst({
      where: and(eq(animals.id, animalId), eq(animals.userId, userId)),
      with: {
        breed: true,
      },
    });

    if (!animal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      animal,
    });
  } catch (error) {
    console.error('Error fetching animal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch animal' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[id]/animals/[animalId]
 * Update an animal (admin action)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; animalId: string }> }
) {
  try {
    const { authorized, session } = await checkAdminAuth(request);
    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: userId, animalId } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateAnimalSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Get existing animal
    const [existingAnimal] = await db
      .select()
      .from(animals)
      .where(and(eq(animals.id, animalId), eq(animals.userId, userId)))
      .limit(1);

    if (!existingAnimal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
    }

    // Get target user info
    const [targetUser] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Update animal
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.dateOfBirth) {
      updateData.dateOfBirth = new Date(data.dateOfBirth);
    }

    const [updatedAnimal] = await db
      .update(animals)
      .set(updateData)
      .where(eq(animals.id, animalId))
      .returning();

    // Create audit log
    await createAdminAuditLog({
      adminId: session.user.id,
      adminName: session.user.name || 'Admin',
      adminEmail: session.user.email || '',
      action: 'update_animal',
      resource: 'animal',
      resourceId: animalId,
      targetUserId: userId,
      targetUserName: targetUser?.name || undefined,
      targetUserEmail: targetUser?.email || undefined,
      description: `Admin updated animal "${existingAnimal.name}" for user ${targetUser?.name || 'Unknown'}`,
      changes: {
        before: existingAnimal,
        after: data,
      },
      metadata: {
        animalName: existingAnimal.name,
        updatedFields: Object.keys(data),
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      animal: updatedAnimal,
      message: 'Animal updated successfully',
    });
  } catch (error) {
    console.error('Error updating animal:', error);
    return NextResponse.json(
      { error: 'Failed to update animal' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]/animals/[animalId]
 * Delete an animal (admin action)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; animalId: string }> }
) {
  try {
    const { authorized, session } = await checkAdminAuth(request);
    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: userId, animalId } = await params;

    // Get existing animal
    const [existingAnimal] = await db
      .select()
      .from(animals)
      .where(and(eq(animals.id, animalId), eq(animals.userId, userId)))
      .limit(1);

    if (!existingAnimal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
    }

    // Get target user info
    const [targetUser] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Delete animal
    await db
      .delete(animals)
      .where(eq(animals.id, animalId));

    // Create audit log
    await createAdminAuditLog({
      adminId: session.user.id,
      adminName: session.user.name || 'Admin',
      adminEmail: session.user.email || '',
      action: 'delete_animal',
      resource: 'animal',
      resourceId: animalId,
      targetUserId: userId,
      targetUserName: targetUser?.name || undefined,
      targetUserEmail: targetUser?.email || undefined,
      description: `Admin deleted animal "${existingAnimal.name}" for user ${targetUser?.name || 'Unknown'}`,
      changes: {
        before: existingAnimal,
      },
      metadata: {
        animalName: existingAnimal.name,
        animalBreed: existingAnimal.breedId,
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Animal deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting animal:', error);
    return NextResponse.json(
      { error: 'Failed to delete animal' },
      { status: 500 }
    );
  }
}
