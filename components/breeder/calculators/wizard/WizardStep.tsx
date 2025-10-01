"use client";

import { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WizardStepProps {
  stepNumber?: number;
  title?: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  isActive?: boolean;
}

export function WizardStep({
  title,
  description,
  icon,
  children,
  className,
  isActive = true
}: WizardStepProps) {
  // Only render if this step is active
  if (!isActive) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Step Header (optional) */}
      {(title || description) && (
        <Card className="shadow-card border-primary/10 bg-gradient-subtle mb-6">
          <CardHeader>
            {title && (
              <CardTitle className="flex items-center gap-3">
                {icon && (
                  <div className="p-2 rounded-lg bg-gradient-brand shadow-md">
                    {icon}
                  </div>
                )}
                <span>{title}</span>
              </CardTitle>
            )}
            {description && (
              <CardDescription className="mt-2">
                {description}
              </CardDescription>
            )}
          </CardHeader>
        </Card>
      )}

      {/* Step Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}