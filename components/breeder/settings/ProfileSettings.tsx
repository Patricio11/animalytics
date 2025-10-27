"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Camera } from "lucide-react";
import { useAuth } from "@/lib/auth/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  kennel: string;
  location: string;
  bio: string;
  website: string;
}

export function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileData>({
    name: user?.name || "John Breeder",
    email: user?.email || "john@example.com",
    phone: "+27 12 345 6789",
    kennel: "Premium Kennels",
    location: "Johannesburg, South Africa",
    bio: "Professional dog breeder with 15 years of experience specializing in Golden Retrievers and Labradors.",
    website: "https://premiumkennels.co.za"
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // TODO: Implement API call to save profile
      // await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(profile),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
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
    // Reset to initial values or refetch from server
    setProfile({
      name: user?.name || "John Breeder",
      email: user?.email || "john@example.com",
      phone: "+27 12 345 6789",
      kennel: "Premium Kennels",
      location: "Johannesburg, South Africa",
      bio: "Professional dog breeder with 15 years of experience specializing in Golden Retrievers and Labradors.",
      website: "https://premiumkennels.co.za"
    });
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
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={profile.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="bg-background border-primary/20 focus:border-primary"
              data-testid="input-profile-location"
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
