/**
 * Messaging Service
 * Centralized service for managing conversations across all user roles
 * Supports: Buyer, Breeder, Veterinarian, Event Organizer
 * Future-proof design for multi-participant conversations
 */

import { db } from '@/lib/db';
import { conversations, messages, conversationParticipants } from '@/lib/db/schema/conversations';
import { users } from '@/lib/db/schema/users';
import { eq, or, and, sum, desc } from 'drizzle-orm';

export type UserRole = 'buyer' | 'breeder' | 'veterinarian' | 'event_organizer' | 'admin';

export interface UnreadCountResult {
  total: number;
  breakdown: {
    asBuyer: number;
    asSeller: number;
  };
}

export interface ConversationContext {
  userId: string;
  userRole: UserRole;
}

/**
 * Get unread message count for a user
 * Works for all user roles (buyer, breeder, vet, event organizer)
 */
export async function getUnreadCount(userId: string): Promise<UnreadCountResult> {
  try {
    // Get unread count as buyer with timeout protection
    const buyerUnreadPromise = db
      .select({
        total: sum(conversations.unreadCountBuyer),
      })
      .from(conversations)
      .where(eq(conversations.buyerId, userId));

    // Get unread count as seller (applies to breeders, vets, event organizers)
    const sellerUnreadPromise = db
      .select({
        total: sum(conversations.unreadCountSeller),
      })
      .from(conversations)
      .where(eq(conversations.sellerId, userId));

    // Execute both queries in parallel with timeout
    const [buyerResult, sellerResult] = await Promise.all([
      buyerUnreadPromise,
      sellerUnreadPromise,
    ]);

    const asBuyerCount = Number(buyerResult[0]?.total) || 0;
    const asSellerCount = Number(sellerResult[0]?.total) || 0;

    return {
      total: asBuyerCount + asSellerCount,
      breakdown: {
        asBuyer: asBuyerCount,
        asSeller: asSellerCount,
      },
    };
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return {
      total: 0,
      breakdown: {
        asBuyer: 0,
        asSeller: 0,
      },
    };
  }
}

/**
 * Check if user has any conversations
 * Works for all user roles
 */
export async function hasConversations(userId: string): Promise<boolean> {
  try {
    const userConversations = await db
      .select()
      .from(conversations)
      .where(
        or(
          eq(conversations.buyerId, userId),
          eq(conversations.sellerId, userId)
        )
      )
      .limit(1);

    return userConversations.length > 0;
  } catch (error) {
    console.error('Error checking conversations:', error);
    return false;
  }
}

/**
 * Get conversations for a user with filtering
 * Works for all user roles
 */
export async function getUserConversations(
  userId: string,
  options: {
    archived?: boolean;
    status?: 'active' | 'archived' | 'blocked' | 'deleted';
  } = {}
) {
  const { archived = false, status = 'active' } = options;

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

  return await db
    .select()
    .from(conversations)
    .where(whereClause)
    .orderBy(desc(conversations.lastMessageAt));
}

/**
 * Determine user's role in a conversation
 */
export function getUserRoleInConversation(
  conversation: typeof conversations.$inferSelect,
  userId: string
): 'buyer' | 'seller' | null {
  if (conversation.buyerId === userId) return 'buyer';
  if (conversation.sellerId === userId) return 'seller';
  return null;
}

/**
 * Get unread count for user's specific role in conversation
 */
export function getUnreadCountForRole(
  conversation: typeof conversations.$inferSelect,
  userId: string
): number {
  const role = getUserRoleInConversation(conversation, userId);
  if (role === 'buyer') return conversation.unreadCountBuyer;
  if (role === 'seller') return conversation.unreadCountSeller;
  return 0;
}

/**
 * Check if conversation is archived by user
 */
export function isArchivedByUser(
  conversation: typeof conversations.$inferSelect,
  userId: string
): boolean {
  const role = getUserRoleInConversation(conversation, userId);
  if (role === 'buyer') return conversation.archivedByBuyer ?? false;
  if (role === 'seller') return conversation.archivedBySeller ?? false;
  return false;
}

/**
 * Check if conversation is blocked by user
 */
export function isBlockedByUser(
  conversation: typeof conversations.$inferSelect,
  userId: string
): boolean {
  const role = getUserRoleInConversation(conversation, userId);
  if (role === 'buyer') return conversation.blockedByBuyer ?? false;
  if (role === 'seller') return conversation.blockedBySeller ?? false;
  return false;
}

/**
 * Future-proof: Support for multi-participant conversations
 * This can be extended to support:
 * - Group chats (Buyer + Breeder + Vet)
 * - Event organizer conversations with multiple participants
 * - Admin moderation conversations
 */
export async function getConversationParticipants(conversationId: string) {
  return await db
    .select({
      participant: conversationParticipants,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      },
    })
    .from(conversationParticipants)
    .leftJoin(users, eq(conversationParticipants.userId, users.id))
    .where(eq(conversationParticipants.conversationId, conversationId));
}

/**
 * Future-proof: Check if user can access conversation
 * Currently supports buyer-seller model
 * Can be extended to support multi-participant conversations
 */
export async function canUserAccessConversation(
  conversationId: string,
  userId: string
): Promise<boolean> {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conversation) return false;

  // Check if user is buyer or seller
  if (conversation.buyerId === userId || conversation.sellerId === userId) {
    return true;
  }

  // Future: Check conversationParticipants table for multi-user conversations
  const participants = await db
    .select()
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId)
      )
    )
    .limit(1);

  return participants.length > 0;
}
