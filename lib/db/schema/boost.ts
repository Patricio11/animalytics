import { pgTable, text, timestamp, boolean, integer, uuid, jsonb } from 'drizzle-orm/pg-core';
import { listings } from './marketplace';
import { breederProfiles } from './profiles';
import { users } from './users';

// ============================================================================
// BOOST PRICING CONFIGURATION (Admin-managed)
// ============================================================================

export const boostPricing = pgTable('boost_pricing', {
  id: uuid('id').primaryKey().defaultRandom(),
  platform: text('platform').notNull().unique(), // 'system', 'facebook', 'instagram', 'tiktok', 'twitter', 'youtube', 'all_social'
  displayName: text('display_name').notNull(),
  pricePerDay: integer('price_per_day').notNull(), // in cents
  currency: text('currency').default('USD').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// LISTING BOOSTS (Individual boost orders)
// ============================================================================

export const listingBoosts = pgTable('listing_boosts', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id').references(() => listings.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Selected platforms
  platforms: jsonb('platforms').$type<string[]>().notNull(),

  // Duration
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  durationDays: integer('duration_days').notNull(),

  // Pricing
  totalAmount: integer('total_amount').notNull(), // in cents
  currency: text('currency').default('USD').notNull(),
  walletTransactionId: uuid('wallet_transaction_id'),

  // Status: pending, active, completed, cancelled, expired
  status: text('status').notNull().default('active'),

  // Social media integration tracking
  socialMediaPostUrls: jsonb('social_media_post_urls').$type<Record<string, string>>().default({}),
  // Per-platform ad/post status: { facebook: 'pending', instagram: 'published', ... }
  socialMediaPostStatus: jsonb('social_media_post_status').$type<Record<string, string>>().default({}),
  // Per-platform external IDs from APIs: { facebook: 'ad_123', instagram: 'post_456', ... }
  socialMediaExternalIds: jsonb('social_media_external_ids').$type<Record<string, string>>().default({}),

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// PROFILE BOOSTS (Breeder profile featured on landing page)
// ============================================================================

export const profileBoosts = pgTable('profile_boosts', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').references(() => breederProfiles.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Duration
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  durationDays: integer('duration_days').notNull(),

  // Pricing
  totalAmount: integer('total_amount').notNull(), // in cents
  currency: text('currency').default('USD').notNull(),
  walletTransactionId: uuid('wallet_transaction_id'),

  // Status: active, completed, cancelled, expired
  status: text('status').notNull().default('active'),

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type BoostPricing = typeof boostPricing.$inferSelect;
export type NewBoostPricing = typeof boostPricing.$inferInsert;
export type ListingBoost = typeof listingBoosts.$inferSelect;
export type NewListingBoost = typeof listingBoosts.$inferInsert;
export type ProfileBoost = typeof profileBoosts.$inferSelect;
export type NewProfileBoost = typeof profileBoosts.$inferInsert;
