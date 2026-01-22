"use client";

import { use, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProfileTab } from "@/components/breeder/animals/ProfileTab";
import { PhotosDocsTab } from "@/components/breeder/animals/PhotosDocsTab";
import { FeedingPlanTab } from "@/components/breeder/animals/FeedingPlanTab";
import { SemenTab } from "@/components/breeder/animals/SemenTab";
import { SeasonsTab } from "@/components/breeder/animals/SeasonsTab";
import { LitterDetailsTab } from "@/components/breeder/animals/LitterDetailsTab";
import { RemindersTab } from "@/components/breeder/animals/RemindersTab";
import { PedigreeTab } from "@/components/breeder/animals/PedigreeTab";
import { HealthTab } from "@/components/breeder/animals/HealthTab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import {
  ArrowLeft, Share2, Heart, Award, Shield, Calendar,
  Weight, Activity, Ruler, MapPin, Eye, User, FileText, Clock
} from "lucide-react";
import { format, differenceInYears, differenceInMonths } from "date-fns";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    tab?: string;
    userId?: string;
  }>;
}

export default function AdminAnimalProfilePage({ params, searchParams }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams || Promise.resolve({})) as { tab?: string; userId?: string };

  // Fetch animal data using the API endpoint that supports admin access
  const { data: animal, isLoading, isError } = useQuery({
    queryKey: ['admin-animal', resolvedParams.id],
    queryFn: async () => {
      const res = await fetch(`/api/animals/${resolvedParams.id}`);
      if (!res.ok) throw new Error('Failed to fetch animal');
      const json = await res.json();
      return json.data;
    },
  });

  // Fetch owner/user information
  const { data: ownerData } = useQuery({
    queryKey: ['admin-animal-owner', animal?.userId],
    queryFn: async () => {
      if (!animal?.userId) return null;
      const res = await fetch(`/api/admin/users/${animal.userId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!animal?.userId,
  });

  const initialTab = resolvedSearchParams?.tab || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
          <Skeleton className="h-10 w-40" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-card bg-surface border-0">
                <CardContent className="p-0">
                  <Skeleton className="aspect-video w-full rounded-t-lg" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="shadow-card bg-surface border-0">
                <CardContent className="p-6 space-y-6">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-9 w-48" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !animal) {
    notFound();
  }

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

  const profilePhoto = animal.photos?.find((p: any) => p.category === 'profile');
  const primaryPhoto = profilePhoto?.fileUrl || animal.profileImageUrl || animal.photos?.[0]?.fileUrl || null;
  
  const additionalPhotos = animal.photos
    ?.filter((p: any) => p.category !== 'profile')
    .slice(0, 4)
    .map((p: any) => p.fileUrl) || [];
  
  const allPhotos = animal.photos && animal.photos.length > 0
    ? [
        profilePhoto?.fileUrl,
        ...animal.photos.filter((p: any) => p.category !== 'profile').map((p: any) => p.fileUrl)
      ].filter((url: string | undefined) => url)
    : [];

  const tabs = [
    { value: 'profile', label: 'Profile', icon: Activity },
    { value: 'health', label: 'Health', icon: Heart },
    { value: 'pedigree', label: 'Pedigree', icon: Share2 },
    { value: 'photos-docs', label: 'Photos & Docs', icon: Award },
    { value: 'feeding', label: 'Feeding', icon: Calendar },
    ...(animal.sex === 'male' ? [
      { value: 'semen', label: 'Semen', icon: Shield },
    ] : []),
    ...(animal.sex === 'female' ? [
      { value: 'seasons', label: 'Seasons', icon: Heart },
      { value: 'litters', label: 'Litter Details', icon: Activity },
    ] : []),
    { value: 'reminders', label: 'Reminders', icon: Calendar },
  ];

  const owner = ownerData?.user;

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Admin Header with Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                if (resolvedSearchParams.userId) {
                  router.push(`/admin/users/${resolvedSearchParams.userId}`);
                } else if (animal.userId) {
                  router.push(`/admin/users/${animal.userId}`);
                } else {
                  router.push('/admin/users');
                }
              }}
              className="hover:bg-primary/10 hover:border-primary shadow-card"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to User
            </Button>
            <Badge variant="secondary" className="text-sm">
              <Eye className="w-3 h-3 mr-1" />
              Admin View
            </Badge>
          </div>
          <Button
            variant="outline"
            onClick={handleShare}
            className="hover:bg-primary/10 hover:border-primary shadow-card"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Main Photo Card */}
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
                    {additionalPhotos.map((photo: string, index: number) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setLightboxIndex(index + 1);
                          setLightboxOpen(true);
                        }}
                      >
                        <img
                          src={photo}
                          alt={`${animal.name} photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabs Section */}
            <Card className="shadow-card bg-surface border-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b border-primary/10 px-6 pt-6">
                  <TabsList className="bg-transparent border-0 p-0 h-auto space-x-2 mb-4">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="data-[state=active]:bg-gradient-brand data-[state=active]:text-white data-[state=active]:shadow-card rounded-lg px-4 py-2 transition-all duration-200"
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {tab.label}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="profile" className="mt-0">
                    <ProfileTab animal={animal} animalId={animal.id} />
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
                    <PedigreeTab 
                      animalId={animal.id}
                      animalName={animal.name}
                      animalUserId={animal.userId}
                    />
                  </TabsContent>
                  <TabsContent value="photos-docs" className="mt-0">
                    <PhotosDocsTab animalId={animal.id} />
                  </TabsContent>
                  <TabsContent value="feeding" className="mt-0">
                    <FeedingPlanTab 
                      animalId={animal.id}
                      animalName={animal.name}
                      feedingPlans={animal.feedingPlans || []}
                    />
                  </TabsContent>
                  {animal.sex === 'male' && (
                    <TabsContent value="semen" className="mt-0">
                      <SemenTab 
                        animalId={animal.id}
                        assessments={animal.semenAssessments || []}
                      />
                    </TabsContent>
                  )}
                  {animal.sex === 'female' && (
                    <>
                      <TabsContent value="seasons" className="mt-0">
                        <SeasonsTab 
                          animalId={animal.id}
                          seasons={animal.seasons || []}
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
            {/* Animal Info Card */}
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    {primaryPhoto && <AvatarImage src={primaryPhoto} />}
                    <AvatarFallback className="bg-gradient-brand text-white text-xl">
                      {animal.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-foreground truncate">
                      {animal.registeredName || animal.name}
                    </h1>
                    {animal.registeredName && (
                      <p className="text-sm text-muted-foreground">
                        Call name: {animal.name}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Breed</span>
                    <span className="text-sm font-medium">{animal.breed?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sex</span>
                    <Badge variant={animal.sex === 'male' ? 'default' : 'secondary'}>
                      {animal.sex === 'male' ? '♂ Male' : '♀ Female'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Age</span>
                    <span className="text-sm font-medium">{age}</span>
                  </div>
                  {animal.color && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Color</span>
                      <span className="text-sm font-medium">{animal.color}</span>
                    </div>
                  )}
                  {animal.weight && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Weight</span>
                      <span className="text-sm font-medium">{animal.weight} kg</span>
                    </div>
                  )}
                  {animal.microchipNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Microchip</span>
                      <span className="text-sm font-medium font-mono text-xs">{animal.microchipNumber}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Owner Information Card */}
            {owner && (
              <Card className="shadow-card bg-surface border-0">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Owner Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {owner.image && <AvatarImage src={owner.image} />}
                      <AvatarFallback className="bg-primary/10">
                        {owner.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{owner.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{owner.email}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Role</span>
                      <Badge variant="outline">{owner.role}</Badge>
                    </div>
                    {owner.createdAt && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Member Since</span>
                        <span className="font-medium">{format(new Date(owner.createdAt), 'MMM yyyy')}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/admin/users/${animal.userId}`)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    View User Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Admin Actions Card */}
            <Card className="shadow-card bg-surface border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Admin Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/admin/users/${animal.userId}?tab=animals`)}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  View All User Animals
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/admin/audit-logs?resourceId=${animal.id}`)}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  View Audit Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={allPhotos as string[]}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </div>
  );
}
