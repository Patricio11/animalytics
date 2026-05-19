import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emailTemplates } from '@/lib/db/schema/email-templates';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.role === 'admin';
}

/**
 * GET /api/admin/email-templates/[id]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const [tpl] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id)).limit(1);
  if (!tpl) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, template: tpl });
}

/**
 * PUT /api/admin/email-templates/[id]
 * Update subject, body, name, description, category, variables, enabled.
 * The `key` and `isSystem` fields are immutable from the admin UI.
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
  const { name, description, category, subject, bodyHtml, variables, enabled } = body;

  const updates: Record<string, any> = { updatedAt: new Date() };
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (category !== undefined) updates.category = category;
  if (subject !== undefined) updates.subject = subject;
  if (bodyHtml !== undefined) updates.bodyHtml = bodyHtml;
  if (variables !== undefined) updates.variables = variables;
  if (typeof enabled === 'boolean') updates.enabled = enabled;

  const [updated] = await db
    .update(emailTemplates)
    .set(updates)
    .where(eq(emailTemplates.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, template: updated });
}

/**
 * DELETE /api/admin/email-templates/[id]
 * Only custom (non-system) templates can be deleted.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const [tpl] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id)).limit(1);
  if (!tpl) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  if (tpl.isSystem) {
    return NextResponse.json(
      { error: 'System templates cannot be deleted. Use "Restore to default" to revert changes.' },
      { status: 400 }
    );
  }

  await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
  return NextResponse.json({ success: true });
}
