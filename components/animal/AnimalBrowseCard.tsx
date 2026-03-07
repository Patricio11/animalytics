"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MapPin, Trophy, ShieldCheck } from "lucide-react";

interface AnimalBrowseCardProps {
  id: string;
  name: string;
  registeredName?: string | null;
  breedName?: string | null;
  sex: "male" | "female";
  dateOfBirth?: string | null;
  color?: string | null;
  profileImageUrl?: string | null;
  isChampion?: boolean | null;
  breederName?: string | null;
  breederVerified?: boolean | null;
  breederLocation?: { city?: string; state?: string; country?: string } | null;
}

function getAge(dob: string | null | undefined): string | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 1) return "< 1 month";
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""}`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} year${years !== 1 ? "s" : ""}`;
  return `${years}y ${rem}m`;
}

function getLocationString(loc: AnimalBrowseCardProps["breederLocation"]): string | null {
  if (!loc) return null;
  const parts = [loc.city, loc.state, loc.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

export function AnimalBrowseCard({
  id,
  name,
  registeredName,
  breedName,
  sex,
  dateOfBirth,
  color,
  profileImageUrl,
  isChampion,
  breederName,
  breederVerified,
  breederLocation,
}: AnimalBrowseCardProps) {
  const age = getAge(dateOfBirth);
  const locationStr = getLocationString(breederLocation);
  const displayName = registeredName || name;

  return (
    <Link href={`/animal/${id}`} className="group block">
      <div className="bg-surface rounded-2xl border border-border/50 overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="aspect-[4/3] relative overflow-hidden bg-muted">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={displayName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-subtle">
              <span className="text-4xl font-bold text-primary/20">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Badges overlay */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {isChampion && (
              <Badge className="bg-warning/90 text-white border-0 backdrop-blur-sm shadow-sm text-xs">
                <Trophy className="w-3 h-3 mr-1" />
                Champion
              </Badge>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <Badge
              variant="secondary"
              className={`backdrop-blur-sm border-0 shadow-sm text-xs ${
                sex === "male"
                  ? "bg-blue-500/90 text-white"
                  : "bg-pink-500/90 text-white"
              }`}
            >
              {sex === "male" ? "Male" : "Female"}
            </Badge>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {displayName}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            {breedName && (
              <span className="text-sm text-muted-foreground truncate">{breedName}</span>
            )}
            {breedName && age && <span className="text-muted-foreground/40">·</span>}
            {age && (
              <span className="text-sm text-muted-foreground shrink-0">{age}</span>
            )}
          </div>

          {color && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{color}</p>
          )}

          {/* Breeder Info */}
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {breederVerified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                )}
                <span className="text-xs text-muted-foreground truncate">
                  {breederName || "Unknown Breeder"}
                </span>
              </div>
              {locationStr && (
                <div className="flex items-center gap-1 shrink-0">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {locationStr}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
