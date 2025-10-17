import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/client';

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

async function fetchAnimals(filters?: {
  sex?: 'male' | 'female';
  isActive?: boolean;
  isBreedingActive?: boolean;
}) {
  const params = new URLSearchParams();
  if (filters?.sex) params.append('sex', filters.sex);
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters?.isBreedingActive !== undefined)
    params.append('isBreedingActive', String(filters.isBreedingActive));

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

async function createAnimal(data: any) {
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

async function updateAnimal({ id, data }: { id: string; data: any }) {
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

export function useCreateAnimal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAnimal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
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
    },
  });
}

export function useDeleteAnimal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAnimal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
    },
  });
}
