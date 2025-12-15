import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// ============================================================================
// EMAIL CONFIGURATION
// ============================================================================

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Mailtrap configuration for development/testing
const getEmailConfig = (): EmailConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    // Mailtrap for testing
    console.log('📧 Email Config (Development):');
    console.log('  Host:', process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io');
    console.log('  Port:', process.env.MAILTRAP_PORT || '2525');
    console.log('  User:', process.env.MAILTRAP_USER ? '✓ Set' : '✗ Missing');
    console.log('  Pass:', process.env.MAILTRAP_PASS ? '✓ Set' : '✗ Missing');
    
    return {
      host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
      port: parseInt(process.env.MAILTRAP_PORT || '2525'),
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USER || '',
        pass: process.env.MAILTRAP_PASS || '',
      },
    };
  } else {
    // Production SMTP (e.g., Resend, SendGrid, AWS SES, etc.)
    console.log('📧 Email Config (Production):');
    console.log('  Host:', process.env.SMTP_HOST || '✗ Missing');
    console.log('  Port:', process.env.SMTP_PORT || '587');
    console.log('  Secure:', process.env.SMTP_SECURE === 'true');
    console.log('  User:', process.env.SMTP_USER ? '✓ Set' : '✗ Missing');
    console.log('  Pass:', process.env.SMTP_PASS ? '✓ Set' : '✗ Missing');
    console.log('  From:', process.env.SMTP_FROM || 'noreply@animalytics.co');
    
    return {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };
  }
};

// Create transporter
let transporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (!transporter) {
    const config = getEmailConfig();
    transporter = nodemailer.createTransport(config);
  }
  return transporter;
};

// ============================================================================
// EMAIL TYPES
// ============================================================================

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface ReminderEmailData {
  breederName: string;
  bitchName: string;
  reminderType: string;
  title: string;
  message: string;
  dueDate: string;
  actionUrl?: string;
}

// ============================================================================
// EMAIL SENDING FUNCTIONS
// ============================================================================

/**
 * Send a generic email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transport = getTransporter();
    
    const mailOptions = {
      from: options.from || process.env.EMAIL_FROM || 'Animalytics <noreply@animalytics.com>',
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    const info = await transport.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send progesterone test reminder email
 */
export async function sendProgesteroneReminderEmail(
  to: string,
  data: ReminderEmailData
): Promise<boolean> {
  const html = generateReminderEmailHTML(data);
  
  return sendEmail({
    to,
    subject: `🔔 ${data.title}`,
    html,
  });
}

/**
 * Send breeding window alert email
 */
export async function sendBreedingWindowEmail(
  to: string,
  data: {
    breederName: string;
    bitchName: string;
    progesteroneLevel: number;
    day: number;
    breedingDates: string[];
    whelpingDate?: string;
  }
): Promise<boolean> {
  const html = generateBreedingWindowEmailHTML(data);
  
  return sendEmail({
    to,
    subject: '🎯 Breeding Window Open - Action Required!',
    html,
  });
}

/**
 * Send daily test reminder email
 */
export async function sendDailyTestReminderEmail(
  to: string,
  data: {
    breederName: string;
    bitchName: string;
    day: number;
    lastLevel: number;
  }
): Promise<boolean> {
  const html = generateDailyTestReminderHTML(data);
  
  return sendEmail({
    to,
    subject: '⚡ Daily Progesterone Test Due',
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  data: {
    name: string;
    resetUrl: string;
    token: string;
  }
): Promise<boolean> {
  const html = generatePasswordResetEmailHTML(data);
  
  return sendEmail({
    to,
    subject: '🔐 Reset Your Password - Animalytics',
    html,
  });
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  to: string,
  data: {
    name: string;
    verificationUrl: string;
    token: string;
  }
): Promise<boolean> {
  const html = generateVerificationEmailHTML(data);
  
  return sendEmail({
    to,
    subject: '✉️ Verify Your Email - Animalytics',
    html,
  });
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

/**
 * Generate reminder email HTML
 */
function generateReminderEmailHTML(data: ReminderEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
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
      padding: 32px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #8b5cf6;
      margin-bottom: 8px;
    }
    .title {
      font-size: 24px;
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
    .info-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
    }
    .info-box h3 {
      margin: 0 0 12px 0;
      font-size: 18px;
    }
    .info-box p {
      margin: 8px 0;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 16px 0;
      text-align: center;
    }
    .footer {
      margin-top: 32px;
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
      <div class="title">${data.title}</div>
    </div>
    
    <div class="message">
      <p>Hi ${data.breederName},</p>
      <p>${data.message}</p>
    </div>
    
    <div class="info-box">
      <h3>📋 Reminder Details</h3>
      <p><strong>Bitch:</strong> ${data.bitchName}</p>
      <p><strong>Type:</strong> ${data.reminderType}</p>
      <p><strong>Due Date:</strong> ${data.dueDate}</p>
    </div>
    
    ${data.actionUrl ? `
    <div style="text-align: center;">
      <a href="${data.actionUrl}" class="button">View Heat Cycle</a>
    </div>
    ` : ''}
    
    <div class="footer">
      <p>This is an automated reminder from Animalytics</p>
      <p>© ${new Date().getFullYear()} Animalytics. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate breeding window email HTML
 */
function generateBreedingWindowEmailHTML(data: {
  breederName: string;
  bitchName: string;
  progesteroneLevel: number;
  day: number;
  breedingDates: string[];
  whelpingDate?: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Breeding Window Open!</title>
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
      padding: 32px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .alert {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 24px;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 24px;
    }
    .alert h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
    }
    .alert p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 24px 0;
    }
    .stat-box {
      background: #f9fafb;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #10b981;
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 14px;
      color: #6b7280;
    }
    .breeding-dates {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .breeding-dates h3 {
      margin: 0 0 12px 0;
      color: #92400e;
    }
    .date-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .date-list li {
      padding: 8px 0;
      color: #78350f;
      font-weight: 500;
    }
    .footer {
      margin-top: 32px;
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
    <div class="alert">
      <h1>🎯 Breeding Window Open!</h1>
      <p>Optimal breeding time detected for ${data.bitchName}</p>
    </div>
    
    <p>Hi ${data.breederName},</p>
    <p>Great news! The progesterone levels indicate that <strong>${data.bitchName}</strong> is now in the optimal breeding window.</p>
    
    <div class="stats">
      <div class="stat-box">
        <div class="stat-value">${data.progesteroneLevel} ng/mL</div>
        <div class="stat-label">Progesterone Level</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">Day ${data.day}</div>
        <div class="stat-label">Heat Cycle Day</div>
      </div>
    </div>
    
    <div class="breeding-dates">
      <h3>📅 Recommended Breeding Dates</h3>
      <ul class="date-list">
        ${data.breedingDates.map(date => `<li>✓ ${date}</li>`).join('')}
      </ul>
    </div>
    
    ${data.whelpingDate ? `
    <p style="background: #dbeafe; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <strong>👶 Expected Whelping Date:</strong> ${data.whelpingDate}<br>
      <small style="color: #1e40af;">(±2 days from ovulation)</small>
    </p>
    ` : ''}
    
    <p style="color: #dc2626; font-weight: 600; margin-top: 24px;">
      ⚠️ Time-sensitive: Breed within the next 24-48 hours for optimal results.
    </p>
    
    <div class="footer">
      <p>This is an automated alert from Animalytics</p>
      <p>© ${new Date().getFullYear()} Animalytics. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate daily test reminder HTML
 */
function generateDailyTestReminderHTML(data: {
  breederName: string;
  bitchName: string;
  day: number;
  lastLevel: number;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Progesterone Test Due</title>
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
      padding: 32px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .urgent {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 24px;
    }
    .urgent h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
    }
    .info {
      background: #fef3c7;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
    }
    .footer {
      margin-top: 32px;
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
    <div class="urgent">
      <h2>⚡ Daily Test Required</h2>
      <p>Progesterone levels are rising - daily testing recommended</p>
    </div>
    
    <p>Hi ${data.breederName},</p>
    <p>A daily progesterone test is due for <strong>${data.bitchName}</strong>.</p>
    
    <div class="info">
      <p><strong>Current Status:</strong></p>
      <p>• Day ${data.day} of heat cycle</p>
      <p>• Last reading: ${data.lastLevel} ng/mL</p>
      <p>• Status: Levels rising - daily monitoring required</p>
    </div>
    
    <p style="color: #dc2626; font-weight: 600;">
      ⚠️ Test today to avoid missing the breeding window!
    </p>
    
    <div class="footer">
      <p>This is an automated reminder from Animalytics</p>
      <p>© ${new Date().getFullYear()} Animalytics. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate email verification HTML
 */
function generateVerificationEmailHTML(data: {
  name: string;
  verificationUrl: string;
  token: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
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
      margin-bottom: 32px;
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
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .info-box {
      background: #dbeafe;
      border-left: 4px solid #3b82f6;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 8px 0;
      color: #1e40af;
      font-size: 14px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
    }
    .footer p {
      margin: 8px 0;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🐕 Animalytics</div>
      <div class="title">✉️ Verify Your Email</div>
    </div>
    
    <div class="message">
      <p>Hi ${data.name},</p>
      <p>Welcome to Animalytics! Please verify your email address to activate your account and start managing your breeding program.</p>
    </div>
    
    <div class="button-container">
      <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
    </div>
    
    <div class="info-box">
      <p><strong>ℹ️ Important:</strong></p>
      <p>• This link will expire in 24 hours</p>
      <p>• You must verify your email to access all features</p>
      <p>• If you didn't create this account, please ignore this email</p>
    </div>
    
    <div class="message">
      <p><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea; font-size: 14px;">${data.verificationUrl}</p>
    </div>
    
    <div class="footer">
      <p>This verification email was sent from your Animalytics account.</p>
      <p>If you didn't sign up, please <a href="mailto:support@animalytics.com">contact support</a>.</p>
      <p style="margin-top: 16px;">© ${new Date().getFullYear()} Animalytics. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate password reset email HTML
 */
function generatePasswordResetEmailHTML(data: {
  name: string;
  resetUrl: string;
  token: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
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
      margin-bottom: 32px;
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
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .security-notice {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .security-notice p {
      margin: 8px 0;
      color: #92400e;
      font-size: 14px;
    }
    .token-box {
      background: #f3f4f6;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
      text-align: center;
    }
    .token {
      font-family: 'Courier New', monospace;
      font-size: 18px;
      font-weight: bold;
      color: #1f2937;
      letter-spacing: 2px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
    }
    .footer p {
      margin: 8px 0;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🐕 Animalytics</div>
      <div class="title">🔐 Reset Your Password</div>
    </div>
    
    <div class="message">
      <p>Hi ${data.name},</p>
      <p>We received a request to reset your password for your Animalytics account. Click the button below to create a new password:</p>
    </div>
    
    <div class="button-container">
      <a href="${data.resetUrl}" class="button">Reset Password</a>
    </div>
    
    <div class="security-notice">
      <p><strong>⚠️ Security Notice:</strong></p>
      <p>• This link will expire in 1 hour for your security</p>
      <p>• If you didn't request this reset, please ignore this email</p>
      <p>• Never share this link with anyone</p>
    </div>
    
    <div class="message">
      <p><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea; font-size: 14px;">${data.resetUrl}</p>
    </div>
    
    <div class="footer">
      <p>This password reset was requested from your Animalytics account.</p>
      <p>If you didn't make this request, please <a href="mailto:support@animalytics.com">contact support</a> immediately.</p>
      <p style="margin-top: 16px;">© ${new Date().getFullYear()} Animalytics. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================================================
// VERIFY EMAIL CONFIGURATION
// ============================================================================

/**
 * Verify email configuration is working
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const transport = getTransporter();
    await transport.verify();
    console.log('✅ Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email configuration verification failed:', error);
    return false;
  }
}
