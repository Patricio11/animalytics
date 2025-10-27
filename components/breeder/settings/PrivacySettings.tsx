"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PrivacySettings {
  profileVisibility: string;
  contactVisibility: string;
  analyticsEnabled: boolean;
  marketingEnabled: boolean;
}

export function PrivacySettings() {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: "public",
    contactVisibility: "verified",
    analyticsEnabled: true,
    marketingEnabled: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof PrivacySettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // TODO: Implement API call to save privacy settings
      // await fetch('/api/user/settings/privacy', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "Settings Saved",
        description: "Your privacy settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save privacy settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = () => {
    toast({
      title: "Change Password",
      description: "Password change functionality will be implemented soon.",
    });
  };

  const handleEnable2FA = () => {
    toast({
      title: "Two-Factor Authentication",
      description: "2FA setup will be implemented soon.",
    });
  };

  return (
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
              <Select 
                value={settings.profileVisibility} 
                onValueChange={(value) => handleChange('profileVisibility', value)}
              >
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
              <Select 
                value={settings.contactVisibility} 
                onValueChange={(value) => handleChange('contactVisibility', value)}
              >
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
              <Switch 
                checked={settings.analyticsEnabled}
                onCheckedChange={(checked) => handleChange('analyticsEnabled', checked)}
                data-testid="switch-analytics" 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-foreground">Marketing Communications</span>
                <p className="text-xs text-muted-foreground">Receive updates about new features</p>
              </div>
              <Switch 
                checked={settings.marketingEnabled}
                onCheckedChange={(checked) => handleChange('marketingEnabled', checked)}
                data-testid="switch-marketing" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-foreground">Account Security</h3>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              onClick={handleChangePassword}
              className="hover:bg-primary/10 hover:border-primary shadow-card w-full sm:w-auto" 
              data-testid="button-change-password"
            >
              Change Password
            </Button>
            <Button 
              variant="outline" 
              onClick={handleEnable2FA}
              className="hover:bg-primary/10 hover:border-primary shadow-card w-full sm:w-auto" 
              data-testid="button-enable-2fa"
            >
              Enable Two-Factor Authentication
            </Button>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-primary/10">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-gradient-brand hover:opacity-90 shadow-card" 
            data-testid="button-save-privacy"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
