"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FILE_VALIDATION, type UploadResult } from "@/lib/supabase/upload";
import { type StoragePath } from "@/lib/supabase/client";
import { X, AlertCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface MultipleImageUploadProps {
  storagePath: StoragePath;
  onUploadSuccess: (results: UploadResult[]) => void;
  onUploadError?: (error: string) => void;
  onPendingFilesChange?: (files: File[]) => void; // Expose pending files
  currentImages?: string[];
  maxFiles?: number;
  maxSizeInMB?: number;
  className?: string;
  label?: string;
  helperText?: string;
}

interface ImagePreview {
  id: string;
  file?: File;
  url: string;
  uploaded: boolean;
}

export function MultipleImageUpload({
  storagePath,
  onUploadSuccess,
  onUploadError,
  onPendingFilesChange,
  currentImages = [],
  maxFiles = 10,
  maxSizeInMB = 5,
  className,
  label = "Upload Images",
  helperText = "PNG, JPG, WEBP up to 5MB each",
}: MultipleImageUploadProps) {
  const [previews, setPreviews] = useState<ImagePreview[]>(
    currentImages.map((url, index) => ({
      id: `existing-${index}`,
      url,
      uploaded: true,
    }))
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notify parent of pending files changes (in useEffect to avoid setState during render)
  useEffect(() => {
    const pendingFiles = previews.filter(p => !p.uploaded && p.file).map(p => p.file!);
    onPendingFilesChange?.(pendingFiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previews]); // Only depend on previews, not the callback

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setError(null);

    // Check max files limit
    if (previews.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // Create previews for new files
    const newPreviews: ImagePreview[] = [];
    
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({
          id: `new-${Date.now()}-${index}`,
          file,
          url: reader.result as string,
          uploaded: false,
        });

        // Update state when all files are read
        if (newPreviews.length === files.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [previews.length, maxFiles]);

  const handleRemove = (id: string) => {
    setPreviews(prev => prev.filter(p => p.id !== id));
    setError(null);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const pendingUploads = previews.filter(p => !p.uploaded).length;

  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <div>
          <label className="text-sm font-medium">{label}</label>
          {helperText && (
            <p className="text-sm text-muted-foreground mt-1">
              {helperText} (Max {maxFiles} images)
            </p>
          )}
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {previews.map((preview) => (
          <Card key={preview.id} className="relative overflow-hidden group">
            <div className="relative aspect-square">
              <Image
                src={preview.url}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized
              />
              {!preview.uploaded && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">Pending</span>
                </div>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(preview.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}

        {/* Add More Button */}
        {previews.length < maxFiles && (
          <Card
            className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer aspect-square"
            onClick={handleButtonClick}
          >
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-2">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs font-medium">Add Images</p>
            </div>
          </Card>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={FILE_VALIDATION.IMAGE.allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        multiple
      />

      {/* Status Message */}
      {pendingUploads > 0 && (
        <p className="text-sm text-muted-foreground">
          {pendingUploads} image{pendingUploads > 1 ? 's' : ''} ready to upload when you submit
        </p>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
