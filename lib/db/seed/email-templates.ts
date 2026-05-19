import { db } from '@/lib/db';
import { emailTemplates, type NewEmailTemplate } from '@/lib/db/schema/email-templates';
import { sql } from 'drizzle-orm';

/**
 * Default email templates. These mirror the hardcoded HTML in lib/services/email.ts
 * so admins can edit them in the UI without touching code. Each template is system-marked
 * and can be reset back to its default body via the admin UI.
 *
 * Adding a new key here? After deploy, hit GET /api/admin/email-templates once to seed it.
 * Existing rows are not overwritten.
 */
export const DEFAULT_EMAIL_TEMPLATES: NewEmailTemplate[] = [
  {
    key: 'welcome_credentials',
    name: 'Welcome — Admin-Created User',
    description: 'Sent to a user when an admin creates their account, with the temporary password.',
    category: 'onboarding',
    subject: 'Welcome to Animalytics — Your Account is Ready!',
    bodyHtml: WELCOME_CREDENTIALS_HTML(),
    variables: [
      { name: 'name', description: 'Recipient name', example: 'Jane Doe' },
      { name: 'email', description: 'Recipient email', example: 'jane@example.com' },
      { name: 'temporaryPassword', description: 'Initial password for first sign-in', example: 'Xy7!aB9zQp2K' },
      { name: 'loginUrl', description: 'Direct link to the sign-in page', example: 'https://animalytics.co/auth/signin' },
    ],
    isSystem: true,
  },
  {
    key: 'password_reset',
    name: 'Password Reset',
    description: 'Sent when a user requests to reset their password.',
    category: 'onboarding',
    subject: 'Reset your Animalytics password',
    bodyHtml: PASSWORD_RESET_HTML(),
    variables: [
      { name: 'name', description: 'Recipient name', example: 'Jane Doe' },
      { name: 'resetUrl', description: 'Direct link to the password reset page (includes token)', example: 'https://animalytics.co/auth/reset-password?token=abc123' },
    ],
    isSystem: true,
  },
  {
    key: 'email_verification',
    name: 'Email Verification',
    description: 'Sent when a new user signs up, to verify their email address.',
    category: 'onboarding',
    subject: 'Verify your email — Animalytics',
    bodyHtml: EMAIL_VERIFICATION_HTML(),
    variables: [
      { name: 'name', description: 'Recipient name', example: 'Jane Doe' },
      { name: 'verificationUrl', description: 'Direct verification link (includes token)', example: 'https://animalytics.co/auth/verify?token=abc123' },
    ],
    isSystem: true,
  },
  {
    key: 'new_message',
    name: 'New Message Notification',
    description: 'Sent to the recipient when they get a new message in the conversation system.',
    category: 'messaging',
    subject: 'New message from {{senderName}} — Animalytics',
    bodyHtml: NEW_MESSAGE_HTML(),
    variables: [
      { name: 'recipientName', description: 'Person receiving the email', example: 'Jane Doe' },
      { name: 'senderName', description: 'Person who sent the message', example: 'John Smith' },
      { name: 'messagePreview', description: 'First ~120 chars of the message', example: 'Hi Jane, I noticed your listing for...' },
      { name: 'conversationUrl', description: 'Link to open the conversation', example: 'https://animalytics.co/messages?conversation=abc' },
    ],
    isSystem: true,
  },
  {
    key: 'progesterone_reminder',
    name: 'Progesterone Test Reminder',
    description: 'Generic reminder that a progesterone test is due.',
    category: 'progesterone',
    subject: '{{title}} — Animalytics',
    bodyHtml: PROGESTERONE_REMINDER_HTML(),
    variables: [
      { name: 'title', description: 'Reminder title', example: 'Day 7 progesterone test due' },
      { name: 'message', description: 'Full reminder message', example: 'Willow is due for her Day 7 progesterone test today.' },
      { name: 'bitchName', description: 'Bitch name', example: 'Willow' },
      { name: 'dueDate', description: 'Human-friendly due date', example: 'Monday, May 12' },
    ],
    isSystem: true,
  },
  {
    key: 'breeding_window',
    name: 'Breeding Window Detected',
    description: 'Sent when progesterone readings indicate the breeding window is open.',
    category: 'progesterone',
    subject: 'Breeding window open for {{bitchName}}',
    bodyHtml: BREEDING_WINDOW_HTML(),
    variables: [
      { name: 'bitchName', description: 'Bitch name', example: 'Willow' },
      { name: 'level', description: 'Current progesterone level (ng/mL)', example: '18.5' },
      { name: 'phase', description: 'Current phase', example: 'Fertile Window' },
      { name: 'cycleUrl', description: 'Link to the heat cycle detail page', example: 'https://animalytics.co/calculators/progesterone/abc' },
    ],
    isSystem: true,
  },
  {
    key: 'daily_test_reminder',
    name: 'Daily Test Required',
    description: 'Sent when the progesterone trend indicates testing is needed daily.',
    category: 'progesterone',
    subject: 'Daily progesterone test required for {{bitchName}}',
    bodyHtml: DAILY_TEST_REMINDER_HTML(),
    variables: [
      { name: 'bitchName', description: 'Bitch name', example: 'Willow' },
      { name: 'day', description: 'Cycle day number', example: '8' },
      { name: 'lastLevel', description: 'Last progesterone reading (ng/mL)', example: '10' },
      { name: 'cycleUrl', description: 'Link to the heat cycle detail page', example: 'https://animalytics.co/calculators/progesterone/abc' },
    ],
    isSystem: true,
  },
];

/**
 * Insert any missing default templates (idempotent — won't overwrite existing rows).
 */
export async function seedDefaultEmailTemplates() {
  await db
    .insert(emailTemplates)
    .values(DEFAULT_EMAIL_TEMPLATES)
    .onConflictDoNothing({ target: emailTemplates.key });
}

/**
 * Cheap empty-table check; seeds on first admin visit.
 */
export async function ensureEmailTemplatesSeeded() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(emailTemplates);
  if (count === 0) {
    console.log('📧 Seeding default email templates...');
    await seedDefaultEmailTemplates();
    console.log(`✅ Seeded ${DEFAULT_EMAIL_TEMPLATES.length} email templates`);
  }
}

/**
 * Look up the default HTML body for a given key. Used by the "Restore to default"
 * admin action so we don't have to query the DB.
 */
export function getDefaultTemplateBody(key: string): { subject: string; bodyHtml: string } | null {
  const tpl = DEFAULT_EMAIL_TEMPLATES.find((t) => t.key === key);
  if (!tpl) return null;
  return { subject: tpl.subject, bodyHtml: tpl.bodyHtml };
}

// ============================================================================
// Default HTML bodies — kept as functions for tree-shaking and readability
// ============================================================================

function WELCOME_CREDENTIALS_HTML() {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .credentials-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .credential-item { margin: 15px 0; }
    .credential-label { font-weight: bold; color: #667eea; }
    .credential-value { font-family: monospace; background: #f3f4f6; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 5px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Animalytics!</h1>
      <p>Your account has been created and is ready to use</p>
    </div>
    <div class="content">
      <p>Hello {{name}},</p>
      <p>Your Animalytics account has been set up by our admin team. We're excited to have you join our platform!</p>
      <div class="credentials-box">
        <h3 style="margin-top: 0; color: #667eea;">Your Login Credentials</h3>
        <div class="credential-item">
          <div class="credential-label">Email:</div>
          <div class="credential-value">{{email}}</div>
        </div>
        <div class="credential-item">
          <div class="credential-label">Temporary Password:</div>
          <div class="credential-value">{{temporaryPassword}}</div>
        </div>
      </div>
      <div class="warning">
        <strong>Important Security Notice:</strong><br>
        Please change your password immediately after your first login. This temporary password is only for initial access.
      </div>
      <div style="text-align: center;">
        <a href="{{loginUrl}}" class="button">Login to Your Account</a>
      </div>
      <p>Best regards,<br>The Animalytics Team</p>
    </div>
    <div class="footer">
      <p>This email was sent because an admin created an account for you on Animalytics.</p>
    </div>
  </div>
</body>
</html>`;
}

function PASSWORD_RESET_HTML() {
  return `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #667eea;">Reset your password</h2>
  <p>Hello {{name}},</p>
  <p>We received a request to reset your Animalytics password. Click the button below to set a new one:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="{{resetUrl}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">Reset Password</a>
  </p>
  <p>If you didn't request this, you can safely ignore this email — your password won't change.</p>
  <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">This link expires in 1 hour for security.</p>
</body>
</html>`;
}

function EMAIL_VERIFICATION_HTML() {
  return `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #667eea;">Verify your email</h2>
  <p>Hello {{name}},</p>
  <p>Thanks for signing up for Animalytics! Please verify your email address by clicking the button below:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="{{verificationUrl}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">Verify Email</a>
  </p>
  <p>If you didn't sign up for Animalytics, you can safely ignore this email.</p>
</body>
</html>`;
}

function NEW_MESSAGE_HTML() {
  return `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #667eea;">New message from {{senderName}}</h2>
  <p>Hello {{recipientName}},</p>
  <p>You have a new message:</p>
  <blockquote style="border-left: 4px solid #667eea; padding-left: 16px; margin: 20px 0; color: #4b5563;">{{messagePreview}}</blockquote>
  <p style="text-align: center; margin: 30px 0;">
    <a href="{{conversationUrl}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">Reply in Animalytics</a>
  </p>
</body>
</html>`;
}

function PROGESTERONE_REMINDER_HTML() {
  return `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #667eea;">{{title}}</h2>
  <p>{{message}}</p>
  <p><strong>Bitch:</strong> {{bitchName}}<br><strong>Due:</strong> {{dueDate}}</p>
  <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">— Animalytics</p>
</body>
</html>`;
}

function BREEDING_WINDOW_HTML() {
  return `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #16a34a;">🎯 Breeding window detected for {{bitchName}}</h2>
  <p>{{bitchName}}'s latest progesterone reading is <strong>{{level}} ng/mL</strong> — <strong>{{phase}}</strong>.</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="{{cycleUrl}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">View Cycle</a>
  </p>
</body>
</html>`;
}

function DAILY_TEST_REMINDER_HTML() {
  return `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #ea580c;">⚡ Daily test required for {{bitchName}}</h2>
  <p>{{bitchName}} — Day {{day}}. Last reading was <strong>{{lastLevel}} ng/mL</strong>. Daily testing is now required to catch the breeding window.</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="{{cycleUrl}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">View Cycle</a>
  </p>
</body>
</html>`;
}
