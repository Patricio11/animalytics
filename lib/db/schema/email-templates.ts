import { pgTable, text, timestamp, boolean, uuid, jsonb } from 'drizzle-orm/pg-core';

export interface EmailTemplateVariable {
  name: string;
  description: string;
  example: string;
}

export const emailTemplates = pgTable('email_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Stable identifier used in code to look up the template
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull().default('general'),
  subject: text('subject').notNull(),
  bodyHtml: text('body_html').notNull(),
  // Per-template list of {{placeholder}} variables with examples (for docs + test send)
  variables: jsonb('variables').$type<EmailTemplateVariable[]>().default([]),
  // True if this template was seeded by code — admins can edit but not delete it
  isSystem: boolean('is_system').notNull().default(false),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type NewEmailTemplate = typeof emailTemplates.$inferInsert;
