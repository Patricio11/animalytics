/**
 * Frozen semen utility functions
 * Pure utility functions for frozen semen operations (no mock data)
 */

import type { FrozenSemenStatus } from '@/lib/types/frozen-semen';

/**
 * Get human-readable label for frozen semen status
 */
export function getStatusLabel(status: FrozenSemenStatus): string {
  const labels: Record<FrozenSemenStatus, string> = {
    available: 'Available',
    reserved: 'Reserved',
    used: 'Used',
    expired: 'Expired',
  };
  return labels[status];
}

/**
 * Get Tailwind CSS classes for status badge styling
 */
export function getStatusColor(status: FrozenSemenStatus): string {
  const colors: Record<FrozenSemenStatus, string> = {
    available: 'bg-chart-3 text-white',
    reserved: 'bg-chart-4 text-white',
    used: 'bg-muted text-muted-foreground',
    expired: 'bg-destructive text-white',
  };
  return colors[status];
}

/**
 * Get status icon
 */
export function getStatusIcon(status: FrozenSemenStatus): string {
  const icons: Record<FrozenSemenStatus, string> = {
    available: '✓',
    reserved: '⏳',
    used: '✗',
    expired: '⚠',
  };
  return icons[status];
}

/**
 * Check if status allows usage
 */
export function canUseStatus(status: FrozenSemenStatus): boolean {
  return status === 'available' || status === 'reserved';
}

/**
 * Calculate post-thaw viability percentage
 * Based on storage duration and quality
 */
export function calculateViability(
  collectionDate: string,
  quality: 'excellent' | 'good' | 'fair' | 'poor'
): number {
  const monthsStored = Math.floor(
    (new Date().getTime() - new Date(collectionDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  const baseViability = {
    excellent: 85,
    good: 75,
    fair: 65,
    poor: 50,
  }[quality];

  // Decrease viability by 1% per year stored (max 10 years)
  const degradation = Math.min(monthsStored / 12, 10);
  return Math.max(baseViability - degradation, 30);
}
