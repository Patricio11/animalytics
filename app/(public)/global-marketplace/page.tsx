"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BreedCombobox } from "@/components/ui/breed-combobox";
import { ListingCard } from "@/components/breeder/marketplace/ListingCard";
import { MarketplaceListing } from "@/lib/mock-data/marketplace-listings";
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

// Transform API animal data to MarketplaceListing format
function transformAnimalToListing(animal: any): MarketplaceListing {
  // Calculate age from dateOfBirth
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

  // Format location
  const formatLocation = () => {
    if (!animal.breederLocation) return 'Location not specified';
    const { city, state, country } = animal.breederLocation;
    const parts = [city, state, country].filter(Boolean);
    return parts.join(', ') || 'Location not specified';
  };

  return {
    id: animal.id,
    category: 'stud-dog' as any, // Default category for breeding animals
    animalId: animal.id,
    animalName: animal.name,
    breederId: animal.breederId || 'unknown',
    breederName: animal.breederName || 'Unknown Breeder',
    breederAvatar: undefined,
    breederReputation: animal.breederRating || 4.5,
    title: `${animal.name} - ${animal.breedName || 'Unknown Breed'}`,
    description: animal.bio || `Beautiful ${animal.breedName || 'dog'} available for breeding. ${animal.isChampion ? 'Champion bloodlines. ' : ''}Contact breeder for more details.`,
    price: undefined,
    currency: 'USD',
    images: animal.profileImageUrl ? [animal.profileImageUrl] : ['/images/placeholder-dog.png'],
    contact: {
      name: animal.breederName || 'Unknown Breeder',
      email: animal.breederPublicEmail || '',
      phone: animal.breederPublicPhone || '',
      location: formatLocation(),
    },
    status: 'active' as any,
    createdAt: animal.createdAt || new Date().toISOString(),
    updatedAt: animal.updatedAt || new Date().toISOString(),
    views: 0,
    interested: 0,
    featured: animal.breederPremium || false,
    breed: animal.breedName,
    sex: animal.sex,
    age: animal.dateOfBirth ? calculateAge(animal.dateOfBirth) : undefined,
    color: animal.color,
    registrationNumber: animal.registrationNumber,
    healthCertified: animal.healthStatus === 'excellent',
    championLines: animal.isChampion || false,
  };
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
                    <BreedCombobox
                      value={breedFilter}
                      onChange={setBreedFilter}
                      placeholder="All Breeds"
                      showAllOption={true}
                    />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="shadow-card">
                <CardContent className="p-0">
                  <Skeleton className="aspect-video w-full rounded-t-lg" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Animals Grid */}
        {!animalsLoading && finalAnimals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {finalAnimals.map((animal: any) => {
              const listing = transformAnimalToListing(animal);
              return (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isPublicView={true}
                  onInterested={(id) => {
                    // Handle interested action (could add to favorites, etc.)
                    console.log('Interested in animal:', id);
                  }}
                />
              );
            })}
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
