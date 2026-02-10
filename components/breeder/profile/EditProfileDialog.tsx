"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/upload";
import { STORAGE_PATHS } from "@/lib/supabase";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: any;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  profile,
}: EditProfileDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    logoUrl: profile?.logoUrl || "",
    bannerUrl: profile?.bannerUrl || "",
    displayName: profile?.displayName || "",
    tagline: profile?.tagline || "",
    bio: profile?.bio || "",
    publicEmail: profile?.publicEmail || "",
    publicPhone: profile?.publicPhone || "",
    website: profile?.website || "",
    businessName: profile?.businessName || "",
    yearsInBusiness: profile?.yearsInBusiness || "",
    breedingPhilosophy: profile?.breedingPhilosophy || "",
    healthGuarantee: profile?.healthGuarantee || "",
    returnPolicy: profile?.returnPolicy || "",
    shippingPolicy: profile?.shippingPolicy || "",
    locationCity: profile?.location?.city || "",
    locationState: profile?.location?.state || "",
    locationCountry: profile?.location?.country || "",
  });

  // Reset form data when dialog opens or profile changes
  useEffect(() => {
    if (open && profile) {
      setFormData({
        logoUrl: profile.logoUrl || "",
        bannerUrl: profile.bannerUrl || "",
        displayName: profile.displayName || "",
        tagline: profile.tagline || "",
        bio: profile.bio || "",
        publicEmail: profile.publicEmail || "",
        publicPhone: profile.publicPhone || "",
        website: profile.website || "",
        businessName: profile.businessName || "",
        yearsInBusiness: profile.yearsInBusiness || "",
        breedingPhilosophy: profile.breedingPhilosophy || "",
        healthGuarantee: profile.healthGuarantee || "",
        returnPolicy: profile.returnPolicy || "",
        shippingPolicy: profile.shippingPolicy || "",
        locationCity: profile.location?.city || "",
        locationState: profile.location?.state || "",
        locationCountry: profile.location?.country || "",
      });
    }
  }, [open, profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/breeder/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["breeder-profile"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Normalize empty strings to null for optional fields
    const normalize = (val: string) => (val && val.trim() !== "" ? val.trim() : null);
    
    // Build location object
    const location = (formData.locationCity || formData.locationState || formData.locationCountry)
      ? {
          city: normalize(formData.locationCity) || undefined,
          state: normalize(formData.locationState) || undefined,
          country: formData.locationCountry?.trim() || 'Not specified',
        }
      : null;

    const dataToSubmit = {
      logoUrl: normalize(formData.logoUrl),
      bannerUrl: normalize(formData.bannerUrl),
      displayName: formData.displayName.trim(),
      tagline: normalize(formData.tagline),
      bio: normalize(formData.bio),
      publicEmail: normalize(formData.publicEmail),
      publicPhone: normalize(formData.publicPhone),
      website: normalize(formData.website),
      businessName: normalize(formData.businessName),
      yearsInBusiness: formData.yearsInBusiness ? parseInt(formData.yearsInBusiness.toString()) : null,
      breedingPhilosophy: normalize(formData.breedingPhilosophy),
      healthGuarantee: normalize(formData.healthGuarantee),
      returnPolicy: normalize(formData.returnPolicy),
      shippingPolicy: normalize(formData.shippingPolicy),
      location,
    };
    
    updateMutation.mutate(dataToSubmit);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your breeder profile information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              {/* Avatar Upload */}
              <div className="space-y-2">
                <ImageUpload
                  storagePath={STORAGE_PATHS.USER_AVATARS}
                  onUploadSuccess={(result) => {
                    handleChange("logoUrl", result.url!);
                  }}
                  currentImageUrl={formData.logoUrl || undefined}
                  label="Profile Logo/Avatar"
                  helperText="Upload your kennel logo or profile picture"
                  showPreview={true}
                  aspectRatio="square"
                  maxSizeInMB={2}
                />
              </div>

              {/* Banner Upload */}
              <div className="space-y-2">
                <ImageUpload
                  storagePath={STORAGE_PATHS.USER_AVATARS}
                  onUploadSuccess={(result) => {
                    handleChange("bannerUrl", result.url!);
                  }}
                  currentImageUrl={formData.bannerUrl || undefined}
                  label="Profile Banner"
                  helperText="Upload a banner image for your profile page (recommended: 1200x400)"
                  showPreview={true}
                  aspectRatio="video"
                  maxSizeInMB={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => handleChange("displayName", e.target.value)}
                  placeholder="Your Kennel Name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  placeholder="A short catchphrase about your kennel"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  placeholder="Tell us about your kennel and breeding philosophy..."
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="publicEmail">Public Email</Label>
                  <Input
                    id="publicEmail"
                    type="email"
                    value={formData.publicEmail}
                    onChange={(e) => handleChange("publicEmail", e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publicPhone">Public Phone</Label>
                  <Input
                    id="publicPhone"
                    type="tel"
                    value={formData.publicPhone}
                    onChange={(e) => handleChange("publicPhone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </TabsContent>

            <TabsContent value="business" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleChange("businessName", e.target.value)}
                  placeholder="Your Kennels LLC"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsInBusiness">Years in Business</Label>
                <Input
                  id="yearsInBusiness"
                  type="number"
                  min="0"
                  value={formData.yearsInBusiness}
                  onChange={(e) => handleChange("yearsInBusiness", e.target.value)}
                  placeholder="10"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Location</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="locationCity" className="text-xs text-muted-foreground">City</Label>
                    <Input
                      id="locationCity"
                      value={formData.locationCity}
                      onChange={(e) => handleChange("locationCity", e.target.value)}
                      placeholder="Cape Town"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="locationState" className="text-xs text-muted-foreground">State / Region</Label>
                    <Input
                      id="locationState"
                      value={formData.locationState}
                      onChange={(e) => handleChange("locationState", e.target.value)}
                      placeholder="Western Cape"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="locationCountry" className="text-xs text-muted-foreground">Country</Label>
                    <Input
                      id="locationCountry"
                      value={formData.locationCountry}
                      onChange={(e) => handleChange("locationCountry", e.target.value)}
                      placeholder="South Africa"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="breedingPhilosophy">Breeding Philosophy</Label>
                <Textarea
                  id="breedingPhilosophy"
                  value={formData.breedingPhilosophy}
                  onChange={(e) => handleChange("breedingPhilosophy", e.target.value)}
                  placeholder="Describe your approach to breeding..."
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="policies" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="healthGuarantee">Health Guarantee</Label>
                <Textarea
                  id="healthGuarantee"
                  value={formData.healthGuarantee}
                  onChange={(e) => handleChange("healthGuarantee", e.target.value)}
                  placeholder="Describe your health guarantee policy..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnPolicy">Return Policy</Label>
                <Textarea
                  id="returnPolicy"
                  value={formData.returnPolicy}
                  onChange={(e) => handleChange("returnPolicy", e.target.value)}
                  placeholder="Describe your return policy..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingPolicy">Shipping Policy</Label>
                <Textarea
                  id="shippingPolicy"
                  value={formData.shippingPolicy}
                  onChange={(e) => handleChange("shippingPolicy", e.target.value)}
                  placeholder="Describe your shipping/delivery policy..."
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-gradient-brand hover:opacity-90"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
