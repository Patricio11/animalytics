"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { uploadFile, FILE_VALIDATION, type UploadResult } from "@/lib/supabase/upload";
import { type StoragePath } from "@/lib/supabase/client";
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageUploadProps {
  /**
   * Storage path where the image will be uploaded
   */
  storagePath: StoragePath;
  
  /**
   * Callback when upload is successful
   */
  onUploadSuccess: (result: UploadResult) => void;
  
  /**
   * Callback when upload fails
   */
  onUploadError?: (error: string) => void;
  
  /**
   * Current image URL (for editing)
   */
  currentImageUrl?: string;
  
  /**
   * Maximum file size in MB (default: 5MB)
   */
  maxSizeInMB?: number;
  
  /**
   * Custom className for the container
   */
  className?: string;
  
  /**
   * Show preview of selected image
   */
  showPreview?: boolean;
  
  /**
   * Aspect ratio for preview (e.g., "square", "video", "auto")
   */
  aspectRatio?: "square" | "video" | "auto";
  
  /**
   * Label text
   */
  label?: string;
  
  /**
   * Helper text
   */
  helperText?: string;
  
  /**
   * Callback when a file is selected (before upload)
   */
  onFileSelect?: (file: File | null) => void;
  
  /**
   * Hide the manual upload button (useful when auto-uploading on form submit)
   */
  hideUploadButton?: boolean;
}

export function ImageUpload({
  storagePath,
  onUploadSuccess,
  onUploadError,
  currentImageUrl,
  maxSizeInMB = 5,
  className,
  showPreview = true,
  aspectRatio = "square",
  label = "Upload Image",
  helperText = "PNG, JPG, WEBP up to 5MB",
  onFileSelect,
  hideUploadButton = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "aspect-auto",
  }[aspectRatio];

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSelectedFile(file);
    onFileSelect?.(file); // Notify parent component

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [onFileSelect]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress (Supabase doesn't provide real-time progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await uploadFile(
        selectedFile,
        storagePath,
        { ...FILE_VALIDATION.IMAGE, maxSizeInMB }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.url) {
        onUploadSuccess(result);
        setPreviewUrl(result.url);
        setSelectedFile(null);
      } else {
        const errorMsg = result.error || 'Upload failed';
        setError(errorMsg);
        onUploadError?.(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      onUploadError?.(errorMsg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
    onFileSelect?.(null); // Notify parent component
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <div>
          <label className="text-sm font-medium">{label}</label>
          {helperText && (
            <p className="text-sm text-muted-foreground mt-1">{helperText}</p>
          )}
        </div>
      )}

      {/* Preview Area */}
      {showPreview && previewUrl && (
        <Card className="relative overflow-hidden">
          <div className={cn("relative w-full", aspectRatioClass)}>
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
            {!isUploading && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Upload Area */}
      {!previewUrl && (
        <div className="space-y-3">
          <Card
            className={cn(
              "border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer",
              aspectRatioClass
            )}
            onClick={handleButtonClick}
          >
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium mb-1">Click to upload image</p>
              <p className="text-xs text-muted-foreground">{helperText}</p>
            </div>
          </Card>
          
          {/* Camera Capture Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleCameraClick}
            className="w-full"
          >
            <Camera className="h-4 w-4 mr-2" />
            Take Photo with Camera
          </Button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={FILE_VALIDATION.IMAGE.allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Hidden Camera Input */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Button */}
      {!hideUploadButton && selectedFile && !isUploading && previewUrl && (
        <Button
          type="button"
          onClick={handleUpload}
          className="w-full"
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Image
        </Button>
      )}

      {/* Progress Bar */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uploading...</span>
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
