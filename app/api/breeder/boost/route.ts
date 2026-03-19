import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { profileBoosts, boostPricing } from '@/lib/db/schema/boost';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { wallets, transactions } from '@/lib/db/schema/wallet';
import { eq, and, gt, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { getBalance, subtractFromBalance, hasSufficientBalance } from '@/lib/utils/wallet';
import type { CurrencyCode } from '@/lib/utils/currency';
import { addDays } from 'date-fns';

const PROFILE_BOOST_PLATFORM = 'profile_boost';

/**
 * GET /api/breeder/boost
 * Get active profile boost for the authenticated breeder
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [profile] = await db
      .select({ id: breederProfiles.id, isBoosted: breederProfiles.isBoosted, boostedUntil: breederProfiles.boostedUntil })
      .from(breederProfiles)
      .where(eq(breederProfiles.userId, session.user.id))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: 'Breeder profile not found' }, { status: 404 });
    }

    const [activeBoost] = await db
      .select()
      .from(profileBoosts)
      .where(
        and(
          eq(profileBoosts.profileId, profile.id),
          eq(profileBoosts.status, 'active'),
          gt(profileBoosts.endDate, new Date())
        )
      )
      .orderBy(desc(profileBoosts.createdAt))
      .limit(1);

    // Fetch pricing
    const pricing = await db
      .select()
      .from(boostPricing)
      .where(and(eq(boostPricing.platform, PROFILE_BOOST_PLATFORM), eq(boostPricing.isActive, true)))
      .limit(1);

    return NextResponse.json({
      success: true,
      boost: activeBoost || null,
      isBoosted: profile.isBoosted && profile.boostedUntil ? new Date(profile.boostedUntil) > new Date() : false,
      boostedUntil: profile.boostedUntil,
      pricing: pricing[0] || null,
    });
  } catch (error) {
    console.error('Error fetching profile boost:', error);
    return NextResponse.json({ error: 'Failed to fetch boost' }, { status: 500 });
  }
}

/**
 * POST /api/breeder/boost
 * Create a profile boost — deducts from wallet, shows breeder on landing page
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { durationDays } = body as { durationDays: number };

    if (!durationDays || durationDays < 1 || durationDays > 30) {
      return NextResponse.json({ error: 'Duration must be between 1 and 30 days' }, { status: 400 });
    }

    // Get breeder profile
    const [profile] = await db
      .select()
      .from(breederProfiles)
      .where(and(eq(breederProfiles.userId, userId), eq(breederProfiles.isPublic, true)))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: 'Public breeder profile not found. Make your profile public first.' }, { status: 404 });
    }

    // Check for existing active boost
    const [existingBoost] = await db
      .select()
      .from(profileBoosts)
      .where(
        and(
          eq(profileBoosts.profileId, profile.id),
          eq(profileBoosts.status, 'active'),
          gt(profileBoosts.endDate, new Date())
        )
      )
      .limit(1);

    if (existingBoost) {
      return NextResponse.json({ error: 'Your profile already has an active boost' }, { status: 400 });
    }

    // Fetch profile boost pricing
    const [pricing] = await db
      .select()
      .from(boostPricing)
      .where(and(eq(boostPricing.platform, PROFILE_BOOST_PLATFORM), eq(boostPricing.isActive, true)))
      .limit(1);

    if (!pricing) {
      return NextResponse.json({ error: 'Profile boost pricing not configured. Please contact the administrator.' }, { status: 400 });
    }

    const totalAmount = pricing.pricePerDay * durationDays;
    const currency = pricing.currency;

    // Fetch wallet and check balance
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found. Please set up your wallet first.' }, { status: 400 });
    }

    const balances = (wallet.balances || {}) as Record<string, number>;
    if (!hasSufficientBalance(balances, currency as CurrencyCode, totalAmount)) {
      const currentBalance = getBalance(balances, currency as CurrencyCode);
      return NextResponse.json(
        { error: `Insufficient balance. Required: ${(totalAmount / 100).toFixed(2)} ${currency}, Available: ${(currentBalance / 100).toFixed(2)} ${currency}` },
        { status: 400 }
      );
    }

    const now = new Date();
    const endDate = addDays(now, durationDays);
    const balanceBefore = getBalance(balances, currency as CurrencyCode);
    const newBalances = subtractFromBalance(balances, currency as CurrencyCode, totalAmount);
    const balanceAfter = getBalance(newBalances, currency as CurrencyCode);

    // Create wallet transaction
    const [txn] = await db
      .insert(transactions)
      .values({
        walletId: wallet.id,
        userId,
        type: 'payment',
        status: 'completed',
        amount: totalAmount,
        currency,
        fee: 0,
        netAmount: totalAmount,
        balanceBefore,
        balanceAfter,
        paymentMethod: 'wallet',
        description: `Profile boost: ${profile.displayName} (${durationDays} day${durationDays > 1 ? 's' : ''} — featured on landing page)`,
        completedAt: now,
      })
      .returning();

    // Deduct from wallet
    await db
      .update(wallets)
      .set({
        balances: newBalances,
        totalTransactions: (wallet.totalTransactions || 0) + 1,
        updatedAt: now,
      })
      .where(eq(wallets.id, wallet.id));

    // Create boost record
    const [boost] = await db
      .insert(profileBoosts)
      .values({
        profileId: profile.id,
        userId,
        startDate: now,
        endDate,
        durationDays,
        totalAmount,
        currency,
        walletTransactionId: txn.id,
        status: 'active',
      })
      .returning();

    // Mark profile as boosted
    await db
      .update(breederProfiles)
      .set({ isBoosted: true, boostedUntil: endDate, updatedAt: now })
      .where(eq(breederProfiles.id, profile.id));

    return NextResponse.json({
      success: true,
      boost,
      transaction: { id: txn.id, amount: totalAmount, currency },
    });
  } catch (error) {
    console.error('Error creating profile boost:', error);
    return NextResponse.json({ error: 'Failed to create boost' }, { status: 500 });
  }
}
