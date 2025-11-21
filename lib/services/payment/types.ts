/**
 * Payment Provider Types and Interfaces
 *
 * This abstraction layer allows seamless integration of multiple payment providers
 * (Stripe, PayPal, etc.) while maintaining a consistent API.
 */

export type PaymentProviderType = 'stripe' | 'paypal' | 'bank_transfer' | 'wise';

export interface PaymentIntentParams {
  amount: number; // in cents
  currency: string;
  customerId?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
  description?: string;
}

export interface PaymentIntentResult {
  id: string;
  clientSecret?: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  amount: number;
  currency: string;
}

export interface PaymentConfirmResult {
  success: boolean;
  status: string;
  transactionId: string;
  amount: number;
  currency: string;
  error?: string;
}

export interface RefundParams {
  paymentIntentId: string;
  amount?: number; // partial refund if specified
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  status: string;
  error?: string;
}

export interface CustomerParams {
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}

export interface CustomerResult {
  id: string;
  email: string;
  name?: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
  created: number;
}

export interface WebhookVerificationResult {
  valid: boolean;
  event?: WebhookEvent;
  error?: string;
}

/**
 * Payment Provider Interface
 *
 * All payment providers must implement this interface to ensure
 * consistent behavior across different payment systems.
 */
export interface PaymentProvider {
  /**
   * Provider name for identification
   */
  name: PaymentProviderType;

  /**
   * Create a payment intent for processing a payment
   */
  createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntentResult>;

  /**
   * Confirm a payment (server-side confirmation)
   */
  confirmPayment(paymentIntentId: string): Promise<PaymentConfirmResult>;

  /**
   * Process a refund
   */
  refund(params: RefundParams): Promise<RefundResult>;

  /**
   * Create or retrieve a customer
   */
  createCustomer(params: CustomerParams): Promise<CustomerResult>;

  /**
   * Retrieve customer by ID
   */
  getCustomer(customerId: string): Promise<CustomerResult | null>;

  /**
   * Verify a webhook signature and parse the event
   */
  verifyWebhook(payload: string, signature: string): Promise<WebhookVerificationResult>;

  /**
   * Check if the provider is properly configured
   */
  isConfigured(): boolean;
}

/**
 * Platform fee configuration
 */
export interface PlatformFeeConfig {
  standardRate: number; // e.g., 0.05 for 5%
  premiumRate: number;  // e.g., 0.03 for 3%
  minFee: number;       // minimum fee in cents
  maxFee: number;       // maximum fee in cents
}

/**
 * Calculate platform fee for a transaction
 */
export function calculatePlatformFee(
  amount: number,
  isPremiumSeller: boolean,
  config: PlatformFeeConfig = {
    standardRate: 0.05,
    premiumRate: 0.03,
    minFee: 100, // $1.00 minimum
    maxFee: 50000, // $500.00 maximum
  }
): number {
  const rate = isPremiumSeller ? config.premiumRate : config.standardRate;
  let fee = Math.round(amount * rate);

  // Apply min/max constraints
  fee = Math.max(fee, config.minFee);
  fee = Math.min(fee, config.maxFee);

  return fee;
}

/**
 * Escrow status for tracking fund states
 */
export type EscrowStatus = 'pending' | 'held' | 'released' | 'refunded' | 'disputed';

/**
 * Escrow release conditions
 */
export interface EscrowReleaseConditions {
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  autoReleaseDate?: Date;
  disputeResolved?: boolean;
}

/**
 * Check if escrow can be released
 */
export function canReleaseEscrow(conditions: EscrowReleaseConditions): boolean {
  // Release if buyer confirmed receipt
  if (conditions.buyerConfirmed) {
    return true;
  }

  // Release if auto-release date has passed and no disputes
  if (conditions.autoReleaseDate &&
      conditions.autoReleaseDate <= new Date() &&
      conditions.disputeResolved !== false) {
    return true;
  }

  // Release if dispute was resolved in seller's favor
  if (conditions.disputeResolved === true) {
    return true;
  }

  return false;
}

/**
 * Transaction type for wallet operations
 */
export type WalletTransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'payment'
  | 'refund'
  | 'fee'
  | 'commission'
  | 'escrow_hold'
  | 'escrow_release';
