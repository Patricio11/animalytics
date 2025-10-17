import { useQuery } from '@tanstack/react-query';

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

async function fetchDashboardStats() {
  const response = await fetch('/api/dashboard/stats');
  if (!response.ok) throw new Error('Failed to fetch dashboard statistics');
  const json = await response.json();
  // API wraps response in { success: true, data: {...} }
  return json.data;
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    staleTime: 30 * 1000, // 30 seconds - refresh stats more frequently
  });
}
