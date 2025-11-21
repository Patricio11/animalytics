/**
 * Escrow Detail API Routes
 * GET - Get escrow details
 * POST - Release or refund escrow
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { escrows } from '@/lib/db/schema/wallet';
import { purchases } from '@/lib/db/schema/purchases';
import { eq } from 'drizzle-orm';
import { escrowService } from '@/lib/services/payment/escrow-service';

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

    // Get escrow
    const escrow = await escrowService.get(id);

    if (!escrow) {
      return NextResponse.json(
        { error: 'Escrow not found' },
        { status: 404 }
      );
    }

    // Verify user is buyer or seller
    if (escrow.buyerId !== session.user.id && escrow.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to view this escrow' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      escrow: {
        id: escrow.id,
        orderId: escrow.orderId,
        listingId: escrow.listingId,
        buyerId: escrow.buyerId,
        sellerId: escrow.sellerId,
        amount: escrow.amount,
        currency: escrow.currency,
        platformFee: escrow.platformFee,
        sellerAmount: escrow.sellerAmount,
        status: escrow.status,
        heldAt: escrow.heldAt,
        releasedAt: escrow.releasedAt,
        refundedAt: escrow.refundedAt,
        createdAt: escrow.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching escrow:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const { action, reason } = body;

    // Get escrow
    const escrow = await escrowService.get(id);

    if (!escrow) {
      return NextResponse.json(
        { error: 'Escrow not found' },
        { status: 404 }
      );
    }

    // Verify user is buyer or seller
    const isBuyer = escrow.buyerId === session.user.id;
    const isSeller = escrow.sellerId === session.user.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { error: 'Not authorized to manage this escrow' },
        { status: 403 }
      );
    }

    let result;

    switch (action) {
      case 'release':
        // Only buyer can release (by confirming receipt)
        // Or system auto-release
        if (!isBuyer) {
          return NextResponse.json(
            { error: 'Only buyer can release escrow by confirming receipt' },
            { status: 403 }
          );
        }

        result = await escrowService.release({
          escrowId: id,
          releasedBy: session.user.id,
        });
        break;

      case 'refund':
        // Seller can refund, or buyer can request refund
        if (!isSeller) {
          return NextResponse.json(
            { error: 'Only seller can initiate refund' },
            { status: 403 }
          );
        }

        if (!reason) {
          return NextResponse.json(
            { error: 'Refund reason is required' },
            { status: 400 }
          );
        }

        result = await escrowService.refund({
          escrowId: id,
          reason: reason,
          refundedBy: session.user.id,
        });
        break;

      case 'dispute':
        // Both can open dispute
        if (!reason) {
          return NextResponse.json(
            { error: 'Dispute reason is required' },
            { status: 400 }
          );
        }

        // Update escrow to disputed
        await db
          .update(escrows)
          .set({
            status: 'disputed',
            disputeReason: reason,
            updatedAt: new Date(),
          })
          .where(eq(escrows.id, id));

        // Update purchase
        await db
          .update(purchases)
          .set({
            status: 'disputed',
            isDisputed: true,
            disputeReason: reason,
            disputeOpenedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(purchases.id, escrow.orderId));

        result = { success: true, escrowId: id };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: release, refund, or dispute' },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Action failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      action,
      escrowId: id,
    });
  } catch (error) {
    console.error('Error managing escrow:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
