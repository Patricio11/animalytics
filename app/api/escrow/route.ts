/**
 * Escrow API Routes
 * POST - Create escrow for a purchase
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { purchases } from '@/lib/db/schema/purchases';
import { listings } from '@/lib/db/schema/marketplace';
import { eq } from 'drizzle-orm';
import { escrowService } from '@/lib/services/payment/escrow-service';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { purchaseId } = body;

    if (!purchaseId) {
      return NextResponse.json(
        { error: 'Purchase ID is required' },
        { status: 400 }
      );
    }

    // Get purchase details
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.id, purchaseId));

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // Verify user is the buyer
    if (purchase.buyerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the buyer can create escrow' },
        { status: 403 }
      );
    }

    // Check if escrow already exists
    if (purchase.escrowId) {
      return NextResponse.json(
        { error: 'Escrow already exists for this purchase' },
        { status: 400 }
      );
    }

    // Get listing for seller info
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, purchase.listingId));

    // Create escrow
    const result = await escrowService.create({
      purchaseId: purchase.id,
      listingId: purchase.listingId,
      buyerId: purchase.buyerId,
      sellerId: purchase.sellerId,
      amount: purchase.totalAmount,
      currency: purchase.currency,
      isPremiumSeller: false, // TODO: Check seller's premium status
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create escrow' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      escrowId: result.escrowId,
    });
  } catch (error) {
    console.error('Error creating escrow:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
