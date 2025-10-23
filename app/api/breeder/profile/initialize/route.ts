import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { nanoid } from 'nanoid';

// ============================================================================
// POST /api/breeder/profile/initialize
// ============================================================================
// Initialize a breeder profile with seed data (for development/testing)

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if profile already exists
    const [existingProfile] = await db
      .select()
      .from(breederProfiles)
      .where(eq(breederProfiles.userId, session.user.id))
      .limit(1);

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists', profile: existingProfile },
        { status: 400 }
      );
    }

    // Generate slug from user name or email
    const userName = session.user.name || session.user.email?.split('@')[0] || 'breeder';
    const slug = `${userName.toLowerCase().replace(/\s+/g, '-')}-${nanoid(6)}`;

    // Create minimal profile (user can fill in details later)
    const [newProfile] = await db
      .insert(breederProfiles)
      .values({
        userId: session.user.id,
        displayName: session.user.name || 'My Kennel',
        slug,
        publicEmail: session.user.email,
        isPublic: false, // Private by default until user completes profile
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Profile initialized successfully',
      profile: newProfile,
    });
  } catch (error) {
    console.error('Error initializing breeder profile:', error);
    return NextResponse.json(
      { error: 'Failed to initialize profile' },
      { status: 500 }
    );
  }
}
