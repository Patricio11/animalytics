import { pgTable, text, timestamp, boolean, integer, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Breeder Delivery & Shipping Settings (SIMPLIFIED - FLAT RATE VERSION)
 * Stores delivery preferences and flat rate pricing for each breeder
 */
export const breederDeliverySettings = pgTable('breeder_delivery_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  breederId: text('breeder_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),

  // ============================================================================
  // DELIVERY OPTIONS AVAILABILITY
  // ============================================================================
  
  offersPickup: boolean('offers_pickup').default(true).notNull(),
  offersLocalDelivery: boolean('offers_local_delivery').default(false).notNull(),
  offersShipping: boolean('offers_shipping').default(false).notNull(),

  // ============================================================================
  // PICKUP SETTINGS
  // ============================================================================
  
  pickupLocation: text('pickup_location'), // Address or description
  pickupInstructions: text('pickup_instructions'),

  // ============================================================================
  // LOCAL DELIVERY SETTINGS (FLAT RATE)
  // ============================================================================
  
  localDeliveryFee: integer('local_delivery_fee').default(0), // flat fee in cents
  localDeliveryNotes: text('local_delivery_notes'),
  localDeliveryEstimatedDays: integer('local_delivery_estimated_days').default(1),

  // ============================================================================
  // SHIPPING SETTINGS (FLAT RATE)
  // ============================================================================
  
  shippingFee: integer('shipping_fee').default(0), // flat rate in cents
  shippingFeeInternational: integer('shipping_fee_international'), // different rate for international
  shippingEstimatedDays: integer('shipping_estimated_days').default(3),
  shippingNotes: text('shipping_notes'),
  
  // Note: Breeder handles carriers and tracking themselves
  
  // ============================================================================
  // POLICIES (OPTIONAL)
  // ============================================================================
  
  deliveryPolicy: text('delivery_policy'), // full policy text
  
  // ============================================================================
  // METADATA
  // ============================================================================
  
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Per-Listing Delivery Overrides (SIMPLIFIED)
 * Allows breeders to set custom delivery terms for specific listings
 */
export const listingDeliveryOverrides = pgTable('listing_delivery_overrides', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id').notNull().unique(), // references listings.id
  breederId: text('breeder_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Custom fees (override breeder defaults)
  customLocalDeliveryFee: integer('custom_local_delivery_fee'),
  customShippingFee: integer('custom_shipping_fee'),
  customShippingFeeInternational: integer('custom_shipping_fee_international'),
  
  // Special terms
  deliveryIncluded: boolean('delivery_included').default(false), // free delivery for this listing
  shippingIncluded: boolean('shipping_included').default(false), // free shipping for this listing
  pickupOnly: boolean('pickup_only').default(false), // only pickup allowed for this listing
  
  specialDeliveryNotes: text('special_delivery_notes'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
