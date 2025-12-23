import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

// ============================================================================
// VETERINARY CLINICS
// ============================================================================

export const veterinaryClinics = pgTable('veterinary_clinics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Clinic Information
  clinicName: text('clinic_name').notNull(),
  veterinarianName: text('veterinarian_name'),
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
  services: text('services'), // JSON array of services
  specializations: text('specializations'), // JSON array
  
  // Hours & Availability
  operatingHours: text('operating_hours'), // JSON object with days and hours
  emergencyAvailable: boolean('emergency_available').default(false),
  emergencyPhone: text('emergency_phone'),
  
  // Settings
  isPrimary: boolean('is_primary').default(false),
  isFavorite: boolean('is_favorite').default(false),
  
  // Notes
  notes: text('notes'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
