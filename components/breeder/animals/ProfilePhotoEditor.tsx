"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { STORAGE_PATHS } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Camera, Upload as UploadIcon } from "lucide-react";

interface ProfilePhotoEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: string;
  animalName: string;
  currentPhotoUrl?: string;
}

export function ProfilePhotoEditor({
  open,
  onOpenChange,
  animalId,
  animalName,
  currentPhotoUrl,
}: ProfilePhotoEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!photoUrl) {
      toast({
        title: "No Photo Selected",
        description: "Please upload a photo before saving.",
        variant: "destructive",
      });
      return;
    }

    if (photoUrl === currentPhotoUrl) {
      toast({
        title: "No Changes",
        description: "The photo hasn't been changed.",
      });
      onOpenChange(false);
      return;
    }

    setIsUploading(true);

    try {
      // Delete old profile photo and add new one
      const photoResponse = await fetch(`/api/animals/${animalId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'profile',
          fileUrl: photoUrl,
          fileName: 'profile-photo.jpg',
        }),
      });

      if (!photoResponse.ok) {
        const errorData = await photoResponse.json();
        throw new Error(errorData.error || 'Failed to update photo');
      }

      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['animals', animalId] });
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      toast({
        title: "Profile Photo Updated!",
        description: `${animalName}'s profile photo has been updated successfully.`,
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to update profile photo:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setPhotoUrl(currentPhotoUrl || "");
      onOpenChange(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, WEBP).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Supabase
      const { uploadFile } = await import('@/lib/supabase');
      const result = await uploadFile(file, STORAGE_PATHS.ANIMAL_PHOTOS);
      
      if (result.url) {
        setPhotoUrl(result.url);
        toast({
          title: "Photo Uploaded",
          description: "Photo uploaded successfully. Click 'Update Photo' to save.",
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Update Profile Photo
          </DialogTitle>
          <DialogDescription>
            Upload a new profile photo for {animalName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Photo Preview/Upload Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Photo</label>
            <div className="relative">
              {photoUrl ? (
                <div className="relative aspect-square w-full rounded-lg overflow-hidden border-2 border-primary/20 bg-muted">
                  <img
                    src={photoUrl}
                    alt={animalName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      onClick={triggerFileInput}
                      disabled={isUploading}
                      className="bg-gradient-brand hover:opacity-90 text-white shadow-xl"
                    >
                      <UploadIcon className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="aspect-square w-full rounded-lg border-2 border-dashed border-primary/30 bg-muted/30 flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                  onClick={triggerFileInput}
                >
                  <div className="text-center p-6">
                    <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-2">
                      No photo selected
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerFileInput();
                      }}
                      disabled={isUploading}
                    >
                      <UploadIcon className="w-4 h-4 mr-2" />
                      Choose Photo
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Uploading photo...
                </span>
              ) : (
                "Recommended: Square image, at least 400x400px. Max 5MB (JPG, PNG, WEBP)"
              )}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUploading || !photoUrl}
            className="bg-gradient-brand hover:opacity-90"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Update Photo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
