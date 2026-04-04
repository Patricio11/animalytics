import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type {
  HeatCycleWithDetails,
  CreateHeatCycleRequest,
  CreateHeatCycleResponse,
  GetActiveCyclesResponse,
  GetCycleHistoryResponse
} from '@/lib/types/heat-cycle';

/**
 * Fetch all heat cycles
 */
export function useHeatCycles() {
  return useQuery<HeatCycleWithDetails[]>({
    queryKey: ['heat-cycles'],
    queryFn: async () => {
      const response = await fetch('/api/heat-cycles');
      if (!response.ok) {
        throw new Error('Failed to fetch heat cycles');
      }
      const result = await response.json();
      // API returns { success: true, data: { cycles, total, page, pageSize } }
      return result.data?.cycles || result.data || result;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

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
      const result = await response.json();
      // API returns { success: true, data: {...} }
      return result.data || result;
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

      const result = await response.json();
      // API returns { success: true, data: { heatCycle, firstReminderDate } }
      return result.data || result;
    },
    onSuccess: (data) => {
      // Invalidate and refetch active cycles
      queryClient.invalidateQueries({ queryKey: ['heat-cycles', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['heat-cycles'] });
      if (data.heatCycle?.bitchId) {
        queryClient.invalidateQueries({ queryKey: ['heat-cycles', 'bitch', data.heatCycle.bitchId] });
      }

      toast({
        title: 'Heat Cycle Started',
        description: data.firstReminderDate 
          ? `First progesterone test due on ${new Date(data.firstReminderDate).toLocaleDateString()}`
          : 'Heat cycle tracking started successfully',
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
      const response = await fetch(`/api/heat-cycles/${cycleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
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
        description: 'Cycle has been marked as completed successfully',
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
 * Cancel a heat cycle
 */
export function useCancelHeatCycle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: async (cycleId) => {
      const response = await fetch(`/api/heat-cycles/${cycleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel heat cycle');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heat-cycles'] });

      toast({
        title: 'Heat Cycle Cancelled',
        description: 'Cycle has been marked as cancelled',
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

/**
 * Update a progesterone reading
 */
export function useUpdateProgesteroneReading() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    any,
    Error,
    { readingId: string; data: { testDate?: string; progesteroneLevel?: number; laboratory?: string; notes?: string; markAsMating?: boolean; markAsLastMating?: boolean } }
  >({
    mutationFn: async ({ readingId, data }) => {
      const response = await fetch(`/api/progesterone-readings/${readingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update reading');
      }

      const result = await response.json();
      return result.data || result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heat-cycles'] });

      toast({
        title: 'Reading Updated',
        description: 'Progesterone reading updated successfully',
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

  return useMutation<any, Error, string>({
    mutationFn: async (readingId) => {
      const response = await fetch(`/api/progesterone-readings/${readingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete reading');
      }

      const result = await response.json();
      return result.data || result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heat-cycles'] });

      toast({
        title: 'Reading Deleted',
        description: 'Progesterone reading deleted successfully',
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
