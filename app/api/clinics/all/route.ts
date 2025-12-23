import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clinics, officialClinics } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/server';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/clinics/all
 * Get both personal clinics and verified official clinics for the breeder
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Fetch user's personal clinics
    const personalClinics = await db
      .select()
      .from(clinics)
      .where(eq(clinics.userId, session.user.id));

    // Fetch verified official clinics
    const verifiedClinics = await db
      .select()
      .from(officialClinics)
      .where(
        and(
          eq(officialClinics.isVerified, true),
          eq(officialClinics.isActive, true)
        )
      );

    // Format personal clinics
    const formattedPersonalClinics = personalClinics.map((clinic) => ({
      id: clinic.id,
      clinicName: clinic.clinicName,
      veterinarianName: clinic.veterinarianName,
      email: clinic.email,
      phone: clinic.phone,
      address: clinic.address,
      city: clinic.city,
      state: clinic.state,
      isPrimary: clinic.isPrimary,
      isPersonal: true, // Flag to identify personal clinics
      isOfficial: false,
    }));

    // Format official clinics
    const formattedOfficialClinics = verifiedClinics.map((clinic) => ({
      id: clinic.id,
      clinicName: clinic.clinicName,
      veterinarianName: null, // Official clinics don't have a single vet name
      email: clinic.email,
      phone: clinic.phone,
      address: clinic.address,
      city: clinic.city,
      state: clinic.state,
      isPrimary: false,
      isPersonal: false,
      isOfficial: true, // Flag to identify official clinics
      isVerified: clinic.isVerified,
      emergencyAvailable: clinic.emergencyAvailable,
      emergencyPhone: clinic.emergencyPhone,
    }));

    // Combine both lists (personal clinics first, then official)
    const allClinics = [
      ...formattedPersonalClinics,
      ...formattedOfficialClinics,
    ];

    return NextResponse.json({
      success: true,
      clinics: allClinics,
      counts: {
        personal: formattedPersonalClinics.length,
        official: formattedOfficialClinics.length,
        total: allClinics.length,
      },
    });
  } catch (error) {
    console.error('Error fetching clinics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinics' },
      { status: 500 }
    );
  }
}
