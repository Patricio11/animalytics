"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, CheckCircle2, XCircle, AlertCircle, Trash2, Eye, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface DocumentUploadCardProps {
  title: string;
  description: string;
  documentType: string;
  required?: boolean;
  acceptedFormats?: string[];
  maxSizeMB?: number;
  uploadedUrl?: string;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  onUpload: (file: File, documentType: string) => Promise<void>;
  onRemove?: () => void;
  allowCamera?: boolean;
  multiplePhotos?: boolean; // For 4-corner ID photos
  cornerLabels?: string[]; // e.g., ['Top Left', 'Top Right', 'Bottom Left', 'Bottom Right']
}

export function DocumentUploadCard({
  title,
  description,
  documentType,
  required = false,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  maxSizeMB = 10,
  uploadedUrl,
  status,
  rejectionReason,
  onUpload,
  onRemove,
  allowCamera = true,
  multiplePhotos = false,
  cornerLabels,
}: DocumentUploadCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(uploadedUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      setError(`Invalid file type. Accepted formats: ${acceptedFormats.join(', ')}`);
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Upload file
    setIsUploading(true);
    try {
      await onUpload(file, documentType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    if (onRemove) {
      onRemove();
    }
  };

  const getStatusBadge = () => {
    if (!status) return null;

    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );
    }
  };

  return (
    <Card className={cn(
      "shadow-card transition-all",
      status === 'rejected' && "border-destructive",
      status === 'approved' && "border-green-500"
    )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {title}
              {required && <Badge variant="secondary" className="text-xs">Required</Badge>}
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview */}
        {previewUrl && (
          <div className="relative rounded-lg overflow-hidden border bg-muted">
            {previewUrl.endsWith('.pdf') ? (
              <div className="p-8 text-center">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">PDF Document</p>
              </div>
            ) : (
              <div className="relative aspect-video">
                <Image
                  src={previewUrl}
                  alt={title}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => window.open(previewUrl, '_blank')}
              >
                <Eye className="w-4 h-4" />
              </Button>
              {onRemove && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRemove}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Upload Buttons */}
        {!previewUrl && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload File'}
              </Button>
              {allowCamera && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <p className="text-xs text-muted-foreground text-center">
              Max size: {maxSizeMB}MB • Formats: {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Rejection Reason */}
        {status === 'rejected' && rejectionReason && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive">
            <p className="text-sm font-medium text-destructive mb-1">Rejection Reason:</p>
            <p className="text-sm text-destructive/80">{rejectionReason}</p>
          </div>
        )}

        {/* Helper Text for 4-Corner Photos */}
        {multiplePhotos && cornerLabels && !previewUrl && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">📸 4-Corner Photo Instructions:</p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Place your ID on a flat, well-lit surface</li>
              <li>Take clear photos from each corner angle</li>
              <li>Ensure all text and details are readable</li>
              <li>Avoid glare and shadows</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
