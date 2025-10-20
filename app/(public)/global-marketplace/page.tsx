"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  MapPin, 
  Store, 
  LogIn, 
  Filter,
  X,
  SlidersHorizontal,
  Heart,
  Award,
  Calendar
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Fetch marketplace animals
function useMarketplaceAnimals(filters: {
  search?: string;
  breed?: string;
  sex?: string;
  location?: string;
  ageRange?: string;
  isChampion?: boolean;
}) {
  return useQuery({
    queryKey: ['marketplace-animals', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.breed) params.append('breed', filters.breed);
      if (filters.sex) params.append('sex', filters.sex);
      if (filters.location) params.append('location', filters.location);
      
      const response = await fetch(`/api/marketplace?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch animals');
      return response.json();
    },
  });
}

// Fetch breeds
function useBreeds() {
  return useQuery({
    queryKey: ['breeds'],
    queryFn: async () => {
      const response = await fetch('/api/breeds');
      if (!response.ok) throw new Error('Failed to fetch breeds');
      return response.json();
    },
  });
}

export default function GlobalMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [breedFilter, setBreedFilter] = useState("");
  const [sexFilter, setSexFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [ageRangeFilter, setAgeRangeFilter] = useState("");
  const [championOnlyFilter, setChampionOnlyFilter] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data
  const { data: breedsData, isLoading: breedsLoading } = useBreeds();
  const { data: animalsData, isLoading: animalsLoading } = useMarketplaceAnimals({
    search: searchQuery,
    breed: breedFilter,
    sex: sexFilter,
    location: locationFilter,
    ageRange: ageRangeFilter,
    isChampion: championOnlyFilter,
  });

  const breeds = breedsData?.breeds || [];
  const animals = animalsData?.animals || [];

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    
    if (years === 0) {
      return `${months} months`;
    } else if (years === 1 && months === 0) {
      return '1 year';
    } else if (months < 0) {
      return `${years - 1} years ${12 + months} months`;
    } else if (months === 0) {
      return `${years} years`;
    } else {
      return `${years} years ${months} months`;
    }
  };

  // Filter animals by age range
  const filteredAnimals = useMemo(() => {
    if (!ageRangeFilter || !animals) return animals;

    return animals.filter((animal: any) => {
      if (!animal.dateOfBirth) return true;
      
      const birth = new Date(animal.dateOfBirth);
      const today = new Date();
      const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + 
                          (today.getMonth() - birth.getMonth());

      switch (ageRangeFilter) {
        case 'puppy': // 0-12 months
          return ageInMonths <= 12;
        case 'young': // 1-3 years
          return ageInMonths > 12 && ageInMonths <= 36;
        case 'adult': // 3-7 years
          return ageInMonths > 36 && ageInMonths <= 84;
        case 'senior': // 7+ years
          return ageInMonths > 84;
        default:
          return true;
      }
    });
  }, [animals, ageRangeFilter]);

  // Filter by champion status
  const finalAnimals = useMemo(() => {
    if (!championOnlyFilter) return filteredAnimals;
    return filteredAnimals.filter((animal: any) => animal.isChampion);
  }, [filteredAnimals, championOnlyFilter]);

  // Active filters count
  const activeFiltersCount = [
    breedFilter,
    sexFilter,
    locationFilter,
    ageRangeFilter,
    championOnlyFilter,
  ].filter(Boolean).length;

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setBreedFilter("");
    setSexFilter("");
    setLocationFilter("");
    setAgeRangeFilter("");
    setChampionOnlyFilter(false);
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <div className="bg-gradient-brand text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold">Global Marketplace</h1>
              </div>
              <p className="text-lg opacity-90">
                Browse quality breeding animals from verified breeders worldwide
              </p>
            </div>
            
            {/* Sign In CTA */}
            <Link href="/auth/signin">
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to List
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
        
        {/* Search and Filters */}
        <Card className="shadow-elevated bg-surface border-0 mb-6">
          <CardContent className="p-4 sm:p-6">
            {/* Search Bar and Location */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, breed, or breeder..."
                  className="pl-10 bg-background border-primary/20 focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative sm:w-64">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Location (City, State, Country)"
                  className="pl-10 bg-background border-primary/20 focus:border-primary"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">Advanced Filters</h3>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-xs"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Breed Filter */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Breed
                    </label>
                    <Select value={breedFilter || "all"} onValueChange={(value) => setBreedFilter(value === "all" ? "" : value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="All Breeds" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Breeds</SelectItem>
                        {breedsLoading ? (
                          <SelectItem value="loading" disabled>Loading...</SelectItem>
                        ) : (
                          breeds.map((breed: any) => (
                            <SelectItem key={breed.id} value={breed.name}>
                              {breed.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sex Filter */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Sex
                    </label>
                    <Select value={sexFilter || "all"} onValueChange={(value) => setSexFilter(value === "all" ? "" : value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Age Range Filter */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Age Range
                    </label>
                    <Select value={ageRangeFilter || "all"} onValueChange={(value) => setAgeRangeFilter(value === "all" ? "" : value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="All Ages" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ages</SelectItem>
                        <SelectItem value="puppy">Puppy (0-12 months)</SelectItem>
                        <SelectItem value="young">Young (1-3 years)</SelectItem>
                        <SelectItem value="adult">Adult (3-7 years)</SelectItem>
                        <SelectItem value="senior">Senior (7+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Champion Filter */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="champion-filter"
                    checked={championOnlyFilter}
                    onChange={(e) => setChampionOnlyFilter(e.target.checked)}
                    className="w-4 h-4 rounded border-primary/20"
                  />
                  <label htmlFor="champion-filter" className="text-sm cursor-pointer flex items-center gap-2">
                    <Award className="w-4 h-4 text-chart-2" />
                    Show Champions Only
                  </label>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && !showFilters && (
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {breedFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Breed: {breedFilter}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setBreedFilter("")}
                    />
                  </Badge>
                )}
                {sexFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Sex: {sexFilter}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setSexFilter("")}
                    />
                  </Badge>
                )}
                {ageRangeFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Age: {ageRangeFilter}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setAgeRangeFilter("")}
                    />
                  </Badge>
                )}
                {locationFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Location: {locationFilter}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setLocationFilter("")}
                    />
                  </Badge>
                )}
                {championOnlyFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Champions Only
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setChampionOnlyFilter(false)}
                    />
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {animalsLoading ? (
              'Loading...'
            ) : (
              <>
                Showing <span className="font-semibold text-foreground">{finalAnimals.length}</span> {finalAnimals.length === 1 ? 'animal' : 'animals'}
                {activeFiltersCount > 0 && ' with active filters'}
              </>
            )}
          </p>
        </div>

        {/* Loading State */}
        {animalsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="shadow-card">
                <CardContent className="p-0">
                  <Skeleton className="aspect-square w-full rounded-t-lg" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Animals Grid */}
        {!animalsLoading && finalAnimals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {finalAnimals.map((animal: any) => (
              <Link key={animal.id} href={`/global-marketplace/${animal.id}`}>
                <Card className="shadow-card hover-elevate cursor-pointer h-full">
                  <CardContent className="p-0">
                    {/* Image */}
                    <div className="aspect-square relative overflow-hidden rounded-t-lg bg-surface-secondary">
                      {animal.profileImageUrl ? (
                        <Image
                          src={animal.profileImageUrl}
                          alt={animal.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Heart className="w-12 h-12 text-muted-foreground opacity-20" />
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-2 right-2 flex flex-col gap-2">
                        {animal.isChampion && (
                          <Badge className="bg-chart-2 text-white shadow-lg">
                            <Award className="w-3 h-3 mr-1" />
                            Champion
                          </Badge>
                        )}
                        {animal.breederPremium && (
                          <Badge className="bg-gradient-brand text-white shadow-lg">
                            Premium
                          </Badge>
                        )}
                        {animal.breederVerified && (
                          <Badge className="bg-chart-3 text-white shadow-lg">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 truncate">
                        {animal.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {animal.breedName || 'Unknown Breed'} • {animal.sex === 'male' ? '♂' : '♀'}
                      </p>
                      
                      {animal.dateOfBirth && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                          <Calendar className="w-3 h-3" />
                          {calculateAge(animal.dateOfBirth)}
                        </div>
                      )}

                      {/* Titles */}
                      {animal.titles && animal.titles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {animal.titles.slice(0, 3).map((title: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {title}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Breeder Info */}
                      <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground truncate">
                          {animal.breederName}
                        </p>
                        {animal.breederLocation && (
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {animal.breederLocation.city}, {animal.breederLocation.country}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!animalsLoading && finalAnimals.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <h3 className="text-lg font-semibold mb-2">No animals found</h3>
              <p className="text-muted-foreground mb-4">
                {activeFiltersCount > 0
                  ? 'Try adjusting your filters to see more results'
                  : 'No animals are currently listed in the marketplace'}
              </p>
              {activeFiltersCount > 0 && (
                <Button onClick={clearAllFilters} variant="outline">
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
