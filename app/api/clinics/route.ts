import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { veterinaryClinics } from '@/lib/db/schema/clinics';
import { requireAuth } from '@/lib/auth/server';
import { eq, and, desc } from 'drizzle-orm';

/**
 * GET /api/clinics
 * Get all veterinary clinics for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const clinics = await db
      .select()
      .from(veterinaryClinics)
      .where(eq(veterinaryClinics.userId, session.user.id))
      .orderBy(desc(veterinaryClinics.isPrimary), desc(veterinaryClinics.createdAt));

    return NextResponse.json({
      success: true,
      clinics,
    });
  } catch (error) {
    console.error('Error fetching clinics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clinics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clinics
 * Create a new veterinary clinic
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    console.log('Creating clinic for user:', session.user.id);

    // If setting as primary, unset other primary clinics
    if (body.isPrimary) {
      await db
        .update(veterinaryClinics)
        .set({ isPrimary: false })
        .where(eq(veterinaryClinics.userId, session.user.id));
    }

    const [newClinic] = await db
      .insert(veterinaryClinics)
      .values({
        userId: session.user.id,
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
      })
      .returning();

    return NextResponse.json({
      success: true,
      clinic: newClinic,
    });
  } catch (error) {
    console.error('Error creating clinic:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create clinic' },
      { status: 500 }
    );
  }
}
