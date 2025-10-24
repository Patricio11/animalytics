"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Sparkles } from "lucide-react";

interface ConceptionRatingEmptyStateProps {
  onCreateNew: () => void;
}

export function ConceptionRatingEmptyState({ onCreateNew }: ConceptionRatingEmptyStateProps) {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-pink-600" />
        </div>

        <h3 className="text-2xl font-bold text-center mb-2">
          No Conception Ratings Yet
        </h3>

        <p className="text-muted-foreground text-center max-w-md mb-8">
          Calculate conception probability based on breed, health, breeding history, and semen quality.
          Get detailed insights to optimize your breeding program.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-start gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-semibold">1</span>
            </div>
            <div>
              <p className="font-medium">Enter Breeding Data</p>
              <p className="text-muted-foreground text-xs">Provide information about the breeding pair</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <span className="text-purple-600 font-semibold">2</span>
            </div>
            <div>
              <p className="font-medium">Get Rating</p>
              <p className="text-muted-foreground text-xs">Receive detailed conception probability</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <span className="text-green-600 font-semibold">3</span>
            </div>
            <div>
              <p className="font-medium">Optimize</p>
              <p className="text-muted-foreground text-xs">Use insights to improve success rates</p>
            </div>
          </div>
        </div>

        <Button
          onClick={onCreateNew}
          size="lg"
          className="bg-gradient-brand hover:opacity-90"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Calculate Conception Rating
        </Button>

        <p className="text-xs text-muted-foreground mt-4">
          Takes about 5-10 minutes to complete
        </p>
      </CardContent>
    </Card>
  );
}
