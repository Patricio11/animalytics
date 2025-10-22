"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MatingCard } from "@/components/breeder/calculators/MatingCard";
import { MatingEmptyState } from "@/components/breeder/calculators/MatingEmptyState";
import { CreateMatingDialog } from "@/components/breeder/calculators/CreateMatingDialog";
import { MatingCardSkeleton } from "@/components/breeder/calculators/MatingCardSkeleton";
import { Heart, Plus, Search, Filter, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMatings, useCreateMating } from "@/lib/api/queries/matings";
import { useAnimals } from "@/lib/api/queries/animals";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APIMating, APIAnimal } from "@/lib/api/types";

export default function MatingCalculatorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data from API
  const { data: matingsData, isLoading: matingsLoading, isError: matingsError } = useMatings();
  const { data: animalsData, isLoading: animalsLoading } = useAnimals();
  const createMatingMutation = useCreateMating();

  // Filter matings based on search
  const filteredMatings = useMemo(() => {
    if (!matingsData) return [];

    return matingsData.filter((mating: APIMating) => {
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      return (
        mating.bitch?.name?.toLowerCase().includes(query) ||
        mating.dog?.name?.toLowerCase().includes(query) ||
        mating.bitch?.breed?.name?.toLowerCase().includes(query) ||
        mating.dog?.breed?.name?.toLowerCase().includes(query)
      );
    });
  }, [matingsData, searchQuery]);

  const handleCreateMating = () => {
    setShowCreateDialog(true);
  };

  const handleMatingSubmit = async (data: {
    bitchId: string;
    dogId?: string;
    frozenSemenId?: string;
    matingDate: string;
    breedingMethod: 'natural_ai' | 'tci' | 'surgical_ai' | 'frozen';
    notes?: string;
  }) => {
    try {
      const newMating = await createMatingMutation.mutateAsync({
        ...data,
        status: 'planned',
      });

      setShowCreateDialog(false);

      toast({
        title: "Mating record created",
        description: "You can now enter progesterone readings and run calculations."
      });

      // Navigate to the mating detail page
      router.push(`/calculators/mating/${newMating.id}`);
    } catch (error) {
      console.error('Failed to create mating:', error);
      toast({
        title: "Error",
        description: "Failed to create mating record. Please try again.",
        variant: "destructive"
      });
    }
  };

  const hasMatings = (matingsData?.length || 0) > 0;
  const isLoading = matingsLoading || animalsLoading;

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-brand shadow-md">
                <Heart className="w-6 h-6 text-white" />
              </div>
              Mating Calculator
            </h1>
            <p className="text-muted-foreground mt-2">
              Track breeding records and calculate conception probabilities
            </p>
          </div>

          {hasMatings && (
            <Button
              onClick={handleCreateMating}
              className="bg-gradient-brand hover:opacity-90 shadow-card"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Mating Record
            </Button>
          )}
        </div>

        {/* Search and Filters (only show if has matings) */}
        {hasMatings && (
          <Card className="shadow-card border-primary/10">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by animal name or breed..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background border-primary/20"
                  />
                </div>
                <Button variant="outline" className="hover:bg-primary/10 hover:border-primary">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <>
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="shadow-card border-primary/10">
                  <CardHeader className="pb-3">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-9 w-16 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mating Cards Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <MatingCardSkeleton key={i} />
              ))}
            </div>
          </>
        )}

        {/* Error State */}
        {matingsError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load mating records. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Content */}
        {!isLoading && !matingsError && (
          <>
            {!hasMatings ? (
              <MatingEmptyState onCreateMating={handleCreateMating} />
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="shadow-card border-primary/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Matings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-foreground">
                        {matingsData?.length || 0}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-card border-primary/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Average Rating
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-chart-4">
                        {matingsData && matingsData.length > 0
                          ? (matingsData.reduce((sum: number, m: APIMating) => sum + (m.overallRating || 0), 0) / matingsData.length).toFixed(1)
                          : '0.0'}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-card border-primary/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Success Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-chart-3">
                        {matingsData && matingsData.length > 0
                          ? ((matingsData.filter((m: APIMating) => m.status === 'resulted_in_litter').length / matingsData.length) * 100).toFixed(0)
                          : '0'}%
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Mating Records List */}
                {filteredMatings.length === 0 ? (
                  <Card className="shadow-card border-primary/10">
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">
                        No mating records found matching your search
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredMatings.map((mating: APIMating) => (
                      <MatingCard
                        key={mating.id}
                        mating={{
                          id: mating.id,
                          bitchId: mating.bitchId,
                          dogId: mating.dogId || '',
                          matingDate: mating.matingDate,
                          progesteroneLevel: 0,
                          status: mating.status as any,
                          progesteroneCycleRating: mating.progesteroneCycleRating || 0,
                          conceptionRating: mating.conceptionRating || 0,
                          overallRating: mating.overallRating || 0,
                          createdAt: typeof mating.createdAt === 'string' ? mating.createdAt : mating.createdAt.toISOString(),
                        }}
                        bitch={{
                          id: mating.bitch?.id || '',
                          name: mating.bitch?.name || 'Unknown',
                          breed: mating.bitch?.breed?.name || 'Unknown',
                          photos: [mating.bitch?.profileImageUrl || '']
                        } as any}
                        dog={{
                          id: mating.dog?.id || '',
                          name: mating.dog?.name || mating.frozenSemenBatch?.batchIdentifier || 'Unknown',
                          breed: mating.dog?.breed?.name || 'Frozen Semen',
                          photos: [mating.dog?.profileImageUrl || '']
                        } as any}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Create Mating Dialog */}
        <CreateMatingDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSubmit={handleMatingSubmit}
          isLoading={createMatingMutation.isPending}
        />
      </div>
    </div>
  );
}