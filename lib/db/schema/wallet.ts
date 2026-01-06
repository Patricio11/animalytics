import { pgTable, text, timestamp, integer, pgEnum, uuid, bigint, jsonb, decimal } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Wallets Table
 * Multi-currency digital wallet for each user
 * Stores all monetary balances in cents to avoid floating-point errors
 */
export const wallets = pgTable('wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),

  // Multi-currency balances (stored in cents)
  // Example: { USD: 109950, EUR: 89900, ZAR: 185000 } = $1,099.50, €899.00, R1,850.00
  balances: jsonb('balances').$type<Record<string, number>>().default({
    USD: 0,
    EUR: 0,
    GBP: 0,
    ZAR: 0,
    BRL: 0,
    AUD: 0,
    CAD: 0,
  }),

  // Pending/escrow amounts (held during transactions)
  pendingBalance: jsonb('pending_balance').$type<Record<string, number>>().default({}),

  // Lifetime statistics (in cents, primary currency)
  totalEarnings: bigint('total_earnings', { mode: 'number' }).default(0),
  totalWithdrawals: bigint('total_withdrawals', { mode: 'number' }).default(0),
  totalTransactions: integer('total_transactions').default(0),

  // Status
  status: text('status').notNull().default('active'), // active, suspended, frozen

  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Transactions Table
 * Complete audit trail of all wallet transactions
 */
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletId: uuid('wallet_id').references(() => wallets.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Transaction details
  type: text('type').notNull(), // deposit, withdrawal, payment, refund, fee, commission, escrow_hold, escrow_release
  status: text('status').notNull(), // pending, completed, failed, cancelled

  // Amounts (in cents)
  amount: bigint('amount', { mode: 'number' }).notNull(),
  currency: text('currency').notNull(),
  fee: bigint('fee', { mode: 'number' }).default(0),
  netAmount: bigint('net_amount', { mode: 'number' }).notNull(), // amount - fee

  // Balance snapshots (for audit trail)
  balanceBefore: bigint('balance_before', { mode: 'number' }),
  balanceAfter: bigint('balance_after', { mode: 'number' }),

  // Related entities
  relatedListingId: text('related_listing_id'),
  relatedOrderId: text('related_order_id'),
  recipientUserId: text('recipient_user_id').references(() => users.id),

  // Payment gateway info
  paymentMethod: text('payment_method'), // stripe, paypal, bank_transfer, wise, card
  externalTransactionId: text('external_transaction_id'),
  externalStatus: text('external_status'),

  // Metadata
  description: text('description'),
  notes: text('notes'),
  metadata: jsonb('metadata'),

  // Timestamps
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Payout Requests Table
 * User withdrawal requests with approval workflow
 */
export const payoutRequests = pgTable('payout_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  walletId: uuid('wallet_id').references(() => wallets.id, { onDelete: 'cascade' }).notNull(),

  // Payout details (in cents)
  amount: bigint('amount', { mode: 'number' }).notNull(),
  currency: text('currency').notNull(),
  fee: bigint('fee', { mode: 'number' }).default(0),
  netAmount: bigint('net_amount', { mode: 'number' }).notNull(),

  // Payout method
  method: text('method').notNull(), // bank_transfer, paypal, stripe, wise
  destination: jsonb('destination').$type<{
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    routingNumber?: string;
    swiftCode?: string;
    iban?: string;
    email?: string;
    [key: string]: string | undefined;
  }>().notNull(),

  // Status workflow
  status: text('status').notNull().default('pending'), // pending, approved, processing, completed, rejected, cancelled
  reviewedBy: text('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  rejectionReason: text('rejection_reason'),

  // Processing info
  processedAt: timestamp('processed_at'),
  completedAt: timestamp('completed_at'),
  externalTransactionId: text('external_transaction_id'),
  externalStatus: text('external_status'),

  // Metadata
  notes: text('notes'),
  metadata: jsonb('metadata'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Escrow Table
 * Hold funds during marketplace transactions
 */
export const escrows = pgTable('escrows', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: text('order_id').notNull().unique(),
  listingId: text('listing_id').notNull(),

  // Parties
  petOwnerId: text('pet_owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  sellerId: text('seller_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Amount (in cents)
  amount: bigint('amount', { mode: 'number' }).notNull(),
  currency: text('currency').notNull(),
  platformFee: bigint('platform_fee', { mode: 'number' }).default(0),
  sellerAmount: bigint('seller_amount', { mode: 'number' }).notNull(), // amount - platformFee

  // Status
  status: text('status').notNull().default('pending'), // pending, held, released, refunded, disputed

  // Timestamps
  heldAt: timestamp('held_at'),
  releasedAt: timestamp('released_at'),
  refundedAt: timestamp('refunded_at'),

  // Dispute handling
  disputeReason: text('dispute_reason'),
  disputeResolvedBy: text('dispute_resolved_by').references(() => users.id),
  disputeResolvedAt: timestamp('dispute_resolved_at'),

  // Metadata
  notes: text('notes'),
  metadata: jsonb('metadata'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
