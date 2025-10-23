"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { BreedMultiSelect } from "@/components/ui/breed-multi-select";
import { useBreeds } from "@/lib/api/queries/breeds";
import {
  useBreedPreferences,
  useUpdateBreedPreferences,
  useClearBreedPreferences,
} from "@/lib/api/queries/breed-preferences";
import { useToast } from "@/hooks/use-toast";
import { Heart, Save, X, Info, Loader2, Sparkles } from "lucide-react";

export function BreedPreferencesSection() {
  const { toast } = useToast();
  const { data: allBreeds, isLoading: breedsLoading } = useBreeds();
  const { data: preferences, isLoading: preferencesLoading } = useBreedPreferences();
  const updateMutation = useUpdateBreedPreferences();
  const clearMutation = useClearBreedPreferences();

  const [selectedBreedIds, setSelectedBreedIds] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize selected breeds from preferences
  useEffect(() => {
    if (preferences !== undefined) {
      const ids = preferences.map((p) => p.breedId);
      setSelectedBreedIds(ids);
    }
  }, [preferences]);

  // Check for changes
  useEffect(() => {
    if (preferences !== undefined) {
      const currentIds = preferences.map((p) => p.breedId).sort();
      const newIds = [...selectedBreedIds].sort();
      const changed = JSON.stringify(currentIds) !== JSON.stringify(newIds);
      setHasChanges(changed);
    }
  }, [selectedBreedIds, preferences]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(selectedBreedIds);
      toast({
        title: "Preferences saved",
        description: `Successfully updated ${selectedBreedIds.length} breed preference(s).`,
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save breed preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClear = async () => {
    try {
      await clearMutation.mutateAsync();
      setSelectedBreedIds([]);
      toast({
        title: "Preferences cleared",
        description: "All breed preferences have been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (preferences) {
      setSelectedBreedIds(preferences.map((p) => p.breedId));
      setHasChanges(false);
    }
  };

  const isLoading = breedsLoading || preferencesLoading;
  const isSaving = updateMutation.isPending || clearMutation.isPending;

  return (
    <Card className="shadow-card border-primary/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-brand shadow-md">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Breed Preferences</CardTitle>
            <CardDescription className="mt-1">
              Select the breeds you work with or are interested in
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info Alert */}
        <Alert className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="ml-2 text-sm">
            Your breed preferences help us filter animals, breeds, and content relevant to you.
            You can update these anytime.
          </AlertDescription>
        </Alert>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Breed Multi-Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select Breeds
                {selectedBreedIds.length > 0 && (
                  <span className="ml-2 text-muted-foreground">
                    ({selectedBreedIds.length} selected)
                  </span>
                )}
              </label>
              <BreedMultiSelect
                breeds={
                  allBreeds?.map((breed) => ({
                    id: breed.id,
                    name: breed.name,
                    sizeCategory: breed.sizeCategory,
                    imageUrl: breed.imageUrl,
                  })) || []
                }
                selectedBreedIds={selectedBreedIds}
                onSelectionChange={setSelectedBreedIds}
                placeholder="Search and select breeds..."
                emptyText="No breeds found. Try a different search."
                disabled={isSaving}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="flex-1 bg-gradient-brand hover:opacity-90 shadow-card"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>

              {hasChanges && (
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isSaving}
                  className="hover:bg-muted"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}

              {selectedBreedIds.length > 0 && !hasChanges && (
                <Button
                  onClick={handleClear}
                  variant="outline"
                  disabled={isSaving}
                  className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
