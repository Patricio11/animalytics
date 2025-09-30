"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ListingCategory, getCategoryLabel } from "@/lib/mock-data/marketplace-listings";
import { cn } from "@/lib/utils";

interface ListingCategorySelectorProps {
  value: ListingCategory;
  onChange: (category: ListingCategory) => void;
}

const categories: { value: ListingCategory; label: string; icon: string; description: string }[] = [
  {
    value: 'dog-for-sale',
    label: 'Dog for Sale',
    icon: '🐕',
    description: 'Sell an adult dog from your breeding program',
  },
  {
    value: 'pups-for-sale',
    label: 'Puppies for Sale',
    icon: '🐶',
    description: 'List available puppies from your litters',
  },
  {
    value: 'reproductive-services',
    label: 'Reproductive Services',
    icon: '💉',
    description: 'Offer AI services with fresh or chilled semen',
  },
  {
    value: 'frozen-semen',
    label: 'Frozen Semen for Sale',
    icon: '❄️',
    description: 'Sell frozen semen straws stored at a clinic',
  },
  {
    value: 'stud-dog',
    label: 'Stud Dog',
    icon: '👑',
    description: 'Offer stud services for breeding',
  },
];

export function ListingCategorySelector({ value, onChange }: ListingCategorySelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Listing Category *</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((category) => (
          <Card
            key={category.value}
            className={cn(
              "cursor-pointer transition-all duration-200 shadow-card border-0",
              value === category.value
                ? "border-2 border-primary bg-gradient-subtle shadow-elevated"
                : "hover:border-primary/30 hover:shadow-elevated"
            )}
            onClick={() => onChange(category.value)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{category.icon}</div>
                <div className="flex-1 space-y-1">
                  <div className={cn(
                    "font-semibold text-sm",
                    value === category.value ? "text-primary" : "text-foreground"
                  )}>
                    {category.label}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}