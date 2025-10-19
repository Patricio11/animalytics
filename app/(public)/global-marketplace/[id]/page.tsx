"use client";

import { use, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import {
  ArrowLeft, Heart, Share2, Eye, MapPin, Phone, Mail, Calendar,
  Star, Award, Shield, Building2, LogIn
} from "lucide-react";
import { mockMarketplaceListings, getClinicById, getCategoryLabel } from "@/lib/mock-data/marketplace-listings";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PublicListingDetailPage({ params }: ListingDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const listing = mockMarketplaceListings.find(l => l.id === id);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!listing) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
        <Card className="shadow-card bg-surface border-0 max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-6xl">🔍</div>
            <h2 className="text-xl font-bold text-foreground">Listing Not Found</h2>
            <p className="text-muted-foreground">The listing you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Button
              onClick={() => router.push('/global-marketplace')}
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

  const categoryConfig = {
    'dog-for-sale': { color: 'bg-chart-1 text-white', icon: '🐕' },
    'pups-for-sale': { color: 'bg-chart-3 text-white', icon: '🐶' },
    'reproductive-services': { color: 'bg-chart-4 text-white', icon: '💉' },
    'frozen-semen': { color: 'bg-chart-2 text-white', icon: '❄️' },
    'stud-dog': { color: 'bg-primary text-white', icon: '👑' },
  };

  const config = categoryConfig[listing.category];
  const clinic = listing.clinicId ? getClinicById(listing.clinicId) : undefined;

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push('/global-marketplace')}
          className="hover:bg-primary/10 hover:border-primary shadow-card"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>

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
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <Eye className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  {listing.featured && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-brand text-white shadow-card">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>
                {listing.images.length > 1 && (
                  <div className="p-4 grid grid-cols-4 gap-2">
                    {listing.images.slice(1).map((image, index) => (
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
                      {config.icon} {getCategoryLabel(listing.category)}
                    </Badge>
                  </div>

                  <h1 className="text-3xl font-bold text-foreground">{listing.title}</h1>

                  {listing.price && (
                    <div className="text-4xl font-bold text-primary">
                      ${listing.price.toLocaleString()} {listing.currency}
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
                      {listing.age && (
                        <div>
                          <div className="text-sm text-muted-foreground">Age</div>
                          <div className="font-medium text-foreground">{listing.age}</div>
                        </div>
                      )}
                      {listing.color && (
                        <div>
                          <div className="text-sm text-muted-foreground">Color</div>
                          <div className="font-medium text-foreground">{listing.color}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{listing.description}</p>
                </div>

                {/* Health & Certifications */}
                {(listing.healthCertified || listing.championLines) && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">Health & Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {listing.healthCertified && (
                          <Badge className="text-sm bg-chart-3/10 text-chart-3 border-chart-3/20">
                            <Shield className="w-4 h-4 mr-1" />
                            Health Certified
                          </Badge>
                        )}
                        {listing.championLines && (
                          <Badge className="text-sm bg-chart-2/10 text-chart-2 border-chart-2/20">
                            <Award className="w-4 h-4 mr-1" />
                            Champion Lines
                          </Badge>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Stats */}
                <Separator />
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {listing.views} views
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {listing.interested} interested
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Posted {format(new Date(listing.createdAt), 'MMM dd, yyyy')}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Authentication Gate - Sign In to Contact */}
            <Card className="shadow-elevated bg-gradient-to-br from-primary/5 to-chart-2/5 border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center mx-auto">
                    <LogIn className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg">Sign In to Contact Breeder</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a free account or sign in to contact this breeder and make an offer
                  </p>
                </div>
                <div className="space-y-2">
                  <Link href="/auth/signup" className="block">
                    <Button className="w-full bg-gradient-brand hover:opacity-90 shadow-card">
                      Create Free Account
                    </Button>
                  </Link>
                  <Link href="/auth/signin" className="block">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Breeder Info */}
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg text-foreground">Breeder Information</h3>
                
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={listing.breederAvatar} alt={listing.breederName} />
                    <AvatarFallback>{listing.breederName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{listing.breederName}</div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {listing.contact.location}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-chart-2 fill-current" />
                      <span className="text-sm font-medium text-foreground">{listing.breederReputation}</span>
                      <span className="text-xs text-muted-foreground">rating</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span className="blur-sm select-none">+1 (555) 123-4567</span>
                    <Badge variant="outline" className="text-xs">Sign in to view</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="blur-sm select-none">breeder@example.com</span>
                    <Badge variant="outline" className="text-xs">Sign in to view</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clinic Info (if applicable) - Commented out due to type mismatch */}
            {/* {clinic && (
              <Card className="shadow-card bg-surface border-0">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Veterinary Clinic
                  </h3>
                  
                  <div>
                    <div className="font-medium text-foreground">{clinic.name}</div>
                  </div>
                </CardContent>
              </Card>
            )} */}

            {/* Share & Actions */}
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-6 space-y-3">
                <Button variant="outline" className="w-full" disabled>
                  <Heart className="w-4 h-4 mr-2" />
                  Save (Sign in required)
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Listing
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={listing.images}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        alt={listing.title}
      />
    </div>
  );
}
