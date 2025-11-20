import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema/conversations';
import { listings } from '@/lib/db/schema/marketplace';
import { users } from '@/lib/db/schema/users';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

/**
 * GET /api/conversations/[id]
 * Get a single conversation with messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;

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

    // Get conversation
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if user is part of the conversation
    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Determine user role
    const userRole = conversation.buyerId === userId ? 'buyer' : 'seller';

    // Mark messages as read and reset unread count
    if (userRole === 'buyer' && conversation.unreadCountBuyer > 0) {
      // Mark all messages as read
      await db
        .update(messages)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(messages.conversationId, conversationId),
            eq(messages.isRead, false)
          )
        );

      // Reset unread count
      await db
        .update(conversations)
        .set({
          unreadCountBuyer: 0,
          updatedAt: new Date(),
        })
        .where(eq(conversations.id, conversationId));
    } else if (userRole === 'seller' && conversation.unreadCountSeller > 0) {
      // Mark all messages as read
      await db
        .update(messages)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(messages.conversationId, conversationId),
            eq(messages.isRead, false)
          )
        );

      // Reset unread count
      await db
        .update(conversations)
        .set({
          unreadCountSeller: 0,
          updatedAt: new Date(),
        })
        .where(eq(conversations.id, conversationId));
    }

    // Get listing if exists
    let listing = null;
    if (conversation.listingId) {
      const [listingData] = await db
        .select({
          id: listings.id,
          title: listings.title,
          category: listings.category,
          price: listings.price,
          currency: listings.currency,
          status: listings.status,
        })
        .from(listings)
        .where(eq(listings.id, conversation.listingId))
        .limit(1);
      listing = listingData;
    }

    // Get other participant details
    const otherUserId = userRole === 'buyer'
      ? conversation.sellerId
      : conversation.buyerId;

    const [otherUser] = await db
      .select({
        id: users.id,
        name: users.name,
        image: users.image,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, otherUserId))
      .limit(1);

    // Get messages
    const conversationMessages = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.isDeleted, false)
        )
      )
      .orderBy(desc(messages.createdAt));

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        subject: conversation.subject,
        status: conversation.status,
        createdAt: conversation.createdAt,
        userRole,
        otherParticipant: otherUser || {
          id: otherUserId,
          name: 'Unknown User',
          image: null,
          email: null,
        },
        listing,
        isArchived: userRole === 'buyer'
          ? conversation.archivedByBuyer
          : conversation.archivedBySeller,
        isBlocked: userRole === 'buyer'
          ? conversation.blockedBySeller
          : conversation.blockedByBuyer,
        blockedByMe: userRole === 'buyer'
          ? conversation.blockedByBuyer
          : conversation.blockedBySeller,
      },
      messages: conversationMessages.reverse(), // Oldest first for display
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/conversations/[id]
 * Update conversation (archive, block, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;

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
    const body = await request.json();

    // Get conversation
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if user is part of the conversation
    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Determine user role
    const userRole = conversation.buyerId === userId ? 'buyer' : 'seller';

    // Build update object based on action
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Handle archive action
    if (body.action === 'archive') {
      if (userRole === 'buyer') {
        updateData.archivedByBuyer = true;
        updateData.archivedByBuyerAt = new Date();
      } else {
        updateData.archivedBySeller = true;
        updateData.archivedBySellerAt = new Date();
      }
    }

    // Handle unarchive action
    if (body.action === 'unarchive') {
      if (userRole === 'buyer') {
        updateData.archivedByBuyer = false;
        updateData.archivedByBuyerAt = null;
      } else {
        updateData.archivedBySeller = false;
        updateData.archivedBySellerAt = null;
      }
    }

    // Handle block action
    if (body.action === 'block') {
      if (userRole === 'buyer') {
        updateData.blockedByBuyer = true;
      } else {
        updateData.blockedBySeller = true;
      }
      updateData.status = 'blocked';
    }

    // Handle unblock action
    if (body.action === 'unblock') {
      if (userRole === 'buyer') {
        updateData.blockedByBuyer = false;
      } else {
        updateData.blockedBySeller = false;
      }
      // Only set status back to active if neither user has blocked
      const otherBlocked = userRole === 'buyer'
        ? conversation.blockedBySeller
        : conversation.blockedByBuyer;
      if (!otherBlocked) {
        updateData.status = 'active';
      }
    }

    // Handle subject update
    if (body.subject !== undefined) {
      updateData.subject = body.subject;
    }

    // Update conversation
    const [updatedConversation] = await db
      .update(conversations)
      .set(updateData)
      .where(eq(conversations.id, conversationId))
      .returning();

    return NextResponse.json({
      success: true,
      conversation: updatedConversation,
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/conversations/[id]
 * Delete conversation (soft delete - marks as deleted)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;

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

    // Get conversation
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if user is part of the conversation
    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update conversation status to deleted
    await db
      .update(conversations)
      .set({
        status: 'deleted',
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId));

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted',
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
