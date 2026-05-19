import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { and, eq, isNull, desc } from 'drizzle-orm';

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.role === 'admin';
}

/**
 * GET /api/admin/users/unnotified
 * Returns admin-created users who haven't received their welcome email yet.
 */
export async function GET() {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const list = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      organization: users.organization,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(
      and(
        eq(users.createdByAdmin, true),
        isNull(users.credentialsNotifiedAt)
      )
    )
    .orderBy(desc(users.createdAt));

  return NextResponse.json({ success: true, users: list });
}
