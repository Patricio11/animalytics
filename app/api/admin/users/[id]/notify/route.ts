import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { auth } from '@/lib/auth/config';
import { eq } from 'drizzle-orm';
import { createAdminAuditLog } from '@/lib/services/admin-audit';
import { sendEmail } from '@/lib/services/email';
import { hash } from 'bcrypt';

/**
 * Helper to check admin authorization
 */
async function checkAdminAuth(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  if (!session?.user) {
    return { authorized: false, session: null };
  }
  
  const userRole = (session.user as any).role;
  if (userRole !== 'admin') {
    return { authorized: false, session: null };
  }
  
  return { authorized: true, session };
}

/**
 * Generate a secure random password
 */
function generatePassword(length = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * POST /api/admin/users/[id]/notify
 * Send welcome email with credentials to admin-created user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, session } = await checkAdminAuth(request);
    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: userId } = await params;

    // Get user details
    const [targetUser] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdByAdmin: users.createdByAdmin,
        credentialsNotifiedAt: users.credentialsNotifiedAt,
        temporaryPassword: users.temporaryPassword,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user was created by admin
    if (!targetUser.createdByAdmin) {
      return NextResponse.json(
        { error: 'This user was not created by admin and does not need notification' },
        { status: 400 }
      );
    }

    // Check if already notified
    if (targetUser.credentialsNotifiedAt) {
      return NextResponse.json(
        { 
          error: 'User has already been notified',
          notifiedAt: targetUser.credentialsNotifiedAt,
        },
        { status: 400 }
      );
    }

    // Generate new temporary password (for security, don't use stored one)
    const newTemporaryPassword = generatePassword();
    const hashedPassword = await hash(newTemporaryPassword, 10);

    // Update user with new password and notification timestamp
    await db
      .update(users)
      .set({
        temporaryPassword: hashedPassword,
        credentialsNotifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Send welcome email with credentials
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin`;
    
    await sendEmail({
      to: targetUser.email,
      subject: 'Welcome to Animalytics - Your Account is Ready!',
      html: `
        <!DOCTYPE html>
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
              <h1>🎉 Welcome to Animalytics!</h1>
              <p>Your account has been created and is ready to use</p>
            </div>
            <div class="content">
              <p>Hello ${targetUser.name},</p>
              
              <p>Your Animalytics account has been set up by our admin team. We're excited to have you join our platform!</p>
              
              <div class="credentials-box">
                <h3 style="margin-top: 0; color: #667eea;">🔐 Your Login Credentials</h3>
                
                <div class="credential-item">
                  <div class="credential-label">Email:</div>
                  <div class="credential-value">${targetUser.email}</div>
                </div>
                
                <div class="credential-item">
                  <div class="credential-label">Temporary Password:</div>
                  <div class="credential-value">${newTemporaryPassword}</div>
                </div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong><br>
                Please change your password immediately after your first login. This temporary password is only for initial access.
              </div>
              
              <div style="text-align: center;">
                <a href="${loginUrl}" class="button">Login to Your Account</a>
              </div>
              
              <h3>What's Next?</h3>
              <ul>
                <li>Log in using the credentials above</li>
                <li>Change your password in account settings</li>
                <li>Complete your profile information</li>
                <li>Start managing your animals and breeding programs</li>
              </ul>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <p>Best regards,<br>The Animalytics Team</p>
            </div>
            <div class="footer">
              <p>This email was sent because an admin created an account for you on Animalytics.</p>
              <p>If you believe this was sent in error, please contact support immediately.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to Animalytics!

Hello ${targetUser.name},

Your Animalytics account has been created and is ready to use.

Login Credentials:
Email: ${targetUser.email}
Temporary Password: ${newTemporaryPassword}

IMPORTANT: Please change your password immediately after your first login.

Login here: ${loginUrl}

What's Next?
1. Log in using the credentials above
2. Change your password in account settings
3. Complete your profile information
4. Start managing your animals and breeding programs

If you have any questions, please contact our support team.

Best regards,
The Animalytics Team
      `,
    });

    // Create audit log
    await createAdminAuditLog({
      adminId: session.user.id,
      adminName: session.user.name || 'Admin',
      adminEmail: session.user.email || '',
      action: 'notify_user',
      resource: 'user',
      resourceId: userId,
      targetUserId: userId,
      targetUserName: targetUser.name,
      targetUserEmail: targetUser.email,
      description: `Admin sent welcome email with credentials to ${targetUser.name}`,
      metadata: {
        userRole: targetUser.role,
        emailSent: true,
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Welcome email sent successfully to ${targetUser.email}`,
      notifiedAt: new Date(),
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification email' },
      { status: 500 }
    );
  }
}
