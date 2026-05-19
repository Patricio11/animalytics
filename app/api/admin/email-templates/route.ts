import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emailTemplates } from '@/lib/db/schema/email-templates';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { asc, eq } from 'drizzle-orm';
import { ensureEmailTemplatesSeeded } from '@/lib/db/seed/email-templates';

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.role === 'admin';
}

/**
 * GET /api/admin/email-templates
 * Returns every template. Auto-seeds the defaults the first time the table is empty.
 */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  await ensureEmailTemplatesSeeded();

  const templates = await db
    .select()
    .from(emailTemplates)
    .orderBy(asc(emailTemplates.category), asc(emailTemplates.name));

  return NextResponse.json({ success: true, templates });
}

/**
 * POST /api/admin/email-templates
 * Create a new (non-system) template.
 */
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { key, name, description, category, subject, bodyHtml, variables, enabled } = body;

  if (!key || !name || !subject || !bodyHtml) {
    return NextResponse.json(
      { error: 'key, name, subject and bodyHtml are required' },
      { status: 400 }
    );
  }

  // Validate key format — lowercase, snake_case
  if (!/^[a-z][a-z0-9_]*$/.test(key)) {
    return NextResponse.json(
      { error: 'key must be lowercase letters, numbers, underscores; start with a letter' },
      { status: 400 }
    );
  }

  // Check duplicate key
  const [existing] = await db
    .select({ id: emailTemplates.id })
    .from(emailTemplates)
    .where(eq(emailTemplates.key, key))
    .limit(1);
  if (existing) {
    return NextResponse.json({ error: 'A template with this key already exists' }, { status: 400 });
  }

  const [created] = await db
    .insert(emailTemplates)
    .values({
      key,
      name,
      description: description || null,
      category: category || 'general',
      subject,
      bodyHtml,
      variables: variables || [],
      enabled: enabled ?? true,
      // Created by admin — not a system template, so can be deleted
      isSystem: false,
    })
    .returning();

  return NextResponse.json({ success: true, template: created }, { status: 201 });
}
