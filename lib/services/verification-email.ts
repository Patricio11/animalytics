import { sendEmail } from './email';
import { VerificationEmailType } from '@/lib/types/verification';

interface VerificationEmailData {
  userName: string;
  userEmail: string;
  verificationId: string;
  status?: string;
  rejectionReason?: string;
  adminFeedback?: string;
  expiryDate?: string;
  additionalInfo?: string;
}

/**
 * Send verification-related emails
 * Uses Mailtrap for development, production SMTP for live
 */
export async function sendVerificationEmail(
  type: VerificationEmailType,
  data: VerificationEmailData
): Promise<void> {
  const { userName, userEmail, verificationId, status, rejectionReason, adminFeedback, expiryDate, additionalInfo } = data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationUrl = `${appUrl}/verification`;
  const dashboardUrl = `${appUrl}/dashboard`;

  let subject = '';
  let htmlContent = '';
  let textContent = '';

  switch (type) {
    case 'verification_submitted':
      subject = '✅ Verification Submitted - Under Review';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Verification Submitted</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151;">Hi ${userName},</p>
            
            <p style="font-size: 16px; color: #374151;">
              Thank you for submitting your verification request! We've received your documents and information.
            </p>

            <div style="background: white; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0; color: #1f2937; font-weight: bold;">📋 What happens next?</p>
              <ul style="color: #4b5563; margin: 10px 0;">
                <li>Our team will review your documents within 2-3 business days</li>
                <li>We'll verify your identity and credentials</li>
                <li>You'll receive an email once the review is complete</li>
              </ul>
            </div>

            <p style="font-size: 16px; color: #374151;">
              You can check your verification status anytime in your dashboard.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                View Dashboard
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              Reference ID: ${verificationId}
            </p>

            <p style="font-size: 14px; color: #6b7280;">
              Best regards,<br>
              The Animalytics Team
            </p>
          </div>
        </div>
      `;
      textContent = `Hi ${userName},\n\nThank you for submitting your verification request! We've received your documents and information.\n\nWhat happens next?\n- Our team will review your documents within 2-3 business days\n- We'll verify your identity and credentials\n- You'll receive an email once the review is complete\n\nYou can check your verification status anytime in your dashboard: ${dashboardUrl}\n\nReference ID: ${verificationId}\n\nBest regards,\nThe Animalytics Team`;
      break;

    case 'verification_under_review':
      subject = '🔍 Your Verification is Under Review';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Under Review</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151;">Hi ${userName},</p>
            
            <p style="font-size: 16px; color: #374151;">
              Good news! Our verification team has started reviewing your submission.
            </p>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0; color: #92400e; font-weight: bold;">⏳ Review in Progress</p>
              <p style="color: #92400e; margin: 10px 0 0 0;">
                We're carefully reviewing your documents and information. This typically takes 1-2 business days.
              </p>
            </div>

            <p style="font-size: 16px; color: #374151;">
              We'll notify you as soon as the review is complete.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Check Status
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280;">
              Best regards,<br>
              The Animalytics Team
            </p>
          </div>
        </div>
      `;
      textContent = `Hi ${userName},\n\nGood news! Our verification team has started reviewing your submission.\n\nReview in Progress: We're carefully reviewing your documents and information. This typically takes 1-2 business days.\n\nWe'll notify you as soon as the review is complete.\n\nCheck your status: ${verificationUrl}\n\nBest regards,\nThe Animalytics Team`;
      break;

    case 'verification_approved':
      subject = '🎉 Verification Approved - You\'re Now Verified!';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🎉 Verification Approved!</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151;">Hi ${userName},</p>
            
            <p style="font-size: 18px; color: #374151; font-weight: bold;">
              Congratulations! Your verification has been approved. 🎊
            </p>

            <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0; color: #065f46; font-weight: bold;">✅ You're Now Verified</p>
              <p style="color: #065f46; margin: 10px 0 0 0;">
                Your account now has a verified badge that will be displayed on your profile, listings, and throughout the platform.
              </p>
            </div>

            <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #1f2937; font-weight: bold;">🌟 Benefits of Being Verified:</p>
              <ul style="color: #4b5563; margin: 0;">
                <li>Verified badge on your profile</li>
                <li>Increased trust from buyers and other users</li>
                <li>Higher visibility in search results</li>
                <li>Access to premium features</li>
                <li>Priority support</li>
              </ul>
            </div>

            <p style="font-size: 16px; color: #374151;">
              Start showcasing your verified status today!
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Go to Dashboard
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280;">
              Best regards,<br>
              The Animalytics Team
            </p>
          </div>
        </div>
      `;
      textContent = `Hi ${userName},\n\nCongratulations! Your verification has been approved. 🎊\n\nYou're Now Verified: Your account now has a verified badge that will be displayed on your profile, listings, and throughout the platform.\n\nBenefits of Being Verified:\n- Verified badge on your profile\n- Increased trust from buyers and other users\n- Higher visibility in search results\n- Access to premium features\n- Priority support\n\nStart showcasing your verified status today: ${dashboardUrl}\n\nBest regards,\nThe Animalytics Team`;
      break;

    case 'verification_rejected':
      subject = '❌ Verification Not Approved - Action Required';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Verification Not Approved</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151;">Hi ${userName},</p>
            
            <p style="font-size: 16px; color: #374151;">
              Unfortunately, we were unable to approve your verification request at this time.
            </p>

            <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0; color: #991b1b; font-weight: bold;">❌ Reason for Rejection:</p>
              <p style="color: #991b1b; margin: 10px 0 0 0;">
                ${rejectionReason || 'The submitted documents did not meet our verification requirements.'}
              </p>
            </div>

            ${adminFeedback ? `
              <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border: 1px solid #e5e7eb;">
                <p style="margin: 0 0 10px 0; color: #1f2937; font-weight: bold;">💬 Additional Feedback:</p>
                <p style="color: #4b5563; margin: 0;">
                  ${adminFeedback}
                </p>
              </div>
            ` : ''}

            <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0; color: #1e40af; font-weight: bold;">🔄 What You Can Do:</p>
              <ul style="color: #1e40af; margin: 10px 0 0 0;">
                <li>Review the rejection reason carefully</li>
                <li>Prepare the required documents</li>
                <li>Submit a new verification request</li>
              </ul>
            </div>

            <p style="font-size: 16px; color: #374151;">
              If you have questions or need assistance, please contact our support team.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Resubmit Verification
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280;">
              Best regards,<br>
              The Animalytics Team
            </p>
          </div>
        </div>
      `;
      textContent = `Hi ${userName},\n\nUnfortunately, we were unable to approve your verification request at this time.\n\nReason for Rejection:\n${rejectionReason || 'The submitted documents did not meet our verification requirements.'}\n\n${adminFeedback ? `Additional Feedback:\n${adminFeedback}\n\n` : ''}What You Can Do:\n- Review the rejection reason carefully\n- Prepare the required documents\n- Submit a new verification request\n\nIf you have questions or need assistance, please contact our support team.\n\nResubmit verification: ${verificationUrl}\n\nBest regards,\nThe Animalytics Team`;
      break;

    case 'verification_additional_info_required':
      subject = '📄 Additional Information Required for Verification';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Additional Information Needed</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151;">Hi ${userName},</p>
            
            <p style="font-size: 16px; color: #374151;">
              We're reviewing your verification request and need some additional information to complete the process.
            </p>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0; color: #92400e; font-weight: bold;">📋 What We Need:</p>
              <p style="color: #92400e; margin: 10px 0 0 0;">
                ${additionalInfo || 'Please provide additional documents or information as requested by our verification team.'}
              </p>
            </div>

            <p style="font-size: 16px; color: #374151;">
              Please upload the requested information as soon as possible to avoid delays in your verification.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Upload Documents
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280;">
              Best regards,<br>
              The Animalytics Team
            </p>
          </div>
        </div>
      `;
      textContent = `Hi ${userName},\n\nWe're reviewing your verification request and need some additional information to complete the process.\n\nWhat We Need:\n${additionalInfo || 'Please provide additional documents or information as requested by our verification team.'}\n\nPlease upload the requested information as soon as possible to avoid delays in your verification.\n\nUpload documents: ${verificationUrl}\n\nBest regards,\nThe Animalytics Team`;
      break;

    case 'verification_expiring_soon':
      subject = '⚠️ Your Verification is Expiring Soon';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Verification Expiring Soon</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151;">Hi ${userName},</p>
            
            <p style="font-size: 16px; color: #374151;">
              Your account verification will expire on <strong>${expiryDate}</strong>.
            </p>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0; color: #92400e; font-weight: bold;">⚠️ Action Required</p>
              <p style="color: #92400e; margin: 10px 0 0 0;">
                To maintain your verified status and continue enjoying the benefits, please renew your verification before it expires.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Renew Verification
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280;">
              Best regards,<br>
              The Animalytics Team
            </p>
          </div>
        </div>
      `;
      textContent = `Hi ${userName},\n\nYour account verification will expire on ${expiryDate}.\n\nAction Required: To maintain your verified status and continue enjoying the benefits, please renew your verification before it expires.\n\nRenew verification: ${verificationUrl}\n\nBest regards,\nThe Animalytics Team`;
      break;

    case 'verification_expired':
      subject = '❌ Your Verification Has Expired';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Verification Expired</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151;">Hi ${userName},</p>
            
            <p style="font-size: 16px; color: #374151;">
              Your account verification has expired. Your verified badge has been removed.
            </p>

            <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0; color: #991b1b; font-weight: bold;">❌ Verification Expired</p>
              <p style="color: #991b1b; margin: 10px 0 0 0;">
                To regain your verified status, please submit a new verification request.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Again
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280;">
              Best regards,<br>
              The Animalytics Team
            </p>
          </div>
        </div>
      `;
      textContent = `Hi ${userName},\n\nYour account verification has expired. Your verified badge has been removed.\n\nVerification Expired: To regain your verified status, please submit a new verification request.\n\nVerify again: ${verificationUrl}\n\nBest regards,\nThe Animalytics Team`;
      break;

    default:
      throw new Error(`Unknown verification email type: ${type}`);
  }

  // Send email using existing email service (Mailtrap for dev)
  await sendEmail({
    to: userEmail,
    subject,
    html: htmlContent,
    text: textContent,
  });

  console.log(`✅ Verification email sent: ${type} to ${userEmail}`);
}

/**
 * Send admin notification for new verification submission
 */
export async function sendAdminVerificationNotification(data: {
  userName: string;
  userEmail: string;
  userRole: 'breeder' | 'pet_owner';
  verificationId: string;
  submittedAt: string;
}): Promise<void> {
  const { userName, userEmail, userRole, verificationId, submittedAt } = data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const adminUrl = `${appUrl}/admin/verifications/${verificationId}`;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@animalytics.co.za';

  const subject = `🔔 New ${userRole === 'breeder' ? 'Breeder' : 'Pet Owner'} Verification Submission`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">New Verification Submission</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #374151;">
          A new verification request has been submitted and is awaiting review.
        </p>

        <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 10px 0; color: #1f2937; font-weight: bold;">📋 Submission Details:</p>
          <ul style="color: #4b5563; margin: 0; list-style: none; padding: 0;">
            <li style="padding: 5px 0;"><strong>User:</strong> ${userName}</li>
            <li style="padding: 5px 0;"><strong>Email:</strong> ${userEmail}</li>
            <li style="padding: 5px 0;"><strong>Role:</strong> ${userRole === 'breeder' ? 'Breeder' : 'Pet Owner'}</li>
            <li style="padding: 5px 0;"><strong>Submitted:</strong> ${submittedAt}</li>
            <li style="padding: 5px 0;"><strong>ID:</strong> ${verificationId}</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${adminUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Review Submission
          </a>
        </div>

        <p style="font-size: 14px; color: #6b7280;">
          Admin Panel - Animalytics
        </p>
      </div>
    </div>
  `;

  const textContent = `New Verification Submission\n\nA new verification request has been submitted and is awaiting review.\n\nSubmission Details:\n- User: ${userName}\n- Email: ${userEmail}\n- Role: ${userRole === 'breeder' ? 'Breeder' : 'Pet Owner'}\n- Submitted: ${submittedAt}\n- ID: ${verificationId}\n\nReview submission: ${adminUrl}\n\nAdmin Panel - Animalytics`;

  await sendEmail({
    to: adminEmail,
    subject,
    html: htmlContent,
    text: textContent,
  });

  console.log(`✅ Admin notification sent for verification: ${verificationId}`);
}
