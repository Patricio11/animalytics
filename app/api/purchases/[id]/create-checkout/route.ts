import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { purchases } from '@/lib/db/schema/purchases';
import { listings } from '@/lib/db/schema/marketplace';
import { users } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { stripeProvider } from '@/lib/services/payment/stripe-provider';
import type { UserRole } from '@/lib/utils/routing';

/**
 * POST /api/purchases/[id]/create-checkout
 * Create Stripe checkout session for a purchase
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: purchaseId } = await params;

    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get the purchase
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.id, purchaseId))
      .limit(1);

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // Verify user is the buyer
    if (purchase.buyerId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized - not the buyer' },
        { status: 403 }
      );
    }

    // Check if already paid
    if (purchase.paymentStatus === 'completed') {
      return NextResponse.json(
        { error: 'Purchase already paid' },
        { status: 400 }
      );
    }

    // Get listing details
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, purchase.listingId))
      .limit(1);

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Check if Stripe is configured
    const isConfigured = await stripeProvider.isConfiguredAsync();
    if (!isConfigured) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Get buyer's role to determine correct redirect URL
    const [buyer] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, purchase.buyerId))
      .limit(1);

    const buyerRole = (buyer?.role || 'buyer') as UserRole;
    
    // Determine purchase path based on user role
    // Breeders use /purchases, buyers use /buyer/purchases
    const purchasePath = buyerRole === 'buyer' ? '/buyer/purchases' : '/purchases';

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const checkoutSession = await stripeProvider.createCheckoutSession({
      amount: purchase.totalAmount,
      currency: purchase.currency.toLowerCase(),
      customerEmail: session.user.email || '',
      description: `Purchase: ${listing.title}`,
      metadata: {
        purchaseId: purchase.id,
        listingId: listing.id,
        buyerId: purchase.buyerId,
        sellerId: purchase.sellerId,
      },
      successUrl: `${baseUrl}${purchasePath}/${purchase.id}?payment=success`,
      cancelUrl: `${baseUrl}${purchasePath}/${purchase.id}?payment=cancelled`,
    });

    // Update purchase with payment intent ID
    await db
      .update(purchases)
      .set({
        paymentIntentId: checkoutSession.id,
        paymentStatus: 'processing',
        updatedAt: new Date(),
      })
      .where(eq(purchases.id, purchaseId));

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
