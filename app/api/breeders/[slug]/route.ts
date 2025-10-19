import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { eq } from 'drizzle-orm';

// ============================================================================
// GET /api/breeders/[slug]
// ============================================================================
// Fetch a single public breeder profile by slug

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch breeder profile by slug
    const [profile] = await db
      .select()
      .from(breederProfiles)
      .where(eq(breederProfiles.slug, slug))
      .limit(1);

    if (!profile) {
      return NextResponse.json(
        { error: 'Breeder not found' },
        { status: 404 }
      );
    }

    // Check if profile is public
    if (!profile.isPublic) {
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
