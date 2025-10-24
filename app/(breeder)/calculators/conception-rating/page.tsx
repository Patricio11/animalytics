"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConceptionRatingCard } from "@/components/breeder/calculators/ConceptionRatingCard";
import { ConceptionRatingEmptyState } from "@/components/breeder/calculators/ConceptionRatingEmptyState";
import { ConceptionRatingWizard } from "@/components/breeder/calculators/ConceptionRatingWizard";
import { Heart, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConceptionRating } from "@/lib/calculations/conception-types";

interface StoredRating extends ConceptionRating {
  id: string;
  createdAt: Date;
}

export default function ConceptionRatingPage() {
  const { toast } = useToast();
  const [showWizard, setShowWizard] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratings, setRatings] = useState<StoredRating[]>([]);

  // Filter ratings based on search
  const filteredRatings = useMemo(() => {
    if (!searchQuery) return ratings;

    const query = searchQuery.toLowerCase();
    return ratings.filter((rating) => {
      const ratingText = `${rating.overallRating.toFixed(1)}%`;
      return ratingText.includes(query);
    });
  }, [ratings, searchQuery]);

  const handleCreateNew = () => {
    setShowWizard(true);
  };

  const handleWizardComplete = (rating: ConceptionRating) => {
    // Add new rating to the list
    const newRating: StoredRating = {
      ...rating,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    setRatings((prev) => [newRating, ...prev]);

    toast({
      title: "Rating calculated!",
      description: `Conception rating: ${rating.overallRating.toFixed(1)}%`,
    });
  };

  const handleDeleteRating = (id: string) => {
    if (confirm("Are you sure you want to delete this rating?")) {
      setRatings((prev) => prev.filter((r) => r.id !== id));
      toast({
        title: "Rating deleted",
        description: "The conception rating has been removed",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Conception Rating Calculator
              </h1>
              <p className="text-muted-foreground mt-1">
                Calculate breeding success probability
              </p>
            </div>
          </div>

          <Button
            onClick={handleCreateNew}
            size="lg"
            className="bg-gradient-brand hover:opacity-90 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Calculation
          </Button>
        </div>

        {/* Search Bar */}
        {ratings.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search ratings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {ratings.length === 0 ? (
          <ConceptionRatingEmptyState onCreateNew={handleCreateNew} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRatings.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No ratings match your search
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredRatings.map((rating) => (
                <ConceptionRatingCard
                  key={rating.id}
                  rating={rating}
                  createdAt={rating.createdAt}
                  onDelete={() => handleDeleteRating(rating.id)}
                />
              ))
            )}
          </div>
        )}

        {/* Stats Card */}
        {ratings.length > 0 && (
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {ratings.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Calculations
                  </p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {(
                      ratings.reduce((sum, r) => sum + r.overallRating, 0) /
                      ratings.length
                    ).toFixed(1)}
                    %
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Average Rating
                  </p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {Math.max(...ratings.map((r) => r.overallRating)).toFixed(
                      1
                    )}
                    %
                  </p>
                  <p className="text-sm text-muted-foreground">Highest Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Wizard Modal */}
      <ConceptionRatingWizard
        open={showWizard}
        onOpenChange={setShowWizard}
        onComplete={handleWizardComplete}
      />
    </div>
  );
}
