import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { officialClinics, clinicStaff, users } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/server';
import { eq } from 'drizzle-orm';

/**
 * GET /api/vet/clinic
 * Get the veterinarian's clinic information
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Check if user is a veterinarian
    if (session.user.role !== 'veterinary') {
      return NextResponse.json(
        { error: 'Unauthorized - Veterinary access required' },
        { status: 403 }
      );
    }

    // Find the vet's clinic staff record
    const userStaffRecord = await db.query.clinicStaff.findFirst({
      where: eq(clinicStaff.userId, session.user.id),
    });

    if (!userStaffRecord) {
      return NextResponse.json(
        { error: 'Not associated with any clinic' },
        { status: 404 }
      );
    }

    // Fetch clinic details
    const clinic = await db.query.officialClinics.findFirst({
      where: eq(officialClinics.id, userStaffRecord.clinicId),
    });

    if (!clinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    // Fetch all staff members
    const staff = await db
      .select({
        staff: clinicStaff,
        user: {
          id: users.id,
          email: users.email,
          name: users.name,
          avatar: users.avatar,
        },
      })
      .from(clinicStaff)
      .leftJoin(users, eq(clinicStaff.userId, users.id))
      .where(eq(clinicStaff.clinicId, userStaffRecord.clinicId));

    return NextResponse.json({
      success: true,
      clinic: {
        ...clinic,
        services: clinic.services ? JSON.parse(clinic.services) : [],
        specializations: clinic.specializations ? JSON.parse(clinic.specializations) : [],
        operatingHours: clinic.operatingHours ? JSON.parse(clinic.operatingHours) : null,
      },
      staff: staff.map(s => ({
        ...s.staff,
        user: s.user,
      })),
      userStaffRecord,
    });
  } catch (error) {
    console.error('Error fetching vet clinic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinic' },
      { status: 500 }
    );
  }
}
