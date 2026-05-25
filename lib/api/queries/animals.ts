import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/client';

// ============================================================================
// TYPES
// ============================================================================

interface CreateAnimalData {
  name: string;
  registeredName?: string;
  breedId?: string;
  sex: 'male' | 'female';
  dateOfBirth?: string;
  microchipNumber?: string;
  registrationNumber?: string;
  weight?: number;
  height?: number;
  color?: string;
  markings?: string;
  profileImageUrl?: string;
  bio?: string;
  temperament?: string;
  healthStatus?: 'excellent' | 'good' | 'fair' | 'poor';
  isBreedingActive?: boolean;
  isChampion?: boolean;
  titles?: string[];
  notes?: string;
  
  // Parent information (relational or manual)
  sireId?: string;
  damId?: string;
  sireName?: string;
  sireRegisteredName?: string;
  damName?: string;
  damRegisteredName?: string;
}

interface UpdateAnimalData extends Partial<CreateAnimalData> {
  isActive?: boolean;
  isDeceased?: boolean;
  deceasedDate?: string;
}

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

async function fetchAnimals(filters?: {
  sex?: 'male' | 'female';
  isActive?: boolean;
  isBreedingActive?: boolean;
  global?: boolean;
}) {
  const params = new URLSearchParams();
  if (filters?.sex) params.append('sex', filters.sex);
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters?.isBreedingActive !== undefined)
    params.append('isBreedingActive', String(filters.isBreedingActive));
  if (filters?.global) params.append('global', 'true');

  const response = await fetch(`/api/animals?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch animals');
  const json = await response.json();
  // API wraps response in { success: true, data: [...] }
  return json.data;
}

async function fetchAnimal(id: string) {
  const response = await fetch(`/api/animals/${id}`);
  if (!response.ok) throw new Error('Failed to fetch animal');
  const json = await response.json();
  // API wraps response in { success: true, data: {...} }
  return json.data;
}

/** Fetch the public-safe view of an animal — works without authentication. */
async function fetchPublicAnimal(id: string) {
  const response = await fetch(`/api/animals/${id}/public`);
  if (!response.ok) throw new Error('Failed to fetch animal');
  const json = await response.json();
  return json.animal;
}

async function createAnimal(data: CreateAnimalData) {
  const response = await fetch('/api/animals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create animal');
  }
  const json = await response.json();
  // API wraps response in { success: true, data: {...} }
  return json.data;
}

async function updateAnimal({ id, data }: { id: string; data: UpdateAnimalData }) {
  const response = await fetch(`/api/animals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update animal');
  }
  const json = await response.json();
  // API wraps response in { success: true, data: {...} }
  return json.data;
}

async function deleteAnimal(id: string) {
  const response = await fetch(`/api/animals/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete animal');
  }
  const json = await response.json();
  // API wraps response in { success: true, data: {...} }
  return json.data;
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export function useAnimals(filters?: {
  sex?: 'male' | 'female';
  isActive?: boolean;
  isBreedingActive?: boolean;
  global?: boolean;
}) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['animals', filters],
    queryFn: () => fetchAnimals(filters),
    enabled: isAuthenticated,
  });
}

export function useAnimal(id: string) {
  return useQuery({
    queryKey: ['animals', id],
    queryFn: () => fetchAnimal(id),
    enabled: !!id,
  });
}

/**
 * Public-safe animal fetch. Use when the viewer might not be authenticated
 * (e.g. the public `/animal/[id]` page). Hits `/api/animals/[id]/public`
 * which returns a trimmed, non-401 response.
 */
export function usePublicAnimal(id: string, enabled = true) {
  return useQuery({
    queryKey: ['animals', 'public', id],
    queryFn: () => fetchPublicAnimal(id),
    enabled: !!id && enabled,
  });
}

export function useCreateAnimal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAnimal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Invalidate all dashboard queries
    },
  });
}

export function useUpdateAnimal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAnimal,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['animals', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['pedigree', variables.id] }); // Invalidate pedigree when parents change
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Invalidate all dashboard queries
    },
  });
}

export function useDeleteAnimal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAnimal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Invalidate all dashboard queries
    },
  });
}
