import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// TYPES
// ============================================================================

export interface ProgesteroneReading {
  day: number;
  value: number;
  date: string;
}

export interface BreedingWindow {
  startDay: number;
  endDay: number;
  confidence: number;
}

export interface ProgesteroneTest {
  id: string;
  userId: string;
  animalId?: string | null;
  matingId?: string | null;
  testDate: string;
  laboratory: string;
  unit: string;
  breedingMethod: string;
  readings: ProgesteroneReading[];
  rating?: string | null;
  alternativeRating?: string | null;
  matchedPattern?: string | null;
  confidence?: string | null;
  trend?: string | null;
  averageChange?: string | null;
  isOptimal?: string | null;
  recommendation?: string | null;
  recommendationMessage?: string | null;
  suggestedAction?: string | null;
  breedingWindow?: BreedingWindow | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  animal?: {
    id: string;
    name: string;
    registrationNumber?: string | null;
    avatarUrl?: string | null;
  } | null;
}

export interface CreateProgesteroneTestInput {
  animalId?: string;
  matingId?: string;
  testDate: string;
  laboratory: string;
  unit: string;
  breedingMethod: string;
  readings: ProgesteroneReading[];
  rating?: number;
  alternativeRating?: number;
  matchedPattern?: string;
  confidence?: number;
  trend?: string;
  averageChange?: number;
  isOptimal?: string;
  recommendation?: string;
  recommendationMessage?: string;
  suggestedAction?: string;
  breedingWindow?: BreedingWindow;
  notes?: string;
}

export interface UpdateProgesteroneTestInput extends Partial<CreateProgesteroneTestInput> {
  id: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function fetchProgesteroneTests(params?: {
  animalId?: string;
  matingId?: string;
  limit?: number;
}): Promise<ProgesteroneTest[]> {
  const searchParams = new URLSearchParams();
  if (params?.animalId) searchParams.set('animalId', params.animalId);
  if (params?.matingId) searchParams.set('matingId', params.matingId);
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const url = `/api/progesterone-tests${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch progesterone tests');
  }
  
  const data = await response.json();
  return data.tests;
}

async function fetchProgesteroneTest(id: string): Promise<ProgesteroneTest> {
  const response = await fetch(`/api/progesterone-tests/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch progesterone test');
  }
  
  const data = await response.json();
  return data.test;
}

async function createProgesteroneTest(input: CreateProgesteroneTestInput): Promise<ProgesteroneTest> {
  const response = await fetch('/api/progesterone-tests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create progesterone test');
  }
  
  const data = await response.json();
  return data.test;
}

async function updateProgesteroneTest(input: UpdateProgesteroneTestInput): Promise<ProgesteroneTest> {
  const { id, ...updateData } = input;
  const response = await fetch(`/api/progesterone-tests/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update progesterone test');
  }
  
  const data = await response.json();
  return data.test;
}

async function deleteProgesteroneTest(id: string): Promise<void> {
  const response = await fetch(`/api/progesterone-tests/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete progesterone test');
  }
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export function useProgesteroneTests(params?: {
  animalId?: string;
  matingId?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['progesterone-tests', params],
    queryFn: () => fetchProgesteroneTests(params),
  });
}

export function useProgesteroneTest(id: string) {
  return useQuery({
    queryKey: ['progesterone-tests', id],
    queryFn: () => fetchProgesteroneTest(id),
    enabled: !!id,
  });
}

export function useCreateProgesteroneTest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProgesteroneTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progesterone-tests'] });
    },
  });
}

export function useUpdateProgesteroneTest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProgesteroneTest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['progesterone-tests'] });
      queryClient.invalidateQueries({ queryKey: ['progesterone-tests', data.id] });
    },
  });
}

export function useDeleteProgesteroneTest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProgesteroneTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progesterone-tests'] });
    },
  });
}
