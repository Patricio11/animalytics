"use client";

import { MapPin, Star, BadgeCheck, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedCheckmark } from "@/components/ui/verified-badge";
import Link from "next/link";

interface BreederCardProps {
  id: string;
  slug: string;
  displayName: string;
  tagline?: string | null;
  logoUrl?: string | null;
  location?: {
    city?: string;
    state?: string;
    country: string;
  } | null;
  primaryBreeds?: string[];
  averageRating?: string;
  totalReviews?: number;
  totalSales?: number;
  kycVerified?: boolean;
  premiumMember?: boolean;
  profileViews?: number;
  animalCount?: number;
}

export function BreederCard({
  slug,
  displayName,
  tagline,
  logoUrl,
  location,
  primaryBreeds = [],
  averageRating = "0.0",
  totalReviews = 0,
  totalSales = 0,
  kycVerified = false,
  premiumMember = false,
  profileViews = 0,
  animalCount = 0,
}: BreederCardProps) {
  const locationString = location
    ? [location.city, location.state, location.country].filter(Boolean).join(', ')
    : 'Location not specified';

  const rating = parseFloat(averageRating);

  // Build SEO-friendly marketing URL with tracking params
  const profileUrl = (() => {
    const params = new URLSearchParams();
    params.set('source', 'breeders-directory');
    if (primaryBreeds.length > 0) params.set('breed', primaryBreeds[0]);
    if (location?.country) params.set('location', location.country);
    return `/breeders/${slug}?${params.toString()}`;
  })();

  return (
    <Card className="shadow-card hover-elevate transition-all duration-200 group">
      <CardContent className="p-6">
        {/* Header with Avatar and Premium Badge */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-16 h-16 border-2 border-primary/10">
            <AvatarImage src={logoUrl || undefined} alt={displayName} />
            <AvatarFallback className="bg-gradient-brand text-white text-xl font-bold">
              {displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                    {displayName}
                  </h3>
                  {kycVerified && <VerifiedCheckmark isVerified={true} />}
                </div>
                {tagline && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {tagline}
                  </p>
                )}
              </div>
              {premiumMember && (
                <Badge className="bg-chart-2 text-white border-0 shrink-0">
                  Premium
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{locationString}</span>
        </div>

        {/* Breeds */}
        {primaryBreeds.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {primaryBreeds.slice(0, 3).map((breed) => (
              <Badge key={breed} variant="secondary" className="text-xs">
                {breed}
              </Badge>
            ))}
            {primaryBreeds.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{primaryBreeds.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-y">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-3.5 h-3.5 text-chart-2 fill-chart-2" />
              <span className="font-bold text-sm">{rating.toFixed(1)}</span>
            </div>
            <p className="text-xs text-muted-foreground">{totalReviews} reviews</p>
          </div>

          <div className="text-center border-x">
            <div className="font-bold text-sm mb-1">{animalCount}</div>
            <p className="text-xs text-muted-foreground">Animals</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-bold text-sm">{profileViews}</span>
            </div>
            <p className="text-xs text-muted-foreground">Views</p>
          </div>
        </div>

        {/* Verification Badge */}
        {kycVerified && (
          <div className="flex items-center gap-1.5 text-xs text-chart-3 mb-4">
            <BadgeCheck className="w-4 h-4" />
            <span className="font-medium">Verified Breeder</span>
          </div>
        )}

        {/* View Profile Button */}
        <Link href={profileUrl} className="block">
          <Button className="w-full bg-gradient-brand hover:opacity-90">
            View Profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
