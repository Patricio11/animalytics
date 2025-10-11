import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

async function generateReport(data: {
  reportType:
    | 'feeding'
    | 'exercise'
    | 'grooming'
    | 'cleaning'
    | 'puppies'
    | 'events'
    | 'mating_history';
  dateRange: {
    from: string;
    to: string;
  };
  filters?: {
    animalId?: string;
    taskType?: string;
    eventType?: string;
    damId?: string;
    sireId?: string;
  };
}) {
  const response = await fetch('/api/reports/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate report');
  }
  return response.json();
}

async function fetchReports(reportType?: string) {
  const params = new URLSearchParams();
  if (reportType) params.append('reportType', reportType);

  const response = await fetch(`/api/reports?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch reports');
  return response.json();
}

async function exportReport(data: { reportId: string; format: 'csv' | 'pdf' }) {
  const response = await fetch('/api/reports/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to export report');
  }
  return response.json();
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export function useReports(reportType?: string) {
  return useQuery({
    queryKey: ['reports', reportType],
    queryFn: () => fetchReports(reportType),
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: exportReport,
  });
}
