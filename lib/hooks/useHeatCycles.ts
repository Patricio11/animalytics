import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import type {
  HeatCycleWithDetails,
  CreateHeatCycleRequest,
  CreateHeatCycleResponse,
  GetActiveCyclesResponse,
  GetCycleHistoryResponse
} from '@/lib/types/heat-cycle';

/**
 * Fetch active heat cycles
 */
export function useActiveCycles() {
  return useQuery<GetActiveCyclesResponse>({
    queryKey: ['heat-cycles', 'active'],
    queryFn: async () => {
      const response = await fetch('/api/heat-cycles?status=active');
      if (!response.ok) {
        throw new Error('Failed to fetch active cycles');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch cycle history with pagination
 */
export function useCycleHistory(page: number = 1, pageSize: number = 10) {
  return useQuery<GetCycleHistoryResponse>({
    queryKey: ['heat-cycles', 'history', page, pageSize],
    queryFn: async () => {
      const offset = (page - 1) * pageSize;
      const response = await fetch(
        `/api/heat-cycles?limit=${pageSize}&offset=${offset}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch cycle history');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch cycles for a specific bitch
 */
export function useBitchCycles(bitchId: string) {
  return useQuery<GetActiveCyclesResponse>({
    queryKey: ['heat-cycles', 'bitch', bitchId],
    queryFn: async () => {
      const response = await fetch(`/api/heat-cycles?bitchId=${bitchId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bitch cycles');
      }
      return response.json();
    },
    enabled: !!bitchId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch a single heat cycle by ID
 */
export function useHeatCycle(cycleId: string) {
  return useQuery<HeatCycleWithDetails>({
    queryKey: ['heat-cycles', cycleId],
    queryFn: async () => {
      const response = await fetch(`/api/heat-cycles/${cycleId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch heat cycle');
      }
      return response.json();
    },
    enabled: !!cycleId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Create a new heat cycle
 */
export function useCreateHeatCycle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<CreateHeatCycleResponse, Error, CreateHeatCycleRequest>({
    mutationFn: async (data) => {
      const response = await fetch('/api/heat-cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create heat cycle');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch active cycles
      queryClient.invalidateQueries({ queryKey: ['heat-cycles', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['heat-cycles', 'bitch', data.heatCycle.bitchId] });

      toast({
        title: 'Heat Cycle Started',
        description: `First progesterone test due on ${data.firstReminderDate.toLocaleDateString()}`,
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
 * Update a heat cycle
 */
export function useUpdateHeatCycle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    HeatCycleWithDetails,
    Error,
    { cycleId: string; data: Partial<CreateHeatCycleRequest> }
  >({
    mutationFn: async ({ cycleId, data }) => {
      const response = await fetch(`/api/heat-cycles/${cycleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update heat cycle');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['heat-cycles'] });
      queryClient.invalidateQueries({ queryKey: ['heat-cycles', data.id] });

      toast({
        title: 'Heat Cycle Updated',
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
 * Complete a heat cycle
 */
export function useCompleteHeatCycle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: async (cycleId) => {
      const response = await fetch(`/api/heat-cycles/${cycleId}/complete`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete heat cycle');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heat-cycles'] });

      toast({
        title: 'Heat Cycle Completed',
        description: 'Cycle has been marked as completed',
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
 * Delete a heat cycle
 */
export function useDeleteHeatCycle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: async (cycleId) => {
      const response = await fetch(`/api/heat-cycles/${cycleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete heat cycle');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heat-cycles'] });

      toast({
        title: 'Heat Cycle Deleted',
        description: 'Cycle has been permanently deleted',
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
