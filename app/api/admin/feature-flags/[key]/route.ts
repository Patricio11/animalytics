import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { featureFlags } from '@/lib/db/schema/feature-flags';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.role === 'admin' ? session.user : null;
}

/**
 * PATCH /api/admin/feature-flags/[key]
 * Admin: toggle or update a feature flag
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { key } = await params;
  const body = await request.json();
  const { enabled, name, description, category } = body;

  const updates: Record<string, any> = { updatedAt: new Date() };
  if (typeof enabled === 'boolean') updates.enabled = enabled;
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (category !== undefined) updates.category = category;

  const [flag] = await db
    .update(featureFlags)
    .set(updates)
    .where(eq(featureFlags.key, key))
    .returning();

  if (!flag) {
    return NextResponse.json({ error: 'Feature flag not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, flag });
}

/**
 * DELETE /api/admin/feature-flags/[key]
 * Admin: delete a feature flag
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { key } = await params;
  await db.delete(featureFlags).where(eq(featureFlags.key, key));

  return NextResponse.json({ success: true });
}
