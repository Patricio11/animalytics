"use client";

import { use, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { Skeleton } from "@/components/ui/skeleton";
import { EditListingDialog } from "@/components/breeder/marketplace/EditListingDialog";
import {
  ArrowLeft, Heart, Share2, Eye, MapPin, Phone, Mail, Calendar,
  Star, Award, Shield, Building2, Edit, Trash2, LogIn
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CURRENCIES } from "@/lib/utils/currency";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ListingDetailPage({ params }: ListingDetailPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const { id } = use(params);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch listing from API
  const { data: listingData, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const response = await fetch(`/api/marketplace/listings/${id}`);
      if (!response.ok) throw new Error('Failed to fetch listing');
      return response.json();
    },
  });

  const listing = listingData?.listing;
  const isOwner = session?.user?.id === listing?.userId;
  const isAuthenticated = !!session;

  // Delete handler
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/marketplace/listings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete listing');

      toast({
        title: "Listing Deleted",
        description: "Your listing has been removed from the marketplace.",
      });

      router.push('/marketplace');
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/marketplace/${id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          text: listing?.description,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Listing link copied to clipboard!",
        });
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !listing) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
        <Card className="shadow-card bg-surface border-0 max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-6xl">🔍</div>
            <h2 className="text-xl font-bold text-foreground">Listing Not Found</h2>
            <p className="text-muted-foreground">The listing you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Button
              onClick={() => router.push('/marketplace')}
              className="bg-gradient-brand hover:opacity-90 shadow-card"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Category configuration
  const categoryConfig: Record<string, { color: string; icon: string; label: string }> = {
    'dog_for_sale': { color: 'bg-chart-1 text-white', icon: '🐕', label: 'Dog for Sale' },
    'pups_for_sale': { color: 'bg-chart-3 text-white', icon: '🐶', label: 'Pups for Sale' },
    'reproductive_services': { color: 'bg-chart-4 text-white', icon: '💉', label: 'Reproductive Services' },
    'frozen_semen': { color: 'bg-chart-2 text-white', icon: '❄️', label: 'Frozen Semen' },
    'stud_dog': { color: 'bg-primary text-white', icon: '👑', label: 'Stud Dog' },
  };

  const config = categoryConfig[listing.category] || categoryConfig.stud_dog;
  
  // Get images
  const images = listing.additionalImages?.length > 0 
    ? listing.additionalImages 
    : (() => {
        // Get profile photo from animal_photos table (category='profile') or fallback
        const profilePhoto = listing.animal?.photos?.find((p: any) => p.category === 'profile');
        const fallbackImage = profilePhoto?.fileUrl || 
                              listing.animal?.photos?.[0]?.fileUrl || 
                              '/placeholder-dog.jpg';
        return [fallbackImage];
      })();

  // Calculate age if dateOfBirth exists
  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;
    const birth = new Date(dateOfBirth);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    
    if (years === 0) return `${months} months`;
    if (years === 1 && months === 0) return '1 year';
    if (months < 0) return `${years - 1} years ${12 + months} months`;
    if (months === 0) return `${years} years`;
    return `${years} years ${months} months`;
  };

  const age = listing.animal?.dateOfBirth ? calculateAge(listing.animal.dateOfBirth) : null;

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Back Button & Owner Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/marketplace')}
            className="hover:bg-primary/10 hover:border-primary shadow-card"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>

          {/* Owner Actions - Show Edit/Delete buttons only for owners */}
          {isOwner && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(true)}
                className="gap-2 hover:bg-primary/10 hover:border-primary"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-2 text-destructive hover:bg-destructive/10 hover:border-destructive"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          )}
        </div>

        {/* Edit Listing Dialog */}
        {isOwner && (
          <EditListingDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            listingId={id}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['listing', id] });
            }}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-0">
                <div 
                  className="relative aspect-video overflow-hidden rounded-t-lg cursor-pointer group"
                  onClick={() => {
                    setLightboxIndex(0);
                    setLightboxOpen(true);
                  }}
                >
                  <img
                    src={images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <Eye className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  {listing.isFeatured && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-brand text-white shadow-card">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    </div>
                  )}
                  {isOwner && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-500 text-white shadow-card">
                        Your Listing
                      </Badge>
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="p-4 grid grid-cols-4 gap-2">
                    {images.slice(1).map((image: string, index: number) => (
                      <div 
                        key={index} 
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative"
                        onClick={() => {
                          setLightboxIndex(index + 1);
                          setLightboxOpen(true);
                        }}
                      >
                        <img 
                          src={image} 
                          alt={`Additional ${index + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Listing Details */}
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Badge className={cn(config.color, "shadow-card")}>
                      {config.icon} {config.label}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {listing.status}
                    </Badge>
                  </div>

                  <h1 className="text-3xl font-bold text-foreground">{listing.title}</h1>

                  {listing.price && (
                    <div className="text-4xl font-bold text-primary">
                      {CURRENCIES[listing.currency as keyof typeof CURRENCIES]?.symbol || listing.currency}
                      {(listing.price / 100).toLocaleString()} {listing.currency}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Animal Details */}
                {listing.breed && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Animal Details</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Breed</div>
                        <div className="font-medium text-foreground">{listing.breed}</div>
                      </div>
                      {listing.sex && (
                        <div>
                          <div className="text-sm text-muted-foreground">Sex</div>
                          <div className="font-medium text-foreground capitalize">{listing.sex}</div>
                        </div>
                      )}
                      {age && (
                        <div>
                          <div className="text-sm text-muted-foreground">Age</div>
                          <div className="font-medium text-foreground">{age}</div>
                        </div>
                      )}
                      {listing.animal?.name && (
                        <div>
                          <div className="text-sm text-muted-foreground">Animal Name</div>
                          <div className="font-medium text-foreground">{listing.animal.name}</div>
                        </div>
                      )}
                      {listing.color && (
                        <div>
                          <div className="text-sm text-muted-foreground">Color</div>
                          <div className="font-medium text-foreground">{listing.color}</div>
                        </div>
                      )}
                      {listing.registrationNumber && (
                        <div className="col-span-2">
                          <div className="text-sm text-muted-foreground">Registration</div>
                          <div className="font-medium text-foreground">{listing.registrationNumber}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Health Badges */}
                {(listing.healthCertified || listing.championLines) && (
                  <>
                    <Separator />
                    <div className="flex gap-2">
                      {listing.healthCertified && (
                        <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/20">
                          <Shield className="w-4 h-4 mr-2" />
                          Health Certified
                        </Badge>
                      )}
                      {listing.championLines && (
                        <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                          <Award className="w-4 h-4 mr-2" />
                          Champion Lines
                        </Badge>
                      )}
                    </div>
                  </>
                )}

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{listing.description}</p>
                </div>

                {/* Availability Notes */}
                {listing.availabilityNotes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">Availability</h3>
                      <p className="text-muted-foreground">{listing.availabilityNotes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Animal Info Card */}
            {listing.animal && (
              <Card className="shadow-card bg-surface border-0 overflow-hidden hover:shadow-lg transition-shadow">
                <Link 
                  href={`/animals/${listing.animal.id}`}
                  className="block group"
                >
                  <CardContent className="p-0">
                    <div className="flex gap-4 p-4">
                      {/* Animal Image */}
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        {listing.animal.profilePhotoUrl ? (
                          <img
                            src={listing.animal.profilePhotoUrl}
                            alt={listing.animal.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Award className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      {/* Animal Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {listing.animal.name}
                          </h3>
                          {listing.animal.registeredName && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {listing.animal.registeredName}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {listing.breed && (
                            <Badge variant="outline" className="text-xs">
                              {listing.breed}
                            </Badge>
                          )}
                          {listing.sex && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {listing.sex}
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-primary font-medium group-hover:underline">
                          View Profile →
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )}

            {/* Contact Card */}
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Contact Seller</h3>

                {!isAuthenticated && (
                  <Alert className="border-primary/50 bg-gradient-subtle">
                    <LogIn className="w-4 h-4 text-primary" />
                    <AlertDescription className="text-sm">
                      <Link href="/auth/signin" className="font-medium text-primary hover:underline">
                        Sign in
                      </Link> to view contact details and send messages.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  {listing.contactName && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Name</div>
                      <div className="font-medium text-foreground">{listing.contactName}</div>
                    </div>
                  )}

                  {listing.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Location</div>
                        <div className="font-medium text-foreground">{listing.location}</div>
                      </div>
                    </div>
                  )}

                  {isAuthenticated && listing.contactPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Phone</div>
                        <a href={`tel:${listing.contactPhone}`} className="font-medium text-foreground hover:underline">
                          {listing.contactPhone}
                        </a>
                      </div>
                    </div>
                  )}

                  {isAuthenticated && listing.contactEmail && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <a href={`mailto:${listing.contactEmail}`} className="font-medium text-foreground hover:underline break-all">
                          {listing.contactEmail}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {isAuthenticated && !isOwner ? (
                  <>
                    <Button className="w-full bg-gradient-brand hover:opacity-90 shadow-card">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 hover:bg-primary/10 hover:border-primary shadow-card">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 hover:bg-primary/10 hover:border-primary shadow-card"
                        onClick={handleShare}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : !isAuthenticated ? (
                  <Link href="/auth/signin">
                    <Button className="w-full bg-gradient-brand hover:opacity-90 shadow-card">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In to Contact
                    </Button>
                  </Link>
                ) : (
                  <>
                    {/* Owner - Only show share button */}
                    <Button 
                      variant="outline" 
                      className="w-full hover:bg-primary/10 hover:border-primary shadow-card"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Listing
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Breeder/Owner Info */}
            {isOwner ? (
              <Card className="shadow-card bg-surface border-0">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Your Listing</h3>

                  <Alert className="border-green-500/20 bg-green-500/10">
                    <Shield className="w-4 h-4 text-green-500" />
                    <AlertDescription className="text-sm">
                      This is your listing. You can edit or delete it using the buttons above.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline" className="capitalize">{listing.status}</Badge>
                    </div>
                    {listing.publishedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Published</span>
                        <span className="font-medium text-foreground">
                          {format(new Date(listing.publishedAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                    {listing.updatedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span className="font-medium text-foreground">
                          {format(new Date(listing.updatedAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-card bg-surface border-0">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Seller Information</h3>
                  
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={listing.breederAvatar} />
                      <AvatarFallback className="bg-gradient-brand text-white">
                        {listing.contactName?.charAt(0) || 'B'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-foreground">{listing.contactName || 'Breeder'}</div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 text-chart-2 fill-current" />
                        <span>4.5</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span>Views</span>
                  </div>
                  <span className="font-medium text-foreground">{listing.viewCount || 0}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    <span>Interested</span>
                  </div>
                  <span className="font-medium text-foreground">{listing.interestedCount || 0}</span>
                </div>

                {listing.createdAt && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Posted</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {format(new Date(listing.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={images}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </div>
  );
}
