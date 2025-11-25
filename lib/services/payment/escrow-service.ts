/**
 * Escrow Service
 *
 * Manages escrow operations for secure buyer-seller transactions.
 * Handles fund holding, release, and refund logic.
 */

import { db } from '@/lib/db';
import { escrows, wallets, transactions } from '@/lib/db/schema/wallet';
import { purchases } from '@/lib/db/schema/purchases';
import { eq, sql } from 'drizzle-orm';
import { canReleaseEscrow } from './types';
import { settingsService } from './settings-service';

export interface CreateEscrowParams {
  purchaseId: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number; // in cents
  currency: string;
  isPremiumSeller?: boolean;
}

export interface EscrowResult {
  success: boolean;
  escrowId?: string;
  error?: string;
}

export interface ReleaseEscrowParams {
  escrowId: string;
  releasedBy: string; // user ID who triggered the release
}

export interface RefundEscrowParams {
  escrowId: string;
  reason: string;
  refundedBy: string;
}

/**
 * Create an escrow for a purchase
 */
export async function createEscrow(params: CreateEscrowParams): Promise<EscrowResult> {
  try {
    // Calculate fee using database settings
    const platformFee = await settingsService.calculateFee(params.amount, params.isPremiumSeller || false);
    const sellerAmount = params.amount - platformFee;

    // Create escrow record
    const [escrow] = await db
      .insert(escrows)
      .values({
        orderId: params.purchaseId,
        listingId: params.listingId,
        buyerId: params.buyerId,
        sellerId: params.sellerId,
        amount: params.amount,
        currency: params.currency,
        platformFee: platformFee,
        sellerAmount: sellerAmount,
        status: 'pending',
      })
      .returning();

    // Update purchase with escrow ID
    await db
      .update(purchases)
      .set({
        escrowId: escrow.id,
        platformFee: platformFee,
        updatedAt: new Date(),
      })
      .where(eq(purchases.id, params.purchaseId));

    return {
      success: true,
      escrowId: escrow.id,
    };
  } catch (error) {
    console.error('Failed to create escrow:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create escrow',
    };
  }
}

/**
 * Hold funds in escrow after payment is received
 */
export async function holdEscrowFunds(escrowId: string): Promise<EscrowResult> {
  try {
    // Update escrow status to held
    await db
      .update(escrows)
      .set({
        status: 'held',
        heldAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(escrows.id, escrowId));

    // Get escrow details for transaction record
    const [escrow] = await db
      .select()
      .from(escrows)
      .where(eq(escrows.id, escrowId));

    if (!escrow) {
      return { success: false, error: 'Escrow not found' };
    }

    // Create transaction record for the buyer (debit)
    await createTransaction({
      userId: escrow.buyerId,
      type: 'escrow_hold',
      amount: escrow.amount as number,
      currency: escrow.currency,
      description: `Payment held in escrow for order ${escrow.orderId}`,
      relatedOrderId: escrow.orderId,
    });

    return { success: true, escrowId };
  } catch (error) {
    console.error('Failed to hold escrow funds:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to hold funds',
    };
  }
}

/**
 * Release escrow funds to seller
 */
export async function releaseEscrow(params: ReleaseEscrowParams): Promise<EscrowResult> {
  try {
    // Get escrow details
    const [escrow] = await db
      .select()
      .from(escrows)
      .where(eq(escrows.id, params.escrowId));

    if (!escrow) {
      return { success: false, error: 'Escrow not found' };
    }

    if (escrow.status !== 'held') {
      return { success: false, error: `Cannot release escrow in status: ${escrow.status}` };
    }

    // Update escrow status
    await db
      .update(escrows)
      .set({
        status: 'released',
        releasedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(escrows.id, params.escrowId));

    // Get or create seller wallet
    let [sellerWallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, escrow.sellerId));

    if (!sellerWallet) {
      [sellerWallet] = await db
        .insert(wallets)
        .values({
          userId: escrow.sellerId,
          balances: { USD: 0, EUR: 0, GBP: 0, ZAR: 0, BRL: 0, AUD: 0, CAD: 0 },
          status: 'active',
        })
        .returning();
    }

    // Update seller wallet balance
    const currency = escrow.currency.toUpperCase();
    const sellerAmount = escrow.sellerAmount as number;
    const currentBalances = (sellerWallet.balances || {}) as Record<string, number>;
    const currentBalance = currentBalances[currency] || 0;

    await db
      .update(wallets)
      .set({
        balances: {
          ...currentBalances,
          [currency]: currentBalance + sellerAmount,
        },
        totalEarnings: sql`${wallets.totalEarnings} + ${sellerAmount}`,
        totalTransactions: sql`${wallets.totalTransactions} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, sellerWallet.id));

    // Create transaction record for seller (credit)
    await createTransaction({
      userId: escrow.sellerId,
      type: 'escrow_release',
      amount: sellerAmount,
      currency: escrow.currency,
      fee: escrow.platformFee as number,
      description: `Funds released from escrow for order ${escrow.orderId}`,
      relatedOrderId: escrow.orderId,
    });

    // Update purchase status
    await db
      .update(purchases)
      .set({
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(purchases.id, escrow.orderId));

    return { success: true, escrowId: params.escrowId };
  } catch (error) {
    console.error('Failed to release escrow:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to release escrow',
    };
  }
}

/**
 * Refund escrow funds to buyer
 */
export async function refundEscrow(params: RefundEscrowParams): Promise<EscrowResult> {
  try {
    // Get escrow details
    const [escrow] = await db
      .select()
      .from(escrows)
      .where(eq(escrows.id, params.escrowId));

    if (!escrow) {
      return { success: false, error: 'Escrow not found' };
    }

    if (escrow.status !== 'held' && escrow.status !== 'pending') {
      return { success: false, error: `Cannot refund escrow in status: ${escrow.status}` };
    }

    // Update escrow status
    await db
      .update(escrows)
      .set({
        status: 'refunded',
        refundedAt: new Date(),
        notes: params.reason,
        updatedAt: new Date(),
      })
      .where(eq(escrows.id, params.escrowId));

    // Create transaction record for buyer (refund)
    await createTransaction({
      userId: escrow.buyerId,
      type: 'refund',
      amount: escrow.amount as number,
      currency: escrow.currency,
      description: `Refund from escrow: ${params.reason}`,
      relatedOrderId: escrow.orderId,
    });

    // Update purchase status
    await db
      .update(purchases)
      .set({
        status: 'refunded',
        refundAmount: escrow.amount as number,
        refundedAt: new Date(),
        cancelReason: params.reason,
        updatedAt: new Date(),
      })
      .where(eq(purchases.id, escrow.orderId));

    return { success: true, escrowId: params.escrowId };
  } catch (error) {
    console.error('Failed to refund escrow:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refund escrow',
    };
  }
}

/**
 * Get escrow by ID
 */
export async function getEscrow(escrowId: string) {
  const [escrow] = await db
    .select()
    .from(escrows)
    .where(eq(escrows.id, escrowId));

  return escrow || null;
}

/**
 * Get escrow by purchase/order ID
 */
export async function getEscrowByOrder(orderId: string) {
  const [escrow] = await db
    .select()
    .from(escrows)
    .where(eq(escrows.orderId, orderId));

  return escrow || null;
}

/**
 * Check if escrow can be auto-released
 */
export async function checkAutoRelease(purchaseId: string): Promise<boolean> {
  const [purchase] = await db
    .select()
    .from(purchases)
    .where(eq(purchases.id, purchaseId));

  if (!purchase || !purchase.escrowId) {
    return false;
  }

  const conditions = {
    buyerConfirmed: purchase.buyerConfirmedReceipt || false,
    sellerConfirmed: purchase.sellerConfirmedHandover || false,
    autoReleaseDate: purchase.autoReleaseDate ? new Date(purchase.autoReleaseDate) : undefined,
    disputeResolved: purchase.isDisputed ? false : undefined,
  };

  return canReleaseEscrow(conditions);
}

/**
 * Helper to create transaction records
 */
async function createTransaction(params: {
  userId: string;
  type: string;
  amount: number;
  currency: string;
  fee?: number;
  description?: string;
  relatedOrderId?: string;
}) {
  // Get user's wallet
  let [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, params.userId));

  if (!wallet) {
    [wallet] = await db
      .insert(wallets)
      .values({
        userId: params.userId,
        balances: { USD: 0, EUR: 0, GBP: 0, ZAR: 0, BRL: 0, AUD: 0, CAD: 0 },
        status: 'active',
      })
      .returning();
  }

  const netAmount = params.amount - (params.fee || 0);
  const currency = params.currency.toUpperCase();
  const currentBalances = (wallet.balances || {}) as Record<string, number>;
  const balanceBefore = currentBalances[currency] || 0;

  await db.insert(transactions).values({
    walletId: wallet.id,
    userId: params.userId,
    type: params.type,
    status: 'completed',
    amount: params.amount,
    currency: params.currency,
    fee: params.fee || 0,
    netAmount: netAmount,
    balanceBefore: balanceBefore,
    balanceAfter: params.type === 'escrow_release' ? balanceBefore + netAmount : balanceBefore,
    description: params.description,
    relatedOrderId: params.relatedOrderId,
    completedAt: new Date(),
  });
}

export const escrowService = {
  create: createEscrow,
  hold: holdEscrowFunds,
  release: releaseEscrow,
  refund: refundEscrow,
  get: getEscrow,
  getByOrder: getEscrowByOrder,
  checkAutoRelease,
};
