import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';

// ============================================================================
// GET /api/breeder/profile
// ============================================================================
// Get the current user's breeder profile

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch breeder profile
    const [profile] = await db
      .select()
      .from(breederProfiles)
      .where(eq(breederProfiles.userId, session.user.id))
      .limit(1);

    // Return null if no profile exists (not an error)
    return NextResponse.json({
      success: true,
      profile: profile || null,
    });
  } catch (error) {
    console.error('Error fetching breeder profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/breeder/profile
// ============================================================================
// Update the current user's breeder profile

export async function PUT(request: NextRequest) {
  try {
    // Get session
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (body.displayName && body.displayName.trim().length < 3) {
      return NextResponse.json(
        { error: 'Display name must be at least 3 characters' },
        { status: 400 }
      );
    }

    // Check if profile exists
    const [existingProfile] = await db
      .select()
      .from(breederProfiles)
      .where(eq(breederProfiles.userId, session.user.id))
      .limit(1);

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only update fields that are provided
    const allowedFields = [
      'displayName',
      'tagline',
      'bio',
      'logoUrl',
      'bannerUrl',
      'coverImageUrl',
      'publicEmail',
      'publicPhone',
      'website',
      'socialMedia',
      'location',
      'businessName',
      'businessType',
      'yearsInBusiness',
      'establishedYear',
      'primaryBreeds',
      'secondaryBreeds',
      'breedingPhilosophy',
      'specializations',
      'certifications',
      'awards',
      'acceptsInternationalOrders',
      'shipsTo',
      'acceptedPaymentMethods',
      'returnPolicy',
      'shippingPolicy',
      'healthGuarantee',
      'breedingRights',
      'isPublic',
      'metaTitle',
      'metaDescription',
      'keywords',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Calculate profile completeness
    const completenessFields = [
      'displayName',
      'tagline',
      'bio',
      'logoUrl',
      'bannerUrl',
      'publicEmail',
      'publicPhone',
      'website',
      'location',
      'businessName',
      'yearsInBusiness',
      'primaryBreeds',
      'specializations',
      'certifications',
      'healthGuarantee',
    ];

    const filledFields = completenessFields.filter((field) => {
      const value = updateData[field] !== undefined ? updateData[field] : existingProfile[field as keyof typeof existingProfile];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
      return value !== null && value !== undefined && value !== '';
    });

    updateData.profileCompleteness = Math.round((filledFields.length / completenessFields.length) * 100);
    updateData.profileComplete = updateData.profileCompleteness === 100;

    // Update profile
    const [updatedProfile] = await db
      .update(breederProfiles)
      .set(updateData)
      .where(eq(breederProfiles.id, existingProfile.id))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating breeder profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
