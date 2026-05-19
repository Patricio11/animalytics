import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emailTemplates } from '@/lib/db/schema/email-templates';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { getDefaultTemplateBody } from '@/lib/db/seed/email-templates';

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.role === 'admin';
}

/**
 * POST /api/admin/email-templates/[id]/reset
 * Restore the default subject + body from the seed file. Only works on system templates.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const [tpl] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id)).limit(1);
  if (!tpl) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  if (!tpl.isSystem) {
    return NextResponse.json(
      { error: 'Only system templates have a default to restore' },
      { status: 400 }
    );
  }

  const defaults = getDefaultTemplateBody(tpl.key);
  if (!defaults) {
    return NextResponse.json(
      { error: `No default body found in code for key "${tpl.key}"` },
      { status: 404 }
    );
  }

  const [updated] = await db
    .update(emailTemplates)
    .set({
      subject: defaults.subject,
      bodyHtml: defaults.bodyHtml,
      enabled: true,
      updatedAt: new Date(),
    })
    .where(eq(emailTemplates.id, id))
    .returning();

  return NextResponse.json({ success: true, template: updated });
}
