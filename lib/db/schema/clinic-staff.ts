import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';
import { officialClinics } from './official-clinics';
import { users } from './users';

/**
 * Clinic Staff - Many-to-many relationship between clinics and veterinarians
 * Tracks which vets work at which clinics and their roles/permissions
 */
export const clinicStaff = pgTable('clinic_staff', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Relationships
  clinicId: uuid('clinic_id')
    .references(() => officialClinics.id, { onDelete: 'cascade' })
    .notNull(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  
  // Role & Specialization
  role: text('role').notNull().default('vet'), // 'main_admin', 'vet', 'assistant'
  specialization: text('specialization'), // e.g., "Surgery", "Reproduction", "General Practice"
  title: text('title'), // e.g., "DVM", "VMD", "BVSc"
  
  // Permissions
  canInviteStaff: boolean('can_invite_staff').default(false),
  canManageClinic: boolean('can_manage_clinic').default(false),
  canViewAllRecords: boolean('can_view_all_records').default(true),
  
  // Status
  status: text('status').notNull().default('active'), // 'active', 'inactive', 'pending'
  
  // Metadata
  joinedAt: timestamp('joined_at').defaultNow(),
  invitedBy: text('invited_by').references(() => users.id),
  notes: text('notes'), // Admin notes about this staff member
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type ClinicStaff = typeof clinicStaff.$inferSelect;
export type NewClinicStaff = typeof clinicStaff.$inferInsert;
