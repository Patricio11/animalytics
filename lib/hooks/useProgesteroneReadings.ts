import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import type {
  ProgesteroneReading,
  CreateProgesteroneReadingRequest,
  CreateProgesteroneReadingResponse
} from '@/lib/types/heat-cycle';

/**
 * Fetch progesterone readings for a heat cycle
 */
export function useProgesteroneReadings(cycleId: string) {
  return useQuery<ProgesteroneReading[]>({
    queryKey: ['progesterone-readings', cycleId],
    queryFn: async () => {
      const response = await fetch(`/api/progesterone-readings?cycleId=${cycleId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch progesterone readings');
      }
      return response.json();
    },
    enabled: !!cycleId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Create a new progesterone reading
 */
export function useCreateProgesteroneReading() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    CreateProgesteroneReadingResponse,
    Error,
    CreateProgesteroneReadingRequest
  >({
    mutationFn: async (data) => {
      const response = await fetch('/api/progesterone-readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create progesterone reading');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['progesterone-readings', data.reading.heatCycleId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['heat-cycles', data.reading.heatCycleId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['heat-cycles', 'active'] 
      });

      // Show success message with next test recommendation
      const nextTestMessage = data.breedingWindowOpen
        ? '🎯 Breeding window is open!'
        : `Next test in ${data.nextTestRecommendation.days} day${data.nextTestRecommendation.days > 1 ? 's' : ''}`;

      toast({
        title: 'Reading Saved',
        description: nextTestMessage,
      });

      // Show breeding window alert if applicable
      if (data.breedingWindowOpen) {
        toast({
          title: '🎯 Breeding Window Open!',
          description: 'Optimal breeding time detected. Check the breeding recommendations.',
          variant: 'default',
        });
      }
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
 * Update a progesterone reading
 */
export function useUpdateProgesteroneReading() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    ProgesteroneReading,
    Error,
    { readingId: string; data: Partial<CreateProgesteroneReadingRequest> }
  >({
    mutationFn: async ({ readingId, data }) => {
      const response = await fetch(`/api/progesterone-readings/${readingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update progesterone reading');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['progesterone-readings', data.heatCycleId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['heat-cycles', data.heatCycleId] 
      });

      toast({
        title: 'Reading Updated',
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
 * Delete a progesterone reading
 */
export function useDeleteProgesteroneReading() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, { readingId: string; cycleId: string }>({
    mutationFn: async ({ readingId }) => {
      const response = await fetch(`/api/progesterone-readings/${readingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete progesterone reading');
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['progesterone-readings', variables.cycleId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['heat-cycles', variables.cycleId] 
      });

      toast({
        title: 'Reading Deleted',
        description: 'Reading has been permanently deleted',
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
