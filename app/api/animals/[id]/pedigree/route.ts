import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animals, pedigreeSnapshots } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { checkPermission } from '@/lib/permissions/server';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { auth } from '@/lib/auth/config';
import {
  fetchPedigree,
  validateParentLinks,
  validateParentSex,
  calculatePedigreeStats,
} from '@/lib/utils/pedigree';

// ============================================================================
// GET /api/animals/[id]/pedigree
// ============================================================================
// Fetch pedigree tree for an animal

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check permission
    const { allowed } = await checkPermission(PERMISSIONS.ANIMALS_READ as any);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view animals' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const gens = Number(searchParams.get('gens') || '4');

    // Validate generations parameter
    if (gens < 1 || gens > 10) {
      return NextResponse.json(
        { error: 'Generations must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Check if animal exists
    const [animal] = await db
      .select()
      .from(animals)
      .where(eq(animals.id, id))
      .limit(1);

    if (!animal) {
      return NextResponse.json(
        { error: 'Animal not found' },
        { status: 404 }
      );
    }

    // Fetch pedigree tree (pass id as rootAnimalId for manual entries)
    const pedigree = await fetchPedigree(id, 0, gens, id);

    // Calculate statistics
    const stats = calculatePedigreeStats(pedigree, gens);

    return NextResponse.json({
      pedigree,
      generations: gens,
      stats,
    });
  } catch (error) {
    console.error('Error fetching pedigree:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/animals/[id]/pedigree
// ============================================================================
// Update parent links or create snapshot

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check permission
    const { allowed } = await checkPermission(PERMISSIONS.ANIMALS_UPDATE as any);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to update animals' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Get session for user attribution
    const session = await auth.api.getSession({ headers: request.headers });

    // Check if animal exists and verify ownership
    const [animal] = await db
      .select()
      .from(animals)
      .where(eq(animals.id, id))
      .limit(1);

    if (!animal) {
      return NextResponse.json(
        { error: 'Animal not found' },
        { status: 404 }
      );
    }

    if (session && animal.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this animal' },
        { status: 403 }
      );
    }

    // Handle snapshot creation
    if (body.snapshot) {
      const gens = body.generations || 4;
      const pedigree = await fetchPedigree(id, 0, gens);

      await db.insert(pedigreeSnapshots).values({
        animalId: id,
        snapshotJson: JSON.stringify(pedigree),
        generations: gens,
        createdBy: session?.user?.id ?? null,
      });

      return NextResponse.json({
        success: true,
        message: 'Pedigree snapshot created successfully',
      });
    }

    // Handle parent updates
    const { damId, sireId } = body;

    // Validate circular ancestry
    const circularError = await validateParentLinks(id, damId ?? null, sireId ?? null);
    if (circularError) {
      return NextResponse.json(
        { error: circularError },
        { status: 400 }
      );
    }

    // Validate parent sex (warnings only)
    const warnings: string[] = [];

    if (damId) {
      const damWarning = await validateParentSex(damId, 'dam');
      if (damWarning) warnings.push(damWarning);
    }

    if (sireId) {
      const sireWarning = await validateParentSex(sireId, 'sire');
      if (sireWarning) warnings.push(sireWarning);
    }

    // Update parent links
    await db
      .update(animals)
      .set({
        damId: damId ?? null,
        sireId: sireId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(animals.id, id));

    return NextResponse.json({
      success: true,
      message: 'Parent links updated successfully',
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (error) {
    console.error('Error updating pedigree:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
