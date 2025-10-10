import { pgTable, text, timestamp, decimal, boolean, jsonb, pgEnum, integer, date } from 'drizzle-orm/pg-core';
import { animals, frozenSemen } from './animals';
import { users } from './users';

// ============================================================================
// ENUMS
// ============================================================================

export const listingCategoryEnum = pgEnum('listing_category', [
  'dog_for_sale',
  'pups_for_sale',
  'reproductive_services',
  'frozen_semen',
  'stud_dog'
]);

export const listingStatusEnum = pgEnum('listing_status', [
  'draft',
  'active',
  'pending',
  'sold',
  'expired',
  'removed'
]);

export const featuredTierEnum = pgEnum('featured_tier', [
  'none',
  'basic',      // Top of category
  'premium',    // Homepage + category top
  'spotlight'   // Homepage hero + all categories
]);

// ============================================================================
// CLINICS TABLE (FOR REPRODUCTIVE SERVICES)
// ============================================================================

export const clinics = pgTable('clinics', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  country: text('country').default('Australia'),
  postalCode: text('postal_code'),

  // Contact
  phone: text('phone').notNull(),
  email: text('email'),
  website: text('website'),

  // Services offered ⭐ CLINIC SELECTOR
  services: jsonb('services').$type<string[]>().default([]), // ['AI Services', 'Frozen Semen Storage', etc.]

  // Clinic details
  description: text('description'),
  yearsInBusiness: integer('years_in_business'),
  licenseNumber: text('license_number'),
  certifications: jsonb('certifications').$type<string[]>(),

  // Operating hours
  operatingHours: jsonb('operating_hours').$type<{
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  }>(),

  // Status
  isActive: boolean('is_active').default(true),
  isVerified: boolean('is_verified').default(false),

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// MAIN LISTINGS TABLE
// ============================================================================

export const listings = pgTable('listings', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  category: listingCategoryEnum('category').notNull(),

  // Can be linked to animal or frozen semen
  animalId: text('animal_id').references(() => animals.id, { onDelete: 'cascade' }),
  frozenSemenId: text('frozen_semen_id').references(() => frozenSemen.id, { onDelete: 'cascade' }),

  // ========================================================================
  // 3-STEP WIZARD DATA STRUCTURE ⭐ NEW
  // ========================================================================

  wizardData: jsonb('wizard_data').$type<{
    // Step 1: Animal & Category Selection
    step1: {
      category: string;
      animalId?: string;
      animalName?: string;
      frozenSemenId?: string;
      batchIdentifier?: string;
    };

    // Step 2: Contact Details
    step2: {
      contactName: string;
      contactPhone: string;
      contactEmail: string;
      contactLocation: string;
      availabilityNotes?: string;
    };

    // Step 3: Listing Details
    step3: {
      title: string;
      description: string;
      price?: number;
      currency?: string;
      clinicId?: string; // ⭐ CLINIC SELECTOR
      additionalImages?: string[];
    };

    // Completion tracking
    completedSteps: number[];
    lastEditedStep?: number;
    wizardCompletedAt?: string;
  }>(),

  // Core listing fields (derived from wizard)
  title: text('title').notNull(),
  description: text('description'),
  price: integer('price'), // in cents
  currency: text('currency').default('USD'),

  // Contact details
  contactName: text('contact_name').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone'),
  location: text('location'),
  availabilityNotes: text('availability_notes'),

  // For reproductive services and frozen semen ⭐ CLINIC SELECTOR
  clinicId: text('clinic_id').references(() => clinics.id),

  // Additional images (beyond animal profile)
  additionalImages: jsonb('additional_images').$type<string[]>().default([]),

  // ========================================================================
  // FEATURED LISTINGS LOGIC ⭐ NEW
  // ========================================================================

  isFeatured: boolean('is_featured').default(false),
  featuredTier: featuredTierEnum('featured_tier').default('none'),
  featuredStartDate: date('featured_start_date'),
  featuredEndDate: date('featured_end_date'),
  featuredPriority: integer('featured_priority').default(0), // Higher = shows first

  // Featured payment tracking
  featuredPaymentId: text('featured_payment_id'),
  featuredAmount: integer('featured_amount'), // in cents
  featuredCurrency: text('featured_currency'),

  // Animal details (denormalized for quick access)
  breed: text('breed'),
  sex: text('sex'), // male, female
  age: text('age'),
  color: text('color'),
  registrationNumber: text('registration_number'),
  healthCertified: boolean('health_certified').default(false),
  championLines: boolean('champion_lines').default(false),

  // Listing metadata
  status: listingStatusEnum('status').default('draft'),
  viewCount: integer('view_count').default(0),
  interestedCount: integer('interested_count').default(0),
  inquiryCount: integer('inquiry_count').default(0),

  // Expiration
  expiresAt: timestamp('expires_at'),
  autoRenew: boolean('auto_renew').default(false),

  // Timestamps
  publishedAt: timestamp('published_at'),
  soldAt: timestamp('sold_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// LISTING INQUIRIES
// ============================================================================

export const listingInquiries = pgTable('listing_inquiries', {
  id: text('id').primaryKey(),
  listingId: text('listing_id').references(() => listings.id, { onDelete: 'cascade' }).notNull(),
  inquirerUserId: text('inquirer_user_id').references(() => users.id, { onDelete: 'set null' }),

  // If not logged in
  inquirerEmail: text('inquirer_email').notNull(),
  inquirerName: text('inquirer_name').notNull(),
  inquirerPhone: text('inquirer_phone'),

  // Message
  message: text('message').notNull(),
  subject: text('subject'),

  // Response tracking
  replied: boolean('replied').default(false),
  replyMessage: text('reply_message'),
  repliedAt: timestamp('replied_at'),
  repliedBy: text('replied_by').references(() => users.id),

  // Status
  status: text('status').default('new'), // new, read, replied, archived

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  readAt: timestamp('read_at'),
});

// ============================================================================
// SAVED LISTINGS (FAVORITES)
// ============================================================================

export const savedListings = pgTable('saved_listings', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  listingId: text('listing_id').references(() => listings.id, { onDelete: 'cascade' }).notNull(),

  // Organization
  notes: text('notes'),
  tags: jsonb('tags').$type<string[]>(),

  // Tracking
  savedAt: timestamp('saved_at').defaultNow(),
  lastViewedAt: timestamp('last_viewed_at'),
});

// ============================================================================
// LISTING VIEWS (ANALYTICS)
// ============================================================================

export const listingViews = pgTable('listing_views', {
  id: text('id').primaryKey(),
  listingId: text('listing_id').references(() => listings.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),

  // Anonymous tracking (if not logged in)
  sessionId: text('session_id'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),

  // Referrer tracking
  referrer: text('referrer'),
  source: text('source'), // search, category, featured, direct

  // Metadata
  viewedAt: timestamp('viewed_at').defaultNow(),
});

// ============================================================================
// FEATURED LISTING HISTORY ⭐ NEW
// ============================================================================

export const featuredListingHistory = pgTable('featured_listing_history', {
  id: text('id').primaryKey(),
  listingId: text('listing_id').references(() => listings.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Featured details
  featuredTier: featuredTierEnum('featured_tier').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  durationDays: integer('duration_days'),

  // Pricing
  amount: integer('amount').notNull(), // in cents
  currency: text('currency').default('USD'),
  paymentId: text('payment_id'),
  paymentMethod: text('payment_method'), // stripe, paypal, wallet

  // Performance metrics
  viewsGenerated: integer('views_generated').default(0),
  inquiriesGenerated: integer('inquiries_generated').default(0),
  clickThroughRate: decimal('click_through_rate', { precision: 5, scale: 2 }), // percentage

  // Status
  status: text('status').default('active'), // active, completed, cancelled
  cancelledAt: timestamp('cancelled_at'),
  cancelReason: text('cancel_reason'),

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

// ============================================================================
// TYPE EXPORTS FOR DRIZZLE INFERENCE
// ============================================================================

export type Clinic = typeof clinics.$inferSelect;
export type NewClinic = typeof clinics.$inferInsert;

export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;

export type ListingInquiry = typeof listingInquiries.$inferSelect;
export type NewListingInquiry = typeof listingInquiries.$inferInsert;

export type SavedListing = typeof savedListings.$inferSelect;
export type NewSavedListing = typeof savedListings.$inferInsert;

export type ListingView = typeof listingViews.$inferSelect;
export type NewListingView = typeof listingViews.$inferInsert;

export type FeaturedListingHistory = typeof featuredListingHistory.$inferSelect;
export type NewFeaturedListingHistory = typeof featuredListingHistory.$inferInsert;

// ============================================================================
// TYPESCRIPT INTERFACES FOR WIZARD & FEATURED DATA
// ============================================================================

export interface WizardStep1Data {
  category: string;
  animalId?: string;
  animalName?: string;
  frozenSemenId?: string;
  batchIdentifier?: string;
}

export interface WizardStep2Data {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactLocation: string;
  availabilityNotes?: string;
}

export interface WizardStep3Data {
  title: string;
  description: string;
  price?: number;
  currency?: string;
  clinicId?: string;
  additionalImages?: string[];
}

export interface ListingWizardData {
  step1: WizardStep1Data;
  step2: WizardStep2Data;
  step3: WizardStep3Data;
  completedSteps: number[];
  lastEditedStep?: number;
  wizardCompletedAt?: string;
}

export interface ClinicServices {
  services: string[]; // e.g., ['Artificial Insemination', 'Frozen Semen Storage', 'Progesterone Testing']
}

export interface OperatingHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}
