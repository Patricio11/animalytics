import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buyerProfiles } from '@/lib/db/schema/buyer-profiles';
import { savedListings } from '@/lib/db/schema/marketplace';
import { conversations, messages } from '@/lib/db/schema/conversations';
import { purchases } from '@/lib/db/schema/purchases';
import { eq, count, sum, and, or } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

/**
 * GET /api/buyer/stats
 * Get buyer statistics and activity summary
 */
export async function GET(request: NextRequest) {
  try {
    // Get current session
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

    // Get buyer profile
    const [profile] = await db
      .select()
      .from(buyerProfiles)
      .where(eq(buyerProfiles.userId, userId))
      .limit(1);

    if (!profile) {
      return NextResponse.json(
        { error: 'Buyer profile not found' },
        { status: 404 }
      );
    }

    // Get saved listings count
    const [savedCount] = await db
      .select({ count: count() })
      .from(savedListings)
      .where(eq(savedListings.userId, userId));

    // Get conversations count
    const [conversationCount] = await db
      .select({ count: count() })
      .from(conversations)
      .where(eq(conversations.buyerId, userId));

    // Get unread messages count
    const [unreadCount] = await db
      .select({
        total: sum(conversations.unreadCountBuyer)
      })
      .from(conversations)
      .where(eq(conversations.buyerId, userId));

    // Get purchase statistics
    const [purchaseStats] = await db
      .select({
        totalPurchases: count(),
        totalSpent: sum(purchases.purchasePrice),
      })
      .from(purchases)
      .where(
        and(
          eq(purchases.buyerId, userId),
          eq(purchases.status, 'completed')
        )
      );

    // Get pending purchases count
    const [pendingPurchases] = await db
      .select({ count: count() })
      .from(purchases)
      .where(
        and(
          eq(purchases.buyerId, userId),
          or(
            eq(purchases.status, 'pending'),
            eq(purchases.status, 'payment_pending'),
            eq(purchases.status, 'confirmed'),
            eq(purchases.status, 'preparing'),
            eq(purchases.status, 'ready_for_pickup'),
            eq(purchases.status, 'in_transit')
          )
        )
      );

    // Compile stats
    const stats = {
      profile: {
        id: profile.id,
        displayName: profile.displayName,
        isVerified: profile.isVerified,
        memberSince: profile.createdAt,
        lastActive: profile.lastActiveAt,
      },
      activity: {
        savedListings: savedCount?.count || 0,
        totalConversations: conversationCount?.count || 0,
        unreadMessages: Number(unreadCount?.total) || 0,
      },
      purchases: {
        totalCompleted: purchaseStats?.totalPurchases || 0,
        totalSpent: Number(purchaseStats?.totalSpent || 0) / 100, // Convert cents to dollars
        pendingOrders: pendingPurchases?.count || 0,
      },
      preferences: {
        interestedBreeds: profile.interestedBreeds,
        budgetRange: profile.budgetRange,
        lookingFor: profile.lookingFor,
        preferredGender: profile.preferredGender,
        experienceLevel: profile.experienceLevel,
      },
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching buyer stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buyer stats' },
      { status: 500 }
    );
  }
}
