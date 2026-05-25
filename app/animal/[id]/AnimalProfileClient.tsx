"use client";

import { useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { useAnimal, usePublicAnimal } from "@/lib/api/queries/animals";
import { ProfileTab } from "@/components/breeder/animals/ProfileTab";
import { PhotosDocsTab } from "@/components/breeder/animals/PhotosDocsTab";
import { FeedingPlanTab } from "@/components/breeder/animals/FeedingPlanTab";
import { SemenTab } from "@/components/breeder/animals/SemenTab";
import { SeasonsTab } from "@/components/breeder/animals/SeasonsTab";
import { LitterDetailsTab } from "@/components/breeder/animals/LitterDetailsTab";
import { RemindersTab } from "@/components/breeder/animals/RemindersTab";
import { PedigreeTab } from "@/components/breeder/animals/PedigreeTab";
import { HealthTab } from "@/components/breeder/animals/HealthTab";
import { AddAnimalDialog } from "@/components/breeder/animals/AddAnimalDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import {
  ArrowLeft, Share2, Edit, Heart, Award, Shield, Calendar,
  Weight, Activity, Ruler, MapPin, Phone, Mail, Eye,
  Building2, BadgeCheck, ExternalLink,
} from "lucide-react";
import { format, differenceInYears, differenceInMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";
import { AnimalJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AnimalProfileClientProps {
  id: string;
  initialTab?: string;
}

export default function AnimalProfileClient({ id, initialTab = 'profile' }: AnimalProfileClientProps) {
  const router = useRouter();

  // Check authentication
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const isAuthenticated = !!session?.user?.id;

  // Authenticated viewers get the full record from /api/animals/[id];
  // guests get the trimmed public view from /api/animals/[id]/public.
  // We only enable each query in the right state to avoid 401 noise.
  const authedQuery = useAnimal(isAuthenticated && !sessionLoading ? id : "");
  const publicQuery = usePublicAnimal(id, !isAuthenticated && !sessionLoading);

  const animal = isAuthenticated ? authedQuery.data : publicQuery.data;
  const isLoading = sessionLoading || (isAuthenticated ? authedQuery.isLoading : publicQuery.isLoading);
  const isError = isAuthenticated ? authedQuery.isError : publicQuery.isError;

  // Check if current user is the owner
  const isOwner = session?.user?.id && animal?.userId === session.user.id;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: animal.name,
          text: `Check out ${animal.name} - ${animal.breed?.name || 'Dog'}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
          {/* Back Button Skeleton */}
          <Skeleton className="h-10 w-40" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery Skeleton */}
              <Card className="shadow-card bg-surface border-0">
                <CardContent className="p-0">
                  <Skeleton className="aspect-video w-full rounded-t-lg" />
                  <div className="p-4 grid grid-cols-4 gap-2">
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="aspect-square rounded-lg" />
                  </div>
                </CardContent>
              </Card>

              {/* Tabs Skeleton */}
              <Card className="shadow-card bg-surface border-0">
                <div className="border-b border-primary/10 px-6 pt-6">
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <Skeleton className="h-20 rounded-lg" />
                    <Skeleton className="h-20 rounded-lg" />
                    <Skeleton className="h-20 rounded-lg" />
                    <Skeleton className="h-20 rounded-lg" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              <Card className="shadow-card bg-surface border-0">
                <CardContent className="p-6 space-y-6">
                  {/* Badge and Title */}
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-6 w-32" />
                  </div>

                  <Separator />

                  {/* Quick Info */}
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-40" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>

              {/* Additional Card Skeleton */}
              <Card className="shadow-card bg-surface border-0">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error or not found
  if (isError || !animal) {
    notFound();
  }

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string | Date) => {
    const birthDate = new Date(dateOfBirth);
    const years = differenceInYears(new Date(), birthDate);
    const months = differenceInMonths(new Date(), birthDate);
    
    if (years >= 1) {
      return `${years} year${years > 1 ? 's' : ''} old`;
    } else {
      return `${months} month${months !== 1 ? 's' : ''} old`;
    }
  };

  const age = animal.dateOfBirth ? calculateAge(animal.dateOfBirth) : '0 months old';
  const statusConfig = {
    'available': { color: 'bg-chart-3/10 text-chart-3 border-chart-3/20', label: 'Available' },
    'breeding': { color: 'bg-chart-4/10 text-chart-4 border-chart-4/20', label: 'Breeding' },
    'pregnant': { color: 'bg-chart-2/10 text-chart-2 border-chart-2/20', label: 'Pregnant' },
    'retired': { color: 'bg-muted text-muted-foreground border-muted', label: 'Retired' },
  };

  // Get primary photo from animal_photos table (category: 'profile') or use first photo
  const profilePhoto = animal.photos?.find((p: any) => p.category === 'profile');
  const primaryPhoto = profilePhoto?.fileUrl || animal.photos?.[0]?.fileUrl || null;
  
  // Get additional photos (excluding profile photo)
  const additionalPhotos = animal.photos
    ?.filter((p: any) => p.category !== 'profile')
    .slice(0, 4)
    .map((p: any) => p.fileUrl) || [];
  
  // Build allPhotos array - profile photo first, then others
  const allPhotos = animal.photos && animal.photos.length > 0
    ? [
        profilePhoto?.fileUrl,
        ...animal.photos.filter((p: any) => p.category !== 'profile').map((p: any) => p.fileUrl)
      ].filter((url: string | undefined) => url) // Filter out empty/undefined URLs
    : []; // Empty array if no photos

  // Determine available tabs based on animal type
  // Guests see only public-facing tabs. Authenticated users get the full set.
  const tabs = isAuthenticated
    ? [
        { value: 'profile', label: 'Profile', icon: Activity },
        { value: 'health', label: 'Health', icon: Heart },
        { value: 'pedigree', label: 'Pedigree', icon: Share2 },
        { value: 'photos-docs', label: 'Photos & Docs', icon: Award },
        { value: 'feeding', label: 'Feeding', icon: Calendar },
        { value: 'semen', label: 'Semen', icon: Shield },
        ...(animal.sex === 'female'
          ? [
              { value: 'seasons', label: 'Seasons', icon: Heart },
              { value: 'litters', label: 'Litter Details', icon: Activity },
            ]
          : []),
        { value: 'reminders', label: 'Reminders', icon: Calendar },
      ]
    : [
        { value: 'profile', label: 'Profile', icon: Activity },
        { value: 'pedigree', label: 'Pedigree', icon: Share2 },
        { value: 'photos-docs', label: 'Photos & Docs', icon: Award },
      ];

  const seoProfilePhoto = animal?.photos?.find((p: any) => p.category === 'profile');
  const seoImage = seoProfilePhoto?.fileUrl || animal?.photos?.[0]?.fileUrl || animal?.profileImageUrl || null;

  return (
    <div className="min-h-screen bg-surface-secondary">
      <AnimalJsonLd
        name={animal?.registeredName || animal?.name || ''}
        description={animal?.bio || undefined}
        image={seoImage}
        breed={animal?.breed?.name}
        sex={animal?.sex}
        dateOfBirth={animal?.dateOfBirth}
        url={`/animal/${id}`}
        breederName={animal?.breeder?.name || animal?.breederName}
        isChampion={animal?.isChampion}
      />
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Animals', url: '/animals' },
        { name: animal?.registeredName || animal?.name || 'Animal', url: `/animal/${id}` },
      ]} />
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push('/animals')}
          className="hover:bg-primary/10 hover:border-primary shadow-card"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Animals
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-0">
                <div 
                  className={cn(
                    "relative aspect-video overflow-hidden rounded-t-lg",
                    primaryPhoto ? "cursor-pointer group" : ""
                  )}
                  onClick={(e) => {
                    if (!primaryPhoto) return;
                    e.preventDefault();
                    console.log('Main image clicked, allPhotos:', allPhotos);
                    setLightboxIndex(0);
                    setLightboxOpen(true);
                  }}
                >
                  {primaryPhoto ? (
                    <>
                      <img
                        src={primaryPhoto}
                        alt={animal.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <Eye className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                      <Eye className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                {additionalPhotos.length > 0 && (
                  <div className="p-4 grid grid-cols-4 gap-2">
                    {additionalPhotos.map((photo:any, index:any) => (
                      <div 
                        key={index} 
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative"
                        onClick={() => {
                          setLightboxIndex(index + 1);
                          setLightboxOpen(true);
                        }}
                      >
                        <img 
                          src={photo} 
                          alt={`${animal.name} ${index + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            

            {/* Tabs Section */}
            <Card className="shadow-card bg-surface border-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b border-primary/10 px-6 pt-6">
                  <TabsList className="bg-surface-secondary h-auto p-1 gap-2 w-full justify-start flex-wrap">
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="data-[state=active]:bg-gradient-brand data-[state=active]:text-white data-[state=active]:shadow-card px-4 py-2"
                      >
                        <tab.icon className="w-4 h-4 mr-2" />
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="profile" className="mt-0">
                    <ProfileTab animal={animal} animalId={animal.id} onEdit={() => setShowEditDialog(true)} isOwner={!!isOwner} />
                  </TabsContent>

                  <TabsContent value="health" className="mt-0">
                    <HealthTab animalId={animal.id} animalName={animal.name} isOwner={!!isOwner} />
                  </TabsContent>

                  <TabsContent value="pedigree" className="mt-0">
                    <PedigreeTab animalId={animal.id} animalName={animal.name} animalUserId={animal.userId} />
                  </TabsContent>

                  <TabsContent value="photos-docs" className="mt-0">
                    <PhotosDocsTab animalId={animal.id} animalName={animal.name} breedName={animal.breed?.name} isOwner={!!isOwner} />
                  </TabsContent>

                  <TabsContent value="feeding" className="mt-0">
                    <FeedingPlanTab
                      animalId={animal.id}
                      animalName={animal.name}
                      feedingPlans={animal.feedingPlans || []}
                      isOwner={!!isOwner}
                    />
                  </TabsContent>

                  <TabsContent value="semen" className="mt-0">
                    <SemenTab
                      animalId={animal.id}
                      assessments={animal.semenAssessments || []}
                      isOwner={!!isOwner}
                    />
                  </TabsContent>

                  {animal.sex === 'female' && (
                    <>
                      <TabsContent value="seasons" className="mt-0">
                        <SeasonsTab
                          animalId={animal.id}
                          seasons={animal.seasons || []}
                          isOwner={!!isOwner}
                        />
                      </TabsContent>

                      <TabsContent value="litters" className="mt-0">
                        <LitterDetailsTab
                          animalId={animal.id}
                          litters={animal.littersAsBitch || []}
                          isOwner={!!isOwner}
                        />
                      </TabsContent>
                    </>
                  )}

                  <TabsContent value="reminders" className="mt-0">
                    <RemindersTab
                      animalId={animal.id}
                      animalSex={animal.sex}
                      reminders={animal.reminders || []}
                      isOwner={!!isOwner}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Animal Details Card */}
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-gradient-brand text-white shadow-card">
                      {animal.sex === 'female' ? '♀ Female' : '♂ Male'}
                    </Badge>
                  </div>

                  <h1 className="text-3xl font-bold text-foreground">{animal.registeredName || animal.name}</h1>
                  {animal.registeredName && animal.name && (
                    <p className="text-sm text-muted-foreground italic">Call name: {animal.name}</p>
                  )}
                  <div className="text-lg text-muted-foreground">{animal.breed?.name || 'Unknown Breed'}</div>
                </div>

                <Separator />

                {/* Quick Info */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Quick Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Age</div>
                      <div className="font-medium text-foreground">{age}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Date of Birth</div>
                      <div className="font-medium text-foreground">
                        {format(new Date(animal.dateOfBirth), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    {animal.weight && (
                      <div>
                        <div className="text-sm text-muted-foreground">Weight</div>
                        <div className="font-medium text-foreground">{animal.weight} kg</div>
                      </div>
                    )}
                    {animal.color && (
                      <div>
                        <div className="text-sm text-muted-foreground">Color</div>
                        <div className="font-medium text-foreground">{animal.color}</div>
                      </div>
                    )}
                    {animal.microchipNumber && (
                      <div className="col-span-2">
                        <div className="text-sm text-muted-foreground">Microchip ID</div>
                        <div className="font-medium text-foreground">{animal.microchipNumber}</div>
                      </div>
                    )}
                    {animal.registrationNumber && (
                      <div className="col-span-2">
                        <div className="text-sm text-muted-foreground">Registration Number</div>
                        <div className="font-medium text-foreground">{animal.registrationNumber}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Health Badges */}
                {(animal.titles && animal.titles.length > 0) || (animal.healthRecords && animal.healthRecords.length > 0) ? (
                  <>
                    <Separator />
                    <div className="flex gap-2 flex-wrap">
                      {animal.healthRecords && animal.healthRecords.length > 0 && (
                        <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/20">
                          <Shield className="w-4 h-4 mr-2" />
                          Health Records
                        </Badge>
                      )}
                      {animal.titles && animal.titles.length > 0 && (
                        <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                          <Award className="w-4 h-4 mr-2" />
                          Titles ({animal.titles.length})
                        </Badge>
                      )}
                      {animal.isChampion && (
                        <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20">
                          <Award className="w-4 h-4 mr-2" />
                          Champion
                        </Badge>
                      )}
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
            {/* Breeder Card — normalises the two data shapes (public vs authed) */}
            {(() => {
              // Public endpoint: animal.breeder = { slug, displayName, location, bio }
              // Authed endpoint: animal.owner.breederProfile = { slug, displayName, logoUrl, location, kycVerified }
              const breeder =
                animal.breeder ||
                animal.owner?.breederProfile ||
                null;
              if (!breeder) return null;

              const location = breeder.location as
                | { city?: string; state?: string; country?: string }
                | string
                | undefined
                | null;
              const locationStr =
                typeof location === 'string'
                  ? location
                  : [location?.city, location?.state, location?.country].filter(Boolean).join(', ');
              const breederName = breeder.displayName || animal.owner?.name || 'Breeder';
              const breederSlug = breeder.slug;
              const logoUrl = (breeder as any).logoUrl as string | undefined;
              const ownerAvatar = animal.owner?.avatar as string | undefined;

              return (
                <Card className="shadow-card bg-surface border-0">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Bred By</h3>
                    </div>

                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 shrink-0 border-2 border-primary/10">
                        <AvatarImage src={logoUrl || ownerAvatar || undefined} alt={breederName} />
                        <AvatarFallback className="bg-gradient-brand text-white text-sm">
                          {breederName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-foreground truncate">{breederName}</p>
                          {(breeder as any).kycVerified && (
                            <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
                          )}
                        </div>
                        {locationStr && (
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {locationStr}
                          </p>
                        )}
                      </div>
                    </div>

                    {breederSlug && (
                      <Link href={`/breeders/${breederSlug}`} className="block">
                        <Button variant="outline" className="w-full hover:bg-primary/10 hover:border-primary">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Breeder Profile
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Actions Card */}
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>

                {isOwner && (
                  <Button 
                    className="w-full bg-gradient-brand hover:opacity-90 shadow-card"
                    onClick={() => setShowEditDialog(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}

                <Button 
                  variant="outline" 
                  className="w-full hover:bg-primary/10 hover:border-primary shadow-card"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Profile
                </Button>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Statistics</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Weight className="w-4 h-4" />
                      <span>Current Weight</span>
                    </div>
                    <span className="font-medium text-foreground">{animal.weight || 'N/A'} kg</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Ruler className="w-4 h-4" />
                      <span>Height</span>
                    </div>
                    <span className="font-medium text-foreground">{animal.height || 'N/A'} cm</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Added</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {format(new Date(), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            {animal.location && (
              <Card className="shadow-card bg-surface border-0">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Location</h3>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div className="font-medium text-foreground">{animal.location}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={allPhotos}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />

      {/* Edit Animal Dialog - Only for owner */}
      {isOwner && (
        <AddAnimalDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          mode="edit"
          animalId={animal.id}
          initialData={{
            name: animal.name,
            type: animal.sex === 'male' ? 'dog' : 'bitch',
            breed: animal.breed?.name || '',
            dateOfBirth: new Date(animal.dateOfBirth),
            color: animal.color || '',
            markings: animal.markings || '',
            weight: animal.weight || '',
            microchipId: animal.microchipNumber || '',
            registrationNumber: animal.registrationNumber || '',
            dndProfileNumber: animal.dndProfileNumber || '',
            breederName: animal.breederName || '',
            ownerName: animal.ownerName || '',
            description: animal.bio || '',
            location: animal.location || '',
            profilePhotoUrl: animal.profileImageUrl || '',
          }}
        />
      )}
    </div>
  );
}
