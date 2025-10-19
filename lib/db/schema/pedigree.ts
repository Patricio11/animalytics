import { pgTable, text, timestamp, integer, serial } from 'drizzle-orm/pg-core';
import { animals } from './animals';
import { users } from './users';

// ============================================================================
// PEDIGREE SNAPSHOTS
// ============================================================================
// Store historical snapshots of pedigree trees for performance and archival

export const pedigreeSnapshots = pgTable('pedigree_snapshots', {
  id: serial('id').primaryKey(),
  animalId: text('animal_id')
    .references(() => animals.id, { onDelete: 'cascade' })
    .notNull(),
  snapshotJson: text('snapshot_json').notNull(), // Full pedigree tree as JSON
  generations: integer('generations').default(4), // How many generations captured
  createdBy: text('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// PEDIGREE DOCUMENTS
// ============================================================================
// Store pedigree certificates, registration papers, and related documents

export const pedigreeDocuments = pgTable('pedigree_documents', {
  id: serial('id').primaryKey(),
  animalId: text('animal_id')
    .references(() => animals.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title'),
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name'),
  fileSize: integer('file_size'), // in bytes
  mimeType: text('mime_type'), // application/pdf, image/jpeg, etc.
  uploadedBy: text('uploaded_by').references(() => users.id),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  notes: text('notes'),
});

// ============================================================================
// TYPE EXPORTS FOR DRIZZLE INFERENCE
// ============================================================================

export type PedigreeSnapshot = typeof pedigreeSnapshots.$inferSelect;
export type NewPedigreeSnapshot = typeof pedigreeSnapshots.$inferInsert;

export type PedigreeDocument = typeof pedigreeDocuments.$inferSelect;
export type NewPedigreeDocument = typeof pedigreeDocuments.$inferInsert;
