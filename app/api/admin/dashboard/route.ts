import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { animals } from '@/lib/db/schema/animals';
import { listings } from '@/lib/db/schema/marketplace';
import { purchases } from '@/lib/db/schema/purchases';
import { conversations } from '@/lib/db/schema/conversations';
import { eq, sql, gte, desc, and } from 'drizzle-orm';
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
 * GET /api/admin/dashboard
 * Get admin dashboard statistics
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

    // Calculate date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // ========================================================================
    // 1. User Statistics
    // ========================================================================
    const [userStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        breeders: sql<number>`COUNT(CASE WHEN ${users.role} = 'breeder' THEN 1 END)::int`,
        petOwners: sql<number>`COUNT(CASE WHEN ${users.role} = 'pet_owner' THEN 1 END)::int`,
        veterinarians: sql<number>`COUNT(CASE WHEN ${users.role} = 'veterinarian' THEN 1 END)::int`,
        admins: sql<number>`COUNT(CASE WHEN ${users.role} = 'admin' THEN 1 END)::int`,
        verified: sql<number>`COUNT(CASE WHEN ${users.isVerified} = true THEN 1 END)::int`,
        newThisMonth: sql<number>`COUNT(CASE WHEN ${users.createdAt} >= ${thirtyDaysAgo} THEN 1 END)::int`,
      })
      .from(users);

    // ========================================================================
    // 2. Animal Statistics
    // ========================================================================
    const [animalStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`COUNT(CASE WHEN ${animals.isActive} = true THEN 1 END)::int`,
        breeding: sql<number>`COUNT(CASE WHEN ${animals.isBreedingActive} = true THEN 1 END)::int`,
        champions: sql<number>`COUNT(CASE WHEN ${animals.isChampion} = true THEN 1 END)::int`,
      })
      .from(animals);

    // ========================================================================
    // 3. Listing Statistics
    // ========================================================================
    const [listingStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`COUNT(CASE WHEN ${listings.status} = 'active' THEN 1 END)::int`,
        sold: sql<number>`COUNT(CASE WHEN ${listings.status} = 'sold' THEN 1 END)::int`,
        draft: sql<number>`COUNT(CASE WHEN ${listings.status} = 'draft' THEN 1 END)::int`,
        featured: sql<number>`COUNT(CASE WHEN ${listings.isFeatured} = true THEN 1 END)::int`,
        totalViews: sql<number>`SUM(${listings.viewCount})::int`,
      })
      .from(listings);

    // ========================================================================
    // 4. Purchase Statistics
    // ========================================================================
    const [purchaseStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        pending: sql<number>`COUNT(CASE WHEN ${purchases.status} = 'pending' THEN 1 END)::int`,
        completed: sql<number>`COUNT(CASE WHEN ${purchases.status} = 'completed' THEN 1 END)::int`,
        inEscrow: sql<number>`COUNT(CASE WHEN ${purchases.status} = 'payment_completed' THEN 1 END)::int`,
        disputed: sql<number>`COUNT(CASE WHEN ${purchases.status} = 'disputed' THEN 1 END)::int`,
        totalRevenue: sql<number>`COALESCE(SUM(${purchases.totalAmount}), 0)::int`,
        revenueThisMonth: sql<number>`COALESCE(SUM(CASE WHEN ${purchases.createdAt} >= ${thirtyDaysAgo} THEN ${purchases.totalAmount} ELSE 0 END), 0)::int`,
      })
      .from(purchases);

    // ========================================================================
    // 5. Message Statistics
    // ========================================================================
    const [messageStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`COUNT(CASE WHEN ${conversations.status} = 'active' THEN 1 END)::int`,
        thisWeek: sql<number>`COUNT(CASE WHEN ${conversations.createdAt} >= ${sevenDaysAgo} THEN 1 END)::int`,
      })
      .from(conversations);

    // ========================================================================
    // 6. Recent Activity
    // ========================================================================

    // Recent users
    const recentUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10);

    // Recent listings
    const recentListings = await db
      .select({
        id: listings.id,
        title: listings.title,
        category: listings.category,
        status: listings.status,
        price: listings.price,
        userId: listings.userId,
        createdAt: listings.createdAt,
      })
      .from(listings)
      .orderBy(desc(listings.createdAt))
      .limit(10);

    // Recent purchases
    const recentPurchases = await db
      .select({
        id: purchases.id,
        amount: purchases.totalAmount,
        status: purchases.status,
        petOwnerId: purchases.petOwnerId,
        sellerId: purchases.sellerId,
        createdAt: purchases.createdAt,
      })
      .from(purchases)
      .orderBy(desc(purchases.createdAt))
      .limit(10);

    // ========================================================================
    // 7. Growth Metrics (30-day trend)
    // ========================================================================

    // Get user growth over last 30 days
    const userGrowth = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    // Get listing growth over last 30 days
    const listingGrowth = await db
      .select({
        date: sql<string>`DATE(${listings.createdAt})`,
        count: sql<number>`count(*)::int`,
      })
      .from(listings)
      .where(gte(listings.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${listings.createdAt})`)
      .orderBy(sql`DATE(${listings.createdAt})`);

    return NextResponse.json({
      success: true,
      statistics: {
        users: userStats,
        animals: animalStats,
        listings: listingStats,
        purchases: purchaseStats,
        messages: messageStats,
      },
      recentActivity: {
        users: recentUsers,
        listings: recentListings,
        purchases: recentPurchases,
      },
      growth: {
        users: userGrowth,
        listings: listingGrowth,
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
