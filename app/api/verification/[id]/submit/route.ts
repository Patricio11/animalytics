import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verificationRequests, verificationAuditLog } from '@/lib/db/schema/verification-requests';
import { users } from '@/lib/db/schema/users';
import { auth } from '@/lib/auth/config';
import { eq, and } from 'drizzle-orm';
import { notifyVerificationStatusChange } from '@/lib/services/verification-notifications';
import { sendAdminVerificationNotification } from '@/lib/services/verification-email';

/**
 * POST /api/verification/[id]/submit
 * Submit verification request for admin review
 */
export async function POST(
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

    const userId = session.user.id;
    const { id: verificationId } = await params;

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

    // Check if already submitted
    if (verificationRequest.status !== 'draft') {
      return NextResponse.json(
        { error: 'Verification request has already been submitted' },
        { status: 400 }
      );
    }

    // Validate required fields based on role
    const missingFields: string[] = [];

    // Common required fields
    if (!verificationRequest.firstName) missingFields.push('First Name');
    if (!verificationRequest.lastName) missingFields.push('Last Name');
    if (!verificationRequest.dateOfBirth) missingFields.push('Date of Birth');
    if (!verificationRequest.address) missingFields.push('Address');
    if (!verificationRequest.idFrontImageUrl) missingFields.push('ID Front Photo');
    if (!verificationRequest.idBackImageUrl) missingFields.push('ID Back Photo');
    if (!verificationRequest.idTopLeftCornerUrl) missingFields.push('ID Top Left Corner Photo');
    if (!verificationRequest.idTopRightCornerUrl) missingFields.push('ID Top Right Corner Photo');
    if (!verificationRequest.idBottomLeftCornerUrl) missingFields.push('ID Bottom Left Corner Photo');
    if (!verificationRequest.idBottomRightCornerUrl) missingFields.push('ID Bottom Right Corner Photo');
    if (!verificationRequest.selfieWithIdUrl) missingFields.push('Selfie with ID');
    if (!verificationRequest.proofOfAddressUrl) missingFields.push('Proof of Address');

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(', ')}`,
          missingFields,
        },
        { status: 400 }
      );
    }

    // Update verification request status
    const submittedAt = new Date();
    await db.update(verificationRequests)
      .set({
        status: 'submitted',
        submittedAt,
        updatedAt: new Date(),
      })
      .where(eq(verificationRequests.id, verificationId));

    // Create audit log entry
    await db.insert(verificationAuditLog).values({
      verificationRequestId: verificationId,
      userId,
      action: 'submitted',
      previousStatus: 'draft',
      newStatus: 'submitted',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // Send notifications (non-blocking — don't fail submit if notifications fail)
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (user) {
        await notifyVerificationStatusChange(
          userId,
          user.email,
          user.name || 'User',
          'submitted',
          verificationId
        );

        await sendAdminVerificationNotification({
          userName: user.name || 'User',
          userEmail: user.email,
          userRole: verificationRequest.userRole as 'breeder' | 'pet_owner',
          verificationId,
          submittedAt: submittedAt.toISOString(),
        });
      }
    } catch (notificationError) {
      console.error('Failed to send notifications (submit still succeeded):', notificationError);
    }

    console.log(`✅ Verification request submitted: ${verificationId}`);

    return NextResponse.json({
      success: true,
      message: 'Verification request submitted successfully',
      verificationRequest: {
        ...verificationRequest,
        status: 'submitted',
        submittedAt,
      },
    });
  } catch (error) {
    console.error('Error submitting verification request:', error);
    return NextResponse.json(
      { error: 'Failed to submit verification request' },
      { status: 500 }
    );
  }
}
