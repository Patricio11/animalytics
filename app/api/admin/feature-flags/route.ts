import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { featureFlags } from '@/lib/db/schema/feature-flags';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { asc } from 'drizzle-orm';
import { ensureFeatureFlagsSeeded } from '@/lib/db/seed/feature-flags';

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.role === 'admin' ? session.user : null;
}

/**
 * GET /api/admin/feature-flags
 * Admin: list all feature flags. Auto-seeds defaults on first call.
 */
export async function GET() {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // First-time bootstrap: seed defaults if the table is empty
  await ensureFeatureFlagsSeeded();

  const flags = await db
    .select()
    .from(featureFlags)
    .orderBy(asc(featureFlags.category), asc(featureFlags.name));

  return NextResponse.json({ success: true, flags });
}

/**
 * POST /api/admin/feature-flags
 * Admin: create a new feature flag
 */
export async function POST(request: NextRequest) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { key, name, description, category, enabled } = body;

  if (!key || !name) {
    return NextResponse.json({ error: 'Key and name are required' }, { status: 400 });
  }

  const [flag] = await db
    .insert(featureFlags)
    .values({
      key,
      name,
      description: description || null,
      category: category || 'general',
      enabled: enabled ?? true,
    })
    .returning();

  return NextResponse.json({ success: true, flag }, { status: 201 });
}
