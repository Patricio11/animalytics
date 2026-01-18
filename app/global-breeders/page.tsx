"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, MapPin, Star, Users, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BreederCard } from "@/components/breeder/BreederCard";
import { BreedCombobox } from "@/components/ui/breed-combobox";
import { detectUserLocation } from "@/lib/utils/location";

// Fetch breeders from API
function useBreeders(search: string, breed: string, location: string) {
  return useQuery({
    queryKey: ['global-breeders', search, breed, location],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (breed && breed !== 'all') params.set('breed', breed);
      if (location) params.set('location', location);
      
      const response = await fetch(`/api/breeders?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch breeders');
      }
      const data = await response.json();
      return data;
    },
  });
}

export default function GlobalBreedersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBreed, setSelectedBreed] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Auto-detect user location on mount
  useEffect(() => {
    const loadUserLocation = async () => {
      try {
        const location = await detectUserLocation();
        if (location?.city) {
          setLocationFilter(location.city);
        } else if (location?.country) {
          setLocationFilter(location.country);
        }
      } catch (error) {
        console.error('Failed to detect location:', error);
      }
    };
    
    loadUserLocation();
  }, []);

  // Debounce search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
    }, 500);
    return () => clearTimeout(timer);
  };

  const { data, isLoading, error } = useBreeders(debouncedSearch, selectedBreed, locationFilter);

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm backdrop-blur-sm">
              <Globe className="w-4 h-4" />
              <span>Global Breeder Directory</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold">Find Quality Breeders</h1>
            <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto">
              Connect with verified breeders worldwide. Browse profiles, view their animals, and find your perfect companion.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8">
        <Card className="shadow-xl border-0">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or location..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {/* Breed Filter */}
              <BreedCombobox
                value={selectedBreed}
                onChange={setSelectedBreed}
                placeholder="All Breeds"
              />

              {/* Location Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by location..."
                  className="pl-10"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
            </div>

            {/* Active Filters */}
            {(debouncedSearch || selectedBreed || locationFilter) && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {debouncedSearch && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setDebouncedSearch("");
                    }}
                  >
                    Search: {debouncedSearch} ×
                  </Button>
                )}
                {selectedBreed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedBreed("")}
                  >
                    Breed: {selectedBreed} ×
                  </Button>
                )}
                {locationFilter && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocationFilter("")}
                  >
                    Location: {locationFilter} ×
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedSearch("");
                    setSelectedBreed("");
                    setLocationFilter("");
                  }}
                >
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-card border-0">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{data?.total || 0}</div>
              <div className="text-sm text-muted-foreground">Verified Breeders</div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-6 text-center">
              <Globe className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{data?.countries || 0}</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">4.8</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Breeders Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="shadow-card border-0">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="shadow-card border-0">
            <CardContent className="p-12 text-center">
              <div className="text-destructive mb-4">Failed to load breeders</div>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        ) : data?.breeders?.length > 0 ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {data.total} {data.total === 1 ? 'Breeder' : 'Breeders'} Found
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.breeders.map((breeder: any) => (
                <BreederCard key={breeder.id} {...breeder} />
              ))}
            </div>
          </>
        ) : (
          <Card className="shadow-card border-0">
            <CardContent className="p-12 text-center space-y-4">
              <Users className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-xl font-semibold mb-2">No Breeders Found</h3>
                <p className="text-muted-foreground">
                  {debouncedSearch || selectedBreed || locationFilter
                    ? "Try adjusting your filters to see more results"
                    : "No breeders are currently available"}
                </p>
              </div>
              {(debouncedSearch || selectedBreed || locationFilter) && (
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedSearch("");
                    setSelectedBreed("");
                    setLocationFilter("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
