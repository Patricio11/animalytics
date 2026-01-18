"use client";

import { Camera, MapPin, Calendar, Globe, BadgeCheck, Shield, Heart, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VerifiedCheckmark } from "@/components/ui/verified-badge";

interface ProfileHeaderProps {
  displayName: string;
  tagline?: string | null;
  logoUrl?: string | null;
  location?: {
    city?: string;
    state?: string;
    country: string;
  } | null;
  yearsInBusiness?: number | null;
  website?: string | null;
  kycVerified?: boolean;
  backgroundCheckVerified?: boolean;
  healthCertified?: boolean;
  premiumMember?: boolean;
  isEditing: boolean;
  onLogoChange?: (url: string) => void;
}

export function ProfileHeader({
  displayName,
  tagline,
  logoUrl,
  location,
  yearsInBusiness,
  website,
  kycVerified,
  backgroundCheckVerified,
  healthCertified,
  premiumMember,
  isEditing,
  onLogoChange,
}: ProfileHeaderProps) {
  const verificationBadges = [
    { label: 'KYC Verified', icon: BadgeCheck, active: kycVerified, color: 'text-chart-3' },
    { label: 'Background Check', icon: Shield, active: backgroundCheckVerified, color: 'text-primary-blue' },
    { label: 'Health Certified', icon: Heart, active: healthCertified, color: 'text-chart-1' },
    { label: 'Premium Member', icon: Award, active: premiumMember, color: 'text-chart-2' },
  ];

  const locationString = location
    ? [location.city, location.state, location.country].filter(Boolean).join(', ')
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
      <Card className="shadow-elevated border-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="w-40 h-40 border-4 border-surface shadow-card ring-4 ring-surface-secondary">
                <AvatarImage src={logoUrl || undefined} alt={displayName} />
                <AvatarFallback className="bg-gradient-brand text-white text-4xl font-bold">
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-2 right-2 shadow-card rounded-full"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                    {displayName}
                  </h1>
                  {kycVerified && <VerifiedCheckmark isVerified={true} className="w-7 h-7" />}
                </div>
                {tagline && (
                  <p className="text-base sm:text-lg text-muted-foreground">
                    {tagline}
                  </p>
                )}
              </div>

              {/* Verification Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {verificationBadges.map((badge) => {
                  const Icon = badge.icon;
                  return badge.active ? (
                    <Badge
                      key={badge.label}
                      className="bg-surface-secondary border-primary/30 shadow-sm hover:shadow-md transition-shadow text-foreground"
                    >
                      <Icon className={`w-3.5 h-3.5 mr-1.5 ${badge.color}`} />
                      <span className="text-xs font-medium">{badge.label}</span>
                    </Badge>
                  ) : null;
                })}
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {locationString && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{locationString}</span>
                  </div>
                )}
                {yearsInBusiness && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{yearsInBusiness} years in business</span>
                  </div>
                )}
                {website && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
