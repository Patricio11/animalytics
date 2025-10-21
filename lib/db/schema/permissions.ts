import { pgTable, text, timestamp, uuid, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Permissions table
 * Stores available permissions in the system
 * Currently not used - permissions are defined in code via ROLE_PERMISSIONS
 * This schema is provided for future extension if dynamic permissions are needed
 */
export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(), // e.g., 'animals:create', 'matings:view'
  description: text('description'),
  resource: text('resource').notNull(), // e.g., 'animals', 'matings'
  action: text('action').notNull(), // e.g., 'create', 'read', 'update', 'delete'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Role Permissions table
 * Maps roles to permissions
 * Currently not used - role permissions are defined in code via ROLE_PERMISSIONS
 */
export const rolePermissions = pgTable('role_permissions', {
  role: text('role').notNull(),
  permissionId: uuid('permission_id').references(() => permissions.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.role, table.permissionId] }),
}));

/**
 * User Permissions table
 * Allows granting/revoking specific permissions to individual users
 * Overrides role-based permissions
 */
export const userPermissions = pgTable('user_permissions', {
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  permissionId: uuid('permission_id').references(() => permissions.id, { onDelete: 'cascade' }).notNull(),
  granted: boolean('granted').default(true), // true = granted, false = revoked
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.permissionId] }),
}));
