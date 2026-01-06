"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  MapPin,
  Mail,
  Phone,
  Heart,
  ShoppingBag,
  MessageSquare,
  Camera,
  Save,
  Check,
} from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { useToast } from "@/hooks/use-toast";

interface PetOwnerProfile {
  id: string;
  displayName: string;
  bio: string | null;
  avatar: string | null;
  location: {
    city?: string;
    state?: string;
    country: string;
  } | null;
  interestedBreeds: string[];
  budgetRange: {
    min?: number;
    max?: number;
    currency: string;
  } | null;
  lookingFor: string[];
  experienceLevel: string | null;
  totalPurchases: number;
  favoriteCount: number;
  inquiryCount: number;
  isVerified: boolean;
}

export default function PetOwnerProfilePage() {
  const { data: session } = authClient.useSession();
  const { toast } = useToast();
  const [profile, setProfile] = useState<PetOwnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    city: "",
    state: "",
    country: "",
    experienceLevel: "",
  });

  // Fetch profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/pet-owner/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
          setFormData({
            displayName: data.profile?.displayName || "",
            bio: data.profile?.bio || "",
            city: data.profile?.location?.city || "",
            state: data.profile?.location?.state || "",
            country: data.profile?.location?.country || "",
            experienceLevel: data.profile?.experienceLevel || "",
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, []);

  // Handle save
  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch('/api/pet-owner/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: formData.displayName,
          bio: formData.bio || null,
          location: {
            city: formData.city || undefined,
            state: formData.state || undefined,
            country: formData.country || 'US',
          },
          experienceLevel: formData.experienceLevel || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been saved successfully.",
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  // Get initials
  function getInitials(name: string) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Profile Header */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  {profile?.avatar ? (
                    <AvatarImage src={profile.avatar} />
                  ) : session?.user?.image ? (
                    <AvatarImage src={session.user.image} />
                  ) : null}
                  <AvatarFallback className="text-xl">
                    {getInitials(profile?.displayName || session?.user?.name || 'B')}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">
                    {profile?.displayName || session?.user?.name}
                  </h1>
                  {profile?.isVerified && (
                    <Badge variant="secondary" className="gap-1">
                      <Check className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                {profile?.location && (
                  <p className="text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {[profile.location.city, profile.location.state, profile.location.country]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Mail className="h-3 w-3" />
                  {session?.user?.email}
                </div>
              </div>
              <Button
                variant={isEditing ? "ghost" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold">{profile?.totalPurchases || 0}</p>
                <p className="text-xs text-muted-foreground">Purchases</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Heart className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold">{profile?.favoriteCount || 0}</p>
                <p className="text-xs text-muted-foreground">Saved</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold">{profile?.inquiryCount || 0}</p>
                <p className="text-xs text-muted-foreground">Inquiries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form or Display */}
        {isEditing ? (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Your display name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell sellers about yourself..."
                  rows={3}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Input
                  id="experience"
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                  placeholder="e.g., First-time pet owner, Experienced owner"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          profile?.bio && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{profile.bio}</p>
              </CardContent>
            </Card>
          )
        )}

        {/* Preferences */}
        {!isEditing && (profile?.interestedBreeds?.length > 0 || profile?.lookingFor?.length > 0) && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.interestedBreeds?.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Interested Breeds</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.interestedBreeds.map((breed) => (
                      <Badge key={breed} variant="secondary">{breed}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile?.lookingFor?.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Looking For</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.lookingFor.map((item) => (
                      <Badge key={item} variant="outline">{item}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile?.budgetRange && (
                <div>
                  <p className="text-sm font-medium mb-1">Budget Range</p>
                  <p className="text-muted-foreground">
                    {profile.budgetRange.min && `$${profile.budgetRange.min.toLocaleString()}`}
                    {profile.budgetRange.min && profile.budgetRange.max && ' - '}
                    {profile.budgetRange.max && `$${profile.budgetRange.max.toLocaleString()}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
