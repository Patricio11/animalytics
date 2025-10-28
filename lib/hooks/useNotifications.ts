import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  Notification, 
  NotificationFilters, 
  NotificationStats,
  UpdateNotificationRequest 
} from '@/lib/types/notification';

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function fetchNotifications(filters?: NotificationFilters): Promise<{
  data: Notification[];
  meta: { total: number; limit: number; offset: number; hasMore: boolean };
}> {
  const params = new URLSearchParams();
  
  if (filters?.read !== undefined) params.append('read', String(filters.read));
  if (filters?.archived !== undefined) params.append('archived', String(filters.archived));
  if (filters?.category) params.append('category', filters.category);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.offset) params.append('offset', String(filters.offset));

  const response = await fetch(`/api/notifications?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }

  return response.json();
}

async function fetchNotificationStats(): Promise<NotificationStats> {
  const response = await fetch('/api/notifications?stats=true');
  
  if (!response.ok) {
    throw new Error('Failed to fetch notification stats');
  }

  const result = await response.json();
  return result.data;
}

async function updateNotification(
  id: string,
  data: UpdateNotificationRequest
): Promise<Notification> {
  const response = await fetch(`/api/notifications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update notification');
  }

  const result = await response.json();
  return result.data;
}

async function deleteNotification(id: string): Promise<void> {
  const response = await fetch(`/api/notifications/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete notification');
  }
}

async function bulkAction(
  action: 'mark_read' | 'mark_unread' | 'archive' | 'unarchive' | 'delete',
  notificationIds: string[]
): Promise<{ affected: number }> {
  const response = await fetch('/api/notifications/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, notificationIds }),
  });

  if (!response.ok) {
    throw new Error('Failed to perform bulk action');
  }

  const result = await response.json();
  return result.data;
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

/**
 * Fetch notifications with filters
 */
export function useNotifications(filters?: NotificationFilters) {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => fetchNotifications(filters),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Fetch notification statistics
 */
export function useNotificationStats() {
  return useQuery({
    queryKey: ['notifications', 'stats'],
    queryFn: fetchNotificationStats,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Fetch unread notifications only
 */
export function useUnreadNotifications(limit = 10) {
  return useNotifications({ read: false, limit });
}

/**
 * Mark notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => updateNotification(id, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Mark notification as unread
 */
export function useMarkAsUnread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => updateNotification(id, { read: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Archive notification
 */
export function useArchiveNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => updateNotification(id, { archived: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Delete notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Mark all as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // First, fetch all unread notification IDs
      const { data } = await fetchNotifications({ read: false, limit: 100 });
      const ids = data.map(n => n.id);
      
      if (ids.length === 0) return { affected: 0 };
      
      return bulkAction('mark_read', ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Bulk delete notifications
 */
export function useBulkDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkAction('delete', ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Bulk archive notifications
 */
export function useBulkArchive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkAction('archive', ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Get unread count (from stats)
 */
export function useUnreadCount() {
  const { data: stats } = useNotificationStats();
  return stats?.unread || 0;
}
