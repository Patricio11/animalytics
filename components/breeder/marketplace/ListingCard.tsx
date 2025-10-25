"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Eye, MapPin, Phone, Mail, Star, Award, Shield, Edit, Trash2, Share2 } from "lucide-react";
import { MarketplaceListing, getCategoryLabel } from "@/lib/mock-data/marketplace-listings";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";

interface ListingCardProps {
  listing: MarketplaceListing;
  onInterested?: (listingId: string) => void;
  isPublicView?: boolean;
  isOwner?: boolean;
  onEdit?: (listingId: string) => void;
  onDelete?: (listingId: string) => void;
}

export function ListingCard({ listing, onInterested, isPublicView, isOwner, onEdit, onDelete }: ListingCardProps) {
  const categoryConfig = {
    'dog-for-sale': { color: 'bg-chart-1 text-white', icon: '🐕' },
    'pups-for-sale': { color: 'bg-chart-3 text-white', icon: '🐶' },
    'reproductive-services': { color: 'bg-chart-4 text-white', icon: '💉' },
    'frozen-semen': { color: 'bg-chart-2 text-white', icon: '❄️' },
    'stud-dog': { color: 'bg-primary text-white', icon: '👑' },
  };

  const config = categoryConfig[listing.category];

  const statusConfig = {
    active: { color: 'bg-chart-3 text-white', label: 'Active' },
    pending: { color: 'bg-chart-4 text-white', label: 'Pending' },
    sold: { color: 'bg-muted text-muted-foreground', label: 'Sold' },
    expired: { color: 'bg-destructive text-white', label: 'Expired' },
  };

  const statusStyle = statusConfig[listing.status];
  
  // All routes now use unified marketplace
  const detailUrl = `/marketplace/${listing.id}`;

  // Handle share
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${detailUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: listing.description,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <Card className={cn(
      "shadow-card border-0 hover:shadow-elevated transition-all duration-200",
      listing.featured && "border-2 border-primary/20 bg-gradient-subtle"
    )}>
      <CardContent className="p-0">
        {/* Image */}
        <Link href={detailUrl}>
          <div className="relative aspect-video overflow-hidden rounded-t-lg bg-surface-secondary">
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            {listing.featured && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-gradient-brand text-white shadow-card">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Featured
                </Badge>
              </div>
            )}
            <div className="absolute top-3 right-3 flex gap-2">
              <Badge className={cn(config.color, "shadow-card")}>
                {config.icon} {getCategoryLabel(listing.category)}
              </Badge>
            </div>
            <div className="absolute bottom-3 left-3">
              <Badge className={cn(statusStyle.color, "shadow-card")}>
                {statusStyle.label}
              </Badge>
            </div>
          </div>
        </Link>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Title and Price */}
          <div className="space-y-2">
            <Link href={detailUrl}>
              <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors line-clamp-2">
                {listing.title}
              </h3>
            </Link>
            {listing.price && (
              <div className="text-2xl font-bold text-primary">
                ${listing.price.toLocaleString()} {listing.currency}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {listing.description}
          </p>

          {/* Animal Details */}
          {listing.breed && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                {listing.breed}
              </Badge>
              {listing.age && (
                <Badge variant="outline" className="text-xs">
                  {listing.age}
                </Badge>
              )}
              {listing.sex && (
                <Badge variant="outline" className="text-xs capitalize">
                  {listing.sex}
                </Badge>
              )}
              {listing.color && (
                <Badge variant="outline" className="text-xs">
                  {listing.color}
                </Badge>
              )}
            </div>
          )}

          {/* Health Badges */}
          {(listing.healthCertified || listing.championLines) && (
            <div className="flex gap-2">
              {listing.healthCertified && (
                <Badge className="text-xs bg-chart-3/10 text-chart-3 border-chart-3/20">
                  <Shield className="w-3 h-3 mr-1" />
                  Health Certified
                </Badge>
              )}
              {listing.championLines && (
                <Badge className="text-xs bg-chart-2/10 text-chart-2 border-chart-2/20">
                  <Award className="w-3 h-3 mr-1" />
                  Champion Lines
                </Badge>
              )}
            </div>
          )}

          {/* Breeder Info */}
          <div className="flex items-center gap-3 pt-2 border-t border-primary/10">
            <Avatar className="w-10 h-10">
              <AvatarImage src={listing.breederAvatar} alt={listing.breederName} />
              <AvatarFallback>{listing.breederName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium text-sm text-foreground">{listing.breederName}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {listing.contact.location}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-chart-2 fill-current" />
              <span className="text-sm font-medium text-foreground">{listing.breederReputation}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-primary/10">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {listing.views} views
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {listing.interested} interested
            </div>
            <div>
              {format(new Date(listing.createdAt), 'MMM dd, yyyy')}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isOwner ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1 hover:bg-primary/10 hover:border-primary shadow-card"
                  onClick={() => onEdit?.(listing.id)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="hover:bg-destructive/10 hover:border-destructive hover:text-destructive shadow-card"
                  onClick={() => onDelete?.(listing.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
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
                  onClick={handleShare}
                  title="Share listing"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                {!isPublicView && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="hover:bg-primary/10 hover:border-primary shadow-card"
                    onClick={() => onInterested?.(listing.id)}
                    title="Mark as interested"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}