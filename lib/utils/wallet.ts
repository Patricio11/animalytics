/**
 * Wallet Utility Functions
 *
 * Comprehensive wallet management utilities for multi-currency balances,
 * transactions, escrow, and payouts.
 *
 * IMPORTANT: All amounts are stored in CENTS (smallest currency unit)
 * Use currency.ts utilities for conversion and formatting.
 *
 * @see lib/utils/currency.ts for currency formatting and conversion
 */

import { CURRENCIES, type CurrencyCode } from './currency';

// ============================================================================
// WALLET BALANCE MANAGEMENT
// ============================================================================

/**
 * Initialize empty wallet balances for all supported currencies
 */
export function initializeWalletBalances(): Record<CurrencyCode, number> {
  return Object.keys(CURRENCIES).reduce((acc, currency) => {
    acc[currency as CurrencyCode] = 0;
    return acc;
  }, {} as Record<CurrencyCode, number>);
}

/**
 * Get balance for specific currency from wallet
 */
export function getBalance(
  balances: Record<string, number>,
  currency: CurrencyCode
): number {
  return balances[currency] || 0;
}

/**
 * Add funds to wallet balance
 */
export function addToBalance(
  balances: Record<string, number>,
  currency: CurrencyCode,
  amountInCents: number
): Record<string, number> {
  return {
    ...balances,
    [currency]: getBalance(balances, currency) + amountInCents,
  };
}

/**
 * Subtract funds from wallet balance
 * @throws Error if insufficient balance
 */
export function subtractFromBalance(
  balances: Record<string, number>,
  currency: CurrencyCode,
  amountInCents: number
): Record<string, number> {
  const currentBalance = getBalance(balances, currency);

  if (currentBalance < amountInCents) {
    throw new Error(
      `Insufficient balance. Available: ${currentBalance} cents, Required: ${amountInCents} cents`
    );
  }

  return {
    ...balances,
    [currency]: currentBalance - amountInCents,
  };
}

/**
 * Check if wallet has sufficient balance
 */
export function hasSufficientBalance(
  balances: Record<string, number>,
  currency: CurrencyCode,
  amountInCents: number
): boolean {
  return getBalance(balances, currency) >= amountInCents;
}

/**
 * Get total balance across all currencies in USD cents
 * (requires exchange rates - placeholder for future implementation)
 */
export function getTotalBalanceInUSD(
  balances: Record<string, number>
): number {
  // TODO: Implement with real-time exchange rates
  // For now, just return USD balance
  return balances.USD || 0;
}

// ============================================================================
// TRANSACTION FEE CALCULATIONS
// ============================================================================

/**
 * Platform fee configuration
 */
export const PLATFORM_FEES = {
  // Marketplace transaction fees
  MARKETPLACE_SALE: 0.10, // 10% of sale price
  STUD_SERVICE: 0.15, // 15% of service price
  AI_SERVICE: 0.15, // 15% of service price

  // Payment processing fees
  STRIPE_PERCENTAGE: 0.029, // 2.9%
  STRIPE_FIXED_USD: 30, // $0.30 in cents
  PAYPAL_PERCENTAGE: 0.0349, // 3.49%
  PAYPAL_FIXED_USD: 49, // $0.49 in cents

  // Payout fees
  PAYOUT_BANK_TRANSFER: 0, // Free
  PAYOUT_INSTANT: 100, // $1.00 in cents

  // Minimum transaction amounts (in cents)
  MIN_SALE: 1000, // $10.00
  MIN_PAYOUT: 2000, // $20.00
} as const;

/**
 * Calculate platform fee for marketplace sale
 */
export function calculatePlatformFee(
  saleAmountInCents: number,
  feePercentage: number = PLATFORM_FEES.MARKETPLACE_SALE
): number {
  return Math.round(saleAmountInCents * feePercentage);
}

/**
 * Calculate Stripe payment processing fee
 */
export function calculateStripeFee(amountInCents: number): number {
  const percentageFee = Math.round(amountInCents * PLATFORM_FEES.STRIPE_PERCENTAGE);
  return percentageFee + PLATFORM_FEES.STRIPE_FIXED_USD;
}

/**
 * Calculate PayPal payment processing fee
 */
export function calculatePayPalFee(amountInCents: number): number {
  const percentageFee = Math.round(amountInCents * PLATFORM_FEES.PAYPAL_PERCENTAGE);
  return percentageFee + PLATFORM_FEES.PAYPAL_FIXED_USD;
}

/**
 * Calculate seller payout after all fees
 */
export function calculateSellerPayout(
  saleAmountInCents: number,
  paymentMethod: 'stripe' | 'paypal' = 'stripe'
): {
  saleAmount: number;
  platformFee: number;
  processingFee: number;
  sellerPayout: number;
} {
  const platformFee = calculatePlatformFee(saleAmountInCents);
  const processingFee = paymentMethod === 'stripe'
    ? calculateStripeFee(saleAmountInCents)
    : calculatePayPalFee(saleAmountInCents);

  const sellerPayout = saleAmountInCents - platformFee - processingFee;

  return {
    saleAmount: saleAmountInCents,
    platformFee,
    processingFee,
    sellerPayout: Math.max(0, sellerPayout),
  };
}

// ============================================================================
// ESCROW MANAGEMENT
// ============================================================================

/**
 * Escrow status types
 */
export type EscrowStatus = 'pending' | 'held' | 'released' | 'refunded' | 'disputed';

/**
 * Calculate escrow amounts for a transaction
 */
export function calculateEscrowAmounts(
  saleAmountInCents: number,
  paymentMethod: 'stripe' | 'paypal' = 'stripe'
): {
  buyerPays: number;
  escrowAmount: number;
  platformFee: number;
  processingFee: number;
  sellerReceives: number;
} {
  const platformFee = calculatePlatformFee(saleAmountInCents);
  const processingFee = paymentMethod === 'stripe'
    ? calculateStripeFee(saleAmountInCents)
    : calculatePayPalFee(saleAmountInCents);

  return {
    buyerPays: saleAmountInCents,
    escrowAmount: saleAmountInCents,
    platformFee,
    processingFee,
    sellerReceives: saleAmountInCents - platformFee - processingFee,
  };
}

/**
 * Check if escrow can be released (business logic)
 */
export function canReleaseEscrow(
  status: EscrowStatus,
  daysHeld: number,
  minHoldDays: number = 1
): { canRelease: boolean; reason?: string } {
  if (status !== 'held') {
    return { canRelease: false, reason: `Escrow status is ${status}, must be 'held'` };
  }

  if (daysHeld < minHoldDays) {
    return {
      canRelease: false,
      reason: `Escrow must be held for at least ${minHoldDays} days (currently ${daysHeld} days)`
    };
  }

  return { canRelease: true };
}

// ============================================================================
// PAYOUT VALIDATION
// ============================================================================

/**
 * Payout method types
 */
export type PayoutMethod = 'bank_transfer' | 'paypal' | 'stripe' | 'wise';

/**
 * Validate payout request
 */
export function validatePayoutRequest(
  amountInCents: number,
  currency: CurrencyCode,
  availableBalance: number,
  method: PayoutMethod
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check minimum amount
  if (amountInCents < PLATFORM_FEES.MIN_PAYOUT) {
    errors.push(
      `Minimum payout is ${PLATFORM_FEES.MIN_PAYOUT} cents (${PLATFORM_FEES.MIN_PAYOUT / 100} ${currency})`
    );
  }

  // Check available balance
  if (amountInCents > availableBalance) {
    errors.push(
      `Insufficient balance. Requested: ${amountInCents} cents, Available: ${availableBalance} cents`
    );
  }

  // Validate payout method
  const validMethods: PayoutMethod[] = ['bank_transfer', 'paypal', 'stripe', 'wise'];
  if (!validMethods.includes(method)) {
    errors.push(`Invalid payout method: ${method}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate payout fee based on method
 */
export function calculatePayoutFee(
  amountInCents: number,
  method: PayoutMethod
): number {
  switch (method) {
    case 'bank_transfer':
      return PLATFORM_FEES.PAYOUT_BANK_TRANSFER;
    case 'paypal':
    case 'stripe':
    case 'wise':
      return PLATFORM_FEES.PAYOUT_INSTANT;
    default:
      return 0;
  }
}

/**
 * Calculate net payout amount after fees
 */
export function calculateNetPayout(
  amountInCents: number,
  method: PayoutMethod
): {
  requestedAmount: number;
  fee: number;
  netAmount: number;
} {
  const fee = calculatePayoutFee(amountInCents, method);
  return {
    requestedAmount: amountInCents,
    fee,
    netAmount: amountInCents - fee,
  };
}

// ============================================================================
// KYC SELLING LIMITS
// ============================================================================

/**
 * KYC level selling limits (in USD cents per month)
 */
export const KYC_LIMITS = {
  NONE: 0, // Level 0: Cannot sell
  BASIC: 100000, // Level 1: $1,000/month (email + phone verified)
  SELLER: 500000, // Level 2: $5,000/month (ID + address verified)
  PROFESSIONAL: Infinity, // Level 3: Unlimited (business verified)
} as const;

/**
 * Get selling limit for KYC level
 */
export function getSellingLimit(kycLevel: 0 | 1 | 2 | 3): number {
  switch (kycLevel) {
    case 0:
      return KYC_LIMITS.NONE;
    case 1:
      return KYC_LIMITS.BASIC;
    case 2:
      return KYC_LIMITS.SELLER;
    case 3:
      return KYC_LIMITS.PROFESSIONAL;
    default:
      return KYC_LIMITS.NONE;
  }
}

/**
 * Check if user can make sale based on KYC level and monthly sales
 */
export function canMakeSale(
  saleAmountInCents: number,
  kycLevel: 0 | 1 | 2 | 3,
  monthlySalesInCents: number
): { allowed: boolean; reason?: string; remainingLimit?: number } {
  const limit = getSellingLimit(kycLevel);

  // No selling allowed
  if (limit === 0) {
    return {
      allowed: false,
      reason: 'Account verification required to sell. Please complete KYC verification.',
    };
  }

  // Unlimited selling
  if (limit === Infinity) {
    return { allowed: true };
  }

  // Check if sale would exceed limit
  const newTotal = monthlySalesInCents + saleAmountInCents;
  if (newTotal > limit) {
    return {
      allowed: false,
      reason: `Monthly selling limit exceeded. Limit: $${limit / 100}, Current: $${monthlySalesInCents / 100}, Attempted: $${saleAmountInCents / 100}`,
      remainingLimit: Math.max(0, limit - monthlySalesInCents),
    };
  }

  return {
    allowed: true,
    remainingLimit: limit - newTotal,
  };
}

/**
 * Get KYC level name
 */
export function getKYCLevelName(level: 0 | 1 | 2 | 3): string {
  switch (level) {
    case 0:
      return 'Not Verified';
    case 1:
      return 'Basic';
    case 2:
      return 'Seller';
    case 3:
      return 'Professional';
    default:
      return 'Unknown';
  }
}

// ============================================================================
// TRANSACTION HISTORY HELPERS
// ============================================================================

/**
 * Transaction types
 */
export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'payment'
  | 'refund'
  | 'fee'
  | 'escrow_hold'
  | 'escrow_release';

/**
 * Get transaction type display name
 */
export function getTransactionTypeName(type: TransactionType): string {
  const names: Record<TransactionType, string> = {
    deposit: 'Deposit',
    withdrawal: 'Withdrawal',
    payment: 'Payment',
    refund: 'Refund',
    fee: 'Fee',
    escrow_hold: 'Escrow Hold',
    escrow_release: 'Escrow Release',
  };
  return names[type] || type;
}

/**
 * Check if transaction increases balance
 */
export function isCredit(type: TransactionType): boolean {
  return ['deposit', 'refund', 'escrow_release'].includes(type);
}

/**
 * Check if transaction decreases balance
 */
export function isDebit(type: TransactionType): boolean {
  return ['withdrawal', 'payment', 'fee', 'escrow_hold'].includes(type);
}

// ============================================================================
// WALLET STATISTICS
// ============================================================================

/**
 * Calculate wallet statistics
 */
export function calculateWalletStats(transactions: Array<{
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  createdAt: Date;
}>): {
  totalDeposits: number;
  totalWithdrawals: number;
  totalEarnings: number;
  totalFees: number;
  transactionCount: number;
  lastTransactionDate?: Date;
} {
  let totalDeposits = 0;
  let totalWithdrawals = 0;
  let totalEarnings = 0;
  let totalFees = 0;
  let lastTransactionDate: Date | undefined;

  transactions.forEach((tx) => {
    if (tx.type === 'deposit') totalDeposits += tx.amount;
    if (tx.type === 'withdrawal') totalWithdrawals += tx.amount;
    if (tx.type === 'escrow_release') totalEarnings += tx.amount;
    if (tx.type === 'fee') totalFees += tx.amount;

    if (!lastTransactionDate || tx.createdAt > lastTransactionDate) {
      lastTransactionDate = tx.createdAt;
    }
  });

  return {
    totalDeposits,
    totalWithdrawals,
    totalEarnings,
    totalFees,
    transactionCount: transactions.length,
    lastTransactionDate,
  };
}
