"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Eye, MapPin, Star, Award, Shield, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface AnimalCardProps {
  animal: {
    id: string;
    name: string;
    breedName?: string;
    sex?: string;
    dateOfBirth?: string;
    profileImageUrl?: string;
    isChampion?: boolean;
    titles?: string[];
    healthStatus?: string;
    breederName?: string;
    breederSlug?: string;
    breederVerified?: boolean;
    breederPremium?: boolean;
    breederRating?: number;
    breederLocation?: {
      city?: string;
      state?: string;
      country?: string;
    };
  };
  featured?: boolean;
  onInterested?: (animalId: string) => void;
  isPublicView?: boolean;
}

export function AnimalCard({ animal, featured = false, onInterested, isPublicView = true }: AnimalCardProps) {
  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    
    if (years === 0) {
      return `${months} months`;
    } else if (years === 1 && months === 0) {
      return '1 year';
    } else if (months < 0) {
      return `${years - 1} years ${12 + months} months`;
    } else if (months === 0) {
      return `${years} years`;
    } else {
      return `${years} years ${months} months`;
    }
  };

  // Format location
  const formatLocation = () => {
    if (!animal.breederLocation) return 'Location not specified';
    const { city, state, country } = animal.breederLocation;
    const parts = [city, state, country].filter(Boolean);
    return parts.join(', ') || 'Location not specified';
  };

  // All routes now use unified marketplace
  const detailUrl = `/marketplace/${animal.id}`;

  // Sex icon
  const sexIcon = animal.sex === 'male' ? '♂' : animal.sex === 'female' ? '♀' : '';

  // Health status color
  const healthStatusConfig: Record<string, { color: string; label: string }> = {
    excellent: { color: 'bg-chart-3/10 text-chart-3 border-chart-3/20', label: 'Excellent Health' },
    good: { color: 'bg-chart-1/10 text-chart-1 border-chart-1/20', label: 'Good Health' },
    fair: { color: 'bg-chart-4/10 text-chart-4 border-chart-4/20', label: 'Fair Health' },
  };

  const healthConfig = animal.healthStatus ? healthStatusConfig[animal.healthStatus] : null;

  return (
    <Card className={cn(
      "shadow-card border-0 hover:shadow-elevated transition-all duration-200",
      featured && "border-2 border-primary/20 bg-gradient-subtle"
    )}>
      <CardContent className="p-0">
        {/* Image */}
        <Link href={detailUrl}>
          <div className="relative aspect-video overflow-hidden rounded-t-lg bg-surface-secondary">
            {animal.profileImageUrl ? (
              <img
                src={animal.profileImageUrl}
                alt={animal.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Heart className="w-16 h-16 text-muted-foreground opacity-20" />
              </div>
            )}
            
            {/* Featured Badge */}
            {featured && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-gradient-brand text-white shadow-card">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Featured
                </Badge>
              </div>
            )}
            
            {/* Top Right Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              {animal.isChampion && (
                <Badge className="bg-chart-2 text-white shadow-card">
                  <Award className="w-3 h-3 mr-1" />
                  Champion
                </Badge>
              )}
              {animal.breederPremium && (
                <Badge className="bg-gradient-brand text-white shadow-card">
                  Premium Breeder
                </Badge>
              )}
            </div>
            
            {/* Bottom Left - Breeding Status */}
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-chart-3 text-white shadow-card">
                Available for Breeding
              </Badge>
            </div>
          </div>
        </Link>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Title and Breed */}
          <div className="space-y-2">
            <Link href={detailUrl}>
              <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors line-clamp-1">
                {animal.name}
              </h3>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{animal.breedName || 'Unknown Breed'}</span>
              {animal.sex && (
                <>
                  <span>•</span>
                  <span className="capitalize">{sexIcon} {animal.sex}</span>
                </>
              )}
            </div>
          </div>

          {/* Age */}
          {animal.dateOfBirth && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {calculateAge(animal.dateOfBirth)}
            </div>
          )}

          {/* Titles */}
          {animal.titles && animal.titles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {animal.titles.slice(0, 4).map((title, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {title}
                </Badge>
              ))}
              {animal.titles.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{animal.titles.length - 4} more
                </Badge>
              )}
            </div>
          )}

          {/* Health Badges */}
          <div className="flex flex-wrap gap-2">
            {healthConfig && (
              <Badge className={cn("text-xs", healthConfig.color)}>
                <Shield className="w-3 h-3 mr-1" />
                {healthConfig.label}
              </Badge>
            )}
            {animal.isChampion && (
              <Badge className="text-xs bg-chart-2/10 text-chart-2 border-chart-2/20">
                <Award className="w-3 h-3 mr-1" />
                Champion Lines
              </Badge>
            )}
          </div>

          {/* Breeder Info */}
          <div className="flex items-center gap-3 pt-2 border-t border-primary/10">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-brand text-white">
                {animal.breederName?.charAt(0) || 'B'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-foreground truncate">
                  {animal.breederName || 'Unknown Breeder'}
                </span>
                {animal.breederVerified && (
                  <Badge className="text-xs bg-chart-3 text-white px-1.5 py-0">
                    ✓
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{formatLocation()}</span>
              </div>
            </div>
            {animal.breederRating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-chart-2 fill-current" />
                <span className="text-sm font-medium text-foreground">
                  {animal.breederRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              asChild
              className="flex-1 bg-gradient-brand hover:opacity-90 shadow-card"
            >
              <Link href={detailUrl}>
                View Details
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hover:bg-primary/10 hover:border-primary shadow-card"
              onClick={() => onInterested?.(animal.id)}
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
