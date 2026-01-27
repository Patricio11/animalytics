import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verificationRequests } from '@/lib/db/schema/verification-requests';
import { auth } from '@/lib/auth/config';
import { eq } from 'drizzle-orm';

/**
 * GET /api/verification/request
 * Get current user's verification request
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get latest verification request
    const verificationRequest = await db.query.verificationRequests.findFirst({
      where: eq(verificationRequests.userId, userId),
      orderBy: (requests, { desc }) => [desc(requests.createdAt)],
    });

    if (!verificationRequest) {
      return NextResponse.json(
        { error: 'No verification request found' },
        { status: 404 }
      );
    }

    return NextResponse.json(verificationRequest);
  } catch (error) {
    console.error('Error fetching verification request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification request' },
      { status: 500 }
    );
  }
}
