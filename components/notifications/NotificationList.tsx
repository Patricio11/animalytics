'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { X, Archive, ExternalLink, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useMarkAsRead, useArchiveNotification, useDeleteNotification } from '@/lib/hooks/useNotifications';
import { NOTIFICATION_CONFIGS } from '@/lib/types/notification';
import type { Notification } from '@/lib/types/notification';
import { NotificationDetailModal } from '@/components/notifications/NotificationDetailModal';
import Link from 'next/link';

interface NotificationListProps {
  notifications: Notification[];
  compact?: boolean;
  showActions?: boolean;
}

export function NotificationList({ 
  notifications, 
  compact = false,
  showActions = true 
}: NotificationListProps) {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const markAsRead = useMarkAsRead();
  const archiveNotification = useArchiveNotification();
  const deleteNotification = useDeleteNotification();

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setModalOpen(true);
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }
  };

  const handleViewClick = (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation();
    handleNotificationClick(notification);
  };

  const handleArchive = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    archiveNotification.mutate(id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification.mutate(id);
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={cn('divide-y divide-gray-100 dark:divide-gray-800', compact && 'text-sm')}>
      {notifications.map((notification) => {
        const config = NOTIFICATION_CONFIGS[notification.type];
        const icon = notification.icon || config?.icon || '📢';
        const iconColor = notification.iconColor || config?.iconColor || '#3b82f6';

        return (
          <div
            key={notification.id}
            className={cn(
              'group relative p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer',
              !notification.read && 'bg-purple-50/50 dark:bg-purple-950/20',
              compact && 'p-3'
            )}
            onClick={() => handleNotificationClick(notification)}
          >
            {/* Unread Indicator */}
            {!notification.read && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-600 rounded-full" />
            )}

            <div className="flex gap-3">
              {/* Icon */}
              <div
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg',
                  compact && 'w-8 h-8 text-base'
                )}
                style={{ backgroundColor: `${iconColor}20` }}
              >
                {icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <p className={cn(
                      'font-semibold text-gray-900 dark:text-white',
                      compact ? 'text-sm' : 'text-base'
                    )}>
                      {notification.title}
                    </p>
                  </div>

                  {/* Priority Badge */}
                  {notification.priority === 'urgent' && (
                    <Badge variant="destructive" className="text-xs">
                      Urgent
                    </Badge>
                  )}
                  {notification.priority === 'high' && !compact && (
                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                      High
                    </Badge>
                  )}
                </div>

                <p className={cn(
                  'text-gray-600 dark:text-gray-400 mb-2',
                  compact ? 'text-xs line-clamp-2' : 'text-sm'
                )}>
                  {notification.message}
                </p>

                {/* Action Button */}
                {notification.actionUrl && notification.actionLabel && (
                  <Link
                    href={notification.actionUrl}
                    onClick={() => handleNotificationClick(notification)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    {notification.actionLabel}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                  
                  {!compact && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {notification.category}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex-shrink-0 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-purple-50 hover:text-purple-600"
                    onClick={(e) => handleViewClick(e, notification)}
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {!notification.archived && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleArchive(e, notification.id)}
                      title="Archive"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                    onClick={(e) => handleDelete(e, notification.id)}
                    title="Delete"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
