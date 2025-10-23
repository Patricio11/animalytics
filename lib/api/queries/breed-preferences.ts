import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// TYPES
// ============================================================================

export interface BreedPreference {
  id: string;
  breedId: string;
  breed: {
    id: string;
    name: string;
    sizeCategory: string | null;
    imageUrl: string | null;
    description: string | null;
  };
  createdAt: string;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const breedPreferencesKeys = {
  all: ['breed-preferences'] as const,
  user: () => [...breedPreferencesKeys.all, 'user'] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Fetch current breeder's breed preferences
 */
export function useBreedPreferences() {
  return useQuery({
    queryKey: breedPreferencesKeys.user(),
    queryFn: async () => {
      const response = await fetch('/api/breeders/breed-preferences');
      if (!response.ok) {
        throw new Error('Failed to fetch breed preferences');
      }
      const data = await response.json();
      return data.data as BreedPreference[];
    },
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Update breeder's breed preferences
 */
export function useUpdateBreedPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (breedIds: string[]) => {
      const response = await fetch('/api/breeders/breed-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ breedIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update breed preferences');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch breed preferences
      queryClient.invalidateQueries({ queryKey: breedPreferencesKeys.user() });
      // Also invalidate breeds query as it might filter by preferences
      queryClient.invalidateQueries({ queryKey: ['breeds'] });
      // Invalidate animals query as it might filter by preferences
      queryClient.invalidateQueries({ queryKey: ['animals'] });
    },
  });
}

/**
 * Clear all breed preferences
 */
export function useClearBreedPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/breeders/breed-preferences', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear breed preferences');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: breedPreferencesKeys.user() });
      queryClient.invalidateQueries({ queryKey: ['breeds'] });
      queryClient.invalidateQueries({ queryKey: ['animals'] });
    },
  });
}
