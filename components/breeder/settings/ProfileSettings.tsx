"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Camera, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth/client";
import { useToast } from "@/hooks/use-toast";
import { useRegionalSettings } from "@/lib/contexts/regional-settings-context";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  kennel: string;
  city: string;
  region: string;
  country: string;
  bio: string;
  website: string;
}

export function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings: regionalSettings, refreshSettings } = useRegionalSettings();

  const [profile, setProfile] = useState<ProfileData>({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    kennel: "",
    city: regionalSettings.city || "",
    region: regionalSettings.region || "",
    country: regionalSettings.country || "",
    bio: "",
    website: ""
  });

  // Load location from regional settings
  useEffect(() => {
    if (regionalSettings) {
      setProfile(prev => ({
        ...prev,
        city: regionalSettings.city || "",
        region: regionalSettings.region || "",
        country: regionalSettings.country || "",
      }));
    }
  }, [regionalSettings]);

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save location to regional settings
      const response = await fetch('/api/settings/regional', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          city: profile.city,
          region: profile.region,
          country: profile.country,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save location');
      }

      // Refresh regional settings to get updated data
      await refreshSettings();

      toast({
        title: "Profile Updated",
        description: "Your location has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to values from regional settings
    setProfile(prev => ({
      ...prev,
      city: regionalSettings.city || "",
      region: regionalSettings.region || "",
      country: regionalSettings.country || "",
    }));
  };

  return (
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
              onChange={(e) => handleChange('name', e.target.value)}
              className="bg-background border-primary/20 focus:border-primary"
              data-testid="input-profile-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kennel">Kennel Name</Label>
            <Input
              id="kennel"
              value={profile.kennel}
              onChange={(e) => handleChange('kennel', e.target.value)}
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
              onChange={(e) => handleChange('email', e.target.value)}
              className="bg-background border-primary/20 focus:border-primary"
              data-testid="input-profile-email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="bg-background border-primary/20 focus:border-primary"
              data-testid="input-profile-phone"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={profile.website}
              onChange={(e) => handleChange('website', e.target.value)}
              className="bg-background border-primary/20 focus:border-primary"
              data-testid="input-profile-website"
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-4 pt-4 border-t border-primary/10">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">Location Information</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            This location will be used to pre-fill animal profiles and is visible to potential buyers.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={profile.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="e.g., Johannesburg"
                className="bg-background border-primary/20 focus:border-primary"
                data-testid="input-profile-city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">State/Province</Label>
              <Input
                id="region"
                value={profile.region}
                onChange={(e) => handleChange('region', e.target.value)}
                placeholder="e.g., Gauteng"
                className="bg-background border-primary/20 focus:border-primary"
                data-testid="input-profile-region"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={profile.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="e.g., South Africa"
                className="bg-background border-primary/20 focus:border-primary"
                data-testid="input-profile-country"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about your breeding experience..."
            value={profile.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            className="bg-background border-primary/20 focus:border-primary"
            data-testid="textarea-profile-bio"
          />
        </div>

        <div className="flex gap-2 pt-4 border-t border-primary/10">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-gradient-brand hover:opacity-90 shadow-card" 
            data-testid="button-save-profile"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="hover:bg-primary/10 hover:border-primary shadow-card"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
