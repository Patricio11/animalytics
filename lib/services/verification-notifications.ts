import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema/notifications';
import { VerificationStatus } from '@/lib/types/verification';

/**
 * Create in-system notifications for verification events
 * These appear in the user's notification center
 */

interface CreateVerificationNotificationParams {
  userId: string;
  type: 'verification_submitted' | 'verification_under_review' | 'verification_approved' | 'verification_rejected' | 'verification_additional_info_required' | 'verification_expiring_soon' | 'verification_expired';
  verificationId: string;
  metadata?: {
    rejectionReason?: string;
    adminFeedback?: string;
    expiryDate?: string;
    additionalInfo?: string;
  };
}

export async function createVerificationNotification({
  userId,
  type,
  verificationId,
  metadata = {},
}: CreateVerificationNotificationParams): Promise<void> {
  let title = '';
  let message = '';
  let actionUrl = '/verification';

  switch (type) {
    case 'verification_submitted':
      title = 'Verification Submitted';
      message = 'Your verification request has been submitted and is awaiting review. We\'ll notify you once it\'s been reviewed.';
      break;

    case 'verification_under_review':
      title = 'Verification Under Review';
      message = 'Our team is now reviewing your verification submission. This typically takes 1-2 business days.';
      break;

    case 'verification_approved':
      title = '🎉 Verification Approved!';
      message = 'Congratulations! Your account has been verified. You now have a verified badge on your profile.';
      actionUrl = '/dashboard';
      break;

    case 'verification_rejected':
      title = 'Verification Not Approved';
      message = metadata.rejectionReason 
        ? `Your verification was not approved. Reason: ${metadata.rejectionReason}`
        : 'Your verification was not approved. Please review the feedback and resubmit.';
      break;

    case 'verification_additional_info_required':
      title = 'Additional Information Required';
      message = metadata.additionalInfo 
        ? `We need additional information for your verification: ${metadata.additionalInfo}`
        : 'We need additional information to complete your verification. Please check your verification page.';
      break;

    case 'verification_expiring_soon':
      title = 'Verification Expiring Soon';
      message = metadata.expiryDate
        ? `Your verification will expire on ${metadata.expiryDate}. Please renew to maintain your verified status.`
        : 'Your verification is expiring soon. Please renew to maintain your verified status.';
      break;

    case 'verification_expired':
      title = 'Verification Expired';
      message = 'Your verification has expired. Your verified badge has been removed. Please submit a new verification request.';
      break;
  }

  // Create notification in database
  await db.insert(notifications).values({
    userId,
    type: type as any, // Cast to notification type enum
    title,
    message,
    actionUrl,
    metadata: {
      verificationId,
      ...metadata,
    },
    read: false,
  });

  console.log(`✅ In-system notification created: ${type} for user ${userId}`);
}

/**
 * Helper to send both email and in-system notification
 */
export async function notifyVerificationStatusChange(
  userId: string,
  userEmail: string,
  userName: string,
  status: VerificationStatus,
  verificationId: string,
  metadata?: {
    rejectionReason?: string;
    adminFeedback?: string;
    expiryDate?: string;
    additionalInfo?: string;
  }
): Promise<void> {
  const { sendVerificationEmail } = await import('./verification-email');

  // Map status to notification type
  let notificationType: CreateVerificationNotificationParams['type'];
  let emailType: Parameters<typeof sendVerificationEmail>[0];

  switch (status) {
    case 'submitted':
      notificationType = 'verification_submitted';
      emailType = 'verification_submitted';
      break;
    case 'under_review':
      notificationType = 'verification_under_review';
      emailType = 'verification_under_review';
      break;
    case 'approved':
      notificationType = 'verification_approved';
      emailType = 'verification_approved';
      break;
    case 'rejected':
      notificationType = 'verification_rejected';
      emailType = 'verification_rejected';
      break;
    case 'expired':
      notificationType = 'verification_expired';
      emailType = 'verification_expired';
      break;
    default:
      console.warn(`Unknown verification status: ${status}`);
      return;
  }

  // Send in-system notification
  await createVerificationNotification({
    userId,
    type: notificationType,
    verificationId,
    metadata,
  });

  // Send email notification
  await sendVerificationEmail(emailType, {
    userName,
    userEmail,
    verificationId,
    status,
    ...metadata,
  });

  console.log(`✅ Dual notification sent (email + in-system) for verification ${verificationId}`);
}
