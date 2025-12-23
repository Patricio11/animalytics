import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { veterinaryClinics } from '@/lib/db/schema/clinics';
import { requireAuth } from '@/lib/auth/server';
import { eq, and } from 'drizzle-orm';

/**
 * PATCH /api/clinics/[id]
 * Update a veterinary clinic
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    console.log('Updating clinic:', id);

    // Verify ownership
    const existingClinic = await db.query.veterinaryClinics.findFirst({
      where: and(
        eq(veterinaryClinics.id, id),
        eq(veterinaryClinics.userId, session.user.id)
      ),
    });

    if (!existingClinic) {
      return NextResponse.json(
        { success: false, error: 'Clinic not found' },
        { status: 404 }
      );
    }

    // If setting as primary, unset other primary clinics
    if (body.isPrimary && !existingClinic.isPrimary) {
      await db
        .update(veterinaryClinics)
        .set({ isPrimary: false })
        .where(and(
          eq(veterinaryClinics.userId, session.user.id),
          eq(veterinaryClinics.isPrimary, true)
        ));
    }

    const [updatedClinic] = await db
      .update(veterinaryClinics)
      .set({
        clinicName: body.clinicName,
        veterinarianName: body.veterinarianName || null,
        email: body.email,
        phone: body.phone || null,
        website: body.website || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        postalCode: body.postalCode || null,
        country: body.country || null,
        emergencyAvailable: body.emergencyAvailable || false,
        emergencyPhone: body.emergencyPhone || null,
        isPrimary: body.isPrimary || false,
        isFavorite: body.isFavorite || false,
        notes: body.notes || null,
        updatedAt: new Date(),
      })
      .where(eq(veterinaryClinics.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      clinic: updatedClinic,
    });
  } catch (error) {
    console.error('Error updating clinic:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update clinic' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clinics/[id]
 * Delete a veterinary clinic
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    console.log('Deleting clinic:', id);

    // Verify ownership
    const existingClinic = await db.query.veterinaryClinics.findFirst({
      where: and(
        eq(veterinaryClinics.id, id),
        eq(veterinaryClinics.userId, session.user.id)
      ),
    });

    if (!existingClinic) {
      return NextResponse.json(
        { success: false, error: 'Clinic not found' },
        { status: 404 }
      );
    }

    await db
      .delete(veterinaryClinics)
      .where(eq(veterinaryClinics.id, id));

    return NextResponse.json({
      success: true,
      message: 'Clinic deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting clinic:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete clinic' },
      { status: 500 }
    );
  }
}
