"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, Trash2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useMarkAsRead, useDeleteNotification } from "@/lib/hooks/useNotifications";
import { sanitizeNotificationTitle } from "@/lib/types/notification";

interface NotificationDetailModalProps {
  notification: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationDetailModal({
  notification,
  open,
  onOpenChange,
}: NotificationDetailModalProps) {
  const router = useRouter();
  const markAsRead = useMarkAsRead();
  const deleteNotification = useDeleteNotification();

  if (!notification) return null;

  const handleAction = () => {
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    deleteNotification.mutate(notification.id);
    onOpenChange(false);
  };

  const handleMarkAsRead = () => {
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200';
      case 'high':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200';
      case 'normal':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'breeding':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200';
      case 'health':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200';
      case 'financial':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200';
      case 'marketplace':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200';
      case 'system':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200';
      default:
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-4">
            {/* Icon */}
            {notification.icon ? (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
                style={{ backgroundColor: notification.iconColor || '#e5e7eb' }}
              >
                {notification.icon}
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-3xl flex-shrink-0">
                📢
              </div>
            )}

            {/* Title and Badges */}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl mb-2">{sanitizeNotificationTitle(notification.title)}</DialogTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                  {notification.priority}
                </Badge>
                <Badge variant="outline" className={getCategoryColor(notification.category)}>
                  {notification.category}
                </Badge>
                {!notification.read && (
                  <Badge className="bg-purple-500 text-white">
                    Unread
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Message */}
        <DialogDescription className="text-base leading-relaxed text-foreground">
          {notification.message}
        </DialogDescription>

        {/* Metadata */}
        {notification.metadata && (() => {
          const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          const isUUID = (v: unknown) => typeof v === 'string' && UUID_REGEX.test(v);
          const isIdKey = (k: string) => k === 'id' || k.endsWith('Id');
          const entries = Object.entries(JSON.parse(notification.metadata))
            .filter(([k, v]) => !isIdKey(k) && !isUUID(v));
          if (entries.length === 0) return null;
          return (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Additional Information</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {entries.map(([key, value]: [string, any]) => (
                  <div key={key}>
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="ml-2 font-medium text-foreground">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
          <Calendar className="w-4 h-4" />
          <span>
            {format(new Date(notification.createdAt), 'MMMM dd, yyyy • h:mm a')}
          </span>
          {notification.readAt && (
            <span className="ml-4 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Read {format(new Date(notification.readAt), 'MMM dd, h:mm a')}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t">
          {notification.actionUrl && notification.actionLabel && (
            <Button
              onClick={handleAction}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {notification.actionLabel}
            </Button>
          )}
          {!notification.read && (
            <Button
              variant="outline"
              onClick={handleMarkAsRead}
              disabled={markAsRead.isPending}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark as Read
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleteNotification.isPending}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
