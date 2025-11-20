import { pgTable, text, timestamp, boolean, jsonb, integer, decimal, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Buyer Profiles Table
 * Stores profile information and preferences for buyers/owners
 */
export const buyerProfiles = pgTable('buyer_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),

  // Profile Information
  displayName: text('display_name').notNull(),
  bio: text('bio'),
  avatar: text('avatar'),

  // Location
  location: jsonb('location').$type<{
    city?: string;
    state?: string;
    country: string;
    timezone?: string;
  }>(),

  // Buyer Preferences & Interests
  interestedBreeds: jsonb('interested_breeds').$type<string[]>().default([]),
  budgetRange: jsonb('budget_range').$type<{
    min?: number;
    max?: number;
    currency: string;
  }>(),
  lookingFor: jsonb('looking_for').$type<string[]>().default([]), // ['breeding', 'pet', 'show', 'working', 'companion']
  preferredGender: text('preferred_gender'), // 'male', 'female', 'no_preference'
  experienceLevel: text('experience_level'), // 'first_time', 'experienced', 'professional'

  // Activity & Statistics
  totalPurchases: integer('total_purchases').default(0),
  totalSpent: decimal('total_spent', { precision: 12, scale: 2 }).default('0.00'),
  favoriteCount: integer('favorite_count').default(0),
  inquiryCount: integer('inquiry_count').default(0),
  averageResponseTime: integer('average_response_time'), // in minutes

  // Engagement
  profileViews: integer('profile_views').default(0),
  lastActiveAt: timestamp('last_active_at'),

  // Verification & Trust
  isVerified: boolean('is_verified').default(false),
  verifiedAt: timestamp('verified_at'),
  phoneVerified: boolean('phone_verified').default(false),
  emailVerified: boolean('email_verified').default(false),

  // Privacy Settings
  showRealName: boolean('show_real_name').default(true),
  showLocation: boolean('show_location').default(true),
  allowMessages: boolean('allow_messages').default(true),

  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
