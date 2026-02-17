import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { wallets } from '@/lib/db/schema/wallet';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

/**
 * GET /api/wallet
 * Get the current user's wallet balance
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, session.user.id))
      .limit(1);

    if (!wallet) {
      return NextResponse.json({
        success: true,
        wallet: null,
        balances: {},
      });
    }

    return NextResponse.json({
      success: true,
      wallet: {
        id: wallet.id,
        balances: wallet.balances || {},
        status: wallet.status,
      },
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
  }
}
