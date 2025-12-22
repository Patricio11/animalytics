"use client";

import { cn } from "@/lib/utils";
import { Animal } from "@/types";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface AnimalProfileTabsProps {
  animal: Animal;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

// Tab definitions based on animal sex
const dogTabs: Tab[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'photos-docs', label: 'Photos & Docs' },
  { id: 'feeding', label: 'Feeding' },
  { id: 'semen', label: 'Semen' },
  { id: 'reminders', label: 'Reminders' },
];

const bitchTabs: Tab[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'photos-docs', label: 'Photos & Docs' },
  { id: 'feeding', label: 'Feeding' },
  { id: 'semen', label: 'Semen' },
  { id: 'seasons', label: 'Seasons' },
  { id: 'litters', label: 'Litter Details' },
  { id: 'reminders', label: 'Reminders' },
];

export function AnimalProfileTabs({ animal, activeTab, onTabChange }: AnimalProfileTabsProps) {
  // Check both sex and type fields for compatibility (database uses sex, frontend uses type)
  const isFemale = (animal as any).sex === 'female' || animal.type === 'bitch';
  const tabs = isFemale ? bitchTabs : dogTabs;

  return (
    <div className="border-b border-primary/10 bg-surface">
      <div className="flex overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200",
              "border-b-2 hover:text-foreground hover:border-primary/50",
              activeTab === tab.id
                ? "text-foreground border-primary bg-gradient-brand/5"
                : "text-muted-foreground border-transparent"
            )}
          >
            <div className="flex items-center gap-2">
              {tab.icon}
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Add hide-scrollbar utility to global CSS if not present
// .hide-scrollbar::-webkit-scrollbar { display: none; }
// .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }