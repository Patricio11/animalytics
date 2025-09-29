"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Database, Mail, Phone, MapPin, Camera } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    breeding: true,
    health: true,
    marketplace: false
  });

  const [profile, setProfile] = useState({
    name: "John Breeder",
    email: "john@example.com",
    phone: "+61 4 1234 5678",
    kennel: "Premium Kennels",
    location: "Melbourne, VIC",
    bio: "Professional dog breeder with 15 years of experience specializing in Golden Retrievers and Labradors.",
    website: "https://premiumkennels.com.au"
  });

  const handleSave = (section: string) => {
    console.log(`Save ${section} settings`);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    console.log(`${key} notifications ${value ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-1 bg-surface shadow-card">
          <TabsTrigger value="profile" data-testid="tab-profile" className="text-xs sm:text-sm">
            <User className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications" className="text-xs sm:text-sm">
            <Bell className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Notifications</span>
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
            <Card className="shadow-card bg-surface border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="" alt={profile.name} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button size="sm" className="bg-gradient-brand hover:opacity-90 shadow-card" data-testid="button-change-photo">
                    <Camera className="w-3 h-3 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-background border-primary/20 focus:border-primary"
                    data-testid="input-profile-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kennel">Kennel Name</Label>
                  <Input
                    id="kennel"
                    value={profile.kennel}
                    onChange={(e) => setProfile(prev => ({ ...prev, kennel: e.target.value }))}
                    className="bg-background border-primary/20 focus:border-primary"
                    data-testid="input-kennel-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-background border-primary/20 focus:border-primary"
                    data-testid="input-profile-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="bg-background border-primary/20 focus:border-primary"
                    data-testid="input-profile-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    className="bg-background border-primary/20 focus:border-primary"
                    data-testid="input-profile-location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                    className="bg-background border-primary/20 focus:border-primary"
                    data-testid="input-profile-website"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about your breeding experience..."
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  className="bg-background border-primary/20 focus:border-primary"
                  data-testid="textarea-profile-bio"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-primary/10">
                <Button onClick={() => handleSave('profile')} className="bg-gradient-brand hover:opacity-90 shadow-card" data-testid="button-save-profile">
                  Save Changes
                </Button>
                <Button variant="outline" className="hover:bg-primary/10 hover:border-primary shadow-card">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
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
                <Button onClick={() => handleSave('notifications')} className="bg-gradient-brand hover:opacity-90 shadow-card" data-testid="button-save-notifications">
                  Save Changes
                </Button>
                <Button variant="outline" className="hover:bg-primary/10 hover:border-primary shadow-card">Reset to Default</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="shadow-card bg-surface border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Profile Visibility</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="profile-visibility">Who can see your profile?</Label>
                    <Select defaultValue="public">
                      <SelectTrigger className="bg-background border-primary/20 focus:border-primary" data-testid="select-profile-visibility">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public - Anyone can view</SelectItem>
                        <SelectItem value="breeders">Verified Breeders Only</SelectItem>
                        <SelectItem value="private">Private - Invite only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-info">Show contact information?</Label>
                    <Select defaultValue="verified">
                      <SelectTrigger className="bg-background border-primary/20 focus:border-primary" data-testid="select-contact-visibility">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Show to everyone</SelectItem>
                        <SelectItem value="verified">Verified members only</SelectItem>
                        <SelectItem value="none">Hide from everyone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-foreground">Data & Privacy</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-foreground">Analytics Collection</span>
                      <p className="text-xs text-muted-foreground">Help improve the app with usage data</p>
                    </div>
                    <Switch defaultChecked data-testid="switch-analytics" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-foreground">Marketing Communications</span>
                      <p className="text-xs text-muted-foreground">Receive updates about new features</p>
                    </div>
                    <Switch data-testid="switch-marketing" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-foreground">Account Security</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="hover:bg-primary/10 hover:border-primary shadow-card" data-testid="button-change-password">
                    Change Password
                  </Button>
                  <Button variant="outline" className="hover:bg-primary/10 hover:border-primary shadow-card" data-testid="button-enable-2fa">
                    Enable Two-Factor Authentication
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-primary/10">
                <Button onClick={() => handleSave('privacy')} className="bg-gradient-brand hover:opacity-90 shadow-card" data-testid="button-save-privacy">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="shadow-card bg-surface border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Appearance & Theme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select defaultValue="system">
                    <SelectTrigger className="bg-background border-primary/20 focus:border-primary" data-testid="select-theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="bg-background border-primary/20 focus:border-primary" data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="australia/melbourne">
                    <SelectTrigger className="bg-background border-primary/20 focus:border-primary" data-testid="select-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="australia/melbourne">Australia/Melbourne</SelectItem>
                      <SelectItem value="australia/sydney">Australia/Sydney</SelectItem>
                      <SelectItem value="australia/brisbane">Australia/Brisbane</SelectItem>
                      <SelectItem value="australia/perth">Australia/Perth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-primary/10">
                <Button onClick={() => handleSave('appearance')} className="bg-gradient-brand hover:opacity-90 shadow-card" data-testid="button-save-appearance">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          {/* Data Settings */}
          <TabsContent value="data" className="space-y-6">
            <Card className="shadow-card bg-surface border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Export Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download a copy of all your data including animals, reports, and documents.
                  </p>
                  <Button variant="outline" className="hover:bg-primary/10 hover:border-primary shadow-card" data-testid="button-export-data">
                    Export All Data
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium text-foreground mb-2">Storage Usage</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Documents & Photos</span>
                      <span>2.4 GB / 5 GB</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '48%' }} />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium text-destructive mb-2">Danger Zone</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10 shadow-card" data-testid="button-delete-account">
                      Delete Account
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      This action cannot be undone. All your data will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}