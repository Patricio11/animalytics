import { Resend } from 'resend';
import { VetInvitationEmail } from './templates/vet-invitation';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendVetInvitationParams {
  email: string;
  firstName?: string;
  lastName?: string;
  clinicName: string;
  inviterName: string;
  inviterRole: string;
  token: string;
  message?: string;
  expiresInDays?: number;
}

/**
 * Send a veterinarian invitation email
 * @param params Invitation parameters
 * @returns Promise with email send result
 */
export async function sendVetInvitation(params: SendVetInvitationParams) {
  const {
    email,
    firstName,
    clinicName,
    inviterName,
    inviterRole,
    token,
    message,
    expiresInDays = 7,
  } = params;

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Animalytics <noreply@animalytics.com>',
      to: email,
      subject: `Join ${clinicName} on Animalytics`,
      react: VetInvitationEmail({
        firstName,
        clinicName,
        inviterName,
        inviterRole,
        inviteUrl,
        message,
        expiresInDays,
      }),
    });

    if (error) {
      console.error('Error sending vet invitation email:', error);
      throw new Error(`Failed to send invitation email: ${error.message}`);
    }

    console.log('Vet invitation email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send vet invitation:', error);
    throw error;
  }
}

/**
 * Send a welcome email to a newly accepted veterinarian
 */
export async function sendVetWelcomeEmail({
  email,
  firstName,
  clinicName,
}: {
  email: string;
  firstName: string;
  clinicName: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Animalytics <noreply@animalytics.com>',
      to: email,
      subject: `Welcome to ${clinicName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937;">Welcome to ${clinicName}, Dr. ${firstName}!</h1>
          <p style="color: #374151; font-size: 16px; line-height: 24px;">
            Your account has been successfully activated. You can now access your clinic dashboard
            and start using Animalytics.
          </p>
          <p style="margin-top: 24px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/vet/dashboard" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Go to Dashboard
            </a>
          </p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
            If you have any questions, contact us at support@animalytics.com
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}
