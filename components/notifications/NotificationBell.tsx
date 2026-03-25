'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationList } from '@/components/notifications/NotificationList';
import { AllNotificationsModal } from '@/components/notifications/AllNotificationsModal';
import { useUnreadNotifications, useUnreadCount, useMarkAllAsRead } from '@/lib/hooks/useNotifications';

export function NotificationBell() {
  const { data, isLoading } = useUnreadNotifications(10);
  const unreadCount = useUnreadCount();
  const markAllAsRead = useMarkAllAsRead();
  const [allModalOpen, setAllModalOpen] = useState(false);

  const notifications = data?.data || [];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative hover-elevate">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-brand rounded-full flex items-center justify-center shadow-elevated">
                <span className="text-xs text-white font-medium">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-96 shadow-elevated" align="end" forceMount>
          <DropdownMenuLabel className="flex items-center justify-between py-3">
            <span className="font-semibold text-base">Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {unreadCount} new
                </Badge>
              )}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Quick Actions */}
          {unreadCount > 0 && (
            <>
              <div className="px-3 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => markAllAsRead.mutate()}
                  disabled={markAllAsRead.isPending}
                >
                  Mark all as read
                </Button>
              </div>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Notification List (unread preview) */}
          <ScrollArea className="h-[360px]">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2" />
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Bell className="mx-auto h-12 w-12 mb-3 opacity-30" />
                <p className="font-medium mb-1">No new notifications</p>
                <p className="text-xs">You're all caught up!</p>
              </div>
            ) : (
              <NotificationList notifications={notifications} compact />
            )}
          </ScrollArea>

          {/* Footer — always visible */}
          <DropdownMenuSeparator />
          <div className="p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => setAllModalOpen(true)}
            >
              <Bell className="w-3.5 h-3.5 mr-1.5" />
              View all notifications
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Full notifications modal */}
      <AllNotificationsModal
        open={allModalOpen}
        onOpenChange={setAllModalOpen}
      />
    </>
  );
}
