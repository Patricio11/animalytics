/**
 * Stripe Webhook Handler
 * Processes payment events from Stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { purchases, purchaseTimeline } from '@/lib/db/schema/purchases';
import { listings } from '@/lib/db/schema/marketplace';
import { users } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';
import { stripeProvider } from '@/lib/services/payment';
import { escrowService } from '@/lib/services/payment/escrow-service';
import { createPaymentCompletedNotification } from '@/lib/services/notification-creator';
import { sendEmail } from '@/lib/services/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    // Verify webhook
    const verification = await stripeProvider.verifyWebhook(body, signature);

    if (!verification.valid || !verification.event) {
      console.error('Webhook verification failed:', verification.error);
      return NextResponse.json(
        { error: verification.error || 'Invalid webhook' },
        { status: 400 }
      );
    }

    const event = verification.event;

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Record<string, unknown>);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Record<string, unknown>);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Record<string, unknown>);
        break;

      case 'charge.refunded':
        await handleRefund(event.data.object as Record<string, unknown>);
        break;

      case 'charge.dispute.created':
        await handleDispute(event.data.object as Record<string, unknown>);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Record<string, unknown>) {
  const metadata = paymentIntent.metadata as Record<string, string>;
  const purchaseId = metadata?.purchaseId;

  if (!purchaseId) {
    console.error('No purchaseId in payment intent metadata');
    return;
  }

  // Get purchase
  const [purchase] = await db
    .select()
    .from(purchases)
    .where(eq(purchases.id, purchaseId));

  if (!purchase) {
    console.error('Purchase not found:', purchaseId);
    return;
  }

  // Update purchase status
  await db
    .update(purchases)
    .set({
      status: 'payment_completed',
      paymentStatus: 'completed',
      paymentCompletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(purchases.id, purchaseId));

  // Hold escrow funds
  if (purchase.escrowId) {
    await escrowService.hold(purchase.escrowId);
  }

  // Add timeline event
  await db.insert(purchaseTimeline).values({
    purchaseId,
    eventType: 'payment_completed',
    eventTitle: 'Payment Completed',
    eventDescription: `Payment of ${((paymentIntent.amount as number) / 100).toFixed(2)} ${(paymentIntent.currency as string).toUpperCase()} received successfully`,
    oldStatus: 'payment_pending',
    newStatus: 'payment_completed',
    actorRole: 'system',
    visibleToBuyer: true,
    visibleToSeller: true,
    metadata: JSON.stringify({
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    }),
  });

  // Get listing and user details for notifications
  try {
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, purchase.listingId!))
      .limit(1);

    const [buyer] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, purchase.buyerId))
      .limit(1);

    const [seller] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, purchase.sellerId))
      .limit(1);

    if (listing && buyer && seller) {
      // Send in-app notification to seller
      await createPaymentCompletedNotification({
        sellerId: purchase.sellerId,
        buyerName: buyer.name || 'A buyer',
        listingTitle: listing.title,
        amount: purchase.totalAmount,
        currency: purchase.currency,
        purchaseId,
      });

      // Send email notification to seller
      if (seller.email) {
        await sendEmail({
          to: seller.email,
          subject: '💰 Payment Received - Action Required',
          html: `
            <h2>Payment Received!</h2>
            <p>Great news! ${buyer.name || 'A buyer'} has completed payment for your listing.</p>
            
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3 style="margin: 0 0 8px 0;">${listing.title}</h3>
              <p style="margin: 4px 0;"><strong>Amount:</strong> ${new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: purchase.currency,
              }).format(purchase.totalAmount / 100)}</p>
              <p style="margin: 4px 0;"><strong>Buyer:</strong> ${buyer.name}</p>
            </div>

            <h3>Next Steps:</h3>
            <ol>
              <li>Prepare the item for ${purchase.deliveryMethod === 'pickup' ? 'pickup' : 'delivery'}</li>
              <li>Mark as dispatched when ready</li>
              <li>Funds will be released after buyer confirms receipt</li>
            </ol>

            <p style="margin-top: 24px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/purchases/${purchaseId}" 
                 style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Purchase Details
              </a>
            </p>

            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
              The payment is held securely in escrow and will be released to you once the buyer confirms receipt.
            </p>
          `,
        });
      }
    }
  } catch (notifError) {
    console.error('Failed to send payment notification:', notifError);
    // Don't fail the webhook if notification fails
  }

  console.log(`Payment successful for purchase ${purchaseId}`);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Record<string, unknown>) {
  const metadata = paymentIntent.metadata as Record<string, string>;
  const purchaseId = metadata?.purchaseId;

  if (!purchaseId) return;

  // Update purchase status
  await db
    .update(purchases)
    .set({
      paymentStatus: 'failed',
      updatedAt: new Date(),
    })
    .where(eq(purchases.id, purchaseId));

  // Add timeline event
  await db.insert(purchaseTimeline).values({
    purchaseId,
    eventType: 'payment_failed',
    eventTitle: 'Payment Failed',
    eventDescription: 'Payment could not be processed. Please try again.',
    actorRole: 'system',
    visibleToBuyer: true,
    visibleToSeller: false,
  });

  console.log(`Payment failed for purchase ${purchaseId}`);
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent: Record<string, unknown>) {
  const metadata = paymentIntent.metadata as Record<string, string>;
  const purchaseId = metadata?.purchaseId;

  if (!purchaseId) return;

  // Update purchase status
  await db
    .update(purchases)
    .set({
      status: 'cancelled',
      paymentStatus: 'cancelled',
      cancelledAt: new Date(),
      cancelReason: 'Payment cancelled',
      updatedAt: new Date(),
    })
    .where(eq(purchases.id, purchaseId));

  // Add timeline event
  await db.insert(purchaseTimeline).values({
    purchaseId,
    eventType: 'payment_cancelled',
    eventTitle: 'Payment Cancelled',
    eventDescription: 'Payment was cancelled',
    actorRole: 'system',
    visibleToBuyer: true,
    visibleToSeller: true,
  });

  console.log(`Payment cancelled for purchase ${purchaseId}`);
}

/**
 * Handle refund
 */
async function handleRefund(charge: Record<string, unknown>) {
  const paymentIntentId = charge.payment_intent as string;

  if (!paymentIntentId) return;

  // Find purchase by payment intent ID
  const [purchase] = await db
    .select()
    .from(purchases)
    .where(eq(purchases.paymentIntentId, paymentIntentId));

  if (!purchase) {
    console.error('Purchase not found for payment intent:', paymentIntentId);
    return;
  }

  const refundAmount = charge.amount_refunded as number;

  // Update purchase
  await db
    .update(purchases)
    .set({
      status: 'refunded',
      paymentStatus: 'refunded',
      refundAmount,
      refundedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(purchases.id, purchase.id));

  // Refund escrow if exists
  if (purchase.escrowId) {
    await escrowService.refund({
      escrowId: purchase.escrowId,
      reason: 'Stripe refund processed',
      refundedBy: 'system',
    });
  }

  // Add timeline event
  await db.insert(purchaseTimeline).values({
    purchaseId: purchase.id,
    eventType: 'refund_processed',
    eventTitle: 'Refund Processed',
    eventDescription: `Refund of ${(refundAmount / 100).toFixed(2)} ${purchase.currency} processed`,
    actorRole: 'system',
    visibleToBuyer: true,
    visibleToSeller: true,
  });

  console.log(`Refund processed for purchase ${purchase.id}`);
}

/**
 * Handle dispute
 */
async function handleDispute(dispute: Record<string, unknown>) {
  const chargeId = dispute.charge as string;

  // Find purchase - would need to track charge ID
  // For now, log the dispute
  console.log(`Dispute created for charge ${chargeId}:`, dispute.reason);

  // TODO: Find purchase and update status to disputed
  // This would require storing charge ID in the purchase record
}
