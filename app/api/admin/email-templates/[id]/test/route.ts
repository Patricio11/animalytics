import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emailTemplates } from '@/lib/db/schema/email-templates';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { renderTemplate } from '@/lib/services/email-templates';
import { sendEmail } from '@/lib/services/email';

async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== 'admin') return null;
  return session;
}

/**
 * POST /api/admin/email-templates/[id]/test
 * Body (optional): { to?: string, vars?: Record<string,string> }
 * Renders the template with the provided vars (or each variable's `example` from the
 * template definition) and sends a single test email. Defaults `to` to the admin's
 * own email so test sends don't accidentally hit a real user.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const [tpl] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id)).limit(1);
  if (!tpl) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const to = body.to || session.user.email;
  if (!to) {
    return NextResponse.json({ error: 'No recipient email available' }, { status: 400 });
  }

  // Build the variable map: caller's `vars` wins, otherwise use each variable's `example`
  const exampleVars: Record<string, string> = {};
  for (const v of tpl.variables || []) {
    exampleVars[v.name] = v.example;
  }
  const vars = { ...exampleVars, ...(body.vars || {}) };

  const renderedSubject = `[TEST] ${renderTemplate(tpl.subject, vars)}`;
  const renderedHtml = renderTemplate(tpl.bodyHtml, vars);

  try {
    await sendEmail({ to, subject: renderedSubject, html: renderedHtml });
    return NextResponse.json({ success: true, sentTo: to });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send test email' },
      { status: 500 }
    );
  }
}
