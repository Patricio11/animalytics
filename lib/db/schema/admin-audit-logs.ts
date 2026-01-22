import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Admin Audit Logs
 * Tracks all admin actions for security and compliance
 */
export const adminAuditLogs = pgTable('admin_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Who performed the action
  adminId: text('admin_id').references(() => users.id, { onDelete: 'set null' }).notNull(),
  adminName: text('admin_name').notNull(),
  adminEmail: text('admin_email').notNull(),
  
  // What action was performed
  action: text('action').notNull(), // create_animal, update_animal, delete_animal, create_user, etc.
  resource: text('resource').notNull(), // animal, user, listing, verification, etc.
  resourceId: text('resource_id'), // ID of the affected resource
  
  // Target user (if action was on behalf of another user)
  targetUserId: text('target_user_id').references(() => users.id, { onDelete: 'set null' }),
  targetUserName: text('target_user_name'),
  targetUserEmail: text('target_user_email'),
  
  // Details
  description: text('description').notNull(),
  changes: jsonb('changes').$type<{
    before?: Record<string, any>;
    after?: Record<string, any>;
  }>(),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  
  // Request information
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
export type NewAdminAuditLog = typeof adminAuditLogs.$inferInsert;
