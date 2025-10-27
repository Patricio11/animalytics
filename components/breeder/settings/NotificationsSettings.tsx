"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  breeding: boolean;
  health: boolean;
  marketplace: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  email: true,
  push: false,
  sms: true,
  breeding: true,
  health: true,
  marketplace: false
};

export function NotificationsSettings() {
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<NotificationPreferences>(DEFAULT_NOTIFICATIONS);
  const [isSaving, setIsSaving] = useState(false);

  const handleNotificationChange = (key: keyof NotificationPreferences, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // TODO: Implement API call to save notification preferences
      // await fetch('/api/user/settings/notifications', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(notifications),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setNotifications(DEFAULT_NOTIFICATIONS);
    toast({
      title: "Reset to Default",
      description: "Notification preferences have been reset to default values.",
    });
  };

  return (
    <Card className="shadow-card bg-surface border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Methods */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Notification Methods</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Email Notifications</span>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                data-testid="switch-email-notifications"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Push Notifications</span>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                data-testid="switch-push-notifications"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">SMS Notifications</span>
              </div>
              <Switch
                checked={notifications.sms}
                onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                data-testid="switch-sms-notifications"
              />
            </div>
          </div>
        </div>

        {/* Notification Categories */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-foreground">Notification Categories</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-foreground">Breeding Reminders</span>
                <p className="text-xs text-muted-foreground">Task reminders, mating schedules</p>
              </div>
              <Switch
                checked={notifications.breeding}
                onCheckedChange={(checked) => handleNotificationChange('breeding', checked)}
                data-testid="switch-breeding-notifications"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-foreground">Health Alerts</span>
                <p className="text-xs text-muted-foreground">Vet appointments, medication reminders</p>
              </div>
              <Switch
                checked={notifications.health}
                onCheckedChange={(checked) => handleNotificationChange('health', checked)}
                data-testid="switch-health-notifications"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-foreground">Marketplace Updates</span>
                <p className="text-xs text-muted-foreground">New listings, messages from buyers</p>
              </div>
              <Switch
                checked={notifications.marketplace}
                onCheckedChange={(checked) => handleNotificationChange('marketplace', checked)}
                data-testid="switch-marketplace-notifications"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-primary/10">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-gradient-brand hover:opacity-90 shadow-card" 
            data-testid="button-save-notifications"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="hover:bg-primary/10 hover:border-primary shadow-card"
          >
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
