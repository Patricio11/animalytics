"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image as ImageIcon, FileText, Eye, Download, Trash2, X, File } from "lucide-react";
import { PhotoCategory } from "@/lib/mock-data/animal-profile-details";
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PhotosDocsTabProps {
  animalId: string;
  photoCategories: PhotoCategory[];
}

type FileType = 'photo' | 'document';

type CategoryId = 'shelter' | 'whelping' | 'vaccinations' | 'pedigree' | 'registration' | 'parents' | 'baby';

interface CategoryDefinition {
  id: CategoryId;
  name: string;
  description: string;
  icon: string;
  types: FileType[]; // Which file types can be uploaded to this category
}

const categoryDefinitions: CategoryDefinition[] = [
  { id: 'shelter', name: 'Shelter', description: 'Photos of living quarters and kennels', icon: '🏠', types: ['photo'] },
  { id: 'whelping', name: 'Whelping Areas', description: 'Whelping box and maternity areas', icon: '🐾', types: ['photo'] },
  { id: 'vaccinations', name: 'Vaccinations', description: 'Vaccination records and certificates', icon: '💉', types: ['document'] },
  { id: 'pedigree', name: 'Pedigree', description: 'Pedigree certificates and lineage documents', icon: '📜', types: ['document'] },
  { id: 'registration', name: 'Council Registration', description: 'Registration papers and permits', icon: '📋', types: ['document'] },
  { id: 'parents', name: 'Parents', description: 'Photos of sire and dam', icon: '👨‍👩‍👦', types: ['photo'] },
  { id: 'baby', name: 'Baby Photos', description: 'Puppy photos and early development', icon: '🍼', types: ['photo'] },
];

export function PhotosDocsTab({ animalId, photoCategories }: PhotosDocsTabProps) {
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileType, setFileType] = useState<FileType>('photo');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('shelter');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');

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

  const getCategoryPhotos = (categoryId: string) => {
    const category = photoCategories.find(c => c.category.toLowerCase() === categoryId);
    return category?.photos || [];
  };

  const getTotalPhotos = (categoryId: string) => {
    return getCategoryPhotos(categoryId).length;
  };

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

  const handleUpload = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement actual upload logic
    console.log('Uploading files:', {
      animalId,
      fileType,
      category: selectedCategory,
      files: uploadedFiles,
      caption,
    });

    toast({
      title: "Upload Successful!",
      description: `${uploadedFiles.length} file(s) uploaded to ${categoryDefinitions.find(c => c.id === selectedCategory)?.name}.`,
    });

    // Reset form
    setUploadedFiles([]);
    setCaption('');
  };

  return (
    <div className="space-y-6">
      {/* Unified Upload Zone */}
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
                <span className="text-xs text-muted-foreground ml-2">
                  ({filteredCategories.length} {fileType === 'photo' ? 'photo' : 'document'} categories)
                </span>
              </Label>
              <Select value={selectedCategory} onValueChange={(value: CategoryId) => setSelectedCategory(value)}>
                <SelectTrigger id="category" className="bg-background border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs text-muted-foreground">{category.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
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
            disabled={uploadedFiles.length === 0}
            className="w-full bg-gradient-brand hover:opacity-90 shadow-card"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
          </Button>
        </CardContent>
      </Card>

      {/* Uploaded Files Gallery by Category */}
      {categoryDefinitions.map((category) => {
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
                  {photoCount} items
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-primary/10 bg-background hover-elevate cursor-pointer"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:text-white hover:bg-white/20"
                        onClick={() => setSelectedImage(photo.url)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:text-white hover:bg-white/20"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:text-white hover:bg-destructive/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
      })}

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