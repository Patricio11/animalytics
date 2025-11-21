/**
 * Confirm Handover API
 * POST - Seller confirms handover of animal/item
 * This starts the auto-release countdown
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { purchases, purchaseTimeline } from '@/lib/db/schema/purchases';
import { eq } from 'drizzle-orm';

// Auto-release after 7 days if buyer doesn't confirm
const AUTO_RELEASE_DAYS = 7;

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
    const { notes, deliveryMethod } = body;

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

    // Verify user is the seller
    if (purchase.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the seller can confirm handover' },
        { status: 403 }
      );
    }

    // Check if already confirmed
    if (purchase.sellerConfirmedHandover) {
      return NextResponse.json(
        { error: 'Handover already confirmed' },
        { status: 400 }
      );
    }

    // Check if purchase is in a valid state
    const validStatuses = ['ready_for_pickup', 'in_transit', 'preparing', 'confirmed', 'payment_completed'];
    if (!validStatuses.includes(purchase.status)) {
      return NextResponse.json(
        { error: `Cannot confirm handover for purchase in status: ${purchase.status}` },
        { status: 400 }
      );
    }

    // Calculate auto-release date
    const autoReleaseDate = new Date();
    autoReleaseDate.setDate(autoReleaseDate.getDate() + AUTO_RELEASE_DAYS);

    // Update purchase with seller confirmation
    await db
      .update(purchases)
      .set({
        sellerConfirmedHandover: true,
        sellerConfirmedAt: new Date(),
        actualHandoverDate: new Date(),
        sellerNotes: notes || purchase.sellerNotes,
        autoReleaseDate: autoReleaseDate,
        updatedAt: new Date(),
      })
      .where(eq(purchases.id, id));

    // Add timeline event
    await db.insert(purchaseTimeline).values({
      purchaseId: id,
      eventType: 'seller_confirmed_handover',
      eventTitle: 'Seller Confirmed Handover',
      eventDescription: notes || `Animal/item has been handed over to buyer. Auto-release in ${AUTO_RELEASE_DAYS} days if buyer doesn't confirm.`,
      actorId: session.user.id,
      actorRole: 'seller',
      visibleToBuyer: true,
      visibleToSeller: true,
      metadata: JSON.stringify({
        autoReleaseDate: autoReleaseDate.toISOString(),
        deliveryMethod: deliveryMethod || purchase.deliveryMethod,
      }),
    });

    return NextResponse.json({
      success: true,
      message: `Handover confirmed. Payment will auto-release in ${AUTO_RELEASE_DAYS} days if buyer doesn't confirm receipt.`,
      purchase: {
        id,
        sellerConfirmedHandover: true,
        sellerConfirmedAt: new Date(),
        autoReleaseDate,
      },
    });
  } catch (error) {
    console.error('Error confirming handover:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
