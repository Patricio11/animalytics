import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema/conversations';
import { listings } from '@/lib/db/schema/marketplace';
import { users } from '@/lib/db/schema/users';
import { eq, or, and, desc, ne } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

/**
 * GET /api/conversations
 * Get all conversations for the current user
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

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const archived = searchParams.get('archived') === 'true';

    // Build where clause based on user role in conversation
    let whereClause;

    if (archived) {
      // Get archived conversations
      whereClause = or(
        and(
          eq(conversations.buyerId, userId),
          eq(conversations.archivedByBuyer, true)
        ),
        and(
          eq(conversations.sellerId, userId),
          eq(conversations.archivedBySeller, true)
        )
      );
    } else {
      // Get active conversations (not archived by this user)
      // User is buyer and hasn't archived OR user is seller and hasn't archived
      whereClause = or(
        and(
          eq(conversations.buyerId, userId),
          eq(conversations.archivedByBuyer, false)
        ),
        and(
          eq(conversations.sellerId, userId),
          eq(conversations.archivedBySeller, false)
        )
      );
    }

    // Fetch conversations with related data
    const userConversations = await db
      .select({
        conversation: conversations,
        listing: {
          id: listings.id,
          title: listings.title,
          category: listings.category,
          price: listings.price,
          currency: listings.currency,
        },
      })
      .from(conversations)
      .leftJoin(listings, eq(conversations.listingId, listings.id))
      .where(whereClause)
      .orderBy(desc(conversations.lastMessageAt));

    // Get participant details for each conversation
    const conversationsWithParticipants = await Promise.all(
      userConversations.map(async ({ conversation, listing }) => {
        // Determine the other participant
        const otherUserId = conversation.buyerId === userId
          ? conversation.sellerId
          : conversation.buyerId;

        // Get other user's details
        const [otherUser] = await db
          .select({
            id: users.id,
            name: users.name,
            image: users.image,
          })
          .from(users)
          .where(eq(users.id, otherUserId))
          .limit(1);

        // Determine unread count for current user
        const unreadCount = conversation.buyerId === userId
          ? conversation.unreadCountBuyer
          : conversation.unreadCountSeller;

        // Determine if current user is buyer or seller
        const userRole = conversation.buyerId === userId ? 'buyer' : 'seller';

        return {
          id: conversation.id,
          subject: conversation.subject,
          status: conversation.status,
          lastMessageAt: conversation.lastMessageAt,
          lastMessagePreview: conversation.lastMessagePreview,
          unreadCount,
          userRole,
          createdAt: conversation.createdAt,
          otherParticipant: otherUser || {
            id: otherUserId,
            name: 'Unknown User',
            image: null,
          },
          listing: listing ? {
            id: listing.id,
            title: listing.title,
            category: listing.category,
            price: listing.price,
            currency: listing.currency,
          } : null,
          isArchived: userRole === 'buyer'
            ? conversation.archivedByBuyer
            : conversation.archivedBySeller,
          isBlocked: userRole === 'buyer'
            ? conversation.blockedBySeller
            : conversation.blockedByBuyer,
        };
      })
    );

    return NextResponse.json({
      success: true,
      conversations: conversationsWithParticipants,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations
 * Start a new conversation
 */
export async function POST(request: NextRequest) {
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
    const body = await request.json();

    const { sellerId, listingId, subject, initialMessage } = body;

    // Validate required fields
    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      );
    }

    if (!initialMessage || initialMessage.trim() === '') {
      return NextResponse.json(
        { error: 'Initial message is required' },
        { status: 400 }
      );
    }

    // Prevent messaging yourself
    if (sellerId === userId) {
      return NextResponse.json(
        { error: 'Cannot start a conversation with yourself' },
        { status: 400 }
      );
    }

    // Check if conversation already exists between these users for this listing
    let existingConversation = null;

    if (listingId) {
      [existingConversation] = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.buyerId, userId),
            eq(conversations.sellerId, sellerId),
            eq(conversations.listingId, listingId)
          )
        )
        .limit(1);
    } else {
      // Check for any conversation between these users without a listing
      [existingConversation] = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.buyerId, userId),
            eq(conversations.sellerId, sellerId)
          )
        )
        .limit(1);
    }

    if (existingConversation) {
      // Add message to existing conversation
      const [newMessage] = await db
        .insert(messages)
        .values({
          conversationId: existingConversation.id,
          senderId: userId,
          message: initialMessage.trim(),
          messageType: 'text',
        })
        .returning();

      // Update conversation
      await db
        .update(conversations)
        .set({
          lastMessageAt: new Date(),
          lastMessagePreview: initialMessage.trim().substring(0, 100),
          unreadCountSeller: existingConversation.unreadCountSeller + 1,
          // Unarchive if it was archived
          archivedByBuyer: false,
          archivedBySeller: false,
          updatedAt: new Date(),
        })
        .where(eq(conversations.id, existingConversation.id));

      return NextResponse.json({
        success: true,
        conversationId: existingConversation.id,
        messageId: newMessage.id,
        isNew: false,
      });
    }

    // Create new conversation
    const [newConversation] = await db
      .insert(conversations)
      .values({
        buyerId: userId,
        sellerId,
        listingId: listingId || null,
        subject: subject || null,
        lastMessageAt: new Date(),
        lastMessagePreview: initialMessage.trim().substring(0, 100),
        unreadCountSeller: 1, // Seller has 1 unread message
      })
      .returning();

    // Create initial message
    const [newMessage] = await db
      .insert(messages)
      .values({
        conversationId: newConversation.id,
        senderId: userId,
        message: initialMessage.trim(),
        messageType: 'text',
      })
      .returning();

    return NextResponse.json({
      success: true,
      conversationId: newConversation.id,
      messageId: newMessage.id,
      isNew: true,
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
