import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations } from '@/lib/db/schema/conversations';
import { eq, or, sum } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

/**
 * GET /api/conversations/unread
 * Get total unread message count for the current user
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

    // Get unread count as buyer
    const [buyerUnread] = await db
      .select({
        total: sum(conversations.unreadCountBuyer),
      })
      .from(conversations)
      .where(eq(conversations.buyerId, userId));

    // Get unread count as seller
    const [sellerUnread] = await db
      .select({
        total: sum(conversations.unreadCountSeller),
      })
      .from(conversations)
      .where(eq(conversations.sellerId, userId));

    const totalUnread =
      (Number(buyerUnread?.total) || 0) +
      (Number(sellerUnread?.total) || 0);

    return NextResponse.json({
      success: true,
      unreadCount: totalUnread,
      breakdown: {
        asBuyer: Number(buyerUnread?.total) || 0,
        asSeller: Number(sellerUnread?.total) || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
}
