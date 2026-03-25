import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { officialClinics, clinicStaff, users } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/server';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/admin/clinics/[id]
 * Get a specific clinic with full details (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch clinic
    const clinic = await db.query.officialClinics.findFirst({
      where: eq(officialClinics.id, id),
    });

    if (!clinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    // Fetch staff members
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
      .where(eq(clinicStaff.clinicId, id));

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
    });
  } catch (error) {
    console.error('Error fetching clinic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinic' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/clinics/[id]
 * Update a clinic (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Check if clinic exists
    const existingClinic = await db.query.officialClinics.findFirst({
      where: eq(officialClinics.id, id),
    });

    if (!existingClinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    console.log('Updating clinic:', id);

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only update provided fields
    if (body.clinicName !== undefined) updateData.clinicName = body.clinicName;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.postalCode !== undefined) updateData.postalCode = body.postalCode;
    if (body.country !== undefined) updateData.country = body.country;
    if (body.services !== undefined) updateData.services = JSON.stringify(body.services);
    if (body.specializations !== undefined) updateData.specializations = JSON.stringify(body.specializations);
    if (body.operatingHours !== undefined) updateData.operatingHours = JSON.stringify(body.operatingHours);
    if (body.emergencyAvailable !== undefined) updateData.emergencyAvailable = body.emergencyAvailable;
    if (body.emergencyPhone !== undefined) updateData.emergencyPhone = body.emergencyPhone;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.licenseNumber !== undefined) updateData.licenseNumber = body.licenseNumber;
    if (body.logo !== undefined) updateData.logo = body.logo;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    // Handle verification
    if (body.isVerified !== undefined && body.isVerified !== existingClinic.isVerified) {
      updateData.isVerified = body.isVerified;
      if (body.isVerified) {
        updateData.verifiedAt = new Date();
        updateData.verifiedBy = session.user.id;
      } else {
        updateData.verifiedAt = null;
        updateData.verifiedBy = null;
      }
    }

    const [updatedClinic] = await db
      .update(officialClinics)
      .set(updateData)
      .where(eq(officialClinics.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      clinic: updatedClinic,
      message: 'Clinic updated successfully',
    });
  } catch (error) {
    console.error('Error updating clinic:', error);
    return NextResponse.json(
      { error: 'Failed to update clinic' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/clinics/[id]
 * Delete a clinic (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Check if clinic exists
    const existingClinic = await db.query.officialClinics.findFirst({
      where: eq(officialClinics.id, id),
    });

    if (!existingClinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    console.log('Deleting clinic:', id);

    // Delete clinic (cascade will handle staff and invitations)
    await db
      .delete(officialClinics)
      .where(eq(officialClinics.id, id));

    return NextResponse.json({
      success: true,
      message: 'Clinic deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting clinic:', error);
    return NextResponse.json(
      { error: 'Failed to delete clinic' },
      { status: 500 }
    );
  }
}
