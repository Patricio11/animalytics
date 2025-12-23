import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { officialClinics, clinicStaff } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/server';
import { eq, desc, or, ilike, and } from 'drizzle-orm';

/**
 * GET /api/admin/clinics
 * Get all official clinics (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // 'verified', 'unverified', 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(officialClinics.clinicName, `%${search}%`),
          ilike(officialClinics.email, `%${search}%`),
          ilike(officialClinics.city, `%${search}%`)
        )
      );
    }

    if (status === 'verified') {
      conditions.push(eq(officialClinics.isVerified, true));
    } else if (status === 'unverified') {
      conditions.push(eq(officialClinics.isVerified, false));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch clinics with staff count
    const clinics = await db
      .select({
        clinic: officialClinics,
        staffCount: db.$count(clinicStaff, eq(clinicStaff.clinicId, officialClinics.id)),
      })
      .from(officialClinics)
      .where(whereClause)
      .orderBy(desc(officialClinics.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: db.$count(officialClinics) })
      .from(officialClinics)
      .where(whereClause);

    return NextResponse.json({
      success: true,
      clinics: clinics.map(c => ({
        ...c.clinic,
        staffCount: c.staffCount,
      })),
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
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

/**
 * POST /api/admin/clinics
 * Create a new official clinic (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    console.log('Creating official clinic:', body.clinicName);

    // Create clinic
    const [newClinic] = await db
      .insert(officialClinics)
      .values({
        clinicName: body.clinicName,
        email: body.email,
        phone: body.phone || null,
        website: body.website || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        postalCode: body.postalCode || null,
        country: body.country || null,
        services: body.services ? JSON.stringify(body.services) : null,
        specializations: body.specializations ? JSON.stringify(body.specializations) : null,
        operatingHours: body.operatingHours ? JSON.stringify(body.operatingHours) : null,
        emergencyAvailable: body.emergencyAvailable || false,
        emergencyPhone: body.emergencyPhone || null,
        description: body.description || null,
        licenseNumber: body.licenseNumber || null,
        logo: body.logo || null,
        isActive: true,
        isVerified: false, // Clinics start unverified
      })
      .returning();

    return NextResponse.json({
      success: true,
      clinic: newClinic,
      message: 'Clinic created successfully',
    });
  } catch (error) {
    console.error('Error creating clinic:', error);
    return NextResponse.json(
      { error: 'Failed to create clinic' },
      { status: 500 }
    );
  }
}
