"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image as ImageIcon, FileText, Eye, Download, Trash2, X, File, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadMultipleFiles, STORAGE_PATHS, FILE_VALIDATION } from "@/lib/supabase";
import type { SeoFileContext } from "@/lib/supabase/upload";

interface PhotosDocsTabProps {
  animalId: string;
  animalName?: string;
  breedName?: string;
  isOwner?: boolean;
}

type FileType = 'photo' | 'document';

type CategoryId = 'profile' | 'gallery' | 'shelter' | 'whelping_areas' | 'vaccinations' | 'pedigree' | 'council_registration' | 'parents' | 'baby_photos' | 'training' | 'shows' | 'health';

interface CategoryDefinition {
  id: CategoryId;
  name: string;
  description: string;
  icon: string;
  types: FileType[];
  limit: number;
}

const categoryDefinitions: CategoryDefinition[] = [
  { id: 'profile', name: 'Profile Photo', description: 'Main profile picture for this animal', icon: '📸', types: ['photo'], limit: 1 },
  { id: 'gallery', name: 'Gallery', description: 'General photos of this animal', icon: '🖼️', types: ['photo'], limit: 20 },
  { id: 'shelter', name: 'Shelter', description: 'Photos of living quarters and kennels', icon: '🏠', types: ['photo'], limit: 10 },
  { id: 'whelping_areas', name: 'Whelping Areas', description: 'Whelping box and maternity areas', icon: '🐾', types: ['photo'], limit: 10 },
  { id: 'vaccinations', name: 'Vaccinations', description: 'Vaccination records and certificates', icon: '💉', types: ['document'], limit: 10 },
  { id: 'pedigree', name: 'Pedigree', description: 'Pedigree certificates and lineage documents', icon: '📜', types: ['document'], limit: 10 },
  { id: 'council_registration', name: 'Council Registration', description: 'Registration papers and permits', icon: '📋', types: ['document'], limit: 10 },
  { id: 'parents', name: 'Parents', description: 'Photos of sire and dam', icon: '👨‍👩‍👦', types: ['photo'], limit: 10 },
  { id: 'baby_photos', name: 'Baby Photos', description: 'Puppy photos and early development', icon: '🍼', types: ['photo'], limit: 10 },
  { id: 'training', name: 'Training', description: 'Training sessions and activities', icon: '🎓', types: ['photo'], limit: 10 },
  { id: 'shows', name: 'Shows', description: 'Competition and show photos', icon: '🏆', types: ['photo'], limit: 10 },
  { id: 'health', name: 'Health Records', description: 'Health documents and records', icon: '⚕️', types: ['document'], limit: 10 },
];

export function PhotosDocsTab({ animalId, animalName, breedName, isOwner }: PhotosDocsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileType, setFileType] = useState<FileType>('photo');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('gallery');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch photos from API
  const { data: photosData, isLoading } = useQuery({
    queryKey: ['animal-photos', animalId],
    queryFn: async () => {
      const response = await fetch(`/api/animals/${animalId}/photos`);
      if (!response.ok) throw new Error('Failed to fetch photos');
      return response.json();
    },
  });

  // Handle upload with Supabase
  const handleUploadToSupabase = async (files: File[]) => {
    try {
      // Determine validation based on file type
      const validation = fileType === 'photo' ? FILE_VALIDATION.IMAGE : FILE_VALIDATION.DOCUMENT;
      
      // Build SEO context for file naming
      const seoContext: SeoFileContext = {
        animalName: animalName || undefined,
        breedName: breedName || undefined,
        category: selectedCategory,
      };

      // Upload files to Supabase with SEO-friendly names
      const results = await uploadMultipleFiles(
        files,
        STORAGE_PATHS.ANIMAL_PHOTOS,
        validation,
        seoContext
      );

      // Check for errors
      const errors = results.filter(r => !r.success);
      if (errors.length > 0) {
        throw new Error(`Failed to upload ${errors.length} file(s)`);
      }

      // Save each uploaded file to database
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const file = files[i];
        
        if (result.success && result.url) {
          const response = await fetch(`/api/animals/${animalId}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category: selectedCategory,
              fileUrl: result.url,
              fileName: file.name,
              fileSize: file.size,
              caption: caption || null,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save photo');
          }
        }
      }

      // Refresh photos list
      queryClient.invalidateQueries({ queryKey: ['animal-photos', animalId] });

      setUploadedFiles([]);
      setCaption('');

      toast({
        title: "Upload Successful!",
        description: `${results.length} file(s) uploaded to ${categoryDefinitions.find(c => c.id === selectedCategory)?.name}.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
    }
  };

  // Delete photo mutation
  const deleteMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const response = await fetch(`/api/animals/${animalId}/photos?photoId=${photoId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete photo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animal-photos', animalId] });
      toast({
        title: "Photo Deleted",
        description: "Photo deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete photo",
        variant: "destructive",
      });
    },
  });

  // Filter categories based on selected file type
  const filteredCategories = categoryDefinitions.filter(category =>
    category.types.includes(fileType)
  );

  // Handle file type change and auto-select first valid category
  const handleFileTypeChange = (newType: FileType) => {
    setFileType(newType);

    // Get first valid category for the new type
    const firstValidCategory = categoryDefinitions.find(cat =>
      cat.types.includes(newType)
    );

    if (firstValidCategory) {
      setSelectedCategory(firstValidCategory.id);
    }
  };

  // Get photos for a specific category
  const getCategoryPhotos = (categoryId: string) => {
    if (!photosData?.photos) return [];
    return photosData.photos.filter((p: any) => p.category === categoryId);
  };

  // Get current category info
  const currentCategory = categoryDefinitions.find(c => c.id === selectedCategory);
  const currentCategoryPhotos = getCategoryPhotos(selectedCategory);
  const remainingSlots = (currentCategory?.limit || 10) - currentCategoryPhotos.length;

  // Handle drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [fileType]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  }, [fileType]);

  const handleFiles = (files: File[]) => {
    // Validate file types
    const validFiles = files.filter(file => {
      if (fileType === 'photo') {
        return file.type.startsWith('image/');
      } else {
        return file.type === 'application/pdf' || file.type.startsWith('image/');
      }
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: fileType === 'photo'
          ? "Only image files are allowed for photos."
          : "Only PDF and image files are allowed for documents.",
        variant: "destructive",
      });
    }

    // Validate file size (30MB)
    const oversizedFiles = validFiles.filter(file => file.size > 30 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File Too Large",
        description: "Each file must be under 30MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    // Check category limit
    if (uploadedFiles.length > remainingSlots) {
      toast({
        title: "Category Limit Exceeded",
        description: `Only ${remainingSlots} slot(s) remaining in this category. Please select fewer files.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    await handleUploadToSupabase(uploadedFiles);
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      {/* Unified Upload Zone - Only show for owner */}
      {isOwner && (
      <Card className="shadow-card bg-surface border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Upload Photos & Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Type & Category Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="file-type">Type</Label>
              <Select value={fileType} onValueChange={handleFileTypeChange}>
                <SelectTrigger id="file-type" className="bg-background border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photo">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>Photo</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="document">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Document</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category
                {currentCategory && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {remainingSlots} of {currentCategory.limit} slots remaining
                  </Badge>
                )}
              </Label>
              <Select value={selectedCategory} onValueChange={(value: CategoryId) => setSelectedCategory(value)}>
                <SelectTrigger id="category" className="bg-background border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => {
                    const categoryPhotos = getCategoryPhotos(category.id);
                    const remaining = category.limit - categoryPhotos.length;
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium">{category.name}</div>
                            <div className="text-xs text-muted-foreground">{category.description}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {remaining}/{category.limit}
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 transition-all duration-200",
              isDragging
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-primary/20 hover:border-primary/40 hover:bg-surface-secondary"
            )}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              accept={fileType === 'photo' ? 'image/*' : 'image/*,application/pdf'}
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-center pointer-events-none">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-brand/10 flex items-center justify-center">
                {fileType === 'photo' ? (
                  <ImageIcon className="w-8 h-8 text-primary" />
                ) : (
                  <FileText className="w-8 h-8 text-primary" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {isDragging ? 'Drop files here' : 'Drag & drop files here'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse from your computer
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="bg-background">
                    {fileType === 'photo' ? 'JPG, PNG' : 'JPG, PNG, PDF'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="bg-background">
                    Max 30MB
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <Label>Selected Files ({uploadedFiles.length})</Label>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary border border-primary/10"
                  >
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="w-5 h-5 text-primary" />
                      ) : (
                        <File className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">
                        {file.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Caption (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption (Optional)</Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption or description..."
              className="bg-background border-primary/20"
            />
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={uploadedFiles.length === 0 || uploading || remainingSlots === 0}
            className="w-full bg-gradient-brand hover:opacity-90 shadow-card"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
              </>
            )}
          </Button>

          {remainingSlots === 0 && (
            <p className="text-sm text-destructive text-center">
              This category is full. Please select a different category or delete existing photos.
            </p>
          )}
        </CardContent>
      </Card>
      )}

      {/* Uploaded Files Gallery by Category */}
      {isLoading ? (
        <Card className="shadow-card border-0 bg-surface">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Loading photos...</p>
          </CardContent>
        </Card>
      ) : (
        categoryDefinitions.map((category) => {
          const photos = getCategoryPhotos(category.id);
          const photoCount = photos.length;
          const hasPhotos = photoCount > 0;

          if (!hasPhotos) return null;

          return (
            <Card key={category.id} className="shadow-card border-0 bg-surface">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{category.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {photoCount} / {category.limit}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo: any) => (
                    <div
                      key={photo.id}
                      className="relative group aspect-square rounded-lg overflow-hidden border border-primary/10 bg-background hover-elevate cursor-pointer"
                    >
                      <img
                        src={photo.fileUrl}
                        alt={photo.caption || category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:text-white hover:bg-white/20"
                          onClick={() => setSelectedImage(photo.fileUrl)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:text-white hover:bg-white/20"
                          onClick={() => window.open(photo.fileUrl, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        {isOwner && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:text-white hover:bg-destructive/80"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this photo?')) {
                                deleteMutation.mutate(photo.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {/* Caption */}
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <p className="text-xs text-white truncate">{photo.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Image Viewer Modal (placeholder) */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh]">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-12 right-0 text-white hover:text-white hover:bg-white/20"
              onClick={() => setSelectedImage(null)}
            >
              Close
            </Button>
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}