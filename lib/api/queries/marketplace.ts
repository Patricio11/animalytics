import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// TYPES
// ============================================================================

interface CreateMarketplaceListingData {
  animalId?: string;
  category: 'stud_dog' | 'puppies' | 'dog_for_sale' | 'reproductive_services' | 'frozen_semen';
  title: string;
  description: string;
  price?: number;
  currency?: string;
  location?: string;
  clinicId?: string;
  availability?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  images?: string[];
}

interface UpdateMarketplaceListingData extends Partial<CreateMarketplaceListingData> {
  status?: 'active' | 'sold' | 'inactive';
  featured?: boolean;
}

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

async function fetchMarketplaceListings(filters?: {
  category?: string;
  location?: string;
  search?: string;
  featured?: boolean;
}) {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.location) params.append('location', filters.location);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.featured !== undefined) params.append('featured', String(filters.featured));

  const response = await fetch(`/api/marketplace?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch marketplace listings');
  const json = await response.json();
  return json.data;
}

async function fetchMarketplaceListing(id: string) {
  const response = await fetch(`/api/marketplace/${id}`);
  if (!response.ok) throw new Error('Failed to fetch marketplace listing');
  const json = await response.json();
  return json.data;
}

async function createMarketplaceListing(data: CreateMarketplaceListingData) {
  const response = await fetch('/api/marketplace', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create marketplace listing');
  }
  const json = await response.json();
  return json.data;
}

async function updateMarketplaceListing({ id, data }: { id: string; data: UpdateMarketplaceListingData }) {
  const response = await fetch(`/api/marketplace/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update marketplace listing');
  }
  const json = await response.json();
  return json.data;
}

async function deleteMarketplaceListing(id: string) {
  const response = await fetch(`/api/marketplace/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete marketplace listing');
  }
  const json = await response.json();
  return json.data;
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export function useMarketplaceListings(filters?: {
  category?: string;
  location?: string;
  search?: string;
  featured?: boolean;
}) {
  return useQuery({
    queryKey: ['marketplace', filters],
    queryFn: () => fetchMarketplaceListings(filters),
  });
}

export function useMarketplaceListing(id: string) {
  return useQuery({
    queryKey: ['marketplace', id],
    queryFn: () => fetchMarketplaceListing(id),
    enabled: !!id,
  });
}

export function useCreateMarketplaceListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMarketplaceListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
    },
  });
}

export function useUpdateMarketplaceListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMarketplaceListing,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace', variables.id] });
    },
  });
}

export function useDeleteMarketplaceListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMarketplaceListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
    },
  });
}
