import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { listings } from '@/lib/db/schema/marketplace';
import { users } from '@/lib/db/schema/users';
import { eq, sql, ilike, or, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

/**
 * Helper function to check if user is admin
 */
async function isAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'admin') {
    return false;
  }

  return true;
}

/**
 * GET /api/admin/listings
 * List all listings for moderation with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    // Build where conditions
    const conditions = [];

    if (status) {
      conditions.push(eq(listings.status, status as any));
    }

    if (category) {
      conditions.push(eq(listings.category, category as any));
    }

    if (search) {
      conditions.push(
        or(
          ilike(listings.title, `%${search}%`),
          ilike(listings.description, `%${search}%`),
          ilike(listings.breed, `%${search}%`)
        )!
      );
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(listings)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Get listings with user info
    const listingsList = await db
      .select({
        id: listings.id,
        userId: listings.userId,
        category: listings.category,
        title: listings.title,
        description: listings.description,
        price: listings.price,
        currency: listings.currency,
        status: listings.status,
        breed: listings.breed,
        sex: listings.sex,
        age: listings.age,
        additionalImages: listings.additionalImages,
        requiresApproval: listings.requiresApproval,
        approvedBy: listings.approvedBy,
        approvedAt: listings.approvedAt,
        rejectedBy: listings.rejectedBy,
        rejectedAt: listings.rejectedAt,
        rejectionReason: listings.rejectionReason,
        viewCount: listings.viewCount,
        inquiryCount: listings.inquiryCount,
        createdAt: listings.createdAt,
        publishedAt: listings.publishedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(listings)
      .leftJoin(users, eq(listings.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(listings.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      listings: listingsList,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
