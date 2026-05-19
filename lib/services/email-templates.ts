import { db } from '@/lib/db';
import { emailTemplates, type EmailTemplate } from '@/lib/db/schema/email-templates';
import { eq } from 'drizzle-orm';

/**
 * Replace `{{var}}` placeholders in a string with values from `vars`.
 * Missing variables become empty strings (won't crash the email).
 */
export function renderTemplate(template: string, vars: Record<string, string | number | undefined | null>): string {
  return template.replace(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g, (_, name) => {
    const v = vars[name];
    return v == null ? '' : String(v);
  });
}

/**
 * Look up a template by its stable key. Returns null if not found or disabled.
 * The caller should fall back to the hardcoded default in that case.
 */
export async function getEmailTemplate(key: string): Promise<EmailTemplate | null> {
  try {
    const [tpl] = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.key, key))
      .limit(1);
    if (!tpl || !tpl.enabled) return null;
    return tpl;
  } catch (error) {
    console.error(`Failed to look up email template "${key}":`, error);
    return null;
  }
}

/**
 * Convenience: look up a template and return rendered subject + html.
 * Returns null if the template is missing — caller falls back to hardcoded default.
 */
export async function renderEmailTemplate(
  key: string,
  vars: Record<string, string | number | undefined | null>
): Promise<{ subject: string; html: string } | null> {
  const tpl = await getEmailTemplate(key);
  if (!tpl) return null;
  return {
    subject: renderTemplate(tpl.subject, vars),
    html: renderTemplate(tpl.bodyHtml, vars),
  };
}
