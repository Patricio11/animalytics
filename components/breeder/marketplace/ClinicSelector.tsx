"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clinic, mockClinics } from "@/lib/mock-data/marketplace-listings";
import { cn } from "@/lib/utils";
import { MapPin, Phone, CheckCircle } from "lucide-react";

interface ClinicSelectorProps {
  value?: string;
  onChange: (clinicId: string) => void;
  required?: boolean;
}

export function ClinicSelector({ value, onChange, required = false }: ClinicSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        Select Clinic {required && '*'}
      </Label>
      <p className="text-sm text-muted-foreground">
        Choose the reproductive clinic where services will be provided or semen is stored
      </p>
      <div className="grid grid-cols-1 gap-3">
        {mockClinics.map((clinic) => (
          <Card
            key={clinic.id}
            className={cn(
              "cursor-pointer transition-all duration-200 shadow-card border-0",
              value === clinic.id
                ? "border-2 border-primary bg-gradient-subtle shadow-elevated"
                : "hover:border-primary/30 hover:shadow-elevated"
            )}
            onClick={() => onChange(clinic.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Selection Indicator */}
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1",
                  value === clinic.id
                    ? "border-primary bg-primary"
                    : "border-muted"
                )}>
                  {value === clinic.id && (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Clinic Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={cn(
                        "font-semibold text-base",
                        value === clinic.id ? "text-primary" : "text-foreground"
                      )}>
                        {clinic.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {clinic.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {clinic.phone}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="flex flex-wrap gap-1">
                    {clinic.services.map((service) => (
                      <Badge
                        key={service}
                        variant="outline"
                        className="text-xs"
                      >
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}