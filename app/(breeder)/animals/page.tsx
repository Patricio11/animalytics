"use client";

import { useState, useMemo } from "react";
import { AnimalCard } from "@/components/breeder/AnimalCard";
import { AddAnimalDialog } from "@/components/breeder/animals/AddAnimalDialog";
import { EditAnimalDialog } from "@/components/breeder/animals/EditAnimalDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BreedCombobox } from "@/components/ui/breed-combobox";
import { Plus, Search, Filter, Loader2, AlertCircle } from "lucide-react";
import { useAnimals } from "@/lib/api/queries/animals";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APIAnimal } from "@/lib/api/types";

export default function Animals() {
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [showEditAnimal, setShowEditAnimal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [breedFilter, setBreedFilter] = useState<string>("");
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

        // Breed filter
        const matchesBreed = !breedFilter || animal.breed?.name === breedFilter;

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

        return matchesSearch && matchesBreed && matchesGender && matchesStatus;
      })
      .map((animal: APIAnimal) => {
        // Get profile photo from animal_photos table (category='profile') or fallback
        const profilePhoto = animal.photos?.find((p: any) => p.category === 'profile');
        const imageUrl = profilePhoto?.fileUrl || 
                         animal.photos?.[0]?.fileUrl || 
                         animal.profileImageUrl ||
                         undefined; // No placeholder URL - let the card handle it
        
        return {
          id: animal.id,
          name: animal.name,
          registeredName: animal.registeredName,
          breed: animal.breed?.name || "Unknown",
          gender: animal.sex as "male" | "female",
          dateOfBirth: animal.dateOfBirth ? new Date(animal.dateOfBirth) : new Date(),
          imageUrl,
          status: animal.isBreedingActive
            ? ("breeding" as const)
            : animal.isActive
            ? ("available" as const)
            : ("retired" as const),
          ownerName: animal.owner?.name,
          breederName: animal.breeder?.name,
        };
      });
  }, [animals, searchQuery, breedFilter, genderFilter, statusFilter]);

  // Handle edit animal
  const handleEditAnimal = (animal: any) => {
    setEditingAnimal(animal);
    setShowEditAnimal(true);
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Animals</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your animal portfolio</p>
          </div>
          <Button
            className="bg-gradient-brand hover:opacity-90 shadow-card w-full sm:w-auto"
            data-testid="button-add-animal"
            onClick={() => setShowAddAnimal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Animal
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-surface shadow-card rounded-lg p-6 border-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search animals..."
                className="pl-10 bg-background border-primary/20 focus:border-primary"
                data-testid="input-search-animals"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <BreedCombobox
                value={breedFilter}
                onChange={setBreedFilter}
                placeholder="All Breeds"
                showAllOption={true}
              />
            </div>
            <div>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-full bg-background border-primary/20 focus:border-primary" data-testid="select-filter-gender">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-background border-primary/20 focus:border-primary" data-testid="select-filter-status">
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
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="shadow-card">
                <CardContent className="p-0">
                  <Skeleton className="aspect-square w-full rounded-t-lg" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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

        {/* Animals Grid - Only show when not loading, not error, and has animals */}
        {!isLoading && !isError && animals && displayAnimals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayAnimals.map((animal: any) => (
              <AnimalCard key={animal.id} {...animal} onEdit={() => handleEditAnimal(animal)} />
            ))}
          </div>
        )}

        {/* Empty State - Only show when not loading, not error, data loaded, and no animals */}
        {!isLoading && !isError && animals && displayAnimals.length === 0 && (
          <div className="bg-surface shadow-card rounded-lg p-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery || breedFilter || genderFilter !== "all" || statusFilter !== "all"
                ? "No animals found matching your filters."
                : "No animals yet. Add your first animal to get started!"}
            </p>
          </div>
        )}

        {/* Add Animal Dialog */}
        <AddAnimalDialog open={showAddAnimal} onOpenChange={setShowAddAnimal} />
        
        {/* Edit Animal Dialog */}
        {editingAnimal && (
          <EditAnimalDialog
            open={showEditAnimal}
            onOpenChange={setShowEditAnimal}
            animalId={editingAnimal.id}
            animalData={{
              name: editingAnimal.name,
              sex: editingAnimal.gender,
              breed: editingAnimal.breed,
              dateOfBirth: editingAnimal.dateOfBirth,
              imageUrl: editingAnimal.imageUrl,
            }}
          />
        )}
      </div>
    </div>
  );
}