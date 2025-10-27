"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Shield, Palette, Database, Globe, Heart } from "lucide-react";
import { BreedPreferencesSection } from "@/components/settings/BreedPreferencesSection";
import {
  ProfileSettings,
  NotificationsSettings,
  RegionalSettings,
  PrivacySettings,
  AppearanceSettings,
  DataSettings,
} from "@/components/breeder/settings";

export default function Settings() {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-7 gap-1 bg-surface shadow-card">
            <TabsTrigger value="profile" data-testid="tab-profile" className="text-xs sm:text-sm">
              <User className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="breeds" data-testid="tab-breeds" className="text-xs sm:text-sm">
              <Heart className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Breeds</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications" className="text-xs sm:text-sm">
              <Bell className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="regional" data-testid="tab-regional" className="text-xs sm:text-sm">
              <Globe className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Regional</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" data-testid="tab-privacy" className="text-xs sm:text-sm">
              <Shield className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" data-testid="tab-appearance" className="text-xs sm:text-sm">
              <Palette className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Theme</span>
            </TabsTrigger>
            <TabsTrigger value="data" data-testid="tab-data" className="text-xs sm:text-sm">
              <Database className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <ProfileSettings />
          </TabsContent>

          {/* Breed Preferences */}
          <TabsContent value="breeds" className="space-y-6">
            <BreedPreferencesSection />
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <NotificationsSettings />
          </TabsContent>

          {/* Regional Settings */}
          <TabsContent value="regional" className="space-y-6">
            <RegionalSettings />
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <PrivacySettings />
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <AppearanceSettings />
          </TabsContent>

          {/* Data Settings */}
          <TabsContent value="data" className="space-y-6">
            <DataSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
