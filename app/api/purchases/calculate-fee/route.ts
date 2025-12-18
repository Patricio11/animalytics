import { NextRequest, NextResponse } from 'next/server';
import { settingsService } from '@/lib/services/payment/settings-service';

/**
 * GET /api/purchases/calculate-fee
 * Calculate platform fee for a given amount
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const amountStr = searchParams.get('amount');
    const isPremiumStr = searchParams.get('isPremium');

    if (!amountStr) {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      );
    }

    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount < 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const isPremiumSeller = isPremiumStr === 'true';

    // Calculate platform fee using database settings
    const platformFee = await settingsService.calculateFee(amount, isPremiumSeller);

    return NextResponse.json({
      success: true,
      amount,
      platformFee,
      totalAmount: amount + platformFee,
      isPremiumSeller,
    });
  } catch (error) {
    console.error('Error calculating platform fee:', error);
    return NextResponse.json(
      { error: 'Failed to calculate platform fee' },
      { status: 500 }
    );
  }
}
