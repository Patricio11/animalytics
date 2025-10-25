import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We're using better-auth for authentication
  },
});

// Bucket name constant
export const STORAGE_BUCKET = 'animalitic';

// Storage paths
export const STORAGE_PATHS = {
  ANIMAL_PHOTOS: 'animals/photos',
  ANIMAL_DOCUMENTS: 'animals/documents',
  HEALTH_RECORDS: 'health/records',
  PEDIGREE_DOCUMENTS: 'pedigree/documents',
  BREEDING_RECORDS: 'breeding/records',
  USER_AVATARS: 'users/avatars',
  MARKETPLACE_IMAGES: 'marketplace/images',
  CLINIC_DOCUMENTS: 'clinics/documents',
} as const;

export type StoragePath = typeof STORAGE_PATHS[keyof typeof STORAGE_PATHS];
