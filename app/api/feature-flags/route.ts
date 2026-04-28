import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { featureFlags } from '@/lib/db/schema/feature-flags';

/**
 * GET /api/feature-flags
 * Public: returns a map of feature key → enabled boolean.
 * Cached for 60s on the edge to keep this lightweight.
 */
export async function GET() {
  try {
    const flags = await db
      .select({
        key: featureFlags.key,
        enabled: featureFlags.enabled,
      })
      .from(featureFlags);

    const map: Record<string, boolean> = {};
    for (const flag of flags) {
      map[flag.key] = flag.enabled;
    }

    return NextResponse.json(
      { success: true, flags: map },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    // Fail open — return empty map so UI defaults to "feature missing" rather than blocking everything
    return NextResponse.json({ success: false, flags: {} }, { status: 200 });
  }
}
