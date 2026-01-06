import { pgTable, text, timestamp, boolean, integer, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { listings } from './marketplace';

/**
 * Conversation Status Enum
 */
export const conversationStatusEnum = pgEnum('conversation_status', [
  'active',
  'archived',
  'blocked',
  'deleted'
]);

/**
 * Message Type Enum
 */
export const messageTypeEnum = pgEnum('message_type', [
  'text',
  'image',
  'document',
  'system',
  'offer',
  'listing_share'
]);

/**
 * Conversations Table
 * Tracks message threads between pet owners and sellers
 */
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Related Listing (optional - conversation may not always be about a specific listing)
  listingId: uuid('listing_id').references(() => listings.id, { onDelete: 'set null' }),

  // Participants
  petOwnerId: text('pet_owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  sellerId: text('seller_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Conversation Details
  subject: text('subject'),
  status: conversationStatusEnum('status').default('active').notNull(),

  // Unread Tracking
  unreadCountPetOwner: integer('unread_count_pet_owner').default(0).notNull(),
  unreadCountSeller: integer('unread_count_seller').default(0).notNull(),

  // Last Activity
  lastMessageAt: timestamp('last_message_at'),
  lastMessagePreview: text('last_message_preview'), // For quick display

  // Archival
  archivedByPetOwner: boolean('archived_by_pet_owner').default(false),
  archivedBySeller: boolean('archived_by_seller').default(false),
  archivedByPetOwnerAt: timestamp('archived_by_pet_owner_at'),
  archivedBySellerAt: timestamp('archived_by_seller_at'),

  // Blocking
  blockedByPetOwner: boolean('blocked_by_pet_owner').default(false),
  blockedBySeller: boolean('blocked_by_seller').default(false),

  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Messages Table
 * Individual messages within conversations
 */
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),

  // Sender
  senderId: text('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Message Content
  message: text('message').notNull(),
  messageType: messageTypeEnum('message_type').default('text').notNull(),

  // Attachments
  attachments: text('attachments').array(), // URLs to uploaded files

  // Read Status
  isRead: boolean('is_read').default(false).notNull(),
  readAt: timestamp('read_at'),

  // For Special Message Types
  metadata: text('metadata'), // JSON string for offers, system messages, etc.

  // Soft Delete
  isDeleted: boolean('is_deleted').default(false),
  deletedAt: timestamp('deleted_at'),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Conversation Participants Table
 * Tracks who can access each conversation
 * (Future-proofing for group conversations)
 */
export const conversationParticipants = pgTable('conversation_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Participant Role
  role: text('role').notNull(), // 'pet_owner', 'seller', 'admin'

  // Notifications
  mutedUntil: timestamp('muted_until'),
  notificationsEnabled: boolean('notifications_enabled').default(true),

  // Last Activity
  lastReadAt: timestamp('last_read_at'),
  lastSeenMessageId: uuid('last_seen_message_id'),

  // Metadata
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  leftAt: timestamp('left_at'),
});
