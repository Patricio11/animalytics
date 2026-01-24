import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

// ============================================================================
// GET /api/breeders/[slug]
// ============================================================================
// Fetch a single breeder profile by slug
// Public profiles are accessible to everyone
// Private profiles are only accessible to admins

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Check if user is admin
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const isAdmin = session?.user?.role === 'admin';

    // Fetch breeder profile by slug
    const [profile] = await db
      .select()
      .from(breederProfiles)
      .where(eq(breederProfiles.slug, slug))
      .limit(1);

    console.log('Breeder profile lookup:', { 
      slug, 
      found: !!profile, 
      isPublic: profile?.isPublic,
      isAdmin 
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Breeder not found' },
        { status: 404 }
      );
    }

    // Check if profile is accessible
    // Admins can view any profile, others can only view public profiles
    if (!profile.isPublic && !isAdmin) {
      return NextResponse.json(
        { error: 'This profile is not public' },
        { status: 403 }
      );
    }

    // Increment profile views (async, don't wait)
    db.update(breederProfiles)
      .set({ 
        profileViews: (profile.profileViews || 0) + 1,
        profileViewsThisMonth: (profile.profileViewsThisMonth || 0) + 1,
      })
      .where(eq(breederProfiles.id, profile.id))
      .execute()
      .catch(console.error);

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Error fetching breeder profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch breeder profile' },
      { status: 500 }
    );
  }
}
