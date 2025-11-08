"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { uploadFile, FILE_VALIDATION, type UploadResult } from "@/lib/supabase/upload";
import { type StoragePath } from "@/lib/supabase/client";
import { Upload, X, FileText, Loader2, AlertCircle, File, Download, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentUploadProps {
  storagePath: StoragePath;
  onUploadSuccess: (result: UploadResult) => void;
  onUploadError?: (error: string) => void;
  currentDocumentUrl?: string;
  currentDocumentName?: string;
  maxSizeInMB?: number;
  className?: string;
  label?: string;
  helperText?: string;
  allowedTypes?: string[];
}

export function DocumentUpload({
  storagePath,
  onUploadSuccess,
  onUploadError,
  currentDocumentUrl,
  currentDocumentName,
  maxSizeInMB = 10,
  className,
  label = "Upload Document",
  helperText = "PDF, DOC, DOCX up to 10MB",
  allowedTypes,
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(currentDocumentUrl || null);
  const [documentName, setDocumentName] = useState<string | null>(currentDocumentName || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-8 w-8 text-green-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSelectedFile(file);
    setDocumentName(file.name);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const validationOptions = allowedTypes
        ? { ...FILE_VALIDATION.DOCUMENT, allowedTypes, maxSizeInMB }
        : { ...FILE_VALIDATION.DOCUMENT, maxSizeInMB };

      const result = await uploadFile(
        selectedFile,
        storagePath,
        validationOptions
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.url) {
        onUploadSuccess(result);
        setDocumentUrl(result.url);
        setDocumentName(selectedFile.name);
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
    setDocumentUrl(null);
    setDocumentName(null);
    setSelectedFile(null);
    setError(null);
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

  const handleCameraCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSelectedFile(file);
    setDocumentName(file.name);
  }, []);

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

      {/* Current Document Display */}
      {documentUrl && !selectedFile && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(documentName || '')}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{documentName}</p>
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  Download
                </a>
              </div>
            </div>
            {!isUploading && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Selected File Display */}
      {selectedFile && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(selectedFile.name)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            {!isUploading && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Upload Area */}
      {!documentUrl && !selectedFile && (
        <div className="space-y-3">
          <Card
            className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer"
            onClick={handleButtonClick}
          >
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium mb-1">Click to upload document</p>
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
        accept={allowedTypes?.join(',') || FILE_VALIDATION.DOCUMENT.allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Hidden Camera Input */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />

      {/* Upload Button */}
      {selectedFile && !isUploading && (
        <Button
          type="button"
          onClick={handleUpload}
          className="w-full"
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
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
