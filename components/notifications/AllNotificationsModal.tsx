'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  CheckCheck,
  Trash2,
  Eye,
  Calendar,
  X,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '@/lib/hooks/useNotifications';
import { NOTIFICATION_CONFIGS } from '@/lib/types/notification';
import type { Notification } from '@/lib/types/notification';
import { NotificationDetailModal } from './NotificationDetailModal';

interface AllNotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AllNotificationsModal({ open, onOpenChange }: AllNotificationsModalProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [selected, setSelected] = useState<Notification | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: allData, isLoading: allLoading } = useNotifications({});
  const { data: unreadData, isLoading: unreadLoading } = useNotifications({ read: false });
  const { data: readData, isLoading: readLoading } = useNotifications({ read: true });

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const allNotifications = allData?.data || [];
  const unreadNotifications = unreadData?.data || [];
  const readNotifications = readData?.data || [];

  const allTotal = allData?.meta.total || 0;
  const unreadTotal = unreadData?.meta.total || 0;
  const readTotal = readData?.meta.total || 0;

  function openDetail(n: Notification) {
    setSelected(n);
    setDetailOpen(true);
    if (!n.read) markAsRead.mutate(n.id);
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    deleteNotification.mutate(id);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden p-0">
          {/* Header */}
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                Notifications
                {unreadTotal > 0 && (
                  <Badge className="bg-purple-600 text-white text-xs">
                    {unreadTotal} new
                  </Badge>
                )}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {unreadTotal > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllAsRead.mutate()}
                    disabled={markAllAsRead.isPending}
                    className="text-xs"
                  >
                    <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex-shrink-0 px-6 pt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full max-w-sm">
                <TabsTrigger value="all" className="text-xs">
                  All {allTotal > 0 && <span className="ml-1 text-muted-foreground">({allTotal})</span>}
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">
                  Unread {unreadTotal > 0 && <span className="ml-1 text-muted-foreground">({unreadTotal})</span>}
                </TabsTrigger>
                <TabsTrigger value="read" className="text-xs">
                  Read {readTotal > 0 && <span className="ml-1 text-muted-foreground">({readTotal})</span>}
                </TabsTrigger>
              </TabsList>

              {/* List area */}
              <ScrollArea className="h-[480px] mt-4 -mx-6 px-0">
                <TabsContent value="all" className="mt-0">
                  <NotificationItems
                    notifications={allNotifications}
                    isLoading={allLoading}
                    onView={openDetail}
                    onDelete={handleDelete}
                  />
                </TabsContent>
                <TabsContent value="unread" className="mt-0">
                  <NotificationItems
                    notifications={unreadNotifications}
                    isLoading={unreadLoading}
                    onView={openDetail}
                    onDelete={handleDelete}
                    emptyMessage="No unread notifications"
                    emptySubtext="You're all caught up!"
                  />
                </TabsContent>
                <TabsContent value="read" className="mt-0">
                  <NotificationItems
                    notifications={readNotifications}
                    isLoading={readLoading}
                    onView={openDetail}
                    onDelete={handleDelete}
                    emptyMessage="No read notifications"
                    emptySubtext="Notifications you've read will appear here"
                  />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail modal — nested */}
      <NotificationDetailModal
        notification={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Inner list renderer
// ────────────────────────────────────────────────────────────────────────────

interface NotificationItemsProps {
  notifications: Notification[];
  isLoading: boolean;
  onView: (n: Notification) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  emptyMessage?: string;
  emptySubtext?: string;
}

function NotificationItems({
  notifications,
  isLoading,
  onView,
  onDelete,
  emptyMessage = 'No notifications',
  emptySubtext = "You're all caught up!",
}: NotificationItemsProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        <p className="text-sm">Loading notifications…</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <Bell className="w-12 h-12 opacity-20" />
        <p className="font-medium text-sm">{emptyMessage}</p>
        <p className="text-xs">{emptySubtext}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {notifications.map((n) => {
        const config = NOTIFICATION_CONFIGS[n.type];
        const icon = n.icon || config?.icon || '📢';
        const iconColor = n.iconColor || config?.iconColor || '#8b5cf6';

        return (
          <div
            key={n.id}
            className={`group flex items-start gap-4 px-6 py-4 cursor-pointer hover:bg-muted/40 transition-colors ${
              !n.read ? 'bg-purple-50/40 dark:bg-purple-950/20' : ''
            }`}
            onClick={() => onView(n)}
          >
            {/* Unread dot */}
            <div className="flex-shrink-0 w-2 mt-2">
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-purple-600" />
              )}
            </div>

            {/* Icon */}
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: `${iconColor}20` }}
            >
              {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <p className={`font-semibold text-sm ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {n.title}
                </p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {n.priority === 'urgent' && (
                    <Badge variant="destructive" className="text-xs py-0 h-5">Urgent</Badge>
                  )}
                  {n.priority === 'high' && (
                    <Badge variant="secondary" className="text-xs py-0 h-5 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                      High
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">
                {n.message}
              </p>

              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </span>
                <Badge variant="outline" className="text-xs py-0 h-4 capitalize">
                  {n.category}
                </Badge>
              </div>
            </div>

            {/* Actions — show on hover */}
            <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/40"
                onClick={(e) => { e.stopPropagation(); onView(n); }}
                title="View"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                onClick={(e) => onDelete(e, n.id)}
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
