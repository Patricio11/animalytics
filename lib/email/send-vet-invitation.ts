import { sendEmail } from '@/lib/services/email';

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
    const html = generateVetInvitationHTML({
      firstName,
      clinicName,
      inviterName,
      inviterRole,
      inviteUrl,
      message,
      expiresInDays,
    });

    const success = await sendEmail({
      to: email,
      subject: `Join ${clinicName} on Animalytics`,
      html,
    });

    if (!success) {
      throw new Error('Failed to send invitation email');
    }

    console.log('Vet invitation email sent successfully');
    return { success: true, data: { email } };
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
    const html = generateVetWelcomeHTML({ firstName, clinicName });

    const success = await sendEmail({
      to: email,
      subject: `Welcome to ${clinicName}!`,
      html,
    });

    if (!success) {
      throw new Error('Failed to send welcome email');
    }

    return { success: true, data: { email } };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

/**
 * Generate vet invitation email HTML
 */
function generateVetInvitationHTML(data: {
  firstName?: string;
  clinicName: string;
  inviterName: string;
  inviterRole: string;
  inviteUrl: string;
  message?: string;
  expiresInDays: number;
}): string {
  const { firstName = 'there', clinicName, inviterName, inviterRole, inviteUrl, message, expiresInDays } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Join ${clinicName} on Animalytics</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      font-size: 36px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 16px;
    }
    .title {
      font-size: 28px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 16px;
    }
    .message {
      font-size: 16px;
      color: #4b5563;
      margin-bottom: 24px;
      line-height: 1.8;
    }
    .message-box {
      background: #f3f4f6;
      border-left: 4px solid #3b82f6;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .message-text {
      color: #374151;
      font-size: 15px;
      line-height: 24px;
      margin: 8px 0;
    }
    .features {
      margin: 24px 0;
    }
    .features ul {
      list-style: none;
      padding: 0;
      margin: 16px 0;
    }
    .features li {
      padding: 8px 0;
      color: #374151;
      font-size: 16px;
    }
    .features li:before {
      content: "✓ ";
      color: #10b981;
      font-weight: bold;
      margin-right: 8px;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .link {
      color: #3b82f6;
      font-size: 14px;
      word-break: break-all;
    }
    .footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🐕 Animalytics</div>
      <div class="title">You're Invited to Join ${clinicName}!</div>
    </div>
    
    <div class="message">
      <p>Hi Dr. ${firstName},</p>
      <p>${inviterName} (${inviterRole}) has invited you to join <strong>${clinicName}</strong> on Animalytics, the comprehensive animal breeding and health management platform.</p>
    </div>
    
    ${message ? `
    <div class="message-box">
      <p class="message-text"><strong>Personal Message:</strong></p>
      <p class="message-text">"${message}"</p>
    </div>
    ` : ''}
    
    <div class="features">
      <p><strong>As a veterinarian on Animalytics, you'll be able to:</strong></p>
      <ul>
        <li>Manage your clinic profile and services</li>
        <li>Conduct and record semen assessments</li>
        <li>Track animal health records and appointments</li>
        <li>Collaborate with breeders and other veterinarians</li>
        <li>Access advanced breeding analytics</li>
      </ul>
    </div>
    
    <div class="button-container">
      <a href="${inviteUrl}" class="button">Accept Invitation</a>
    </div>
    
    <div class="message">
      <p><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
      <p class="link">${inviteUrl}</p>
    </div>
    
    <div class="footer">
      <p>This invitation will expire in <strong>${expiresInDays} days</strong>.</p>
      <p>If you didn't expect this invitation, you can safely ignore this email.</p>
      <p style="margin-top: 16px;">© ${new Date().getFullYear()} Animalytics. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate vet welcome email HTML
 */
function generateVetWelcomeHTML(data: {
  firstName: string;
  clinicName: string;
}): string {
  const { firstName, clinicName } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${clinicName}!</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      font-size: 36px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 16px;
    }
    .title {
      font-size: 28px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 16px;
    }
    .message {
      font-size: 16px;
      color: #4b5563;
      margin-bottom: 24px;
      line-height: 1.8;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🐕 Animalytics</div>
      <div class="title">Welcome to ${clinicName}, Dr. ${firstName}!</div>
    </div>
    
    <div class="message">
      <p>Your account has been successfully activated. You can now access your clinic dashboard and start using Animalytics.</p>
    </div>
    
    <div class="button-container">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/vet/dashboard" class="button">Go to Dashboard</a>
    </div>
    
    <div class="footer">
      <p>If you have any questions, contact us at support@animalytics.com</p>
      <p style="margin-top: 16px;">© ${new Date().getFullYear()} Animalytics. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
