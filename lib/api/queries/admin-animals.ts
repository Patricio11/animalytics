import { useQuery } from '@tanstack/react-query';

export interface AnimalFilters {
  search?: string;
  breedId?: string;
  sex?: 'male' | 'female' | '';
  location?: string;
  ownerId?: string;
  breederName?: string;
  ownerName?: string;
  hasPedigree?: 'yes' | 'no' | '';
  ageMin?: string;
  ageMax?: string;
  status?: 'all' | 'active' | 'inactive';
  sortBy?: 'name' | 'breed' | 'dateOfBirth' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface Animal {
  id: string;
  name: string;
  registeredName: string | null;
  sex: 'male' | 'female';
  dateOfBirth: string | null;
  profileImageUrl: string | null;
  color: string | null;
  markings: string | null;
  weight: number | null;
  height: number | null;
  microchipNumber: string | null;
  registrationNumber: string | null;
  dndProfileNumber: string | null;
  breederName: string | null;
  ownerName: string | null;
  location: string | null;
  bio: string | null;
  userId: string;
  breedId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  sireRegisteredName: string | null;
  damRegisteredName: string | null;
  breed: {
    id: string;
    name: string;
  } | null;
  owner: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export interface AnimalStats {
  totalAnimals: number;
  activeAnimals: number;
  inactiveAnimals: number;
  bySex: Array<{ sex: string; count: number }>;
  topBreeds: Array<{ breed: string; count: number }>;
  withPedigree: number;
  recentAdditions: number;
}

export interface AdminAnimalsResponse {
  animals: Animal[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  stats: AnimalStats;
}

export function useAdminAnimals(filters: AnimalFilters = {}) {
  return useQuery<AdminAnimalsResponse>({
    queryKey: ['admin-animals', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`/api/admin/animals?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch animals');
      }
      
      return response.json();
    },
  });
}

export async function deleteAnimal(animalId: string) {
  const response = await fetch(`/api/animals/${animalId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete animal');
  }

  return response.json();
}

export async function bulkDeleteAnimals(animalIds: string[]) {
  const response = await fetch('/api/admin/animals/bulk-delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ animalIds }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete animals');
  }

  return response.json();
}
