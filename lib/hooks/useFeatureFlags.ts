"use client";

import { useQuery } from '@tanstack/react-query';

/**
 * All known feature flag keys. Add new ones here for type safety.
 */
export type FeatureFlagKey =
  | 'marketplace'
  | 'breeders_directory'
  | 'public_animals'
  | 'pedigree'
  | 'calculators'
  | 'progesterone_tracking'
  | 'mating_calculator'
  | 'conception_rating'
  | 'verification'
  | 'boost_listings'
  | 'wallet'
  | 'wishlist'
  | 'messaging'
  | 'notifications'
  | 'reports'
  | 'frozen_semen'
  | 'vet_clinics'
  | 'events'
  | 'puppies_marketplace'
  | 'signup_breeder'
  | 'signup_pet_owner';

export type FeatureFlagsMap = Partial<Record<FeatureFlagKey, boolean>>;

/**
 * Fetch all feature flags as a key→boolean map.
 * Cached for 5 minutes client-side.
 */
export function useFeatureFlags() {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: async (): Promise<FeatureFlagsMap> => {
      const response = await fetch('/api/feature-flags');
      if (!response.ok) return {};
      const data = await response.json();
      return data.flags || {};
    },
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Check if a single feature is enabled.
 * Defaults to `defaultValue` (true by default) while loading or on error,
 * so we fail open during a cold load and don't flash empty UI.
 */
export function useFeatureFlag(key: FeatureFlagKey, defaultValue: boolean = true): boolean {
  const { data } = useFeatureFlags();
  if (!data) return defaultValue;
  return data[key] ?? defaultValue;
}
