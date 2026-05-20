import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.role === 'admin';
}

/**
 * PUT /api/admin/users/[id]/preferences
 * Update the user's `preferences` JSON column. Merges with existing values
 * so partial updates don't blow away the rest.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const [user] = await db
    .select({ preferences: users.preferences })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const merged = { ...(user.preferences || {}), ...body };

  const [updated] = await db
    .update(users)
    .set({ preferences: merged, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning({ preferences: users.preferences });

  return NextResponse.json({ success: true, preferences: updated.preferences });
}
