"use client";

import { useState } from 'react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useBulkDelete } from '@/lib/hooks/useNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CheckCheck, Trash2, Eye, Calendar, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { NotificationDetailModal } from '@/components/notifications/NotificationDetailModal';

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch notifications based on active tab
  const { data: allData, isLoading: allLoading } = useNotifications({});
  const { data: unreadData, isLoading: unreadLoading } = useNotifications({ read: false });
  const { data: readData, isLoading: readLoading } = useNotifications({ read: true });

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const bulkDelete = useBulkDelete();

  const getCurrentData = () => {
    switch (activeTab) {
      case 'unread':
        return unreadData;
      case 'read':
        return readData;
      default:
        return allData;
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case 'unread':
        return unreadLoading;
      case 'read':
        return readLoading;
      default:
        return allLoading;
    }
  };

  const currentData = getCurrentData();
  const isLoading = getCurrentLoading();
  const notifications = currentData?.data || [];

  const handleNotificationClick = (notification: any) => {
    setSelectedNotification(notification);
    setModalOpen(true);
    
    // Mark as read if unread
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDeleteSelected = (ids: string[]) => {
    bulkDelete.mutate(ids);
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'breeding':
        return '🐕';
      case 'health':
        return '🏥';
      case 'financial':
        return '💰';
      case 'marketplace':
        return '🛒';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="w-8 h-8 text-purple-600" />
              Notifications
            </h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with your breeding activities
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">
            All ({allData?.meta.total || 0})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadData?.meta.total || 0})
          </TabsTrigger>
          <TabsTrigger value="read">
            Read ({readData?.meta.total || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-12">
                <div className="text-center text-muted-foreground">
                  <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">No Notifications</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification: any) => (
                <Card
                  key={notification.id}
                  className={`shadow-card cursor-pointer transition-all hover:shadow-lg ${
                    !notification.read ? 'border-l-4 border-l-purple-500 bg-purple-50/30 dark:bg-purple-900/10' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        {notification.icon ? (
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                            style={{ backgroundColor: notification.iconColor || '#e5e7eb' }}
                          >
                            {notification.icon}
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-2xl">
                            {getCategoryIcon(notification.category)}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                            )}
                            <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                              {notification.priority}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(notification.createdAt), 'MMM dd, yyyy • h:mm a')}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {notification.category}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSelected([notification.id]);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
