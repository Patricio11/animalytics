import { useQuery } from '@tanstack/react-query';

// ============================================================================
// TYPES
// ============================================================================

export interface Breed {
  id: string;
  name: string;
  sizeCategory: string | null;
  averageWeight: string | null;
  averageHeight: string | null;
  description: string | null;
  imageUrl: string | null;
  successRating: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const breedsKeys = {
  all: ['breeds'] as const,
  lists: () => [...breedsKeys.all, 'list'] as const,
  list: (filters: string) => [...breedsKeys.lists(), { filters }] as const,
  details: () => [...breedsKeys.all, 'detail'] as const,
  detail: (id: string) => [...breedsKeys.details(), id] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Fetch all breeds
 */
export function useBreeds() {
  return useQuery({
    queryKey: breedsKeys.lists(),
    queryFn: async () => {
      const response = await fetch('/api/breeds');
      if (!response.ok) {
        throw new Error('Failed to fetch breeds');
      }
      const data = await response.json();
      return data.data as Breed[];
    },
  });
}

/**
 * Fetch a single breed by ID
 */
export function useBreed(id: string) {
  return useQuery({
    queryKey: breedsKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/breeds/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch breed');
      }
      const data = await response.json();
      return data.data as Breed;
    },
    enabled: !!id,
  });
}
