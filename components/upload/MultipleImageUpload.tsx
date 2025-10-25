"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { uploadMultipleFiles, FILE_VALIDATION, type UploadResult } from "@/lib/supabase/upload";
import { type StoragePath } from "@/lib/supabase/client";
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface MultipleImageUploadProps {
  storagePath: StoragePath;
  onUploadSuccess: (results: UploadResult[]) => void;
  onUploadError?: (error: string) => void;
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
  currentImages = [],
  maxFiles = 10,
  maxSizeInMB = 5,
  className,
  label = "Upload Images",
  helperText = "PNG, JPG, WEBP up to 5MB each",
}: MultipleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previews, setPreviews] = useState<ImagePreview[]>(
    currentImages.map((url, index) => ({
      id: `existing-${index}`,
      url,
      uploaded: true,
    }))
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleUpload = async () => {
    const filesToUpload = previews
      .filter(p => !p.uploaded && p.file)
      .map(p => p.file!);

    if (filesToUpload.length === 0) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const results = await uploadMultipleFiles(
        filesToUpload,
        storagePath,
        { ...FILE_VALIDATION.IMAGE, maxSizeInMB }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Check for errors
      const errors = results.filter(r => !r.success);
      if (errors.length > 0) {
        const errorMsg = `Failed to upload ${errors.length} image(s)`;
        setError(errorMsg);
        onUploadError?.(errorMsg);
      }

      // Update previews to mark as uploaded
      const successUrls = results.filter(r => r.success).map(r => r.url!);
      setPreviews(prev =>
        prev.map(p => {
          if (!p.uploaded && p.file) {
            const resultIndex = filesToUpload.indexOf(p.file);
            if (resultIndex !== -1 && results[resultIndex].success) {
              return { ...p, url: results[resultIndex].url!, uploaded: true };
            }
          }
          return p;
        })
      );

      onUploadSuccess(results.filter(r => r.success));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      onUploadError?.(errorMsg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

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
              {!isUploading && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(preview.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
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

      {/* Upload Button */}
      {pendingUploads > 0 && !isUploading && (
        <Button
          type="button"
          onClick={handleUpload}
          className="w-full"
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload {pendingUploads} Image{pendingUploads > 1 ? 's' : ''}
        </Button>
      )}

      {/* Progress Bar */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uploading {pendingUploads} image(s)...</span>
            <span className="font-medium">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
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
