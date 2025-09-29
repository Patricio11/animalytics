"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { mockAnimals } from "@/data/mockData";
import { getAnimalProfileDetails } from "@/lib/mock-data/animal-profile-details";
import { AnimalProfileTabs } from "@/components/breeder/animals/AnimalProfileTabs";
import { ProfileTab } from "@/components/breeder/animals/ProfileTab";
import { PhotosDocsTab } from "@/components/breeder/animals/PhotosDocsTab";
import { FeedingPlanTab } from "@/components/breeder/animals/FeedingPlanTab";
import { SemenTab } from "@/components/breeder/animals/SemenTab";
import { SeasonsTab } from "@/components/breeder/animals/SeasonsTab";
import { LitterDetailsTab } from "@/components/breeder/animals/LitterDetailsTab";
import { RemindersTab } from "@/components/breeder/animals/RemindersTab";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, MoreHorizontal } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    tab?: string;
  }>;
}

export default function AnimalProfilePage({ params, searchParams }: PageProps) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams || Promise.resolve({}));

  const animal = mockAnimals.find((a) => a.id === resolvedParams.id);
  const profileDetails = getAnimalProfileDetails(resolvedParams.id);

  const initialTab = resolvedSearchParams?.tab || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!animal) {
    notFound();
  }

  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab animal={animal} />;

      case 'photos-docs':
        return (
          <PhotosDocsTab
            animalId={animal.id}
            photoCategories={profileDetails?.photoCategories || []}
          />
        );

      case 'feeding':
        return (
          <FeedingPlanTab
            animalId={animal.id}
            schedule={profileDetails?.feedingPlan.schedule || []}
            specialDietaryNotes={profileDetails?.feedingPlan.specialDietaryNotes}
          />
        );

      case 'semen':
        return (
          <SemenTab
            animalId={animal.id}
            assessments={profileDetails?.semenAssessments || []}
          />
        );

      case 'seasons':
        if (animal.type === 'bitch') {
          return (
            <SeasonsTab
              animalId={animal.id}
              seasons={profileDetails?.seasons || []}
            />
          );
        }
        return null;

      case 'litters':
        if (animal.type === 'bitch') {
          return (
            <LitterDetailsTab
              animalId={animal.id}
              litters={profileDetails?.litters || []}
            />
          );
        }
        return null;

      case 'reminders':
        return (
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
        );

      default:
        return <ProfileTab animal={animal} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <div className="bg-surface border-b border-primary/10 shadow-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/animals">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Animals
                </Button>
              </Link>

              <div className="h-8 w-px bg-primary/10" />

              <div>
                <h1 className="text-2xl font-bold text-foreground">{animal.name}</h1>
                <p className="text-sm text-muted-foreground capitalize">
                  {animal.breed} • {animal.type === 'bitch' ? 'Female' : 'Male'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:border-primary">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="hover:bg-primary/10">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <AnimalProfileTabs
            animal={animal}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
}