import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { listingBoosts } from '@/lib/db/schema/boost';
import { listings } from '@/lib/db/schema/marketplace';
import { users } from '@/lib/db/schema/users';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

async function isAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user?.role === 'admin';
}

/**
 * GET /api/admin/marketplace/boosts
 * Fetch all listing boosts with listing and user info
 */
export async function GET(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    const conditions = [];
    if (statusFilter) {
      conditions.push(eq(listingBoosts.status, statusFilter));
    }

    const boosts = await db
      .select({
        boost: listingBoosts,
        listingTitle: listings.title,
        listingSlug: listings.slug,
        userName: users.name,
        userEmail: users.email,
      })
      .from(listingBoosts)
      .innerJoin(listings, eq(listingBoosts.listingId, listings.id))
      .innerJoin(users, eq(listingBoosts.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(listingBoosts.createdAt));

    return NextResponse.json({
      success: true,
      boosts: boosts.map((b) => ({
        ...b.boost,
        listingTitle: b.listingTitle,
        listingSlug: b.listingSlug,
        userName: b.userName,
        userEmail: b.userEmail,
      })),
    });
  } catch (error) {
    console.error('Error fetching boosts:', error);
    return NextResponse.json({ error: 'Failed to fetch boosts' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/marketplace/boosts
 * Update a boost (e.g., add social media post URLs, change status)
 */
export async function PATCH(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, socialMediaPostUrls, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Boost ID is required' }, { status: 400 });
    }

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (socialMediaPostUrls !== undefined) updateData.socialMediaPostUrls = socialMediaPostUrls;
    if (status) updateData.status = status;

    const [updated] = await db
      .update(listingBoosts)
      .set(updateData)
      .where(eq(listingBoosts.id, id))
      .returning();

    return NextResponse.json({ success: true, boost: updated });
  } catch (error) {
    console.error('Error updating boost:', error);
    return NextResponse.json({ error: 'Failed to update boost' }, { status: 500 });
  }
}
