import { db } from '@/lib/db';
import { featureFlags } from '@/lib/db/schema/feature-flags';
import { sql } from 'drizzle-orm';

const DEFAULT_FLAGS = [
  { key: 'marketplace', name: 'Marketplace', description: 'The marketplace where breeders list animals for sale', category: 'navigation', enabled: true },
  { key: 'breeders_directory', name: 'Breeders Directory', description: 'Public directory of breeders', category: 'navigation', enabled: true },
  { key: 'public_animals', name: 'Public Animals (Explore)', description: 'Public-facing animal browsing on the landing page and /explore', category: 'navigation', enabled: true },
  { key: 'pedigree', name: 'Pedigree', description: 'Pedigree tree, AI scanner and parent management', category: 'features', enabled: true },
  { key: 'calculators', name: 'Breeding Calculators', description: 'Mating, progesterone and conception rating calculators', category: 'features', enabled: true },
  { key: 'progesterone_tracking', name: 'Progesterone Tracking', description: 'Heat cycle and progesterone reading tracking', category: 'features', enabled: true },
  { key: 'mating_calculator', name: 'Mating Calculator', description: 'Mating compatibility and planning calculator', category: 'features', enabled: true },
  { key: 'conception_rating', name: 'Conception Rating', description: 'Post-mating conception rating tool', category: 'features', enabled: true },
  { key: 'verification', name: 'Breeder Verification', description: 'Verification badge and verification flow', category: 'features', enabled: true },
  { key: 'boost_listings', name: 'Boost Listings', description: 'Paid boost feature for marketplace listings', category: 'monetization', enabled: true },
  { key: 'wallet', name: 'Wallet / The Purse', description: 'Breeder wallet for receiving payments', category: 'monetization', enabled: true },
  { key: 'wishlist', name: 'Wishlist / Saved Listings', description: 'Saved listings feature for buyers', category: 'features', enabled: true },
  { key: 'messaging', name: 'Messaging', description: 'In-app conversations between breeders and buyers', category: 'features', enabled: true },
  { key: 'notifications', name: 'Notifications', description: 'In-app notification system', category: 'features', enabled: true },
  { key: 'reports', name: 'Reports & Exports', description: 'Reporting and PDF/CSV export tools', category: 'features', enabled: true },
  { key: 'frozen_semen', name: 'Frozen Semen', description: 'Frozen semen inventory tracking', category: 'features', enabled: true },
  { key: 'vet_clinics', name: 'Vet Clinics', description: 'Veterinary clinic features', category: 'features', enabled: true },
  { key: 'events', name: 'Events', description: 'Events and event organizer features', category: 'features', enabled: false },
  { key: 'puppies_marketplace', name: 'Puppies Section', description: 'Dedicated puppies section in the marketplace', category: 'navigation', enabled: true },
  { key: 'signup_breeder', name: 'Breeder Signup', description: 'Allow new users to sign up as breeders', category: 'access', enabled: true },
  { key: 'signup_pet_owner', name: 'Pet Owner Signup', description: 'Allow new users to sign up as pet owners', category: 'access', enabled: true },
];

/**
 * Insert default flags if they don't already exist (idempotent).
 * Safe to call on every request — uses ON CONFLICT DO NOTHING.
 */
export async function seedDefaultFeatureFlags() {
  await db
    .insert(featureFlags)
    .values(DEFAULT_FLAGS)
    .onConflictDoNothing({ target: featureFlags.key });
}

/**
 * Check if any flags exist; if not, seed defaults.
 * Designed to run cheaply — just one COUNT query when flags exist.
 */
export async function ensureFeatureFlagsSeeded() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(featureFlags);

  if (count === 0) {
    console.log('🌱 Seeding default feature flags...');
    await seedDefaultFeatureFlags();
    console.log(`✅ Seeded ${DEFAULT_FLAGS.length} feature flags`);
  }
}
