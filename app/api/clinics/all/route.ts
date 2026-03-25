import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { veterinaryClinics, officialClinics } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/server';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/veterinaryClinics/all
 * Get both personal veterinaryClinics and verified official veterinaryClinics for the breeder
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Fetch user's personal veterinaryClinics
    const personalClinics = await db
      .select()
      .from(veterinaryClinics)
      .where(eq(veterinaryClinics.userId, session.user.id));

    // Fetch verified official veterinaryClinics
    const verifiedClinics = await db
      .select()
      .from(officialClinics)
      .where(
        and(
          eq(officialClinics.isVerified, true),
          eq(officialClinics.isActive, true)
        )
      );

    // Format personal veterinaryClinics
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
      isPersonal: true, // Flag to identify personal veterinaryClinics
      isOfficial: false,
    }));

    // Format official veterinaryClinics
    const formattedOfficialClinics = verifiedClinics.map((clinic) => ({
      id: clinic.id,
      clinicName: clinic.clinicName,
      veterinarianName: null, // Official veterinaryClinics don't have a single vet name
      email: clinic.email,
      phone: clinic.phone,
      address: clinic.address,
      city: clinic.city,
      state: clinic.state,
      isPrimary: false,
      isPersonal: false,
      isOfficial: true, // Flag to identify official veterinaryClinics
      isVerified: clinic.isVerified,
      emergencyAvailable: clinic.emergencyAvailable,
      emergencyPhone: clinic.emergencyPhone,
    }));

    // Combine both lists (personal veterinaryClinics first, then official)
    const allClinics = [
      ...formattedPersonalClinics,
      ...formattedOfficialClinics,
    ];

    return NextResponse.json({
      success: true,
      veterinaryClinics: allClinics,
      counts: {
        personal: formattedPersonalClinics.length,
        official: formattedOfficialClinics.length,
        total: allClinics.length,
      },
    });
  } catch (error) {
    console.error('Error fetching veterinaryClinics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch veterinaryClinics' },
      { status: 500 }
    );
  }
}
