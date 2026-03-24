'use client';

import { use, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, Heart, Share2, MapPin, Calendar, Award, Shield,
  Activity, Dog, Cake, Weight, Ruler, Eye, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';

interface PublicProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function PublicProfileClient({ params }: PublicProfilePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = use(params);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Get query params for SEO/marketing
  const source = searchParams.get('source'); // e.g., 'marketplace', 'search'
  const breed = searchParams.get('breed');
  const location = searchParams.get('location');

  // Fetch public animal profile
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-animal', id, breed, location],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (breed) params.append('breed', breed);
      if (location) params.append('location', location);
      
      const response = await fetch(`/api/animals/${id}/public?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('Animal not found');
        throw new Error('Failed to fetch animal profile');
      }
      return response.json();
    },
  });

  const animal = data?.animal;

  // Identify profile photo using same logic as authenticated profile
  const profilePhoto = animal?.photos?.find((p: any) => p.category === 'profile');
  const primaryPhoto = profilePhoto?.fileUrl || animal?.photos?.[0]?.fileUrl || animal?.profileImageUrl || null;
  
  // Prepare photo gallery - profile image first, then all non-profile photos
  const allPhotos = animal?.photos
    ? [
        primaryPhoto,
        ...animal.photos.filter((p: any) => p.category !== 'profile').map((p: any) => p.fileUrl)
      ].filter((url: string | undefined) => url)
    : primaryPhoto ? [primaryPhoto] : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
          <Skeleton className="h-10 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-card">
          <CardContent className="p-6 text-center space-y-4">
            <Dog className="w-16 h-16 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Animal Not Found</h2>
            <p className="text-muted-foreground">
              This animal profile is not available or has been removed.
            </p>
            <Button onClick={() => router.push('/marketplace')} className="w-full">
              Browse Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => source === 'marketplace' ? router.push('/marketplace') : router.back()}
          className="hover:bg-primary/10 hover:border-primary shadow-card"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {source === 'marketplace' ? 'Back to Marketplace' : 'Back'}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-0">
                <div 
                  className={cn(
                    "relative aspect-video overflow-hidden rounded-t-lg bg-black/5",
                    primaryPhoto ? "cursor-pointer group" : ""
                  )}
                  onClick={() => {
                    if (!primaryPhoto) return;
                    setLightboxIndex(0);
                    setLightboxOpen(true);
                  }}
                >
                  {primaryPhoto ? (
                    <>
                      <img
                        src={primaryPhoto}
                        alt={animal.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <Eye className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-subtle">
                      <Dog className="w-24 h-24 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Photo Gallery - Show additional photos (non-profile) */}
                {animal.photos && animal.photos.filter((p: any) => p.category !== 'profile').length > 0 && (
                  <div className="p-4">
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                      Photo Gallery ({animal.photos.filter((p: any) => p.category !== 'profile').length} photos)
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {animal.photos
                        .filter((p: any) => p.category !== 'profile')
                        .map((photo: any, index: number) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                            onClick={() => {
                              // +1 because profile image is at index 0 in allPhotos
                              setLightboxIndex(index + 1);
                              setLightboxOpen(true);
                            }}
                          >
                            <img 
                              src={photo.fileUrl} 
                              alt={`${animal.name} ${index + 1}`} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="shadow-card bg-surface border-0">
              <CardHeader className="border-b border-primary/10 bg-gradient-subtle">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  About {animal.registeredName || animal.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {animal.description ? (
                  <p className="text-muted-foreground leading-relaxed">{animal.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">No description available.</p>
                )}

                {animal.temperament && (
                  <div>
                    <h4 className="font-semibold mb-2">Temperament</h4>
                    <div className="flex flex-wrap gap-2">
                      {animal.temperament.split(',').map((trait: string, i: number) => (
                        <Badge key={i} variant="outline">{trait.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {animal.achievements && animal.achievements.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" />
                      Achievements & Titles
                    </h4>
                    <ul className="space-y-1">
                      {animal.achievements.map((achievement: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Basic Info Card */}
            <Card className="shadow-card bg-surface border-0">
              <CardHeader className="border-b border-primary/10 bg-gradient-subtle">
                <CardTitle className="text-xl">{animal.registeredName || animal.name}</CardTitle>
                {animal.registeredName && animal.name && (
                  <p className="text-sm text-muted-foreground font-normal mt-1 italic">
                    Call name: {animal.name}
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Breed */}
                {animal.breed && (
                  <div className="flex items-center gap-3">
                    <Dog className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Breed</p>
                      <p className="font-medium truncate">{animal.breed.name}</p>
                    </div>
                  </div>
                )}

                {/* Sex */}
                {animal.sex && (
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Sex</p>
                      <p className="font-medium capitalize">{animal.sex}</p>
                    </div>
                  </div>
                )}

                {/* Date of Birth */}
                {animal.dateOfBirth && (
                  <div className="flex items-center gap-3">
                    <Cake className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">{format(new Date(animal.dateOfBirth), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                )}

                {/* Registration Number */}
                {animal.registrationNumber && (
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Registration</p>
                      <p className="font-medium truncate">{animal.registrationNumber}</p>
                    </div>
                  </div>
                )}

                {/* Color */}
                {animal.color && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-primary flex-shrink-0" 
                         style={{ backgroundColor: animal.colorHex || '#888' }} 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Color</p>
                      <p className="font-medium">{animal.color}</p>
                    </div>
                  </div>
                )}

                {/* Weight */}
                {animal.weight && (
                  <div className="flex items-center gap-3">
                    <Weight className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Weight</p>
                      <p className="font-medium">{animal.weight} kg</p>
                    </div>
                  </div>
                )}

                {/* Height */}
                {animal.height && (
                  <div className="flex items-center gap-3">
                    <Ruler className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Height</p>
                      <p className="font-medium">{animal.height} cm</p>
                    </div>
                  </div>
                )}

                <Separator />

                {/* CTA Buttons */}
                <div className="space-y-2">
                  <Link href="/marketplace" className="block">
                    <Button className="w-full" variant="default">
                      <Heart className="w-4 h-4 mr-2" />
                      View in Marketplace
                    </Button>
                  </Link>
                  <Link href="/auth/signin" className="block">
                    <Button className="w-full" variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact Owner
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Breeder Info Card */}
            {animal.breeder && (
              <Card className="shadow-card bg-surface border-0">
                <CardHeader className="border-b border-primary/10 bg-gradient-subtle">
                  <CardTitle className="text-lg">Breeder Information</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {animal.breeder.slug ? (
                    <Link 
                      href={`/breeders/${animal.breeder.slug}?source=animal-profile&animal=${id}`}
                      className="block group"
                    >
                      <div className="p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Breeder</p>
                            <p className="font-medium group-hover:text-primary transition-colors">
                              {animal.breeder.displayName || 'Anonymous'}
                            </p>
                          </div>
                          <div className="text-xs text-primary font-medium group-hover:underline">
                            View Profile →
                          </div>
                        </div>
                        {animal.breeder.location && (
                          <div className="flex items-start gap-2 mt-2">
                            <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-muted-foreground">Location</p>
                              <p className="text-sm">{animal.breeder.location}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Breeder</p>
                        <p className="font-medium">{animal.breeder.displayName || 'Anonymous'}</p>
                      </div>
                      {animal.breeder.location && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-muted-foreground">Location</p>
                            <p className="text-sm">{animal.breeder.location}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {allPhotos.length > 0 && (
        <ImageLightbox
          images={allPhotos}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          initialIndex={lightboxIndex}
        />
      )}
    </div>
  );
}
