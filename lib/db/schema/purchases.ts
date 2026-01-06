import { pgTable, text, timestamp, boolean, integer, decimal, uuid, pgEnum, date } from 'drizzle-orm/pg-core';
import { users } from './users';
import { listings } from './marketplace';
import { animals } from './animals';
import { escrows } from './wallet';

/**
 * Purchase Status Enum
 */
export const purchaseStatusEnum = pgEnum('purchase_status', [
  'pending',           // Purchase initiated, awaiting payment
  'payment_pending',   // Payment being processed
  'payment_completed', // Payment successful
  'confirmed',         // Seller confirmed
  'preparing',         // Animal being prepared for handover
  'ready_for_pickup',  // Ready for pet owner pickup
  'in_transit',        // Being delivered
  'completed',         // Successfully completed
  'cancelled',         // Cancelled before completion
  'refunded',          // Payment refunded
  'disputed'           // Under dispute
]);

/**
 * Payment Method Enum
 */
export const paymentMethodEnum = pgEnum('payment_method', [
  'wallet',
  'stripe',
  'paypal',
  'bank_transfer',
  'cash',
  'other'
]);

/**
 * Delivery Method Enum
 */
export const deliveryMethodEnum = pgEnum('delivery_method', [
  'pickup',
  'delivery',
  'shipping',
  'meet_halfway',
  'other'
]);

/**
 * Purchases Table
 * Tracks all animal purchases from listing to ownership transfer
 */
export const purchases = pgTable('purchases', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Reference
  listingId: uuid('listing_id').references(() => listings.id, { onDelete: 'set null' }).notNull(),
  animalId: uuid('animal_id').references(() => animals.id, { onDelete: 'set null' }),

  // Parties
  petOwnerId: text('pet_owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  sellerId: text('seller_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Purchase Details
  purchasePrice: integer('purchase_price').notNull(), // in cents
  currency: text('currency').default('USD').notNull(),
  platformFee: integer('platform_fee').default(0), // in cents
  deliveryFee: integer('delivery_fee').default(0), // in cents - NEW
  totalAmount: integer('total_amount').notNull(), // purchase_price + platform_fee + deliveryFee

  // Payment Information
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  paymentStatus: text('payment_status').default('pending'), // pending, processing, completed, failed, refunded
  paymentIntentId: text('payment_intent_id'), // Stripe payment intent ID
  paymentCompletedAt: timestamp('payment_completed_at'),

  // Delivery Details
  deliveryMethod: deliveryMethodEnum('delivery_method').notNull(),
  deliveryAddress: text('delivery_address'),
  deliveryCity: text('delivery_city'),
  deliveryState: text('delivery_state'),
  deliveryPostalCode: text('delivery_postal_code'),
  deliveryCountry: text('delivery_country'),
  deliveryNotes: text('delivery_notes'),

  // Pickup/Delivery Schedule
  scheduledDate: date('scheduled_date'),
  scheduledTime: text('scheduled_time'),
  actualHandoverDate: timestamp('actual_handover_date'),

  // Ownership Transfer
  ownershipTransferred: boolean('ownership_transferred').default(false),
  transferredAt: timestamp('transferred_at'),
  previousOwnerId: text('previous_owner_id'),

  // Documents & Certificates
  contract: text('contract_url'),
  healthCertificates: text('health_certificates').array(),
  registrationPapers: text('registration_papers').array(),
  vaccinationRecords: text('vaccination_records').array(),
  otherDocuments: text('other_documents').array(),

  // Purchase Status
  status: purchaseStatusEnum('status').default('pending').notNull(),

  // Timeline Tracking
  initiatedAt: timestamp('initiated_at').defaultNow(),
  confirmedAt: timestamp('confirmed_at'),
  preparedAt: timestamp('prepared_at'),
  readyAt: timestamp('ready_at'),
  completedAt: timestamp('completed_at'),
  cancelledAt: timestamp('cancelled_at'),

  // Cancellation Details
  cancelReason: text('cancel_reason'),
  cancelledBy: text('cancelled_by'), // 'pet_owner' or 'seller'
  refundAmount: integer('refund_amount'), // in cents
  refundedAt: timestamp('refunded_at'),

  // Escrow Integration
  escrowId: uuid('escrow_id').references(() => escrows.id, { onDelete: 'set null' }),

  // Pet Owner Confirmation
  petOwnerConfirmedReceipt: boolean('pet_owner_confirmed_receipt').default(false),
  petOwnerConfirmedAt: timestamp('pet_owner_confirmed_at'),

  // Seller Confirmation
  sellerConfirmedHandover: boolean('seller_confirmed_handover').default(false),
  sellerConfirmedAt: timestamp('seller_confirmed_at'),

  // Auto-release Settings
  autoReleaseDate: timestamp('auto_release_date'),
  autoReleaseEnabled: boolean('auto_release_enabled').default(true),

  // Dispute Handling
  isDisputed: boolean('is_disputed').default(false),
  disputeReason: text('dispute_reason'),
  disputeOpenedAt: timestamp('dispute_opened_at'),
  disputeResolvedAt: timestamp('dispute_resolved_at'),
  disputeResolution: text('dispute_resolution'),

  // Reviews
  petOwnerReviewId: uuid('pet_owner_review_id'),
  sellerReviewId: uuid('seller_review_id'),
  petOwnerReviewSubmitted: boolean('pet_owner_review_submitted').default(false),
  sellerReviewSubmitted: boolean('seller_review_submitted').default(false),

  // Notes
  petOwnerNotes: text('pet_owner_notes'),
  sellerNotes: text('seller_notes'),
  internalNotes: text('internal_notes'), // Admin notes

  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Purchase Timeline Table
 * Tracks all status changes and events in a purchase
 */
export const purchaseTimeline = pgTable('purchase_timeline', {
  id: uuid('id').primaryKey().defaultRandom(),
  purchaseId: uuid('purchase_id').references(() => purchases.id, { onDelete: 'cascade' }).notNull(),

  // Event Details
  eventType: text('event_type').notNull(), // 'status_change', 'payment', 'message', 'document_upload', etc.
  eventTitle: text('event_title').notNull(),
  eventDescription: text('event_description'),

  // Status Change Details
  oldStatus: text('old_status'),
  newStatus: text('new_status'),

  // Actor
  actorId: text('actor_id').references(() => users.id),
  actorRole: text('actor_role'), // 'pet_owner', 'seller', 'system', 'admin'

  // Visibility
  visibleToPetOwner: boolean('visible_to_pet_owner').default(true),
  visibleToSeller: boolean('visible_to_seller').default(true),

  // Metadata
  metadata: text('metadata'), // JSON for additional event data

  // Timestamp
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Purchase Documents Table
 * Tracks all documents associated with a purchase
 */
export const purchaseDocuments = pgTable('purchase_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  purchaseId: uuid('purchase_id').references(() => purchases.id, { onDelete: 'cascade' }).notNull(),

  // Document Details
  documentType: text('document_type').notNull(), // 'contract', 'health_certificate', 'registration', 'receipt', etc.
  documentName: text('document_name').notNull(),
  documentUrl: text('document_url').notNull(),
  documentSize: integer('document_size'), // in bytes
  mimeType: text('mime_type'),

  // Uploader
  uploadedBy: text('uploaded_by').references(() => users.id),
  uploaderRole: text('uploader_role'), // 'pet_owner', 'seller', 'admin'

  // Visibility & Access
  isPublic: boolean('is_public').default(false),
  accessibleToPetOwner: boolean('accessible_to_pet_owner').default(true),
  accessibleToSeller: boolean('accessible_to_seller').default(true),

  // Verification
  isVerified: boolean('is_verified').default(false),
  verifiedBy: text('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),

  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
