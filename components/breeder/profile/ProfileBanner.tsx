"use client";

import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ProfileBannerProps {
  bannerUrl?: string | null;
  isEditing: boolean;
  onBannerChange?: (url: string) => void;
}

export function ProfileBanner({
  bannerUrl,
  isEditing,
  onBannerChange,
}: ProfileBannerProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleBannerClick = () => {
    if (!isEditing) return;
    // TODO: Open upload dialog
    console.log("Open banner upload dialog");
  };

  return (
    <div className="relative h-80 bg-gradient-brand overflow-hidden">
      {bannerUrl ? (
        <img
          src={bannerUrl}
          alt="Profile Banner"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
      )}
      
      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      {isEditing && (
        <Button
          size="sm"
          variant="secondary"
          className="absolute bottom-6 right-6 shadow-elevated"
          onClick={handleBannerClick}
          disabled={isUploading}
        >
          <Camera className="w-4 h-4 mr-2" />
          {isUploading ? "Uploading..." : "Change Banner"}
        </Button>
      )}
    </div>
  );
}
