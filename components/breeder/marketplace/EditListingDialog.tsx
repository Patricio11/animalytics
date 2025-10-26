"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ClinicSelector } from "./ClinicSelector";
import { categoryRequiresClinic, getCategoryLabel } from "@/lib/utils/marketplace";
import { CheckCircle, AlertCircle, Edit, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface EditListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  onSuccess?: () => void;
}

export function EditListingDialog({ open, onOpenChange, listingId, onSuccess }: EditListingDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: undefined as number | undefined,
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    contactLocation: '',
    availabilityNotes: '',
    clinicId: undefined as string | undefined,
    additionalImages: [] as string[],
  });

  // Fetch listing details
  const { data: listingData, isLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const response = await fetch(`/api/marketplace/listings/${listingId}`);
      if (!response.ok) throw new Error('Failed to fetch listing');
      return response.json();
    },
    enabled: open && !!listingId,
  });

  const listing = listingData?.listing;

  // Pre-fill form when listing data loads
  useEffect(() => {
    if (listing && open) {
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        price: listing.price ? listing.price / 100 : undefined, // Convert from cents
        contactName: listing.contactName || '',
        contactPhone: listing.contactPhone || '',
        contactEmail: listing.contactEmail || '',
        contactLocation: listing.location || '',
        availabilityNotes: listing.availabilityNotes || '',
        clinicId: listing.clinicId || undefined,
        additionalImages: listing.additionalImages || [],
      });
    }
  }, [listing, open]);

  const updateFormData = (field: keyof typeof formData, value: string | number | string[] | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const basicValid = !!(formData.title && formData.description && formData.contactName && formData.contactPhone && formData.contactEmail && formData.contactLocation);
    
    if (listing && categoryRequiresClinic(listing.category)) {
      return basicValid && !!formData.clinicId;
    }
    
    return basicValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/marketplace/listings/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? formData.price : null, // API will convert to cents
          contactLocation: formData.contactLocation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update listing');
      }

      toast({
        title: "Listing Updated!",
        description: "Your listing has been successfully updated.",
      });

      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Edit Listing</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Update your marketplace listing details
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : listing ? (
            <>
              {/* Listing Info */}
              <Alert className="border-chart-3/50 bg-chart-3/10">
                <CheckCircle className="h-4 w-4 text-chart-3" />
                <AlertDescription className="ml-2 text-sm">
                  <strong>Editing:</strong> {listing.animal?.name || 'Listing'} - <Badge variant="outline" className="ml-1">{getCategoryLabel(listing.category)}</Badge>
                </AlertDescription>
              </Alert>

              {/* Listing Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Listing Title *</Label>
                  <Input
                    id="title"
                    placeholder="E.g., Champion Golden Retriever Stud - Max"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    className="bg-background border-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your listing in detail..."
                    rows={6}
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    className="bg-background border-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (AUD)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={formData.price || ''}
                    onChange={(e) => updateFormData('price', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="bg-background border-primary/20 focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank if price is negotiable
                  </p>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Contact Name *</Label>
                    <Input
                      id="contact-name"
                      placeholder="Your name"
                      value={formData.contactName}
                      onChange={(e) => updateFormData('contactName', e.target.value)}
                      className="bg-background border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Phone Number *</Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      placeholder="+61 xxx xxx xxx"
                      value={formData.contactPhone}
                      onChange={(e) => updateFormData('contactPhone', e.target.value)}
                      className="bg-background border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email Address *</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.contactEmail}
                      onChange={(e) => updateFormData('contactEmail', e.target.value)}
                      className="bg-background border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-location">Location *</Label>
                    <Input
                      id="contact-location"
                      placeholder="City, State"
                      value={formData.contactLocation}
                      onChange={(e) => updateFormData('contactLocation', e.target.value)}
                      className="bg-background border-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability-notes">Availability Notes</Label>
                  <Textarea
                    id="availability-notes"
                    placeholder="E.g., Available weekdays after 5pm..."
                    rows={3}
                    value={formData.availabilityNotes}
                    onChange={(e) => updateFormData('availabilityNotes', e.target.value)}
                    className="bg-background border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Clinic Selector if needed */}
              {categoryRequiresClinic(listing.category) && (
                <ClinicSelector
                  value={formData.clinicId}
                  onChange={(clinicId) => updateFormData('clinicId', clinicId)}
                  required
                />
              )}

              {/* Additional Images */}
              <div className="space-y-3">
                <Label>Additional Images (Optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Add image URLs one per line. The animal's profile image will remain as the main image.
                </p>
                <Textarea
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  rows={4}
                  value={formData.additionalImages.join('\n')}
                  onChange={(e) => {
                    const urls = e.target.value.split('\n').filter(url => url.trim());
                    updateFormData('additionalImages', urls);
                  }}
                  className="bg-background border-primary/20 focus:border-primary font-mono text-sm"
                />
                {formData.additionalImages.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {formData.additionalImages.length} image(s)
                  </div>
                )}
              </div>

              {!validateForm() && (
                <Alert className="border-destructive/50 bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="ml-2 text-sm text-foreground">
                    All fields marked with * are required
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="ml-2 text-sm">
                Failed to load listing details
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-primary/10">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="hover:bg-primary/10 hover:border-primary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!validateForm() || isSubmitting}
              className="bg-gradient-brand hover:opacity-90 shadow-card"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
