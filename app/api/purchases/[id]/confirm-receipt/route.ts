/**
 * Confirm Receipt API
 * POST - Pet owner confirms receipt of animal/item
 * This triggers escrow release to seller
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { purchases, purchaseTimeline } from '@/lib/db/schema/purchases';
import { eq } from 'drizzle-orm';
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
    const { notes, rating } = body;

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
        { error: 'Only the pet owner can confirm receipt' },
        { status: 403 }
      );
    }

    // Check if already confirmed
    if (purchase.petOwnerConfirmedReceipt) {
      return NextResponse.json(
        { error: 'Receipt already confirmed' },
        { status: 400 }
      );
    }

    // Check if purchase is in a valid state for confirmation
    const validStatuses = ['ready_for_pickup', 'in_transit', 'preparing', 'confirmed', 'payment_completed'];
    if (!validStatuses.includes(purchase.status)) {
      return NextResponse.json(
        { error: `Cannot confirm receipt for purchase in status: ${purchase.status}` },
        { status: 400 }
      );
    }

    // Update purchase with pet owner confirmation
    await db
      .update(purchases)
      .set({
        petOwnerConfirmedReceipt: true,
        petOwnerConfirmedAt: new Date(),
        petOwnerNotes: notes || purchase.petOwnerNotes,
        status: 'completed',
        completedAt: new Date(),
        ownershipTransferred: true,
        transferredAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(purchases.id, id));

    // Add timeline event
    await db.insert(purchaseTimeline).values({
      purchaseId: id,
      eventType: 'pet_owner_confirmed',
      eventTitle: 'Pet Owner Confirmed Receipt',
      eventDescription: notes || 'Pet owner has confirmed receipt of the animal/item',
      oldStatus: purchase.status,
      newStatus: 'completed',
      actorId: session.user.id,
      actorRole: 'pet_owner',
      visibleToPetOwner: true,
      visibleToSeller: true,
    });

    // Release escrow funds to seller
    if (purchase.escrowId) {
      const releaseResult = await escrowService.release({
        escrowId: purchase.escrowId,
        releasedBy: session.user.id,
      });

      if (!releaseResult.success) {
        console.error('Failed to release escrow:', releaseResult.error);
        // Continue anyway - the confirmation is recorded
        // Admin can manually release funds if needed
      } else {
        // Add timeline event for escrow release
        await db.insert(purchaseTimeline).values({
          purchaseId: id,
          eventType: 'escrow_released',
          eventTitle: 'Payment Released to Seller',
          eventDescription: 'Funds have been released to the seller\'s wallet',
          actorId: session.user.id,
          actorRole: 'system',
          visibleToPetOwner: true,
          visibleToSeller: true,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Receipt confirmed and payment released to seller',
      purchase: {
        id,
        status: 'completed',
        petOwnerConfirmedReceipt: true,
        petOwnerConfirmedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error confirming receipt:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
