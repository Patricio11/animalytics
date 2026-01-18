"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, CheckCircle2, AlertCircle } from "lucide-react";
import { DocumentUploadCard } from "./DocumentUploadCard";

interface FourCornerPhotoUploadProps {
  onUpload: (file: File, documentType: string) => Promise<void>;
  uploadedPhotos?: {
    topLeft?: string;
    topRight?: string;
    bottomLeft?: string;
    bottomRight?: string;
  };
  status?: {
    topLeft?: 'pending' | 'approved' | 'rejected';
    topRight?: 'pending' | 'approved' | 'rejected';
    bottomLeft?: 'pending' | 'approved' | 'rejected';
    bottomRight?: 'pending' | 'approved' | 'rejected';
  };
}

export function FourCornerPhotoUpload({
  onUpload,
  uploadedPhotos = {},
  status = {},
}: FourCornerPhotoUploadProps) {
  const corners = [
    { key: 'topLeft', label: 'Top Left Corner', type: 'id_corner_tl' },
    { key: 'topRight', label: 'Top Right Corner', type: 'id_corner_tr' },
    { key: 'bottomLeft', label: 'Bottom Left Corner', type: 'id_corner_bl' },
    { key: 'bottomRight', label: 'Bottom Right Corner', type: 'id_corner_br' },
  ];

  const completedCount = Object.values(uploadedPhotos).filter(Boolean).length;
  const allApproved = corners.every(corner => 
    status[corner.key as keyof typeof status] === 'approved'
  );

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              4-Corner ID Verification Photos
              <Badge variant="secondary">{completedCount}/4</Badge>
            </CardTitle>
            <CardDescription className="mt-2">
              Take clear photos of your ID from all four corner angles to verify authenticity
            </CardDescription>
          </div>
          {allApproved && (
            <Badge className="bg-green-500 text-white">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              All Approved
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Instructions */}
        <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Photo Requirements
          </h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Place your ID on a flat, contrasting surface (e.g., dark ID on white paper)</li>
            <li>Ensure good lighting with no glare or shadows</li>
            <li>Take one photo from each corner angle (4 total photos)</li>
            <li>All text, holograms, and security features must be clearly visible</li>
            <li>Photos should show the full ID card in each shot</li>
          </ul>
        </div>

        {/* Visual Guide */}
        <div className="mb-6 p-4 rounded-lg bg-muted border">
          <h4 className="font-medium mb-3 text-center">Photo Angles Guide</h4>
          <div className="grid grid-cols-2 gap-4">
            {corners.map((corner, index) => (
              <div key={corner.key} className="text-center">
                <div className="aspect-video bg-background border-2 border-dashed rounded-lg flex items-center justify-center mb-2">
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">{corner.label}</p>
                  </div>
                </div>
                {uploadedPhotos[corner.key as keyof typeof uploadedPhotos] && (
                  <CheckCircle2 className="w-5 h-5 mx-auto text-green-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upload Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {corners.map((corner) => (
            <DocumentUploadCard
              key={corner.key}
              title={corner.label}
              description={`Photo of ID from ${corner.label.toLowerCase()} angle`}
              documentType={corner.type}
              required
              acceptedFormats={['image/jpeg', 'image/png', 'image/jpg']}
              maxSizeMB={5}
              uploadedUrl={uploadedPhotos[corner.key as keyof typeof uploadedPhotos]}
              status={status[corner.key as keyof typeof status]}
              onUpload={onUpload}
              allowCamera={true}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
