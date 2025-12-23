import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { officialClinics } from './official-clinics';
import { users } from './users';

/**
 * Vet Invitations - Tracks invitations sent to veterinarians to join clinics
 * Used for both admin-created invitations and clinic admin invitations
 */
export const vetInvitations = pgTable('vet_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Clinic Relationship
  clinicId: uuid('clinic_id')
    .references(() => officialClinics.id, { onDelete: 'cascade' })
    .notNull(),
  
  // Invitee Information
  email: text('email').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  role: text('role').notNull().default('vet'), // 'main_admin', 'vet', 'assistant'
  specialization: text('specialization'),
  
  // Invitation Details
  token: text('token').notNull().unique(), // Secure random token for invitation link
  invitedBy: text('invited_by')
    .references(() => users.id, { onDelete: 'set null' })
    .notNull(),
  inviterRole: text('inviter_role').notNull(), // 'admin' or 'clinic_admin'
  
  // Status & Timing
  status: text('status').notNull().default('pending'), // 'pending', 'accepted', 'expired', 'cancelled'
  expiresAt: timestamp('expires_at').notNull(), // Typically 7 days from creation
  sentAt: timestamp('sent_at').defaultNow(),
  acceptedAt: timestamp('accepted_at'),
  
  // Additional Information
  message: text('message'), // Optional personal message from inviter
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type VetInvitation = typeof vetInvitations.$inferSelect;
export type NewVetInvitation = typeof vetInvitations.$inferInsert;
