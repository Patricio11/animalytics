import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verificationRequests } from '@/lib/db/schema/verification-requests';
import { users } from '@/lib/db/schema/users';
import { auth } from '@/lib/auth/config';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const reviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewNotes: z.string().optional(),
});

/**
 * PUT /api/admin/verifications/[id]/review
 * Approve or reject a verification request (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Check if user is admin
    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validation = reviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { status, reviewNotes } = validation.data;

    // Fetch the verification request
    const verification = await db.query.verificationRequests.findFirst({
      where: eq(verificationRequests.id, id),
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification request not found' },
        { status: 404 }
      );
    }

    // Update verification status
    const [updatedVerification] = await db
      .update(verificationRequests)
      .set({
        status,
        reviewNotes,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(verificationRequests.id, id))
      .returning();

    // If approved, update user's emailVerified status (verification badge)
    if (status === 'approved') {
      await db
        .update(users)
        .set({
          emailVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, verification.userId));
    }

    // TODO: Send notification email to user about verification status
    // You can implement this later using your email service

    return NextResponse.json({
      success: true,
      verification: updatedVerification,
      message: `Verification ${status} successfully`,
    });
  } catch (error) {
    console.error('Error reviewing verification:', error);
    return NextResponse.json(
      { error: 'Failed to review verification' },
      { status: 500 }
    );
  }
}
