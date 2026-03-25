/**
 * Purchase Payment API
 * POST - Create payment intent and process payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { purchases, purchaseTimeline } from '@/lib/db/schema/purchases';
import { users } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';
import { getPaymentProvider, stripeProvider } from '@/lib/services/payment';
import { escrowService } from '@/lib/services/payment/escrow-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { paymentMethod = 'stripe' } = body;

    // Get purchase
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.id, id));

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // Verify user is the pet owner
    if (purchase.petOwnerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the pet owner can make payment' },
        { status: 403 }
      );
    }

    // Check if already paid
    if (purchase.paymentStatus === 'completed') {
      return NextResponse.json(
        { error: 'Payment already completed' },
        { status: 400 }
      );
    }

    // Check if purchase is in valid state for payment
    if (purchase.status !== 'pending' && purchase.status !== 'payment_pending') {
      return NextResponse.json(
        { error: `Cannot process payment for purchase in status: ${purchase.status}` },
        { status: 400 }
      );
    }

    // Get pet owner info for Stripe customer
    const [petOwner] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!petOwner) {
      return NextResponse.json(
        { error: 'Pet owner not found' },
        { status: 404 }
      );
    }

    // Get payment provider
    const provider = getPaymentProvider(paymentMethod as 'stripe');

    if (!provider.isConfigured()) {
      return NextResponse.json(
        { error: `Payment provider ${paymentMethod} is not configured` },
        { status: 500 }
      );
    }

    // Create or get Stripe customer
    const customer = await provider.createCustomer({
      email: petOwner.email,
      name: petOwner.name || undefined,
    });

    // Determine redirect path based on user role
    const userRole = (petOwner as any).role || 'pet_owner';
    const purchasePath = userRole === 'pet_owner' 
      ? `/pet-owner/purchases/${purchase.id}` 
      : `/purchases/${purchase.id}`;

    // Create Stripe Checkout Session (payment link)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const checkoutSession = await (provider as any).createCheckoutSession({
      amount: purchase.totalAmount,
      currency: purchase.currency.toLowerCase(),
      customerEmail: petOwner.email,
      description: `Purchase #${purchase.id.substring(0, 8)}`,
      metadata: {
        purchaseId: purchase.id,
        buyerId: purchase.petOwnerId,
        sellerId: purchase.sellerId,
        listingId: purchase.listingId,
      },
      successUrl: `${baseUrl}${purchasePath}?payment=success`,
      cancelUrl: `${baseUrl}${purchasePath}?payment=cancelled`,
    });

    // Update purchase with payment info
    await db
      .update(purchases)
      .set({
        status: 'payment_pending',
        paymentStatus: 'processing',
        paymentIntentId: checkoutSession.id,
        updatedAt: new Date(),
      })
      .where(eq(purchases.id, id));

    // Add timeline event
    await db.insert(purchaseTimeline).values({
      purchaseId: id,
      eventType: 'payment_initiated',
      eventTitle: 'Payment Initiated',
      eventDescription: `Payment of ${(purchase.totalAmount / 100).toFixed(2)} ${purchase.currency} initiated via ${paymentMethod}`,
      oldStatus: purchase.status,
      newStatus: 'payment_pending',
      actorId: session.user.id,
      actorRole: 'pet_owner',
      visibleToPetOwner: true,
      visibleToSeller: false,
    });

    // Create escrow for this purchase
    if (!purchase.escrowId) {
      await escrowService.create({
        purchaseId: purchase.id,
        listingId: purchase.listingId,
        buyerId: purchase.petOwnerId,
        sellerId: purchase.sellerId,
        amount: purchase.totalAmount,
        currency: purchase.currency,
        isPremiumSeller: false,
      });
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      amount: purchase.totalAmount,
      currency: purchase.currency,
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET - Get payment status for a purchase
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get purchase
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.id, id));

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // Verify user is pet owner or seller
    if (purchase.petOwnerId !== session.user.id && purchase.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to view payment status' },
        { status: 403 }
      );
    }

    // If there's a payment intent, get its status from Stripe
    let stripeStatus = null;
    if (purchase.paymentIntentId && stripeProvider.isConfigured()) {
      const result = await stripeProvider.confirmPayment(purchase.paymentIntentId);
      stripeStatus = result.status;
    }

    return NextResponse.json({
      success: true,
      payment: {
        status: purchase.paymentStatus,
        method: purchase.paymentMethod,
        amount: purchase.totalAmount,
        currency: purchase.currency,
        platformFee: purchase.platformFee,
        completedAt: purchase.paymentCompletedAt,
        stripeStatus,
      },
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
