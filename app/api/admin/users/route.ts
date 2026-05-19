import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, accounts } from '@/lib/db/schema/users';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { breederBreedPreferences } from '@/lib/db/schema/user-breed-preferences';
import { eq, sql, ilike, or, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { hash } from 'bcrypt';
import { sendEmail } from '@/lib/services/email';

/**
 * Helper function to check if user is admin
 */
async function isAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'admin') {
    return false;
  }

  return true;
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
 * GET /api/admin/users
 * List all users with filtering, searching, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Filters
    const role = searchParams.get('role');
    const verified = searchParams.get('verified');
    const search = searchParams.get('search');

    // Build where conditions
    const conditions = [];

    if (role) {
      conditions.push(eq(users.role, role as any));
    }

    if (verified === 'true') {
      conditions.push(eq(users.isVerified, true));
    } else if (verified === 'false') {
      conditions.push(eq(users.isVerified, false));
    }

    if (search) {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.organization, `%${search}%`)
        )!
      );
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Get users with breeder profile info
    const userList = await db
      .select({
        id: users.id,
        email: users.email,
        emailVerified: users.emailVerified,
        name: users.name,
        avatar: users.avatar,
        role: users.role,
        organization: users.organization,
        licenseNumber: users.licenseNumber,
        isVerified: users.isVerified,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
        subscription: users.subscription,
        breederProfileId: breederProfiles.id,
        breederProfileSlug: breederProfiles.slug,
        breederProfileIsPublic: breederProfiles.isPublic,
      })
      .from(users)
      .leftJoin(breederProfiles, eq(users.id, breederProfiles.userId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      users: userList,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      email,
      name,
      role = 'breeder',
      organization,
      licenseNumber,
      certifications,
      specializations,
      isVerified = false,
      breedIds,
      // When false, skip the welcome email — admin can send it later via "Send / Resend Credentials"
      sendWelcomeEmail = true,
    } = body;

    // Validate required fields
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate temporary password
    const temporaryPassword = generatePassword();
    const hashedPassword = await hash(temporaryPassword, 10);

    // Create user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        email,
        name,
        role: role as any,
        organization: organization || null,
        licenseNumber: licenseNumber || null,
        certifications: certifications || null,
        specializations: specializations || null,
        isVerified,
        emailVerified: true, // Admin-created users have verified email (admin vouches)
        createdByAdmin: true,
        temporaryPassword: hashedPassword, // Store hashed password
        // Only stamp the notification time if we're actually sending it now
        credentialsNotifiedAt: sendWelcomeEmail ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        organization: users.organization,
        licenseNumber: users.licenseNumber,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
        createdByAdmin: users.createdByAdmin,
        credentialsNotifiedAt: users.credentialsNotifiedAt,
      });

    // Create Better Auth accounts record so the user can log in with email/password
    const accountId = `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(accounts).values({
      id: accountId,
      accountId: userId,
      providerId: 'credential',
      userId: userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send welcome email with login credentials (only if requested by admin)
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/auth/signin`;
    if (sendWelcomeEmail) {
    try {
      await sendEmail({
        to: email,
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
                <h1>Welcome to Animalytics!</h1>
                <p>Your account has been created and is ready to use</p>
              </div>
              <div class="content">
                <p>Hello ${name},</p>

                <p>Your Animalytics account has been set up by our admin team. We're excited to have you join our platform!</p>

                <div class="credentials-box">
                  <h3 style="margin-top: 0; color: #667eea;">Your Login Credentials</h3>

                  <div class="credential-item">
                    <div class="credential-label">Email:</div>
                    <div class="credential-value">${email}</div>
                  </div>

                  <div class="credential-item">
                    <div class="credential-label">Temporary Password:</div>
                    <div class="credential-value">${temporaryPassword}</div>
                  </div>
                </div>

                <div class="warning">
                  <strong>Important Security Notice:</strong><br>
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
        text: `Welcome to Animalytics!\n\nHello ${name},\n\nYour Animalytics account has been created and is ready to use.\n\nLogin Credentials:\nEmail: ${email}\nTemporary Password: ${temporaryPassword}\n\nIMPORTANT: Please change your password immediately after your first login.\n\nLogin here: ${loginUrl}\n\nBest regards,\nThe Animalytics Team`,
      });
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      // Don't fail user creation if email fails
    }
    } else {
      console.log(`ℹ️  Welcome email skipped for ${email} — admin opted out. Use "Send / Resend Credentials" to send later.`);
    }

    // Save breed preferences if user is a breeder and selected breeds
    if (role === 'breeder' && breedIds && Array.isArray(breedIds) && breedIds.length > 0) {
      try {
        console.log('🐕 Saving breed preferences for admin-created breeder:', breedIds);

        // Create breeder profile
        const displayName = name;
        const slug = `${displayName.toLowerCase().replace(/\s+/g, '-')}-${userId.substring(0, 8)}`;

        const [breederProfile] = await db
          .insert(breederProfiles)
          .values({
            userId: newUser.id,
            displayName,
            slug,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        console.log('✅ Breeder profile created:', breederProfile.id);

        // Insert breed preferences
        const preferences = breedIds.map((breedId: string) => ({
          breederProfileId: breederProfile.id,
          breedId: breedId,
        }));

        await db.insert(breederBreedPreferences).values(preferences);

        console.log('✅ Breed preferences saved');
      } catch (error) {
        console.error('❌ Error saving breed preferences:', error);
        // Don't fail user creation if breed preferences fail
      }
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      credentials: {
        email: newUser.email,
        temporaryPassword,
        message: sendWelcomeEmail
          ? 'User created and welcome email sent.'
          : 'User created. Welcome email was NOT sent — use "Send / Resend Credentials" to send it later.',
      },
      welcomeEmailSent: sendWelcomeEmail,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
