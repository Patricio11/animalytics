import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { getUnreadCount } from '@/lib/services/messaging-service';

/**
 * GET /api/conversations/unread
 * Get total unread message count for the current user
 * Supports all user roles: Buyer, Breeder, Veterinarian, Event Organizer
 */
export async function GET() {
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

    // Use centralized messaging service (future-proof for all roles)
    const unreadData = await getUnreadCount(userId);

    return NextResponse.json({
      success: true,
      unreadCount: unreadData.total,
      breakdown: unreadData.breakdown,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
}
