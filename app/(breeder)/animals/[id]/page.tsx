"use client";

import { use, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/client";
import { useAnimal } from "@/lib/api/queries/animals";
import { ProfileTab } from "@/components/breeder/animals/ProfileTab";
import { PhotosDocsTab } from "@/components/breeder/animals/PhotosDocsTab";
import { FeedingPlanTab } from "@/components/breeder/animals/FeedingPlanTab";
import { SemenTab } from "@/components/breeder/animals/SemenTab";
import { SeasonHistoryTab } from "@/components/breeder/animals/SeasonHistoryTab";
import { LitterDetailsTab } from "@/components/breeder/animals/LitterDetailsTab";
import { RemindersTab } from "@/components/breeder/animals/RemindersTab";
import { PedigreeTab } from "@/components/breeder/animals/PedigreeTab";
import { HealthTab } from "@/components/breeder/animals/HealthTab";
import { ProgesteroneTab } from "@/components/breeder/animals/ProgesteroneTab";
import { EditAnimalDialogMultiStep } from "@/components/breeder/animals/EditAnimalDialogMultiStep";
import { ProfilePhotoEditor } from "@/components/breeder/animals/ProfilePhotoEditor";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import {
  ArrowLeft, Share2, Edit, Heart, Award, Shield, Calendar,
  Weight, Activity, Ruler, MapPin, Phone, Mail, Eye, TrendingUp
} from "lucide-react";
import { format, differenceInYears, differenceInMonths } from "date-fns";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    tab?: string;
  }>;
}

export default function AnimalProfilePage({ params, searchParams }: PageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams || Promise.resolve({})) as { tab?: string };

  // Fetch animal data from API
  const { data: animal, isLoading, isError } = useAnimal(resolvedParams.id);

  const initialTab = resolvedSearchParams?.tab || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);

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

  // Debug logging
  console.log('🐕 Animal data:', {
    id: animal.id,
    name: animal.name,
    userId: animal.userId,
    currentUser: user?.id,
    isOwner: user?.id === animal.userId,
  });

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
  const tabs = [
    { value: 'profile', label: 'Profile', icon: Activity },
    { value: 'health', label: 'Health', icon: Heart },
    { value: 'pedigree', label: 'Pedigree', icon: Share2 },
    { value: 'photos-docs', label: 'Photos & Docs', icon: Award },
    { value: 'feeding', label: 'Feeding', icon: Calendar },
    // Sex-specific tabs
    ...(animal.sex === 'male' ? [
      { value: 'semen', label: 'Semen', icon: Shield },
    ] : []),
    ...(animal.sex === 'female' ? [
      { value: 'progesterone', label: 'Progesterone', icon: TrendingUp },
      { value: 'seasons', label: 'Cycle History', icon: Heart },
      { value: 'litters', label: 'Litter Details', icon: Activity },
    ] : []),
    { value: 'reminders', label: 'Reminders', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary">
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
                <div className="relative aspect-video rounded-t-lg overflow-visible">
                  {/* Clickable area for lightbox */}
                  <div 
                    className={cn(
                      "absolute inset-0 overflow-hidden rounded-t-lg",
                      primaryPhoto ? "cursor-pointer group" : "bg-gradient-subtle"
                    )}
                    onClick={(e) => {
                      if (!primaryPhoto) return; // Don't open lightbox if no photo
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
                          className="w-full h-full object-contain bg-muted/30 group-hover:scale-105 transition-transform duration-300"
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
                  
                  {/* Edit Profile Photo Button - Always visible, on top */}
                  <Button
                    size="sm"
                    className="absolute top-3 right-3 z-10 bg-white/95 hover:bg-white text-foreground shadow-xl backdrop-blur-sm border border-primary/30 hover:border-primary hover:shadow-2xl transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPhotoEditor(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Photo
                  </Button>
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
                          className="w-full h-full object-contain bg-muted/30 group-hover:scale-110 transition-transform duration-300" 
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
                    <ProfileTab animal={animal} animalId={animal.id} onEdit={() => setShowEditDialog(true)} />
                  </TabsContent>

                  <TabsContent value="health" className="mt-0">
                    <HealthTab 
                      animalId={animal.id} 
                      animalName={animal.name}
                      animalSex={animal.sex}
                      animalDateOfBirth={animal.dateOfBirth}
                    />
                  </TabsContent>

                  <TabsContent value="pedigree" className="mt-0">
                    {animal.userId ? (
                      <PedigreeTab 
                        animalId={animal.id} 
                        animalName={animal.name}
                        animalUserId={animal.userId}
                      />
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        Loading pedigree data...
                      </div>
                    )}
                  </TabsContent>

                  {animal.sex === 'female' && (
                    <TabsContent value="progesterone" className="mt-0">
                      <ProgesteroneTab 
                        animalId={animal.id} 
                        animalName={animal.name}
                      />
                    </TabsContent>
                  )}

                  <TabsContent value="photos-docs" className="mt-0">
                    <PhotosDocsTab animalId={animal.id} />
                  </TabsContent>

                  <TabsContent value="feeding" className="mt-0">
                    <FeedingPlanTab
                      animalId={animal.id}
                      feedingPlans={animal.feedingPlans || []}
                    />
                  </TabsContent>

                  <TabsContent value="semen" className="mt-0">
                    <SemenTab
                      animalId={animal.id}
                      assessments={animal.semenAssessments || []}
                    />
                  </TabsContent>

                  {animal.sex === 'female' && (
                    <>
                      <TabsContent value="seasons" className="mt-0">
                        <SeasonHistoryTab
                          animalId={animal.id}
                          animalName={animal.name}
                          animalSex={animal.sex}
                        />
                      </TabsContent>

                      <TabsContent value="litters" className="mt-0">
                        <LitterDetailsTab
                          animalId={animal.id}
                          litters={animal.littersAsBitch || []}
                        />
                      </TabsContent>
                    </>
                  )}

                  <TabsContent value="reminders" className="mt-0">
                    <RemindersTab
                      animalId={animal.id}
                      animalSex={animal.sex}
                      reminders={animal.reminders || []}
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
                <div className="space-y-3">
                  {/* Sex Badge */}
                  <div className="flex items-start gap-3">
                    <Badge className="bg-gradient-brand text-white shadow-card">
                      {animal.sex === 'female' ? '♀ Female' : '♂ Male'}
                    </Badge>
                  </div>

                  {/* Registered Name (Most Prominent) and Call Name */}
                  <div>
                    {/* Registered Name - Bold and Prominent */}
                    {animal.registeredName && (
                      <div className="mb-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Registered Name</div>
                        <h1 className="text-2xl font-bold text-foreground leading-tight">
                          {animal.registeredName}
                        </h1>
                      </div>
                    )}
                    
                    {/* Call Name - Normal Weight */}
                    <div className={animal.registeredName ? "mt-2" : ""}>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        {animal.registeredName ? "Call Name" : "Name"}
                      </div>
                      <div className="text-lg font-normal text-foreground">
                        {animal.name}
                      </div>
                    </div>
                  </div>

                  {/* Breed, Breeder, Owner - Side by Side Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Breed</div>
                      <div className="text-sm font-medium text-foreground">{animal.breed?.name || 'Unknown'}</div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Breeder</div>
                      <div className="text-sm font-medium text-foreground">
                        {animal.breederName || animal.breeder?.name || 'Not Specified'}
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Owner</div>
                      <div className="text-sm font-medium text-foreground">
                        {animal.ownerName || animal.owner?.name || 'Not Specified'}
                      </div>
                    </div>
                  </div>
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
                    {animal.dndProfileNumber && (
                      <div className="col-span-2">
                        <div className="text-sm text-muted-foreground">DND Profile No.</div>
                        <div className="font-medium text-foreground">{animal.dndProfileNumber}</div>
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
            {/* Actions Card */}
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>

                <Button 
                  className="w-full bg-gradient-brand hover:opacity-90 shadow-card"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>

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

      {/* Edit Animal Dialog - Multi-Step */}
      <EditAnimalDialogMultiStep
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        animalId={animal.id}
        animalData={animal}
      />

      {/* Profile Photo Editor */}
      <ProfilePhotoEditor
        open={showPhotoEditor}
        onOpenChange={setShowPhotoEditor}
        animalId={animal.id}
        animalName={animal.name}
        currentPhotoUrl={primaryPhoto}
      />
    </div>
  );
}