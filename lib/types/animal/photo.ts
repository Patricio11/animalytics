/**
 * Animal photo type definitions
 */

// ============================================================================
// PHOTO TYPES
// ============================================================================

export interface AnimalPhoto {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: string;
}

export interface PhotoCategory {
  category: string;
  photos: AnimalPhoto[];
}
