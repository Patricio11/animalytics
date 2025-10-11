import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

async function fetchMatings(filters?: {
  status?: string;
  bitchId?: string;
  dogId?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.bitchId) params.append('bitchId', filters.bitchId);
  if (filters?.dogId) params.append('dogId', filters.dogId);

  const response = await fetch(`/api/matings?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch matings');
  return response.json();
}

async function fetchMating(id: string) {
  const response = await fetch(`/api/matings/${id}`);
  if (!response.ok) throw new Error('Failed to fetch mating');
  return response.json();
}

async function createMating(data: any) {
  const response = await fetch('/api/matings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create mating');
  }
  return response.json();
}

async function updateMating({ id, data }: { id: string; data: any }) {
  const response = await fetch(`/api/matings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update mating');
  }
  return response.json();
}

async function deleteMating(id: string) {
  const response = await fetch(`/api/matings/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete mating');
  }
  return response.json();
}

async function calculateMating({ id, data }: { id: string; data: any }) {
  const response = await fetch(`/api/matings/${id}/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to calculate ratings');
  }
  return response.json();
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export function useMatings(filters?: {
  status?: string;
  bitchId?: string;
  dogId?: string;
}) {
  return useQuery({
    queryKey: ['matings', filters],
    queryFn: () => fetchMatings(filters),
  });
}

export function useMating(id: string) {
  return useQuery({
    queryKey: ['matings', id],
    queryFn: () => fetchMating(id),
    enabled: !!id,
  });
}

export function useCreateMating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMating,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matings'] });
    },
  });
}

export function useUpdateMating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMating,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matings'] });
      queryClient.invalidateQueries({ queryKey: ['matings', variables.id] });
    },
  });
}

export function useDeleteMating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMating,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matings'] });
    },
  });
}

export function useCalculateMating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calculateMating,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matings'] });
      queryClient.invalidateQueries({ queryKey: ['matings', variables.id] });
    },
  });
}
