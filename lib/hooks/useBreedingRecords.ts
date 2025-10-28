import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface BreedingRecord {
  id: string;
  heatCycleId: string;
  breedingDate: string;
  breedingDay: number;
  breedingMethod: string;
  studId?: string;
  studName?: string;
  studRegistration?: string;
  semenQuality?: string;
  motility?: number;
  concentration?: string;
  progesteroneLevelAtBreeding?: string;
  notes?: string;
  createdAt: Date;
  stud?: any;
}

interface CreateBreedingRecordData {
  heatCycleId: string;
  breedingDate: string;
  breedingMethod: 'natural' | 'ai_fresh' | 'ai_chilled' | 'ai_frozen' | 'tci' | 'surgical';
  studId?: string;
  studName?: string;
  studRegistration?: string;
  semenQuality?: string;
  motility?: number;
  concentration?: number;
  progesteroneLevelAtBreeding?: number;
  notes?: string;
}

/**
 * Fetch breeding records for a heat cycle
 */
export function useBreedingRecords(heatCycleId?: string) {
  return useQuery<BreedingRecord[]>({
    queryKey: ['breeding-records', heatCycleId],
    queryFn: async () => {
      const url = heatCycleId 
        ? `/api/breeding-records?heatCycleId=${heatCycleId}`
        : '/api/breeding-records';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch breeding records');
      }
      const result = await response.json();
      return result.data?.records || result.data || result;
    },
    enabled: !!heatCycleId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Create a new breeding record
 */
export function useCreateBreedingRecord() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<any, Error, CreateBreedingRecordData>({
    mutationFn: async (data) => {
      const response = await fetch('/api/breeding-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create breeding record');
      }

      const result = await response.json();
      return result.data || result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['breeding-records', variables.heatCycleId] });
      queryClient.invalidateQueries({ queryKey: ['heat-cycles', variables.heatCycleId] });

      toast({
        title: 'Breeding Record Added',
        description: 'Breeding information saved successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update a breeding record
 */
export function useUpdateBreedingRecord() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    any,
    Error,
    { recordId: string; heatCycleId: string; data: Partial<CreateBreedingRecordData> }
  >({
    mutationFn: async ({ recordId, data }) => {
      const response = await fetch(`/api/breeding-records/${recordId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update breeding record');
      }

      const result = await response.json();
      return result.data || result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['breeding-records', variables.heatCycleId] });
      queryClient.invalidateQueries({ queryKey: ['heat-cycles', variables.heatCycleId] });

      toast({
        title: 'Breeding Record Updated',
        description: 'Changes saved successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete a breeding record
 */
export function useDeleteBreedingRecord() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<any, Error, { recordId: string; heatCycleId: string }>({
    mutationFn: async ({ recordId }) => {
      const response = await fetch(`/api/breeding-records/${recordId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete breeding record');
      }

      const result = await response.json();
      return result.data || result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['breeding-records', variables.heatCycleId] });
      queryClient.invalidateQueries({ queryKey: ['heat-cycles', variables.heatCycleId] });

      toast({
        title: 'Breeding Record Deleted',
        description: 'Record removed successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
