import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// TYPES
// ============================================================================

interface CreateTaskData {
  type: 'feeding' | 'exercise' | 'grooming' | 'weight' | 'cleaning' | 'event' | 'puppy_feeding' | 'misc';
  title: string;
  description?: string;
  notes?: string;
  dueDate: string;
  dueTime?: string;
  animalId?: string;
  priority?: 'low' | 'medium' | 'high';
  taskData?: Record<string, any>;
  isRecurring?: boolean;
  recurringPattern?: string;
}

interface UpdateTaskData extends Partial<CreateTaskData> {
  completedAt?: string;
}

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

async function fetchTasks(filters?: {
  taskType?: string;
  priority?: string;
  status?: string;
  animalId?: string;
  fromDate?: string;
  toDate?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.taskType) params.append('taskType', filters.taskType);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.animalId) params.append('animalId', filters.animalId);
  if (filters?.fromDate) params.append('fromDate', filters.fromDate);
  if (filters?.toDate) params.append('toDate', filters.toDate);

  const response = await fetch(`/api/tasks?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  const json = await response.json();
  // API wraps response in { success: true, data: [...] }
  return json.data;
}

async function fetchTask(id: string) {
  const response = await fetch(`/api/tasks/${id}`);
  if (!response.ok) throw new Error('Failed to fetch task');
  const json = await response.json();
  // API wraps response in { success: true, data: {...} }
  return json.data;
}

async function createTask(data: CreateTaskData) {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create task');
  }
  const json = await response.json();
  // API wraps response in { success: true, data: {...} }
  return json.data;
}

async function updateTask({ id, data }: { id: string; data: UpdateTaskData }) {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update task');
  }
  const json = await response.json();
  // API wraps response in { success: true, data: {...} }
  return json.data;
}

async function deleteTask(id: string) {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete task');
  }
  const json = await response.json();
  // API wraps response in { success: true, data: {...} }
  return json.data;
}

async function completeTask(id: string) {
  const response = await fetch(`/api/tasks/${id}/complete`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to complete task');
  }
  const json = await response.json();
  // API wraps response in { success: true, data: {...} }
  return json.data;
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export function useTasks(filters?: {
  taskType?: string;
  priority?: string;
  status?: string;
  animalId?: string;
  fromDate?: string;
  toDate?: string;
}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => fetchTask(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.id] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeTask,
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
