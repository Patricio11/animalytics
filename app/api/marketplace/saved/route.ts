import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { savedListings, listings } from '@/lib/db/schema/marketplace';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

/**
 * GET /api/marketplace/saved
 * Get all saved listings for the current user
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get saved listings with full listing details
    const saved = await db
      .select({
        savedListing: savedListings,
        listing: listings,
      })
      .from(savedListings)
      .innerJoin(listings, eq(savedListings.listingId, listings.id))
      .where(eq(savedListings.userId, userId))
      .orderBy(desc(savedListings.savedAt));

    return NextResponse.json({
      success: true,
      saved: saved.map(s => ({
        ...s.savedListing,
        listing: s.listing,
      })),
    });
  } catch (error) {
    console.error('Error fetching saved listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved listings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/saved
 * Save or unsave a listing (toggle)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Check if already saved
    const [existing] = await db
      .select()
      .from(savedListings)
      .where(
        and(
          eq(savedListings.userId, userId),
          eq(savedListings.listingId, listingId)
        )
      )
      .limit(1);

    if (existing) {
      // Already saved, remove it (toggle off)
      await db
        .delete(savedListings)
        .where(eq(savedListings.id, existing.id));

      return NextResponse.json({
        success: true,
        saved: false,
        message: 'Listing removed from saved',
      });
    }

    // Save the listing
    const [saved] = await db
      .insert(savedListings)
      .values({
        userId,
        listingId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      saved: true,
      data: saved,
      message: 'Listing saved successfully',
    });
  } catch (error) {
    console.error('Error saving listing:', error);
    return NextResponse.json(
      { error: 'Failed to save listing' },
      { status: 500 }
    );
  }
}
