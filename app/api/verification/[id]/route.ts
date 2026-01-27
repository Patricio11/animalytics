import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verificationRequests } from '@/lib/db/schema/verification-requests';
import { auth } from '@/lib/auth/config';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/verification/[id]
 * Get verification request by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const verificationId = params.id;

    // Get verification request
    const verificationRequest = await db.query.verificationRequests.findFirst({
      where: and(
        eq(verificationRequests.id, verificationId),
        eq(verificationRequests.userId, userId)
      ),
    });

    if (!verificationRequest) {
      return NextResponse.json(
        { error: 'Verification request not found' },
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

/**
 * PATCH /api/verification/[id]
 * Update verification request
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const verificationId = params.id;
    const body = await request.json();

    // Get verification request
    const verificationRequest = await db.query.verificationRequests.findFirst({
      where: and(
        eq(verificationRequests.id, verificationId),
        eq(verificationRequests.userId, userId)
      ),
    });

    if (!verificationRequest) {
      return NextResponse.json(
        { error: 'Verification request not found' },
        { status: 404 }
      );
    }

    // Only allow updates if status is draft
    if (verificationRequest.status !== 'draft') {
      return NextResponse.json(
        { error: 'Cannot update submitted verification request' },
        { status: 400 }
      );
    }

    // Update verification request
    const [updated] = await db
      .update(verificationRequests)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(verificationRequests.id, verificationId))
      .returning();

    return NextResponse.json({
      success: true,
      verificationRequest: updated,
    });
  } catch (error) {
    console.error('Error updating verification request:', error);
    return NextResponse.json(
      { error: 'Failed to update verification request' },
      { status: 500 }
    );
  }
}
