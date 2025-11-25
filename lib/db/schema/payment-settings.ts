import { pgTable, text, timestamp, boolean, integer, uuid, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Payment Settings Table
 * Stores global payment gateway configuration
 * Only one row should exist (singleton pattern)
 */
export const paymentSettings = pgTable('payment_settings', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Platform Fee Configuration
  standardFeePercent: integer('standard_fee_percent').default(500).notNull(), // 5.00% = 500
  premiumFeePercent: integer('premium_fee_percent').default(300).notNull(), // 3.00% = 300
  minimumFee: integer('minimum_fee').default(100).notNull(), // $1.00 = 100 cents
  maximumFee: integer('maximum_fee').default(50000).notNull(), // $500.00 = 50000 cents

  // Escrow Configuration
  autoReleaseDays: integer('auto_release_days').default(7).notNull(),
  disputeWindowDays: integer('dispute_window_days').default(14).notNull(),

  // Withdrawal Configuration
  minimumWithdrawal: integer('minimum_withdrawal').default(2500).notNull(), // $25.00 = 2500 cents
  withdrawalProcessingDays: integer('withdrawal_processing_days').default(3).notNull(),

  // Default Currency
  defaultCurrency: text('default_currency').default('USD').notNull(),

  // Metadata
  updatedBy: text('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Payment Providers Table
 * Stores configuration for each payment provider
 */
export const paymentProviders = pgTable('payment_providers', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Provider Identification
  providerKey: text('provider_key').notNull().unique(), // 'stripe', 'paypal', 'bank_transfer', etc.
  displayName: text('display_name').notNull(),
  description: text('description'),
  icon: text('icon'), // Icon name or URL

  // Status
  isEnabled: boolean('is_enabled').default(false).notNull(),
  isDefault: boolean('is_default').default(false),

  // API Configuration (encrypted fields should use application-level encryption)
  apiKey: text('api_key'), // Public/Publishable key
  secretKey: text('secret_key'), // Secret key (should be encrypted)
  webhookSecret: text('webhook_secret'), // Webhook signing secret
  webhookUrl: text('webhook_url'), // Webhook endpoint URL

  // Environment
  environment: text('environment').default('test').notNull(), // 'test' or 'live'

  // Provider-Specific Settings
  settings: jsonb('settings').$type<Record<string, unknown>>().default({}),

  // Processing Fees (provider's fees, not platform fees)
  processingFeePercent: integer('processing_fee_percent').default(290), // 2.90% = 290
  processingFeeFixed: integer('processing_fee_fixed').default(30), // $0.30 = 30 cents

  // Supported Features
  supportsRefunds: boolean('supports_refunds').default(true),
  supportsPartialRefunds: boolean('supports_partial_refunds').default(true),
  supportsRecurring: boolean('supports_recurring').default(false),

  // Display Order
  sortOrder: integer('sort_order').default(0),

  // Connection Status
  lastTestedAt: timestamp('last_tested_at'),
  lastTestSuccess: boolean('last_test_success'),
  lastTestError: text('last_test_error'),

  // Metadata
  updatedBy: text('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Payout Methods Table
 * Stores configuration for payout/withdrawal methods
 */
export const payoutMethods = pgTable('payout_methods', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Method Identification
  methodKey: text('method_key').notNull().unique(), // 'bank_transfer', 'paypal', 'wise', etc.
  displayName: text('display_name').notNull(),
  description: text('description'),
  icon: text('icon'),

  // Status
  isEnabled: boolean('is_enabled').default(false).notNull(),

  // Processing Configuration
  processingDays: integer('processing_days').default(3).notNull(),
  processingFeePercent: integer('processing_fee_percent').default(0),
  processingFeeFixed: integer('processing_fee_fixed').default(0),

  // Limits
  minimumAmount: integer('minimum_amount').default(2500), // $25.00 = 2500 cents
  maximumAmount: integer('maximum_amount'), // null = no limit

  // Supported Currencies
  supportedCurrencies: text('supported_currencies').array().default(['USD']),

  // Required Fields for this method
  requiredFields: jsonb('required_fields').$type<string[]>().default([]),

  // Display Order
  sortOrder: integer('sort_order').default(0),

  // Metadata
  updatedBy: text('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Payment Settings Audit Log
 * Tracks all changes to payment configuration
 */
export const paymentSettingsAudit = pgTable('payment_settings_audit', {
  id: uuid('id').primaryKey().defaultRandom(),

  // What was changed
  entityType: text('entity_type').notNull(), // 'payment_settings', 'payment_providers', 'payout_methods'
  entityId: uuid('entity_id').notNull(),
  action: text('action').notNull(), // 'create', 'update', 'delete', 'test_connection'

  // Change Details
  fieldChanged: text('field_changed'),
  oldValue: text('old_value'),
  newValue: text('new_value'),

  // Who made the change
  changedBy: text('changed_by').references(() => users.id).notNull(),

  // Additional context
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),

  // Timestamp
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
