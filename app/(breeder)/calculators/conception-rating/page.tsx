"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { ConceptionRatingCard } from "@/components/breeder/calculators/ConceptionRatingCard";
import { ConceptionRatingEmptyState } from "@/components/breeder/calculators/ConceptionRatingEmptyState";
import { ConceptionRatingWizard } from "@/components/breeder/calculators/ConceptionRatingWizard";
import { Heart, Plus, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConceptionRating } from "@/lib/calculations/conception-types";

interface Animal {
  id: string;
  name: string;
  registrationNumber?: string | null;
  avatarUrl?: string | null;
  breed?: {
    name: string;
  };
}

interface StoredRating extends ConceptionRating {
  id: string;
  createdAt: Date;
  bitch?: Animal;
  dog?: Animal;
  frozenSemen?: {
    id: string;
    dogName: string;
    registrationNumber?: string | null;
  };
}

export default function ConceptionRatingPage() {
  const { toast } = useToast();
  const [showWizard, setShowWizard] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratings, setRatings] = useState<StoredRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ratingToDelete, setRatingToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Resolve profile photo from photos relation
  const resolvePhoto = (animal: any) => {
    if (!animal) return undefined;
    const profilePhoto = animal.photos?.find((p: any) => p.category === 'profile');
    return profilePhoto?.fileUrl || animal.photos?.[0]?.fileUrl || animal.profileImageUrl || undefined;
  };

  // Fetch ratings from database
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await fetch('/api/conception-ratings');
        if (!response.ok) throw new Error('Failed to fetch ratings');
        const result = await response.json();
        
        // Transform API data to match component expectations
        const transformedRatings = (result.ratings || []).map((mating: any) => ({
          id: mating.id,
          overallRating: parseFloat(mating.conceptionRating || mating.overallRating || 0),
          informationAccuracy: parseFloat(mating.informationAccuracy || 0),
          breakdown: mating.ratingBreakdown || {},
          totalWeight: 100,
          missingWeight: 0,
          createdAt: new Date(mating.createdAt),
          bitch: mating.bitch ? { ...mating.bitch, avatarUrl: resolvePhoto(mating.bitch) } : undefined,
          dog: mating.dog ? { ...mating.dog, avatarUrl: resolvePhoto(mating.dog) } : undefined,
          frozenSemen: mating.frozenSemen,
        }));
        
        setRatings(transformedRatings);
      } catch (error) {
        console.error('Error fetching ratings:', error);
        toast({
          title: "Error",
          description: "Failed to load ratings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [toast]);

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

  const handleWizardComplete = async (rating: ConceptionRating) => {
    // Refetch ratings from database to get the newly saved one
    try {
      const response = await fetch('/api/conception-ratings');
      if (!response.ok) throw new Error('Failed to fetch ratings');
      const result = await response.json();
      
      const transformedRatings = (result.ratings || []).map((mating: any) => ({
        id: mating.id,
        overallRating: parseFloat(mating.conceptionRating || mating.overallRating || 0),
        informationAccuracy: parseFloat(mating.informationAccuracy || 0),
        breakdown: mating.ratingBreakdown || {},
        totalWeight: 100,
        missingWeight: 0,
        createdAt: new Date(mating.createdAt),
        bitch: mating.bitch ? { ...mating.bitch, avatarUrl: resolvePhoto(mating.bitch) } : undefined,
        dog: mating.dog ? { ...mating.dog, avatarUrl: resolvePhoto(mating.dog) } : undefined,
        frozenSemen: mating.frozenSemen,
      }));
      
      setRatings(transformedRatings);
    } catch (error) {
      console.error('Error refreshing ratings:', error);
    }
  };

  const handleDeleteRating = (id: string) => {
    setRatingToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!ratingToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/conception-ratings/${ratingToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete rating');

      setRatings((prev) => prev.filter((r) => r.id !== ratingToDelete));
      toast({
        title: "Rating deleted",
        description: "The conception rating has been removed",
      });
      setDeleteModalOpen(false);
      setRatingToDelete(null);
    } catch (error) {
      console.error('Error deleting rating:', error);
      toast({
        title: "Error",
        description: "Failed to delete rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="shadow-card border-primary/10">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center py-6">
                    <Skeleton className="h-32 w-32 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : ratings.length === 0 ? (
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
                  bitch={rating.bitch}
                  dog={rating.dog}
                  frozenSemen={rating.frozenSemen}
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

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Conception Rating"
        description="Are you sure you want to delete this conception rating? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}
