import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Official Clinics - Admin-managed veterinary clinics
 * These are verified clinics that can be seen by all breeders
 * Separate from breeders' personal clinic directory
 */
export const officialClinics = pgTable('official_clinics', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Basic Information
  clinicName: text('clinic_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  website: text('website'),
  
  // Address
  address: text('address'),
  city: text('city'),
  state: text('state'),
  postalCode: text('postal_code'),
  country: text('country'),
  
  // Services & Specializations
  services: text('services'), // JSON array of services offered
  specializations: text('specializations'), // JSON array of specializations
  operatingHours: text('operating_hours'), // JSON object with hours
  
  // Emergency Services
  emergencyAvailable: boolean('emergency_available').default(false),
  emergencyPhone: text('emergency_phone'),
  
  // Administration
  mainAdminId: text('main_admin_id').references(() => users.id, { onDelete: 'set null' }), // First vet assigned
  
  // Status & Verification
  isActive: boolean('is_active').default(true),
  isVerified: boolean('is_verified').default(false), // Must be verified by admin to be visible
  verifiedAt: timestamp('verified_at'),
  verifiedBy: text('verified_by').references(() => users.id),
  
  // Additional Information
  logo: text('logo'), // URL to logo image
  description: text('description'),
  licenseNumber: text('license_number'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type OfficialClinic = typeof officialClinics.$inferSelect;
export type NewOfficialClinic = typeof officialClinics.$inferInsert;
