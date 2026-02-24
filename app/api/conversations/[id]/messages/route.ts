import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema/conversations';
import { users } from '@/lib/db/schema/users';
import { eq, and, desc, gt, lt, ne } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { triggerMessageNotification } from '@/lib/services/realtime-messaging';
import { createMessageReceivedNotification } from '@/lib/services/notification-creator';
import { sendNewMessageEmail } from '@/lib/services/email';

/**
 * GET /api/conversations/[id]/messages
 * Get messages for a conversation with pagination
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
    if (conversation.petOwnerId !== userId && conversation.sellerId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get query params for pagination
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor'); // Message ID to start from
    const limit = parseInt(searchParams.get('limit') || '50');
    const direction = searchParams.get('direction') || 'older'; // 'older' or 'newer'

    // Build query based on cursor pagination
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allMessages: any[] = [];
    
    if (cursor) {
      // Get the cursor message's timestamp
      const [cursorMessage] = await db
        .select({ createdAt: messages.createdAt })
        .from(messages)
        .where(eq(messages.id, cursor))
        .limit(1);

      if (cursorMessage) {
        if (direction === 'older') {
          allMessages = await db
            .select()
            .from(messages)
            .where(
              and(
                eq(messages.conversationId, conversationId),
                eq(messages.isDeleted, false),
                lt(messages.createdAt, cursorMessage.createdAt)
              )
            )
            .orderBy(desc(messages.createdAt))
            .limit(limit + 1);
        } else {
          allMessages = await db
            .select()
            .from(messages)
            .where(
              and(
                eq(messages.conversationId, conversationId),
                eq(messages.isDeleted, false),
                gt(messages.createdAt, cursorMessage.createdAt)
              )
            )
            .orderBy(messages.createdAt)
            .limit(limit + 1);
        }
      } else {
        // Cursor not found, return empty
        allMessages = [];
      }
    } else {
      // No cursor - get most recent messages
      allMessages = await db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, conversationId),
            eq(messages.isDeleted, false)
          )
        )
        .orderBy(desc(messages.createdAt))
        .limit(limit + 1);
    }

    // Check if there are more messages
    const hasMore = allMessages.length > limit;
    const fetchedMessages = hasMore ? allMessages.slice(0, limit) : allMessages;

    // For display, reverse to show oldest first
    const sortedMessages = direction === 'newer'
      ? fetchedMessages
      : fetchedMessages.reverse();

    // Get next cursor
    const nextCursor = hasMore && fetchedMessages.length > 0
      ? fetchedMessages[fetchedMessages.length - 1].id
      : null;

    return NextResponse.json({
      success: true,
      messages: sortedMessages,
      pagination: {
        hasMore,
        nextCursor,
        count: sortedMessages.length,
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations/[id]/messages
 * Send a new message in a conversation
 */
export async function POST(
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
    if (conversation.petOwnerId !== userId && conversation.sellerId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if conversation is blocked
    if (conversation.status === 'blocked') {
      return NextResponse.json(
        { error: 'This conversation is blocked' },
        { status: 403 }
      );
    }

    // Determine user role
    const userRole = conversation.petOwnerId === userId ? 'pet_owner' : 'seller';

    // Check if user is blocked
    const isBlocked = userRole === 'pet_owner'
      ? conversation.blockedBySeller
      : conversation.blockedByPetOwner;

    if (isBlocked) {
      return NextResponse.json(
        { error: 'You cannot send messages to this user' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { message, messageType = 'text', attachments, metadata } = body;

    // Validate message
    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Create message
    const [newMessage] = await db
      .insert(messages)
      .values({
        conversationId,
        senderId: userId,
        message: message.trim(),
        messageType,
        attachments: attachments || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      })
      .returning();

    // Update conversation
    const updateData: Record<string, unknown> = {
      lastMessageAt: new Date(),
      lastMessagePreview: message.trim().substring(0, 100),
      updatedAt: new Date(),
      // Unarchive if it was archived
      archivedByPetOwner: false,
      archivedBySeller: false,
    };

    // Increment unread count for the other participant
    if (userRole === 'pet_owner') {
      updateData.unreadCountSeller = conversation.unreadCountSeller + 1;
    } else {
      updateData.unreadCountPetOwner = conversation.unreadCountPetOwner + 1;
    }

    await db
      .update(conversations)
      .set(updateData)
      .where(eq(conversations.id, conversationId));

    // Trigger real-time notification for both participants
    // This notifies their SSE connections to fetch updated unread counts
    triggerMessageNotification([conversation.petOwnerId, conversation.sellerId]);

    // Create in-app notification for the recipient
    try {
      // Determine recipient ID based on conversation role
      const recipientId = userRole === 'pet_owner' ? conversation.sellerId : conversation.petOwnerId;

      // Get sender's name and recipient's actual user role from database
      const [sender] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      const [recipient] = await db
        .select({ name: users.name, role: users.role, email: users.email })
        .from(users)
        .where(eq(users.id, recipientId))
        .limit(1);

      const senderName = sender?.name || 'Someone';
      // Use actual user role (breeder/buyer), NOT conversation role (buyer/seller)
      // Breeders can buy AND sell, so they always use /messages
      // Buyers can only buy, so they use /buyer/messages
      const recipientUserRole = (recipient?.role || 'breeder') as 'breeder' | 'pet_owner' | 'vet' | 'event_organizer' | 'admin';

      // Create notification for recipient
      await createMessageReceivedNotification({
        userId: recipientId,
        senderName,
        messagePreview: message.trim().substring(0, 100),
        conversationId,
        recipientUserRole,
      });

      // Send email notification to recipient
      if (recipient?.email) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'https://animalytics.co';
        const messagesPath = recipientUserRole === 'pet_owner' ? '/buyer/messages' : '/messages';
        const conversationUrl = `${baseUrl}${messagesPath}?conversation=${conversationId}`;

        sendNewMessageEmail(recipient.email, {
          recipientName: recipient.name || 'there',
          senderName,
          messagePreview: message.trim().substring(0, 200),
          conversationUrl,
        }).catch(err => console.error('Failed to send message email:', err));
      }
    } catch (notifError) {
      // Don't fail the message send if notification creation fails
      console.error('Failed to create message notification:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/conversations/[id]/messages
 * Delete a message (soft delete)
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

    // Get message ID from request body
    const body = await request.json();
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Get the message
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Check if message belongs to this conversation
    if (message.conversationId !== conversationId) {
      return NextResponse.json(
        { error: 'Message not found in this conversation' },
        { status: 404 }
      );
    }

    // Check if user is the sender
    if (message.senderId !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own messages' },
        { status: 403 }
      );
    }

    // Soft delete the message
    await db
      .update(messages)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(messages.id, messageId));

    return NextResponse.json({
      success: true,
      message: 'Message deleted',
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
