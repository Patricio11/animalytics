"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Heart, Award, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface AnimalCardProps {
  id: string;
  name: string;
  breed?: string;
  sex: string;
  dateOfBirth?: string;
  profileImageUrl?: string;
  isBreedingActive?: boolean;
  isChampion?: boolean;
  titles?: string[];
  color?: string;
  isActive?: boolean;
  healthStatus?: string;
}

export function AnimalCard({
  id,
  name,
  breed,
  sex,
  dateOfBirth,
  profileImageUrl,
  isBreedingActive,
  isChampion,
  titles,
  color,
  isActive,
  healthStatus,
}: AnimalCardProps) {
  // Calculate age from date of birth
  const getAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${years} year${years !== 1 ? 's' : ''}`;
  };

  return (
    <Card className="shadow-card hover-elevate transition-all duration-300 group overflow-hidden">
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {profileImageUrl ? (
            <Image
              src={profileImageUrl}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              <Eye className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}
          
          {/* Overlay Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isChampion && (
              <Badge className="bg-chart-2 text-white border-0 shadow-lg">
                <Award className="w-3 h-3 mr-1" />
                Champion
              </Badge>
            )}
            {isBreedingActive && (
              <Badge className="bg-chart-3 text-white border-0 shadow-lg">
                <Heart className="w-3 h-3 mr-1" />
                Breeding
              </Badge>
            )}
          </div>

          {/* Status Badge */}
          {!isActive && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="shadow-lg">
                Inactive
              </Badge>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Name and Titles */}
          <div>
            <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
              {name}
            </h3>
            {titles && titles.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {titles.map((title, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {title}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="space-y-2 text-sm">
            {breed && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Breed</span>
                <span className="font-medium">{breed}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sex</span>
              <Badge variant="secondary" className="text-xs">
                {sex === 'male' ? '♂ Male' : '♀ Female'}
              </Badge>
            </div>
            {dateOfBirth && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Age
                </span>
                <span className="font-medium">{getAge(dateOfBirth)}</span>
              </div>
            )}
            {color && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Color</span>
                <span className="font-medium">{color}</span>
              </div>
            )}
          </div>

          {/* Health Status */}
          {healthStatus && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Health</span>
                <Badge 
                  variant={healthStatus === 'excellent' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {healthStatus}
                </Badge>
              </div>
            </div>
          )}

          {/* View Profile Button */}
          <Link href={`/animal/${id}`} className="block pt-2">
            <Button className="w-full bg-gradient-brand hover:opacity-90">
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
