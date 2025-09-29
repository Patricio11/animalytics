"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Image as ImageIcon, FileText, Eye, Download, Trash2 } from "lucide-react";
import { PhotoCategory } from "@/lib/mock-data/animal-profile-details";
import { useState } from "react";

interface PhotosDocsTabProps {
  animalId: string;
  photoCategories: PhotoCategory[];
}

const categoryDefinitions = [
  { id: 'shelter', name: 'Shelter', description: 'Photos of living quarters and kennels' },
  { id: 'whelping', name: 'Whelping Areas', description: 'Whelping box and maternity areas' },
  { id: 'vaccinations', name: 'Vaccinations', description: 'Vaccination records and certificates' },
  { id: 'pedigree', name: 'Pedigree', description: 'Pedigree certificates and lineage documents' },
  { id: 'registration', name: 'Council Registration', description: 'Registration papers and permits' },
  { id: 'parents', name: 'Parents', description: 'Photos of sire and dam' },
  { id: 'baby', name: 'Baby Photos', description: 'Puppy photos and early development' },
];

export function PhotosDocsTab({ animalId, photoCategories }: PhotosDocsTabProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const getCategoryPhotos = (categoryId: string) => {
    const category = photoCategories.find(c => c.category.toLowerCase() === categoryId);
    return category?.photos || [];
  };

  const getTotalPhotos = (categoryId: string) => {
    return getCategoryPhotos(categoryId).length;
  };

  return (
    <div className="space-y-6">
      {/* Upload Limit Notice */}
      <Card className="shadow-card border-primary/10 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Upload className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm">
              <strong className="text-foreground">Upload Guidelines:</strong>
              <span className="text-muted-foreground"> Maximum 10 items per category, 30MB per file. Supported formats: JPG, PNG, PDF</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      {categoryDefinitions.map((category) => {
        const photos = getCategoryPhotos(category.id);
        const photoCount = photos.length;
        const hasPhotos = photoCount > 0;

        return (
          <Card key={category.id} className="shadow-card border-primary/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <CardTitle className="text-base">{category.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {photoCount}/10
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-primary/10 hover:border-primary"
                  disabled={photoCount >= 10}
                >
                  <Upload className="w-3 h-3 mr-2" />
                  Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {hasPhotos ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative group aspect-square rounded-lg overflow-hidden border border-primary/10 bg-background"
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
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-primary/20 rounded-lg">
                  <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">No photos uploaded yet</p>
                  <Button variant="outline" className="hover:bg-primary/10 hover:border-primary">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload First Photo
                  </Button>
                </div>
              )}
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