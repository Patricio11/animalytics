"use client";

import { useState } from "react";
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
  });

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
    
    // Convert yearsInBusiness to number
    const dataToSubmit = {
      ...formData,
      yearsInBusiness: formData.yearsInBusiness ? parseInt(formData.yearsInBusiness.toString()) : null,
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
