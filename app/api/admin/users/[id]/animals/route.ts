import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animals } from '@/lib/db/schema/animals';
import { users } from '@/lib/db/schema/users';
import { auth } from '@/lib/auth/config';
import { eq, and, desc } from 'drizzle-orm';
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
 * Animal creation schema
 */
const createAnimalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  registeredName: z.string().optional(),
  breedId: z.string().min(1, 'Breed is required'),
  sex: z.enum(['male', 'female']),
  dateOfBirth: z.string().optional(),
  microchipNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  color: z.string().optional(),
  profileImageUrl: z.string().optional(),
  bio: z.string().optional(),
  healthStatus: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  isBreedingActive: z.boolean().optional(),
});

/**
 * GET /api/admin/users/[id]/animals
 * Get all animals for a specific user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, session } = await checkAdminAuth(request);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: userId } = await params;

    // Get user info
    const [targetUser] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all animals for this user
    const userAnimals = await db.query.animals.findMany({
      where: eq(animals.userId, userId),
      with: {
        breed: true,
      },
      orderBy: [desc(animals.createdAt)],
    });

    return NextResponse.json({
      success: true,
      animals: userAnimals,
      user: targetUser,
    });
  } catch (error) {
    console.error('Error fetching user animals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch animals' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users/[id]/animals
 * Create an animal for a specific user (admin action)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, session } = await checkAdminAuth(request);
    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: userId } = await params;
    const body = await request.json();

    // Validate input
    const validation = createAnimalSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Get target user info
    const [targetUser] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create animal
    const [newAnimal] = await db
      .insert(animals)
      .values({
        userId: userId,
        name: data.name,
        registeredName: data.registeredName,
        breedId: data.breedId,
        sex: data.sex,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        microchipNumber: data.microchipNumber,
        registrationNumber: data.registrationNumber,
        color: data.color,
        profileImageUrl: data.profileImageUrl,
        bio: data.bio,
        healthStatus: data.healthStatus || 'good',
        isBreedingActive: data.isBreedingActive ?? false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create audit log
    await createAdminAuditLog({
      adminId: session.user.id,
      adminName: session.user.name || 'Admin',
      adminEmail: session.user.email || '',
      action: 'create_animal',
      resource: 'animal',
      resourceId: newAnimal.id,
      targetUserId: userId,
      targetUserName: targetUser.name,
      targetUserEmail: targetUser.email,
      description: `Admin created animal "${data.name}" for user ${targetUser.name}`,
      changes: {
        after: data,
      },
      metadata: {
        animalName: data.name,
        breed: data.breedId,
        sex: data.sex,
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      animal: newAnimal,
      message: `Animal "${data.name}" created successfully for ${targetUser.name}`,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating animal:', error);
    return NextResponse.json(
      { error: 'Failed to create animal' },
      { status: 500 }
    );
  }
}
