import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

async function fetchFrozenSemenBatches(filters?: {
  status?: string;
  sourceAnimalId?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.sourceAnimalId) params.append('sourceAnimalId', filters.sourceAnimalId);

  const response = await fetch(`/api/frozen-semen?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch frozen semen batches');
  return response.json();
}

async function fetchFrozenSemenBatch(id: string) {
  const response = await fetch(`/api/frozen-semen/${id}`);
  if (!response.ok) throw new Error('Failed to fetch frozen semen batch');
  return response.json();
}

async function createFrozenSemenBatch(data: any) {
  const response = await fetch('/api/frozen-semen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create frozen semen batch');
  }
  return response.json();
}

async function updateFrozenSemenBatch({ id, data }: { id: string; data: any }) {
  const response = await fetch(`/api/frozen-semen/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update frozen semen batch');
  }
  return response.json();
}

async function deleteFrozenSemenBatch(id: string) {
  const response = await fetch(`/api/frozen-semen/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete frozen semen batch');
  }
  return response.json();
}

async function recordFrozenSemenUsage({
  id,
  data,
}: {
  id: string;
  data: {
    bitchId: string;
    usageDate: string;
    strawsUsed: number;
    breedingMethod: 'natural_ai' | 'tci' | 'surgical_ai' | 'frozen';
    veterinarian?: string;
    clinic?: string;
    notes?: string;
  };
}) {
  const response = await fetch(`/api/frozen-semen/${id}/use`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to record usage');
  }
  return response.json();
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export function useFrozenSemenBatches(filters?: {
  status?: string;
  sourceAnimalId?: string;
}) {
  return useQuery({
    queryKey: ['frozen-semen', filters],
    queryFn: () => fetchFrozenSemenBatches(filters),
  });
}

export function useFrozenSemenBatch(id: string) {
  return useQuery({
    queryKey: ['frozen-semen', id],
    queryFn: () => fetchFrozenSemenBatch(id),
    enabled: !!id,
  });
}

export function useCreateFrozenSemenBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFrozenSemenBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frozen-semen'] });
    },
  });
}

export function useUpdateFrozenSemenBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFrozenSemenBatch,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['frozen-semen'] });
      queryClient.invalidateQueries({ queryKey: ['frozen-semen', variables.id] });
    },
  });
}

export function useDeleteFrozenSemenBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFrozenSemenBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frozen-semen'] });
    },
  });
}

export function useRecordFrozenSemenUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordFrozenSemenUsage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['frozen-semen'] });
      queryClient.invalidateQueries({ queryKey: ['frozen-semen', variables.id] });
    },
  });
}

// ============================================================================
// STATS API
// ============================================================================

async function fetchFrozenSemenStats() {
  const response = await fetch('/api/frozen-semen/stats');
  if (!response.ok) throw new Error('Failed to fetch frozen semen stats');
  return response.json();
}

export function useFrozenSemenStats() {
  return useQuery({
    queryKey: ['frozen-semen', 'stats'],
    queryFn: fetchFrozenSemenStats,
  });
}
