import { pgTable, text, timestamp, boolean, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

// ============================================================================
// NOTIFICATION ENUMS
// ============================================================================

export const notificationTypeEnum = pgEnum('notification_type', [
  // Progesterone & Heat Cycles
  'progesterone_test_due',
  'progesterone_daily_test',
  'progesterone_next_cycle',
  'breeding_window_open',
  'breeding_window_closing',
  'ovulation_detected',
  'whelping_approaching',
  'heat_cycle_started',
  'heat_cycle_completed',
  
  // Breeding & Litters
  'breeding_scheduled',
  'breeding_completed',
  'pregnancy_confirmed',
  'ultrasound_due',
  'whelping_started',
  'puppy_born',
  'litter_registered',
  
  // Health & Veterinary
  'vaccination_due',
  'deworming_due',
  'vet_appointment',
  'health_check_due',
  'medication_reminder',
  
  // Marketplace & Sales
  'listing_approved',
  'listing_rejected',
  'listing_expired',
  'inquiry_received',
  'offer_received',
  'sale_completed',
  
  // Financial
  'payment_received',
  'payment_due',
  'invoice_generated',
  'wallet_low_balance',
  
  // System & Account
  'kyc_approved',
  'kyc_rejected',
  'kyc_pending_review',
  'subscription_expiring',
  'subscription_renewed',
  'account_verified',
  
  // Social & Community
  'new_follower',
  'review_received',
  'message_received',
  'event_reminder',
  
  // General
  'system_announcement',
  'feature_update',
  'maintenance_scheduled',
]);

export const notificationPriorityEnum = pgEnum('notification_priority', [
  'low',
  'normal',
  'high',
  'urgent',
]);

export const notificationCategoryEnum = pgEnum('notification_category', [
  'breeding',
  'health',
  'financial',
  'marketplace',
  'system',
  'social',
]);

// ============================================================================
// NOTIFICATIONS TABLE
// ============================================================================

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Notification content
  type: notificationTypeEnum('type').notNull(),
  category: notificationCategoryEnum('category').notNull(),
  priority: notificationPriorityEnum('priority').default('normal').notNull(),
  
  title: text('title').notNull(),
  message: text('message').notNull(),
  
  // Optional action
  actionUrl: text('action_url'), // Where to navigate when clicked
  actionLabel: text('action_label'), // Button text (e.g., "View Details", "Take Action")
  
  // Related entity (for deep linking)
  relatedEntityType: text('related_entity_type'), // 'heat_cycle', 'litter', 'listing', etc.
  relatedEntityId: text('related_entity_id'), // UUID of the related entity
  
  // Icon and styling
  icon: text('icon'), // Emoji or icon name
  iconColor: text('icon_color'), // Hex color for icon background
  
  // Status
  read: boolean('read').default(false).notNull(),
  readAt: timestamp('read_at'),
  
  archived: boolean('archived').default(false).notNull(),
  archivedAt: timestamp('archived_at'),
  
  // Metadata
  metadata: text('metadata'), // JSON string for additional data
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'), // Optional expiration for time-sensitive notifications
});

// ============================================================================
// NOTIFICATION PREFERENCES TABLE
// ============================================================================

export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Global preferences
  enableInApp: boolean('enable_in_app').default(true).notNull(),
  enableEmail: boolean('enable_email').default(true).notNull(),
  enableSms: boolean('enable_sms').default(false).notNull(),
  enablePush: boolean('enable_push').default(false).notNull(),
  
  // Category preferences (JSON object)
  // { breeding: { inApp: true, email: true, sms: false }, health: {...}, etc. }
  categoryPreferences: text('category_preferences'),
  
  // Quiet hours
  quietHoursEnabled: boolean('quiet_hours_enabled').default(false).notNull(),
  quietHoursStart: text('quiet_hours_start'), // "22:00"
  quietHoursEnd: text('quiet_hours_end'), // "08:00"
  
  // Digest preferences
  enableDailyDigest: boolean('enable_daily_digest').default(false).notNull(),
  dailyDigestTime: text('daily_digest_time'), // "09:00"
  
  enableWeeklyDigest: boolean('enable_weekly_digest').default(false).notNull(),
  weeklyDigestDay: text('weekly_digest_day'), // "monday"
  weeklyDigestTime: text('weekly_digest_time'), // "09:00"
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// NOTIFICATION TEMPLATES (Optional - for consistent messaging)
// ============================================================================

export const notificationTemplates = pgTable('notification_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: notificationTypeEnum('type').notNull().unique(),
  category: notificationCategoryEnum('category').notNull(),
  priority: notificationPriorityEnum('priority').default('normal').notNull(),
  
  // Template content (supports variables like {{bitchName}}, {{day}}, etc.)
  titleTemplate: text('title_template').notNull(),
  messageTemplate: text('message_template').notNull(),
  
  // Default styling
  icon: text('icon'),
  iconColor: text('icon_color'),
  
  // Default action
  actionUrlTemplate: text('action_url_template'),
  actionLabel: text('action_label'),
  
  // Active status
  isActive: boolean('is_active').default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
