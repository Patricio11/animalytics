"use client";

import { useState, useMemo } from "react";
import { AnimalCard } from "@/components/breeder/AnimalCard";
import { AddAnimalDialog } from "@/components/breeder/animals/AddAnimalDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Loader2, AlertCircle } from "lucide-react";
import { useAnimals } from "@/lib/api/queries/animals";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APIAnimal } from "@/lib/api/types";

export default function Animals() {
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch animals from API
  const { data: animals, isLoading, isError, error } = useAnimals();

  // Filter and search animals
  const displayAnimals = useMemo(() => {
    if (!animals) return [];

    return animals
      .filter((animal: APIAnimal) => {
        // Search filter
        const matchesSearch = searchQuery
          ? animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            animal.breed?.name?.toLowerCase().includes(searchQuery.toLowerCase())
          : true;

        // Gender filter
        const matchesGender = genderFilter === "all" || animal.sex === genderFilter;

        // Status filter (based on isActive and isBreedingActive)
        let matchesStatus = true;
        if (statusFilter === "available") {
          matchesStatus = animal.isActive && !animal.isBreedingActive;
        } else if (statusFilter === "breeding") {
          matchesStatus = animal.isBreedingActive;
        } else if (statusFilter === "retired") {
          matchesStatus = !animal.isActive;
        }

        return matchesSearch && matchesGender && matchesStatus;
      })
      .map((animal: APIAnimal) => ({
        id: animal.id,
        name: animal.name,
        breed: animal.breed?.name || "Unknown",
        gender: animal.sex as "male" | "female",
        dateOfBirth: animal.dateOfBirth ? new Date(animal.dateOfBirth) : new Date(),
        imageUrl:
          animal.profileImageUrl ||
          "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop&crop=face",
        status: animal.isBreedingActive
          ? ("breeding" as const)
          : animal.isActive
          ? ("available" as const)
          : ("retired" as const),
      }));
  }, [animals, searchQuery, genderFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Animals</h1>
            <p className="text-muted-foreground">Manage your animal portfolio</p>
          </div>
          <Button
            className="bg-gradient-brand hover:opacity-90 shadow-card"
            data-testid="button-add-animal"
            onClick={() => setShowAddAnimal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Animal
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-surface shadow-card rounded-lg p-6 border-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search animals..."
                className="pl-10 bg-background border-primary/20 focus:border-primary"
                data-testid="input-search-animals"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background border-primary/20 focus:border-primary" data-testid="select-filter-gender">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background border-primary/20 focus:border-primary" data-testid="select-filter-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="breeding">Breeding</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading animals...</span>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load animals. {error?.message || "Please try again later."}
            </AlertDescription>
          </Alert>
        )}

        {/* Animals Grid */}
        {!isLoading && !isError && (
          <>
            {displayAnimals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayAnimals.map((animal: any) => (
                  <AnimalCard key={animal.id} {...animal} />
                ))}
              </div>
            ) : (
              <div className="bg-surface shadow-card rounded-lg p-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery || genderFilter !== "all" || statusFilter !== "all"
                    ? "No animals found matching your filters."
                    : "No animals yet. Add your first animal to get started!"}
                </p>
              </div>
            )}
          </>
        )}

        {/* Add Animal Dialog */}
        <AddAnimalDialog open={showAddAnimal} onOpenChange={setShowAddAnimal} />
      </div>
    </div>
  );
}