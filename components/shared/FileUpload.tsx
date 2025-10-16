'use client';

import { useUploadThing } from '@/lib/uploadthing';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  category: string;
  onUploadComplete: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
}

export function FileUpload({
  category,
  onUploadComplete,
  accept = 'image/*',
  maxSize = 30,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const { startUpload } = useUploadThing('animalImage', {
    onClientUploadComplete: (res) => {
      setUploading(false);
      if (res?.[0]?.url) {
        onUploadComplete(res[0].url);
        setPreview(res[0].url);
      }
    },
    onUploadError: (error) => {
      setUploading(false);
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  const processFile = async (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    // Show preview before upload
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    setUploading(true);
    await startUpload([file]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <Image
            src={preview}
            alt="Upload preview"
            width={200}
            height={200}
            className="rounded-lg object-cover"
          />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={() => setPreview(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={`file-upload-${category}`}
            disabled={uploading}
          />
          <label htmlFor={`file-upload-${category}`} className="cursor-pointer">
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max size: {maxSize}MB
                </p>
              </>
            )}
          </label>
        </div>
      )}
    </div>
  );
}
