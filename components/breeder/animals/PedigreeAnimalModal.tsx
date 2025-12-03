"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ExternalLink,
  Calendar,
  MapPin,
  Palette,
  Hash,
  User,
  Heart,
  Award,
  Edit,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PedigreeNode {
  id: string;
  name: string;
  registeredName?: string | null;
  registrationNumber?: string | null;
  microchipNumber?: string | null;
  sex?: string | null;
  dateOfBirth?: string | null;
  color?: string | null;
  profileImageUrl?: string | null;
  dam?: PedigreeNode | null;
  sire?: PedigreeNode | null;
  isManualEntry?: boolean;
}

interface PedigreeAnimalModalProps {
  animal: PedigreeNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isOwner?: boolean;
  onEdit?: () => void;
}

export function PedigreeAnimalModal({
  animal,
  open,
  onOpenChange,
  isOwner = false,
  onEdit,
}: PedigreeAnimalModalProps) {
  const router = useRouter();

  if (!animal) return null;

  const isSystemAnimal = !animal.isManualEntry;
  const displayName = animal.registeredName || animal.name;
  const hasCallName = animal.registeredName && animal.name && animal.registeredName !== animal.name;

  const handleViewFullProfile = () => {
    if (isSystemAnimal && animal.id) {
      router.push(`/animals/${animal.id}`);
      onOpenChange(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {animal.isManualEntry ? "Pedigree Entry" : "Animal Profile"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section with Avatar */}
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={animal.profileImageUrl || undefined} alt={displayName} />
              <AvatarFallback className="text-2xl font-bold bg-gradient-brand text-white">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold">{displayName}</h3>
                  {hasCallName && (
                    <p className="text-sm text-muted-foreground italic">
                      Call name: {animal.name}
                    </p>
                  )}
                </div>
                {animal.sex && (
                  <Badge
                    variant={animal.sex === "male" ? "default" : "secondary"}
                    className={cn(
                      "text-xs font-semibold",
                      animal.sex === "male"
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-pink-500 hover:bg-pink-600"
                    )}
                  >
                    {animal.sex === "male" ? "♂ Male" : "♀ Female"}
                  </Badge>
                )}
              </div>

              {animal.isManualEntry && (
                <Badge variant="outline" className="border-amber-500 text-amber-600">
                  <FileText className="w-3 h-3 mr-1" />
                  Manual Entry
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Registration Number */}
            {animal.registrationNumber && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Hash className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Registration Number</p>
                  <p className="text-sm font-semibold truncate">{animal.registrationNumber}</p>
                </div>
              </div>
            )}

            {/* Microchip Number */}
            {animal.microchipNumber && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Award className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Microchip Number</p>
                  <p className="text-sm font-semibold truncate">{animal.microchipNumber}</p>
                </div>
              </div>
            )}

            {/* Date of Birth */}
            {animal.dateOfBirth && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Date of Birth</p>
                  <p className="text-sm font-semibold">
                    {format(new Date(animal.dateOfBirth), "MMMM d, yyyy")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      const today = new Date();
                      const birthDate = new Date(animal.dateOfBirth);
                      const ageInMonths =
                        (today.getFullYear() - birthDate.getFullYear()) * 12 +
                        today.getMonth() -
                        birthDate.getMonth();
                      const years = Math.floor(ageInMonths / 12);
                      const months = ageInMonths % 12;
                      return years > 0
                        ? `${years} year${years !== 1 ? "s" : ""} ${months > 0 ? `${months} month${months !== 1 ? "s" : ""}` : ""} old`
                        : `${months} month${months !== 1 ? "s" : ""} old`;
                    })()}
                  </p>
                </div>
              </div>
            )}

            {/* Color */}
            {animal.color && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Palette className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Color</p>
                  <p className="text-sm font-semibold capitalize">{animal.color}</p>
                </div>
              </div>
            )}
          </div>

          {/* Parents Section */}
          {(animal.sire || animal.dam) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Parents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Sire */}
                  {animal.sire && (
                    <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
                      <p className="text-xs text-muted-foreground font-medium mb-1">SIRE (Father)</p>
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                        {animal.sire.registeredName || animal.sire.name}
                      </p>
                      {animal.sire.registrationNumber && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {animal.sire.registrationNumber}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Dam */}
                  {animal.dam && (
                    <div className="p-3 rounded-lg border border-pink-200 bg-pink-50/50 dark:border-pink-800 dark:bg-pink-950/20">
                      <p className="text-xs text-muted-foreground font-medium mb-1">DAM (Mother)</p>
                      <p className="text-sm font-semibold text-pink-700 dark:text-pink-400">
                        {animal.dam.registeredName || animal.dam.name}
                      </p>
                      {animal.dam.registrationNumber && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {animal.dam.registrationNumber}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <Separator />
          <div className="flex flex-wrap items-center justify-end gap-2">
            {isOwner && animal.isManualEntry && onEdit && (
              <Button variant="outline" onClick={onEdit} className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Entry
              </Button>
            )}

            {isSystemAnimal && (
              <Button onClick={handleViewFullProfile} className="gap-2 bg-gradient-brand">
                <ExternalLink className="w-4 h-4" />
                View Full Profile
              </Button>
            )}

            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
