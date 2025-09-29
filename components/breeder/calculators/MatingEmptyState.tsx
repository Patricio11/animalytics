"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Plus, Calculator, TrendingUp } from "lucide-react";

interface MatingEmptyStateProps {
  onCreateMating: () => void;
}

export function MatingEmptyState({ onCreateMating }: MatingEmptyStateProps) {
  return (
    <Card className="shadow-card border-primary/10">
      <CardContent className="py-16">
        <div className="flex flex-col items-center text-center max-w-md mx-auto space-y-6">
          {/* Icon */}
          <div className="relative">
            <div className="p-6 rounded-full bg-gradient-subtle border-2 border-primary/20">
              <Heart className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-gradient-brand shadow-md">
              <Calculator className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-foreground">
              No Mating Records Yet
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Start tracking breeding records by creating your first mating calculation.
              Get detailed progesterone analysis and conception ratings.
            </p>
          </div>

          {/* Features List */}
          <div className="w-full space-y-3 text-left bg-muted/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-chart-3/20 mt-0.5">
                <TrendingUp className="w-4 h-4 text-chart-3" />
              </div>
              <div>
                <div className="font-medium text-sm text-foreground">
                  Progesterone Tracking
                </div>
                <div className="text-xs text-muted-foreground">
                  Monitor hormone levels throughout the breeding cycle
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-chart-4/20 mt-0.5">
                <Calculator className="w-4 h-4 text-chart-4" />
              </div>
              <div>
                <div className="font-medium text-sm text-foreground">
                  Conception Ratings
                </div>
                <div className="text-xs text-muted-foreground">
                  Calculate success probability based on scientific data
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-primary/20 mt-0.5">
                <Heart className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-medium text-sm text-foreground">
                  Breeding History
                </div>
                <div className="text-xs text-muted-foreground">
                  Keep detailed records of all mating activities
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={onCreateMating}
            size="lg"
            className="w-full sm:w-auto bg-gradient-brand hover:opacity-90 shadow-card"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create First Mating Record
          </Button>

          {/* Secondary Info */}
          <p className="text-xs text-muted-foreground">
            Select a bitch and dog to get started with progesterone calculations
          </p>
        </div>
      </CardContent>
    </Card>
  );
}