import { pgTable, text, timestamp, integer, decimal, boolean, jsonb, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Breeder Profiles Table
 * Public-facing professional profiles for breeders
 * Accessible globally (not just to breeders)
 */
export const breederProfiles = pgTable('breeder_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),

  // Professional branding
  displayName: text('display_name').notNull(),
  slug: text('slug').unique().notNull(), // URL-friendly: animalytics.co/breeders/john-smith-kennels
  tagline: text('tagline'), // Short catchphrase
  bio: text('bio'), // Detailed biography
  logoUrl: text('logo_url'),
  bannerUrl: text('banner_url'),
  coverImageUrl: text('cover_image_url'),

  // Contact preferences (public)
  publicEmail: text('public_email'),
  publicPhone: text('public_phone'),
  website: text('website'),
  socialMedia: jsonb('social_media').$type<{
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
    linkedin?: string;
  }>(),

  // Location
  location: jsonb('location').$type<{
    city?: string;
    state?: string;
    country: string;
    timezone?: string;
  }>(),

  // Business information
  businessName: text('business_name'),
  businessType: text('business_type'), // individual, partnership, company, kennel
  registrationNumber: text('registration_number'),
  yearsInBusiness: integer('years_in_business'),
  establishedYear: integer('established_year'),

  // Specializations
  primaryBreeds: jsonb('primary_breeds').$type<string[]>().default([]),
  secondaryBreeds: jsonb('secondary_breeds').$type<string[]>().default([]),
  breedingPhilosophy: text('breeding_philosophy'),
  specializations: jsonb('specializations').$type<string[]>().default([]), // show dogs, working dogs, service dogs, etc.

  // Certifications & Awards
  certifications: jsonb('certifications').$type<Array<{
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
  }>>().default([]),

  awards: jsonb('awards').$type<Array<{
    title: string;
    organization: string;
    year: number;
    description?: string;
  }>>().default([]),

  // Verification & Trust Badges
  kycVerified: boolean('kyc_verified').default(false),
  kycVerifiedAt: timestamp('kyc_verified_at'),
  backgroundCheckVerified: boolean('background_check_verified').default(false),
  healthCertified: boolean('health_certified').default(false),
  kennelClubMember: boolean('kennel_club_member').default(false),
  kennelClubs: jsonb('kennel_clubs').$type<string[]>().default([]), // AKC, UKC, FCI, etc.

  // Premium features
  premiumMember: boolean('premium_member').default(false),
  premiumSince: timestamp('premium_since'),
  premiumExpiresAt: timestamp('premium_expires_at'),
  featuredProfile: boolean('featured_profile').default(false),

  // Statistics (auto-updated)
  totalSales: integer('total_sales').default(0),
  totalListings: integer('total_listings').default(0),
  activeListings: integer('active_listings').default(0),
  totalEarnings: decimal('total_earnings', { precision: 12, scale: 2 }).default('0.00'),
  successfulTransactions: integer('successful_transactions').default(0),
  totalAnimals: integer('total_animals').default(0),
  totalLitters: integer('total_litters').default(0),

  // Reputation & Performance
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0.00'),
  totalReviews: integer('total_reviews').default(0),
  fiveStarReviews: integer('five_star_reviews').default(0),
  fourStarReviews: integer('four_star_reviews').default(0),
  threeStarReviews: integer('three_star_reviews').default(0),
  twoStarReviews: integer('two_star_reviews').default(0),
  oneStarReviews: integer('one_star_reviews').default(0),

  responseRate: integer('response_rate').default(100), // percentage (0-100)
  responseTimeHours: integer('response_time_hours').default(24), // average hours to respond
  onTimeDeliveryRate: integer('on_time_delivery_rate').default(100), // percentage

  // Settings & Preferences
  acceptsInternationalOrders: boolean('accepts_international_orders').default(true),
  shipsTo: jsonb('ships_to').$type<string[]>().default([]), // country codes
  acceptedPaymentMethods: jsonb('accepted_payment_methods').$type<string[]>().default(['wallet', 'stripe', 'paypal']),

  returnPolicy: text('return_policy'),
  shippingPolicy: text('shipping_policy'),
  healthGuarantee: text('health_guarantee'),
  breedingRights: text('breeding_rights'), // available, limited, not available

  // Visibility & Privacy
  isPublic: boolean('is_public').default(true),
  profileComplete: boolean('profile_complete').default(false),
  profileCompleteness: integer('profile_completeness').default(0), // percentage (0-100)

  // SEO
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  keywords: jsonb('keywords').$type<string[]>().default([]),

  // Activity tracking
  lastActiveAt: timestamp('last_active_at'),
  lastListingAt: timestamp('last_listing_at'),
  profileViews: integer('profile_views').default(0),
  profileViewsThisMonth: integer('profile_views_this_month').default(0),

  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Breeder Reviews Table
 * Customer reviews and ratings for breeders
 */
export const breederReviews = pgTable('breeder_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  breederId: uuid('breeder_id').references(() => breederProfiles.id, { onDelete: 'cascade' }).notNull(),
  reviewerId: text('reviewer_id').references(() => users.id, { onDelete: 'set null' }),
  orderId: text('order_id'), // link to actual transaction
  listingId: text('listing_id'), // what was purchased

  // Ratings (1-5 stars)
  overallRating: integer('overall_rating').notNull(),
  communicationRating: integer('communication_rating'),
  healthRating: integer('health_rating'),
  descriptionAccuracyRating: integer('description_accuracy_rating'),
  valueRating: integer('value_rating'),

  // Review content
  title: text('title'),
  comment: text('comment').notNull(),
  pros: text('pros'),
  cons: text('cons'),
  images: jsonb('images').$type<string[]>().default([]),

  // Verification
  verifiedPurchase: boolean('verified_purchase').default(false),
  purchaseDate: timestamp('purchase_date'),

  // Moderation
  status: text('status').notNull().default('pending'), // pending, approved, rejected, flagged, hidden
  moderatedBy: text('moderated_by').references(() => users.id),
  moderatedAt: timestamp('moderated_at'),
  moderationNotes: text('moderation_notes'),
  flagReason: text('flag_reason'),

  // Response from breeder
  breederResponse: text('breeder_response'),
  breederRespondedAt: timestamp('breeder_responded_at'),

  // Engagement
  helpfulCount: integer('helpful_count').default(0),
  notHelpfulCount: integer('not_helpful_count').default(0),
  reportCount: integer('report_count').default(0),

  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Review Votes Table
 * Track helpful/not helpful votes
 */
export const reviewVotes = pgTable('review_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  reviewId: uuid('review_id').references(() => breederReviews.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  voteType: text('vote_type').notNull(), // helpful, not_helpful
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Review Reports Table
 * User reports of inappropriate reviews
 */
export const reviewReports = pgTable('review_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reviewId: uuid('review_id').references(() => breederReviews.id, { onDelete: 'cascade' }).notNull(),
  reporterId: text('reporter_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  reason: text('reason').notNull(), // spam, fake, offensive, irrelevant, other
  description: text('description'),
  status: text('status').notNull().default('pending'), // pending, reviewed, resolved, dismissed
  reviewedBy: text('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Profile Views Table
 * Track profile visits for analytics
 */
export const profileViews = pgTable('profile_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').references(() => breederProfiles.id, { onDelete: 'cascade' }).notNull(),
  viewerId: text('viewer_id').references(() => users.id, { onDelete: 'set null' }), // null if anonymous
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  referrer: text('referrer'),
  country: text('country'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
