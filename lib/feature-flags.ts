import { db } from '@/lib/db';
import { featureFlags } from '@/lib/db/schema/feature-flags';
import { eq } from 'drizzle-orm';
import type { FeatureFlagKey } from '@/lib/hooks/useFeatureFlags';

export type { FeatureFlagKey };

/**
 * Server-side: check if a feature flag is enabled.
 * Defaults to true if the flag isn't found (fail open).
 */
export async function isFeatureEnabled(key: FeatureFlagKey): Promise<boolean> {
  try {
    const [flag] = await db
      .select({ enabled: featureFlags.enabled })
      .from(featureFlags)
      .where(eq(featureFlags.key, key))
      .limit(1);
    if (!flag) return true;
    return flag.enabled;
  } catch (error) {
    console.error(`Failed to read feature flag ${key}:`, error);
    return true;
  }
}

/**
 * Server-side: load all feature flags as a key→enabled map.
 */
export async function getAllFeatureFlags(): Promise<Record<string, boolean>> {
  try {
    const flags = await db
      .select({ key: featureFlags.key, enabled: featureFlags.enabled })
      .from(featureFlags);
    const map: Record<string, boolean> = {};
    for (const flag of flags) {
      map[flag.key] = flag.enabled;
    }
    return map;
  } catch (error) {
    console.error('Failed to load feature flags:', error);
    return {};
  }
}
