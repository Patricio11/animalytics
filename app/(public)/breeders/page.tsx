"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, MapPin, Star, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BreederCard } from "@/components/breeder/BreederCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Fetch breeders from API
function useBreeders(search: string, breed: string) {
  return useQuery({
    queryKey: ['breeders', search, breed],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (breed && breed !== 'all') params.set('breed', breed);
      
      const response = await fetch(`/api/breeders?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch breeders');
      }
      const data = await response.json();
      return data;
    },
  });
}

export default function BreedersDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBreed, setSelectedBreed] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
    }, 500);
    return () => clearTimeout(timer);
  };

  const { data, isLoading, error } = useBreeders(debouncedSearch, selectedBreed);

  // Common breeds for filter
  const popularBreeds = [
    "Golden Retriever",
    "Labrador Retriever",
    "German Shepherd",
    "French Bulldog",
    "Bulldog",
    "Poodle",
    "Beagle",
    "Rottweiler",
    "Yorkshire Terrier",
    "Boxer",
  ];

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <div className="bg-gradient-brand text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold">Find Trusted Breeders</h1>
          </div>
          <p className="text-lg opacity-90">
            Connect with verified, professional breeders in your area
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <Card className="shadow-elevated">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, location, or breed..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Breed Filter */}
              <Select value={selectedBreed} onValueChange={setSelectedBreed}>
                <SelectTrigger className="w-full sm:w-64">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by breed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Breeds</SelectItem>
                  {popularBreeds.map((breed) => (
                    <SelectItem key={breed} value={breed}>
                      {breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              Found <span className="font-semibold text-foreground">{data.pagination.total}</span> breeder
              {data.pagination.total !== 1 ? 's' : ''}
              {debouncedSearch && ` matching "${debouncedSearch}"`}
              {selectedBreed !== 'all' && ` specializing in ${selectedBreed}`}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <p className="text-destructive mb-4">Failed to load breeders</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {data && data.breeders.length === 0 && !isLoading && (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Breeders Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedSearch("");
                  setSelectedBreed("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Breeders Grid */}
        {data && data.breeders.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.breeders.map((breeder: any) => (
              <BreederCard key={breeder.id} {...breeder} />
            ))}
          </div>
        )}

        {/* Load More */}
        {data && data.pagination.hasMore && (
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg">
              Load More Breeders
            </Button>
          </div>
        )}
      </div>

      {/* Featured Section */}
      <div className="bg-surface py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="shadow-card text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-chart-3/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-chart-3" />
                </div>
                <CardTitle className="text-lg">Verified Breeders</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All breeders are verified through our comprehensive KYC and background check process
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-card text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Local & Nationwide</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Find breeders in your area or search nationwide for specific breeds
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-card text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-chart-2/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-chart-2 fill-chart-2" />
                </div>
                <CardTitle className="text-lg">Rated & Reviewed</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Read authentic reviews from verified buyers to make informed decisions
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
