"use client";

import { useState } from 'react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '@/lib/hooks/useNotifications';
import { sanitizeNotificationTitle } from '@/lib/types/notification';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CheckCheck, Trash2, Eye, Calendar, ArrowLeft } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { NotificationDetailModal } from '@/components/notifications';
import { NOTIFICATION_CONFIGS } from '@/lib/types/notification';
import type { Notification } from '@/lib/types/notification';

export default function NotificationsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Notification | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: allData, isLoading: allLoading } = useNotifications({});
  const { data: unreadData, isLoading: unreadLoading } = useNotifications({ read: false });
  const { data: readData, isLoading: readLoading } = useNotifications({ read: true });

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  function openDetail(n: Notification) {
    setSelected(n);
    setModalOpen(true);
    if (!n.read) markAsRead.mutate(n.id);
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    deleteNotification.mutate(id);
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200';
      case 'high':   return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200';
      case 'normal': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200';
      default:       return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200';
    }
  };

  function NotificationList({ notifications, isLoading }: { notifications: Notification[]; isLoading: boolean }) {
    if (isLoading) {
      return (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
          <p className="text-muted-foreground mt-4">Loading notifications...</p>
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No notifications here</p>
            <p className="text-sm">You're all caught up!</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {notifications.map((n) => {
          const config = NOTIFICATION_CONFIGS[n.type];
          const icon = n.icon || config?.icon || '📢';
          const iconColor = n.iconColor || config?.iconColor || '#8b5cf6';

          return (
            <Card
              key={n.id}
              className={`shadow-card cursor-pointer transition-all hover:shadow-lg ${
                !n.read ? 'border-l-4 border-l-purple-500 bg-purple-50/30 dark:bg-purple-900/10' : ''
              }`}
              onClick={() => openDetail(n)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Unread dot */}
                  <div className="flex-shrink-0 w-2 mt-5">
                    {!n.read && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                  </div>

                  {/* Icon */}
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${iconColor}20` }}
                  >
                    {icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-semibold ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {sanitizeNotificationTitle(n.title)}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!n.read && <div className="hidden" />}
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(n.priority)}`}>
                          {n.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(n.createdAt), 'MMM dd, yyyy • h:mm a')}
                      </span>
                      <span className="text-muted-foreground/60">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {n.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); openDetail(n); }}
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(e, n.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="w-8 h-8 text-purple-600" />
              Notifications
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Stay updated with your breeding activities
            </p>
          </div>
        </div>
        {(unreadData?.meta.total ?? 0) > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">
            All {(allData?.meta.total ?? 0) > 0 && <span className="ml-1 text-muted-foreground text-xs">({allData?.meta.total})</span>}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread {(unreadData?.meta.total ?? 0) > 0 && <span className="ml-1 text-muted-foreground text-xs">({unreadData?.meta.total})</span>}
          </TabsTrigger>
          <TabsTrigger value="read">
            Read {(readData?.meta.total ?? 0) > 0 && <span className="ml-1 text-muted-foreground text-xs">({readData?.meta.total})</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <NotificationList notifications={allData?.data || []} isLoading={allLoading} />
        </TabsContent>
        <TabsContent value="unread">
          <NotificationList notifications={unreadData?.data || []} isLoading={unreadLoading} />
        </TabsContent>
        <TabsContent value="read">
          <NotificationList notifications={readData?.data || []} isLoading={readLoading} />
        </TabsContent>
      </Tabs>

      {/* Detail modal */}
      <NotificationDetailModal
        notification={selected}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
