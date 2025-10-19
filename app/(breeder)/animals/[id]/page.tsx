"use client";

import { use, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { mockAnimals } from "@/data/mockData";
import { getAnimalProfileDetails } from "@/lib/mock-data/animal-profile-details";
import { ProfileTab } from "@/components/breeder/animals/ProfileTab";
import { PhotosDocsTab } from "@/components/breeder/animals/PhotosDocsTab";
import { FeedingPlanTab } from "@/components/breeder/animals/FeedingPlanTab";
import { SemenTab } from "@/components/breeder/animals/SemenTab";
import { SeasonsTab } from "@/components/breeder/animals/SeasonsTab";
import { LitterDetailsTab } from "@/components/breeder/animals/LitterDetailsTab";
import { RemindersTab } from "@/components/breeder/animals/RemindersTab";
import { PedigreeTab } from "@/components/breeder/animals/PedigreeTab";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Share2, Edit, Heart, Award, Shield, Calendar,
  Weight, Activity, Ruler, MapPin, Phone, Mail
} from "lucide-react";
import { format } from "date-fns";
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
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams || Promise.resolve({})) as { tab?: string };

  const animal = mockAnimals.find((a) => a.id === resolvedParams.id);
  const profileDetails = getAnimalProfileDetails(resolvedParams.id);

  const initialTab = resolvedSearchParams?.tab || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!animal) {
    notFound();
  }

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(animal.dateOfBirth);
  const statusConfig = {
    'available': { color: 'bg-chart-3/10 text-chart-3 border-chart-3/20', label: 'Available' },
    'breeding': { color: 'bg-chart-4/10 text-chart-4 border-chart-4/20', label: 'Breeding' },
    'pregnant': { color: 'bg-chart-2/10 text-chart-2 border-chart-2/20', label: 'Pregnant' },
    'retired': { color: 'bg-muted text-muted-foreground border-muted', label: 'Retired' },
  };

  // Get primary photo or use first photo
  const primaryPhoto = animal.photos?.[0] || "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=600&fit=crop&crop=face";
  const additionalPhotos = animal.photos?.slice(1, 5) || [];

  // Determine available tabs based on animal type
  const tabs = [
    { value: 'profile', label: 'Profile', icon: Activity },
    { value: 'pedigree', label: 'Pedigree', icon: Share2 },
    { value: 'photos-docs', label: 'Photos & Docs', icon: Award },
    { value: 'feeding', label: 'Feeding', icon: Calendar },
    { value: 'semen', label: 'Semen', icon: Shield },
    ...(animal.type === 'bitch' ? [
      { value: 'seasons', label: 'Seasons', icon: Heart },
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
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={primaryPhoto}
                    alt={animal.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {additionalPhotos.length > 0 && (
                  <div className="p-4 grid grid-cols-4 gap-2">
                    {additionalPhotos.map((photo, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img src={photo} alt={`${animal.name} ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Animal Details Card */}
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-gradient-brand text-white shadow-card">
                      {animal.type === 'bitch' ? '♀ Female' : '♂ Male'}
                    </Badge>
                  </div>

                  <h1 className="text-3xl font-bold text-foreground">{animal.name}</h1>

                  <div className="text-lg text-muted-foreground">{animal.breed}</div>
                </div>

                <Separator />

                {/* Quick Info */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Quick Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Age</div>
                      <div className="font-medium text-foreground">{age} years old</div>
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
                    {animal.microchipId && (
                      <div className="col-span-2">
                        <div className="text-sm text-muted-foreground">Microchip ID</div>
                        <div className="font-medium text-foreground">{animal.microchipId}</div>
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
                {(animal.achievements && animal.achievements.length > 0) && (
                  <>
                    <Separator />
                    <div className="flex gap-2 flex-wrap">
                      {animal.healthRecords && animal.healthRecords.length > 0 && (
                        <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/20">
                          <Shield className="w-4 h-4 mr-2" />
                          Health Records
                        </Badge>
                      )}
                      {animal.achievements && animal.achievements.length > 0 && (
                        <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                          <Award className="w-4 h-4 mr-2" />
                          Achievements
                        </Badge>
                      )}
                    </div>
                  </>
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
                    <ProfileTab animal={animal} />
                  </TabsContent>

                  <TabsContent value="pedigree" className="mt-0">
                    <PedigreeTab animalId={animal.id} animalName={animal.name} />
                  </TabsContent>

                  <TabsContent value="photos-docs" className="mt-0">
                    <PhotosDocsTab animalId={animal.id} />
                  </TabsContent>

                  <TabsContent value="feeding" className="mt-0">
                    <FeedingPlanTab
                      animalId={animal.id}
                      schedule={profileDetails?.feedingPlan.schedule || []}
                      specialDietaryNotes={profileDetails?.feedingPlan.specialDietaryNotes}
                    />
                  </TabsContent>

                  <TabsContent value="semen" className="mt-0">
                    <SemenTab
                      animalId={animal.id}
                      assessments={profileDetails?.semenAssessments || []}
                    />
                  </TabsContent>

                  {animal.type === 'bitch' && (
                    <>
                      <TabsContent value="seasons" className="mt-0">
                        <SeasonsTab
                          animalId={animal.id}
                          seasons={profileDetails?.seasons || []}
                        />
                      </TabsContent>

                      <TabsContent value="litters" className="mt-0">
                        <LitterDetailsTab
                          animalId={animal.id}
                          litters={profileDetails?.litters || []}
                        />
                      </TabsContent>
                    </>
                  )}

                  <TabsContent value="reminders" className="mt-0">
                    <RemindersTab
                      animalId={animal.id}
                      animalType={animal.type}
                      reminders={profileDetails?.reminders || {
                        enabled: true,
                        vaccinations: true,
                        vetCheckups: true,
                        heatCycles: false,
                        seasonTracking: false,
                        feedingSchedule: false,
                        customReminders: [],
                      }}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions Card */}
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>

                <Button className="w-full bg-gradient-brand hover:opacity-90 shadow-card">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="hover:bg-primary/10 hover:border-primary shadow-card">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="hover:bg-primary/10 hover:border-primary shadow-card">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
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
    </div>
  );
}