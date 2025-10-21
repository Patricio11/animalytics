import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { puppies, litters, animals } from '@/lib/db/schema/animals';
import { auth } from '@/lib/auth/config';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createPuppySchema = z.object({
  name: z.string().optional(),
  sex: z.enum(['male', 'female']),
  birthWeight: z.number().positive().optional(),
  currentWeight: z.number().positive().optional(),
  color: z.string().optional(),
  markings: z.string().optional(),
  status: z.enum(['available', 'reserved', 'sold', 'retained', 'deceased']).optional().default('available'),
  statusDate: z.string().optional(),
  buyerName: z.string().optional(),
  buyerEmail: z.string().email().optional(),
  buyerPhone: z.string().optional(),
  salePrice: z.number().int().min(0).optional(),
  saleCurrency: z.string().optional().default('USD'),
  saleDate: z.string().optional(),
  microchipNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  healthStatus: z.enum(['healthy', 'special_needs', 'deceased']).optional(),
  notes: z.string().optional(),
});

const updatePuppySchema = createPuppySchema.partial();

// ============================================================================
// GET /api/animals/[id]/litters/[litterId]/puppies
// ============================================================================
// Get all puppies for a litter

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; litterId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: animalId, litterId } = await params;

    // Verify animal ownership
    const [animal] = await db
      .select()
      .from(animals)
      .where(and(eq(animals.id, animalId), eq(animals.userId, session.user.id)))
      .limit(1);

    if (!animal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
    }

    // Verify litter exists
    const [litter] = await db
      .select()
      .from(litters)
      .where(and(eq(litters.id, litterId), eq(litters.bitchId, animalId)))
      .limit(1);

    if (!litter) {
      return NextResponse.json({ error: 'Litter not found' }, { status: 404 });
    }

    // Get puppies
    const litterPuppies = await db
      .select()
      .from(puppies)
      .where(eq(puppies.litterId, litterId))
      .orderBy(desc(puppies.createdAt));

    return NextResponse.json({
      success: true,
      data: litterPuppies,
    });
  } catch (error) {
    console.error('Error fetching puppies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch puppies' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/animals/[id]/litters/[litterId]/puppies
// ============================================================================
// Create a new puppy

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; litterId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: animalId, litterId } = await params;
    const body = await request.json();

    // Validate request body
    const validation = createPuppySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Verify animal ownership
    const [animal] = await db
      .select()
      .from(animals)
      .where(and(eq(animals.id, animalId), eq(animals.userId, session.user.id)))
      .limit(1);

    if (!animal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
    }

    // Verify litter exists
    const [litter] = await db
      .select()
      .from(litters)
      .where(and(eq(litters.id, litterId), eq(litters.bitchId, animalId)))
      .limit(1);

    if (!litter) {
      return NextResponse.json({ error: 'Litter not found' }, { status: 404 });
    }

    const validatedData = validation.data;

    // Create puppy
    const [puppy] = await db
      .insert(puppies)
      .values({
        id: createId(),
        litterId,
        animalId: null, // Will be set if puppy is retained
        name: validatedData.name || null,
        sex: validatedData.sex,
        birthWeight: validatedData.birthWeight ? String(validatedData.birthWeight) : null,
        currentWeight: validatedData.currentWeight ? String(validatedData.currentWeight) : null,
        color: validatedData.color || null,
        markings: validatedData.markings || null,
        status: validatedData.status || 'available',
        statusDate: validatedData.statusDate || null,
        buyerName: validatedData.buyerName || null,
        buyerEmail: validatedData.buyerEmail || null,
        buyerPhone: validatedData.buyerPhone || null,
        salePrice: validatedData.salePrice || null,
        saleCurrency: validatedData.saleCurrency || 'USD',
        saleDate: validatedData.saleDate || null,
        microchipNumber: validatedData.microchipNumber || null,
        registrationNumber: validatedData.registrationNumber || null,
        healthStatus: validatedData.healthStatus || null,
        notes: validatedData.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: puppy,
      message: 'Puppy created successfully',
    });
  } catch (error) {
    console.error('Error creating puppy:', error);
    return NextResponse.json(
      { error: 'Failed to create puppy' },
      { status: 500 }
    );
  }
}
