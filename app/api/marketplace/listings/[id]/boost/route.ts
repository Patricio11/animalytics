import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { listingBoosts } from '@/lib/db/schema/boost';
import { boostPricing } from '@/lib/db/schema/boost';
import { listings, featuredListingHistory } from '@/lib/db/schema/marketplace';
import { wallets, transactions } from '@/lib/db/schema/wallet';
import { eq, and, gt, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { getBalance, subtractFromBalance, hasSufficientBalance } from '@/lib/utils/wallet';
import type { CurrencyCode } from '@/lib/utils/currency';
import { addDays, format } from 'date-fns';

/**
 * GET /api/marketplace/listings/[id]/boost
 * Get active boost for a listing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const [activeBoost] = await db
      .select()
      .from(listingBoosts)
      .where(
        and(
          eq(listingBoosts.listingId, id),
          eq(listingBoosts.status, 'active'),
          gt(listingBoosts.endDate, new Date())
        )
      )
      .orderBy(desc(listingBoosts.createdAt))
      .limit(1);

    return NextResponse.json({
      success: true,
      boost: activeBoost || null,
    });
  } catch (error) {
    console.error('Error fetching boost:', error);
    return NextResponse.json({ error: 'Failed to fetch boost' }, { status: 500 });
  }
}

/**
 * POST /api/marketplace/listings/[id]/boost
 * Create a boost order - deducts from wallet
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: listingId } = await params;
    const userId = session.user.id;
    const body = await request.json();
    const { platforms, durationDays } = body as { platforms: string[]; durationDays: number };

    // Validate input
    if (!platforms || platforms.length === 0) {
      return NextResponse.json({ error: 'At least one platform is required' }, { status: 400 });
    }
    if (!durationDays || durationDays < 1 || durationDays > 30) {
      return NextResponse.json({ error: 'Duration must be between 1 and 30 days' }, { status: 400 });
    }

    // Verify listing exists and belongs to user
    const [listing] = await db
      .select()
      .from(listings)
      .where(and(eq(listings.id, listingId), eq(listings.userId, userId)))
      .limit(1);

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found or access denied' }, { status: 404 });
    }

    if (listing.status !== 'active') {
      return NextResponse.json({ error: 'Only active listings can be boosted' }, { status: 400 });
    }

    // Check for existing active boost
    const [existingBoost] = await db
      .select()
      .from(listingBoosts)
      .where(
        and(
          eq(listingBoosts.listingId, listingId),
          eq(listingBoosts.status, 'active'),
          gt(listingBoosts.endDate, new Date())
        )
      )
      .limit(1);

    if (existingBoost) {
      return NextResponse.json({ error: 'This listing already has an active boost' }, { status: 400 });
    }

    // Fetch pricing for selected platforms
    const allPricing = await db
      .select()
      .from(boostPricing)
      .where(eq(boostPricing.isActive, true));

    // Calculate total cost
    let totalAmount = 0;
    const hasAllSocial = platforms.includes('all_social') || platforms.includes('all_platforms');
    const currency = allPricing[0]?.currency || 'USD';

    if (hasAllSocial) {
      // "All Social Media" bundle — find its pricing
      const allSocialPrice = allPricing.find((p) => p.platform === 'all_social' || p.platform === 'all_platforms');
      if (!allSocialPrice) {
        return NextResponse.json({ error: 'All social media pricing not configured' }, { status: 400 });
      }
      totalAmount = allSocialPrice.pricePerDay * durationDays;
      // Also add system boost if selected
      if (platforms.includes('system')) {
        const systemPrice = allPricing.find((p) => p.platform === 'system');
        if (systemPrice) totalAmount += systemPrice.pricePerDay * durationDays;
      }
    } else {
      for (const platform of platforms) {
        const pricing = allPricing.find((p) => p.platform === platform);
        if (!pricing) {
          return NextResponse.json({ error: `Pricing not configured for ${platform}` }, { status: 400 });
        }
        totalAmount += pricing.pricePerDay * durationDays;
      }
    }

    if (totalAmount <= 0) {
      return NextResponse.json({ error: 'Invalid pricing calculation' }, { status: 400 });
    }

    // Fetch wallet and check balance
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found. Please set up your wallet first.' },
        { status: 400 }
      );
    }

    const balances = (wallet.balances || {}) as Record<string, number>;
    if (!hasSufficientBalance(balances, currency as CurrencyCode, totalAmount)) {
      const currentBalance = getBalance(balances, currency as CurrencyCode);
      return NextResponse.json(
        {
          error: `Insufficient balance. Required: ${totalAmount} cents, Available: ${currentBalance} cents in ${currency}`,
        },
        { status: 400 }
      );
    }

    // Execute the boost in a transaction
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
        relatedListingId: listingId,
        paymentMethod: 'wallet',
        description: `Boost listing: ${listing.title} (${durationDays} days — ${platforms.includes('system') ? 'System' : ''}${platforms.includes('system') && platforms.length > 1 ? ' + ' : ''}${hasAllSocial ? 'All Social Media' : platforms.filter(p => p !== 'system').join(', ')})`,
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

    // Expand platforms: all_social → individual social platforms; keep 'system' as-is
    const socialMediaPlatforms = ['facebook', 'instagram', 'tiktok', 'twitter', 'youtube'];
    const expandedPlatforms = hasAllSocial
      ? [...(platforms.includes('system') ? ['system'] : []), ...socialMediaPlatforms]
      : platforms;

    // Set initial post status for social media platforms (not for 'system')
    const initialPostStatus: Record<string, string> = {};
    for (const p of expandedPlatforms) {
      if (p !== 'system') {
        initialPostStatus[p] = 'pending'; // Will become 'published' when ad is posted
      }
    }

    // Create boost record
    const [boost] = await db
      .insert(listingBoosts)
      .values({
        listingId,
        userId,
        platforms: expandedPlatforms,
        startDate: now,
        endDate,
        durationDays,
        totalAmount,
        currency,
        walletTransactionId: txn.id,
        status: 'active',
        socialMediaPostStatus: initialPostStatus,
      })
      .returning();

    // Update listing featured status only if system boost is included
    const includesSystem = expandedPlatforms.includes('system');
    if (includesSystem) {
      await db
        .update(listings)
        .set({
          isFeatured: true,
          featuredTier: 'basic',
          featuredPriority: 10,
          featuredStartDate: format(now, 'yyyy-MM-dd'),
          featuredEndDate: format(endDate, 'yyyy-MM-dd'),
          featuredAmount: totalAmount,
          featuredCurrency: currency,
        })
        .where(eq(listings.id, listingId));

      // Record in featured listing history
      await db.insert(featuredListingHistory).values({
        listingId,
        userId,
        featuredTier: 'basic',
        startDate: format(now, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        durationDays,
        amount: totalAmount,
        currency,
        paymentId: txn.id,
        paymentMethod: 'wallet',
        status: 'active',
      });
    }

    return NextResponse.json({
      success: true,
      boost,
      transaction: {
        id: txn.id,
        amount: totalAmount,
        currency,
      },
    });
  } catch (error) {
    console.error('Error creating boost:', error);
    return NextResponse.json({ error: 'Failed to create boost' }, { status: 500 });
  }
}
