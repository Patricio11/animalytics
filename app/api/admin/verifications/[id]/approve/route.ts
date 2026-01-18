import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verificationRequests, verificationAuditLog } from '@/lib/db/schema/verification-requests';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { petOwnerProfiles } from '@/lib/db/schema/pet-owner-profiles';
import { users } from '@/lib/db/schema/users';
import { auth } from '@/lib/auth/config';
import { eq } from 'drizzle-orm';
import { notifyVerificationStatusChange } from '@/lib/services/verification-notifications';

/**
 * POST /api/admin/verifications/[id]/approve
 * Approve a verification request (admin only)
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
    const { reviewNotes } = body;

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
    if (verificationRequest.status === 'approved') {
      return NextResponse.json(
        { error: 'Verification request already approved' },
        { status: 400 }
      );
    }

    // Calculate expiry date (2 years from now)
    const verifiedAt = new Date();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 2);

    // Update verification request
    await db.update(verificationRequests)
      .set({
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: verifiedAt,
        verifiedAt,
        expiresAt,
        reviewNotes,
        updatedAt: new Date(),
      })
      .where(eq(verificationRequests.id, verificationId));

    // Update user's profile with verified status
    if (verificationRequest.userRole === 'breeder') {
      await db.update(breederProfiles)
        .set({
          kycVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(breederProfiles.userId, verificationRequest.userId));
    } else if (verificationRequest.userRole === 'pet_owner') {
      await db.update(petOwnerProfiles)
        .set({
          isVerified: true,
          verifiedAt,
        })
        .where(eq(petOwnerProfiles.userId, verificationRequest.userId));
    }

    // Create audit log entry
    await db.insert(verificationAuditLog).values({
      verificationRequestId: verificationId,
      userId: verificationRequest.userId,
      action: 'approved',
      performedBy: adminId,
      previousStatus: verificationRequest.status,
      newStatus: 'approved',
      notes: reviewNotes,
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
      'approved',
      verificationId
    );

    console.log(`✅ Verification approved: ${verificationId} by admin ${adminId}`);

    return NextResponse.json({
      success: true,
      message: 'Verification approved successfully',
      verificationRequest: {
        ...verificationRequest,
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: verifiedAt,
        verifiedAt,
        expiresAt,
      },
    });
  } catch (error) {
    console.error('Error approving verification:', error);
    return NextResponse.json(
      { error: 'Failed to approve verification' },
      { status: 500 }
    );
  }
}
