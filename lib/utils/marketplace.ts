/**
 * Marketplace utility functions
 * Pure utility functions for marketplace operations (no mock data)
 */

import type { ListingCategory } from '@/lib/types/marketplace';

/**
 * Get human-readable label for listing category
 */
export function getCategoryLabel(category: ListingCategory): string {
  const labels: Record<ListingCategory, string> = {
    'dog-for-sale': 'Dog for Sale',
    'pups-for-sale': 'Puppies for Sale',
    'frozen-semen': 'Frozen Semen',
    'stud-dog': 'Stud Dog',
    'other': 'Other',
  };
  return labels[category];
}

/**
 * Check if a listing category requires clinic selection
 */
export function categoryRequiresClinic(category: ListingCategory): boolean {
  return category === 'frozen-semen';
}

/**
 * Get category icon emoji
 */
export function getCategoryIcon(category: ListingCategory): string {
  const icons: Record<ListingCategory, string> = {
    'dog-for-sale': '🐕',
    'pups-for-sale': '🐶',
    'frozen-semen': '❄️',
    'stud-dog': '⭐',
    'other': '🛍️',
  };
  return icons[category];
}

/**
 * Get category description
 */
export function getCategoryDescription(category: ListingCategory): string {
  const descriptions: Record<ListingCategory, string> = {
    'dog-for-sale': 'List adult dogs for sale',
    'pups-for-sale': 'List puppies for sale',
    'frozen-semen': 'List frozen semen inventory',
    'stud-dog': 'Offer stud services',
    'other': 'Food, toys, accessories, and other products',
  };
  return descriptions[category];
}
