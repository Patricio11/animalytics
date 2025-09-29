"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WizardStepProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function WizardStep({
  title,
  description,
  icon,
  children,
  className
}: WizardStepProps) {
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