import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, accounts } from '@/lib/db/schema/users';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { and, eq, inArray } from 'drizzle-orm';
import { hash } from 'bcrypt';
import { sendWelcomeCredentialsEmail } from '@/lib/services/email';
import { createAdminAuditLog } from '@/lib/services/admin-audit';

async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== 'admin') return null;
  return session;
}

function generatePassword(length = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * POST /api/admin/users/bulk-notify
 * Send welcome emails to multiple admin-created users at once.
 * Body: { userIds: string[] }
 *
 * Returns per-user success/failure so the UI can show partial results.
 */
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  let body: { userIds?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const userIds = body.userIds || [];
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ error: 'userIds is required and must be a non-empty array' }, { status: 400 });
  }

  // Cap at 50 per request so a runaway click can't accidentally email 10k users
  if (userIds.length > 50) {
    return NextResponse.json({ error: 'Cannot send more than 50 emails in one request' }, { status: 400 });
  }

  // Fetch all the target users in one go, filter to admin-created only
  const targets = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdByAdmin: users.createdByAdmin,
    })
    .from(users)
    .where(and(inArray(users.id, userIds), eq(users.createdByAdmin, true)));

  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/auth/signin`;

  const results: Array<{ id: string; email: string; success: boolean; error?: string }> = [];

  for (const target of targets) {
    try {
      // Generate a fresh password per user (security: never reuse stored hash)
      const newPassword = generatePassword();
      const hashedPassword = await hash(newPassword, 10);

      // Update user record
      await db
        .update(users)
        .set({
          temporaryPassword: hashedPassword,
          emailVerified: true,
          credentialsNotifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, target.id));

      // Update or create the Better Auth credential account
      const [existing] = await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.userId, target.id), eq(accounts.providerId, 'credential')))
        .limit(1);

      if (existing) {
        await db
          .update(accounts)
          .set({ password: hashedPassword, updatedAt: new Date() })
          .where(eq(accounts.id, existing.id));
      } else {
        await db.insert(accounts).values({
          id: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          accountId: target.id,
          providerId: 'credential',
          userId: target.id,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Send the email
      await sendWelcomeCredentialsEmail(target.email, {
        name: target.name || 'there',
        temporaryPassword: newPassword,
        loginUrl,
      });

      results.push({ id: target.id, email: target.email, success: true });
    } catch (error) {
      console.error(`Bulk-notify failed for ${target.email}:`, error);
      results.push({
        id: target.id,
        email: target.email,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Audit log — single entry summarising the batch
  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.length - successCount;

  await createAdminAuditLog({
    adminId: session.user.id,
    adminName: session.user.name || 'Admin',
    adminEmail: session.user.email || '',
    action: 'bulk_notify_users',
    resource: 'user',
    description: `Bulk-sent welcome emails: ${successCount} succeeded, ${failureCount} failed`,
    metadata: {
      requestedCount: userIds.length,
      processedCount: results.length,
      successCount,
      failureCount,
    },
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  });

  return NextResponse.json({
    success: failureCount === 0,
    sent: successCount,
    failed: failureCount,
    results,
  });
}
