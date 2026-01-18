import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verificationRequests, verificationAuditLog } from '@/lib/db/schema/verification-requests';
import { users } from '@/lib/db/schema/users';
import { auth } from '@/lib/auth/config';
import { eq } from 'drizzle-orm';
import { notifyVerificationStatusChange } from '@/lib/services/verification-notifications';

/**
 * POST /api/admin/verifications/[id]/reject
 * Reject a verification request (admin only)
 */
export async function POST(
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

    // Check if user is admin
    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const adminId = session.user.id;
    const verificationId = params.id;
    const body = await request.json();
    const { rejectionReason, adminFeedback } = body;

    if (!rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // Get verification request
    const verificationRequest = await db.query.verificationRequests.findFirst({
      where: eq(verificationRequests.id, verificationId),
    });

    if (!verificationRequest) {
      return NextResponse.json(
        { error: 'Verification request not found' },
        { status: 404 }
      );
    }

    // Check if already processed
    if (verificationRequest.status === 'rejected') {
      return NextResponse.json(
        { error: 'Verification request already rejected' },
        { status: 400 }
      );
    }

    const reviewedAt = new Date();

    // Update verification request
    await db.update(verificationRequests)
      .set({
        status: 'rejected',
        reviewedBy: adminId,
        reviewedAt,
        rejectionReason,
        adminFeedback,
        updatedAt: new Date(),
      })
      .where(eq(verificationRequests.id, verificationId));

    // Create audit log entry
    await db.insert(verificationAuditLog).values({
      verificationRequestId: verificationId,
      userId: verificationRequest.userId,
      action: 'rejected',
      performedBy: adminId,
      previousStatus: verificationRequest.status,
      newStatus: 'rejected',
      reason: rejectionReason,
      notes: adminFeedback,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // Get user info for notifications
    const user = await db.query.users.findFirst({
      where: eq(users.id, verificationRequest.userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Send notifications (email + in-system)
    await notifyVerificationStatusChange(
      verificationRequest.userId,
      user.email,
      user.name || 'User',
      'rejected',
      verificationId,
      {
        rejectionReason,
        adminFeedback,
      }
    );

    console.log(`✅ Verification rejected: ${verificationId} by admin ${adminId}`);

    return NextResponse.json({
      success: true,
      message: 'Verification rejected',
      verificationRequest: {
        ...verificationRequest,
        status: 'rejected',
        reviewedBy: adminId,
        reviewedAt,
        rejectionReason,
        adminFeedback,
      },
    });
  } catch (error) {
    console.error('Error rejecting verification:', error);
    return NextResponse.json(
      { error: 'Failed to reject verification' },
      { status: 500 }
    );
  }
}
