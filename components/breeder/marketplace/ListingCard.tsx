"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { Heart, Eye, MapPin, Phone, Mail, Star, Award, Shield, Trash2, Share2, Zap } from "lucide-react";
import { VerifiedCheckmark } from "@/components/ui/verified-badge";
import { BoostListingDialog } from "@/components/marketplace/BoostListingDialog";
import type { MarketplaceListing } from "@/lib/types/marketplace";
import { getCategoryLabel } from "@/lib/utils/marketplace";
import { CURRENCIES } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";

interface ListingCardProps {
  listing: MarketplaceListing;
  onInterested?: (listingId: string) => void;
  isPublicView?: boolean;
  isOwner?: boolean;
  isSaved?: boolean;
  isBoosted?: boolean;
  onDelete?: (listingId: string) => void;
}

export function ListingCard({ listing, onInterested, isPublicView, isOwner, isSaved, isBoosted, onDelete }: ListingCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBoostDialog, setShowBoostDialog] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete?.(listing.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete listing:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const categoryConfig: Record<string, { color: string; icon: string }> = {
    'dog-for-sale': { color: 'bg-chart-1 text-white', icon: '🐕' },
    'pups-for-sale': { color: 'bg-chart-3 text-white', icon: '🐶' },
    'reproductive-services': { color: 'bg-chart-4 text-white', icon: '💉' },
    'frozen-semen': { color: 'bg-chart-2 text-white', icon: '❄️' },
    'stud-dog': { color: 'bg-primary text-white', icon: '👑' },
    'other': { color: 'bg-muted text-white', icon: '📦' },
  };

  const config = categoryConfig[listing.category];

  const statusConfig = {
    active: { color: 'bg-chart-3 text-white', label: 'Active' },
    pending: { color: 'bg-chart-4 text-white', label: 'Pending' },
    sold: { color: 'bg-muted text-muted-foreground', label: 'Sold' },
    expired: { color: 'bg-destructive text-white', label: 'Expired' },
  };

  const statusStyle = statusConfig[listing.status];
  
  // All routes now use unified marketplace (SEO-friendly slug with SEO query params)
  const queryParams = new URLSearchParams();
  queryParams.append('source', 'marketplace');
  if (listing.breed) queryParams.append('breed', listing.breed);
  if (listing.contact?.location) queryParams.append('location', listing.contact.location);
  const detailUrl = `/marketplace/${listing.slug || listing.id}?${queryParams.toString()}`;

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
      listing.featured && "border-2 border-primary/20 bg-gradient-subtle",
      isBoosted && "ring-2 ring-primary/40 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5"
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
            <div className="absolute bottom-3 left-3 flex gap-2">
              <Badge className={cn(statusStyle.color, "shadow-card")}>
                {statusStyle.label}
              </Badge>
              {isBoosted && (
                <Badge className="bg-gradient-brand text-white shadow-card">
                  <Zap className="w-3 h-3 mr-1 fill-current" />
                  Boosted
                </Badge>
              )}
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
                {CURRENCIES[listing.currency as keyof typeof CURRENCIES]?.symbol || listing.currency}
                {listing.price.toLocaleString()} {listing.currency}
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
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-sm text-foreground">{listing.breederName}</span>
                {listing.breederVerified && <VerifiedCheckmark isVerified={true} className="w-3.5 h-3.5" />}
              </div>
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
                  asChild
                  className="flex-1 bg-gradient-brand hover:opacity-90 shadow-card"
                >
                  <Link href={detailUrl}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Listing
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "shadow-card transition-all duration-200",
                    isBoosted
                      ? "bg-primary/10 border-primary text-primary"
                      : "hover:bg-primary/10 hover:border-primary hover:text-primary"
                  )}
                  onClick={() => setShowBoostDialog(true)}
                  title={isBoosted ? "Currently boosted" : "Boost listing"}
                >
                  <Zap className={cn("w-4 h-4", isBoosted && "fill-current")} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:bg-destructive/10 hover:border-destructive hover:text-destructive shadow-card"
                  onClick={handleDeleteClick}
                  title="Delete listing"
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
                    className={cn(
                      "shadow-card transition-all duration-200",
                      isSaved
                        ? "bg-red-50 border-red-300 text-red-500 hover:bg-red-100 hover:border-red-400 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400"
                        : "hover:bg-primary/10 hover:border-primary"
                    )}
                    onClick={() => onInterested?.(listing.id)}
                    title={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={cn("w-4 h-4", isSaved && "fill-current")} />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>

      {/* Boost Dialog */}
      {isOwner && (
        <BoostListingDialog
          listingId={listing.id}
          listingTitle={listing.title}
          open={showBoostDialog}
          onOpenChange={setShowBoostDialog}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Listing"
        itemName={listing.title}
        description="Are you sure you want to delete this listing? This action cannot be undone and all associated data will be permanently removed."
        isLoading={isDeleting}
      />
    </Card>
  );
}