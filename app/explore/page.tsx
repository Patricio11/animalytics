"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, PawPrint, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BreedCombobox } from "@/components/ui/breed-combobox";
import { AnimalBrowseCard } from "@/components/animal/AnimalBrowseCard";

function usePublicAnimals(search: string, breed: string, sex: string, location: string, limit: number) {
  return useQuery({
    queryKey: ["public-animals", search, breed, sex, location, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (breed && breed !== "all") params.set("breed", breed);
      if (sex && sex !== "all") params.set("sex", sex);
      if (location) params.set("location", location);
      params.set("limit", String(limit));

      const response = await fetch(`/api/animals/public?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch animals");
      return response.json();
    },
  });
}

export default function ExplorePage() {
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");
  const [selectedBreed, setSelectedBreed] = useState(searchParams.get("breed") || "");
  const [selectedSex, setSelectedSex] = useState(searchParams.get("sex") || "");
  const [locationFilter, setLocationFilter] = useState(searchParams.get("location") || "");
  const [debouncedLocation, setDebouncedLocation] = useState(searchParams.get("location") || "");
  const [limit, setLimit] = useState(24);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedLocation(locationFilter), 500);
    return () => clearTimeout(timer);
  }, [locationFilter]);

  const { data, isLoading, error } = usePublicAnimals(
    debouncedSearch,
    selectedBreed,
    selectedSex,
    debouncedLocation,
    limit
  );

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedBreed("");
    setSelectedSex("");
    setLocationFilter("");
    setDebouncedLocation("");
    setLimit(24);
  };

  const hasActiveFilters = debouncedSearch || (selectedBreed && selectedBreed !== "all") || (selectedSex && selectedSex !== "all") || debouncedLocation;

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <div className="bg-gradient-brand text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <PawPrint className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold">Browse Animals</h1>
          </div>
          <p className="text-lg opacity-90">
            Discover animals from verified breeders across the country
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <Card className="shadow-elevated">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {/* Main search row */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, breed, or breeder..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="City, state or country..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  className="sm:w-auto shrink-0"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Expandable filters */}
              {showFilters && (
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border/50">
                  <div className="w-full sm:w-64">
                    <BreedCombobox
                      value={selectedBreed}
                      onChange={setSelectedBreed}
                      placeholder="All Breeds"
                      showAllOption={true}
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <Select value={selectedSex} onValueChange={setSelectedSex}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Sex" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Sex</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                      Clear all
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {data && !isLoading && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Found{" "}
              <span className="font-semibold text-foreground">
                {data.pagination.total}
              </span>{" "}
              animal{data.pagination.total !== 1 ? "s" : ""}
              {debouncedSearch && ` matching "${debouncedSearch}"`}
              {debouncedLocation && ` in "${debouncedLocation}"`}
            </p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="shadow-card overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <p className="text-destructive mb-4">Failed to load animals</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {data && data.animals.length === 0 && !isLoading && (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <PawPrint className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Animals Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Grid */}
        {data && data.animals.length > 0 && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.animals.map((animal: any) => (
              <AnimalBrowseCard
                key={animal.id}
                id={animal.id}
                name={animal.name}
                registeredName={animal.registeredName}
                breedName={animal.breedName}
                sex={animal.sex}
                dateOfBirth={animal.dateOfBirth}
                color={animal.color}
                profileImageUrl={animal.profileImageUrl}
                isChampion={animal.isChampion}
                breederName={animal.breederName}
                breederVerified={animal.breederVerified}
                breederLocation={animal.breederLocation}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {data && data.pagination.hasMore && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLimit((prev) => prev + 24)}
            >
              Load More Animals
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
