"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MatingCard } from "@/components/breeder/calculators/MatingCard";
import { MatingEmptyState } from "@/components/breeder/calculators/MatingEmptyState";
import { AnimalPickerDialog } from "@/components/breeder/calculators/AnimalPickerDialog";
import { Heart, Plus, Search, Filter } from "lucide-react";
import { mockMatingRecords, mockAnimals } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function MatingCalculatorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showAnimalPicker, setShowAnimalPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // TODO: Replace with actual data fetching
  const matings = mockMatingRecords;
  const animals = mockAnimals;

  // Filter matings based on search
  const filteredMatings = matings.filter(mating => {
    if (!searchQuery) return true;

    const bitch = animals.find(a => a.id === mating.bitchId);
    const dog = animals.find(a => a.id === mating.dogId);

    const query = searchQuery.toLowerCase();
    return (
      bitch?.name.toLowerCase().includes(query) ||
      dog?.name.toLowerCase().includes(query) ||
      bitch?.breed.toLowerCase().includes(query) ||
      dog?.breed.toLowerCase().includes(query)
    );
  });

  const handleCreateMating = () => {
    setShowAnimalPicker(true);
  };

  const handleAnimalSelectionComplete = (
    bitchId: string,
    dogId: string | null,
    frozenSemenId: string | null
  ) => {
    setShowAnimalPicker(false);

    // TODO: Create new mating record and show progesterone form
    // For now, just show a toast
    toast({
      title: "Animals selected",
      description: "Mating record created. You can now enter progesterone readings."
    });

    // In production, this would create a mating record and navigate to its detail page
    // router.push(`/calculators/mating/${newMatingId}`);
  };

  const hasMatings = matings.length > 0;

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

        {/* Content */}
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
                    {matings.length}
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
                    {(matings.reduce((sum, m) => sum + m.overallRating, 0) / matings.length).toFixed(1)}%
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
                    {((matings.filter(m => m.status === 'successful' || m.status === 'completed').length / matings.length) * 100).toFixed(0)}%
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
                {filteredMatings.map(mating => {
                  const bitch = animals.find(a => a.id === mating.bitchId)!;
                  const dog = animals.find(a => a.id === mating.dogId)!;

                  return (
                    <MatingCard
                      key={mating.id}
                      mating={mating}
                      bitch={bitch}
                      dog={dog}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Animal Picker Dialog */}
        <AnimalPickerDialog
          open={showAnimalPicker}
          onOpenChange={setShowAnimalPicker}
          animals={animals}
          onComplete={handleAnimalSelectionComplete}
        />
      </div>
    </div>
  );
}