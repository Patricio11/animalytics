import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animals, manualPedigreeEntries } from '@/lib/db/schema/animals';
import { requireAuth } from '@/lib/auth/server';
import { eq, and } from 'drizzle-orm';

// ============================================================================
// POST /api/animals/[id]/pedigree/scan/save
// ============================================================================
// Bulk save extracted pedigree entries from AI scan

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Verify ownership and fetch animal breed for fallback
    const [animal] = await db
      .select({ id: animals.id, userId: animals.userId, breedId: animals.breedId })
      .from(animals)
      .where(and(eq(animals.id, id), eq(animals.userId, session.user.id)))
      .limit(1);

    if (!animal) {
      return NextResponse.json(
        { success: false, error: 'Animal not found or access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { entries, clearExisting, defaultBreed } = body;

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No entries provided' },
        { status: 400 }
      );
    }

    // Optionally clear existing manual entries before saving scanned ones
    if (clearExisting) {
      await db
        .delete(manualPedigreeEntries)
        .where(eq(manualPedigreeEntries.animalId, id));
    }

    // Build values for bulk insert
    // The tree displays registeredName as the primary bold name.
    // name is NOT NULL in the DB, so we must always have a value.
    const values = entries.map((entry: any) => {
      const registeredName = entry.registeredName || entry.name || 'Unknown';
      const name = entry.name || registeredName; // name is NOT NULL in DB

      return {
        animalId: id,
        userId: session.user.id,
        position: entry.position,
        generation: entry.generation,
        name,
        registeredName,
        registrationNumber: entry.registrationNumber || null,
        breed: entry.breed || defaultBreed || null,
        sex: entry.sex || (entry.position?.endsWith('dam') ? 'female' : 'male'),
        dateOfBirth: entry.dateOfBirth || null,
        color: entry.color || null,
        titles: entry.titles?.length > 0 ? entry.titles : null,
        notes: entry.notes || 'Scanned from pedigree certificate',
      };
    });

    // Upsert logic: for each position, delete existing then insert
    // This handles the case where some positions already have entries
    let created = 0;
    let updated = 0;

    for (const value of values) {
      // Check if entry already exists at this position
      const [existing] = await db
        .select({ id: manualPedigreeEntries.id })
        .from(manualPedigreeEntries)
        .where(
          and(
            eq(manualPedigreeEntries.animalId, id),
            eq(manualPedigreeEntries.position, value.position)
          )
        )
        .limit(1);

      if (existing) {
        // Update existing entry
        await db
          .update(manualPedigreeEntries)
          .set({
            ...value,
            updatedAt: new Date(),
          })
          .where(eq(manualPedigreeEntries.id, existing.id));
        updated++;
      } else {
        // Insert new entry
        await db
          .insert(manualPedigreeEntries)
          .values(value);
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Pedigree saved: ${created} entries created, ${updated} entries updated`,
      created,
      updated,
      total: entries.length,
    });
  } catch (error) {
    console.error('Error saving scanned pedigree:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save pedigree data' },
      { status: 500 }
    );
  }
}
