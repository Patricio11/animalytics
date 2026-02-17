"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/client";
import { useToast } from "@/hooks/use-toast";
import { ListingCard } from "@/components/breeder/marketplace/ListingCard";
import { CreateListingDialog } from "@/components/breeder/marketplace/CreateListingDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BreedCombobox } from "@/components/ui/breed-combobox";
import { detectUserLocation } from "@/lib/utils/location";
import { 
  Plus, 
  Search, 
  MapPin, 
  Store, 
  SlidersHorizontal,
  X,
  Award,
  LogIn
} from "lucide-react";
import Link from "next/link";

// Fetch all marketplace listings (public)
function useMarketplaceListings(filters: {
  search?: string;
  breed?: string;
  sex?: string;
  location?: string;
}) {
  return useQuery({
    queryKey: ['marketplace-listings', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.breed) params.append('breed', filters.breed);
      if (filters.sex) params.append('sex', filters.sex);
      if (filters.location) params.append('location', filters.location);
      params.append('public', 'true'); // Get all public listings
      
      const response = await fetch(`/api/marketplace/listings?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch listings');
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

export default function Marketplace() {
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session;
  const userRole = (session?.user as any)?.role;
  const isBreeder = userRole === 'breeder';
  const isPetOwner = userRole === 'pet_owner';
  const canCreateListing = isBreeder || isPetOwner;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [breedFilter, setBreedFilter] = useState("");
  const [sexFilter, setSexFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [ageRangeFilter, setAgeRangeFilter] = useState("");
  const [championOnlyFilter, setChampionOnlyFilter] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch saved listing IDs for the current user
  const { data: savedData } = useQuery({
    queryKey: ['saved-listings'],
    queryFn: async () => {
      const response = await fetch('/api/marketplace/saved');
      if (!response.ok) return { saved: [] };
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const savedListingIds = useMemo(() => {
    const ids = new Set<string>();
    if (savedData?.saved) {
      for (const item of savedData.saved) {
        ids.add(item.listingId);
      }
    }
    return ids;
  }, [savedData]);

  // Toggle save/unsave mutation
  const toggleSaveMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const response = await fetch('/api/marketplace/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });
      if (!response.ok) throw new Error('Failed to toggle save');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['saved-listings'] });
      toast({
        title: data.saved ? "Added to Wishlist" : "Removed from Wishlist",
        description: data.saved
          ? "Listing has been saved to your wishlist"
          : "Listing has been removed from your wishlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  // Fetch data
  const { data: breedsData, isLoading: breedsLoading } = useBreeds();
  const { data: listingsData, isLoading: listingsLoading, refetch: refetchListings } = useMarketplaceListings({
    search: searchQuery,
    breed: breedFilter,
    sex: sexFilter,
    location: locationFilter,
  });

  const breeds = breedsData?.breeds || [];
  const allListings = listingsData?.listings || [];
  
  // Handle delete listing (confirmation is handled by the ListingCard modal)
  const handleDeleteListing = async (listingId: string) => {
    try {
      const response = await fetch(`/api/marketplace/listings/${listingId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete listing');
      
      // Refresh listings after successful delete
      refetchListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing. Please try again.');
    }
  };

  // Calculate age from dateOfBirth
  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;
    const birth = new Date(dateOfBirth);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    
    if (years === 0) return `${months} months`;
    if (years === 1 && months === 0) return '1 year';
    if (months < 0) return `${years - 1} years ${12 + months} months`;
    if (months === 0) return `${years} years`;
    return `${years} years ${months} months`;
  };

  // Transform listings to display format
  const listings = useMemo(() => {
    return allListings.map((listing: any) => ({
      id: listing.id,
      slug: listing.slug,
      category: listing.category?.replace(/_/g, '-') || 'stud-dog',
      animalId: listing.animalId,
      animalName: listing.animal?.name || 'Unknown',
      breederId: listing.userId,
      breederName: listing.isOwner ? 'You' : (listing.user?.name || 'Breeder'),
      breederAvatar: listing.user?.avatar,
      breederReputation: listing.breederReputation || 4.5,
      title: listing.title,
      description: listing.description,
      price: listing.price ? listing.price / 100 : undefined, // Convert from cents
      currency: listing.currency || 'USD',
      images: listing.additionalImages?.length > 0 
        ? listing.additionalImages 
        : (() => {
            // Get profile photo from animal_photos table (category='profile') or fallback
            const profilePhoto = listing.animal?.photos?.find((p: any) => p.category === 'profile');
            const fallbackImage = profilePhoto?.fileUrl || 
                                  listing.animal?.photos?.[0]?.fileUrl || 
                                  '/placeholder-dog.jpg';
            return [fallbackImage];
          })(),
      breed: listing.breed,
      sex: listing.sex,
      age: listing.animal?.dateOfBirth ? calculateAge(listing.animal.dateOfBirth) : undefined,
      color: listing.color,
      registrationNumber: listing.registrationNumber,
      healthCertified: listing.healthCertified,
      championLines: listing.championLines,
      location: listing.location,
      contact: {
        name: listing.contactName,
        phone: listing.contactPhone,
        email: listing.contactEmail,
        location: listing.location,
      },
      status: listing.status,
      featured: listing.isFeatured || false,
      views: listing.viewCount || 0,
      interested: listing.interestedCount || 0,
      createdAt: listing.createdAt,
      isOwner: listing.isOwner || false,
    }));
  }, [allListings]);

  // Featured listings
  const featuredListings = listings.filter((l: any) => l.featured);

  // Active filters count
  const activeFiltersCount = [
    breedFilter,
    sexFilter,
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
      {/* Header - Different for authenticated vs public */}
      {!isAuthenticated ? (
        // Public Header
        <div className="bg-gradient-brand text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold">Marketplace</h1>
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
      ) : (
        // Authenticated User Header (Breeder or Pet Owner)
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Marketplace</h1>
              <p className="text-muted-foreground">Browse and manage breeding animal listings</p>
            </div>
            <div className="flex items-center gap-2">
              {canCreateListing && (
                <>
                  <Link href="/marketplace/my-listings">
                    <Button variant="outline" className="hover:bg-primary/10 hover:border-primary">
                      My Listings
                    </Button>
                  </Link>
                  <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="bg-gradient-brand hover:opacity-90 shadow-card"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Listing
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${!isAuthenticated ? '-mt-8' : ''} pb-12`}>
        
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
                    id="champion-filter-marketplace"
                    checked={championOnlyFilter}
                    onChange={(e) => setChampionOnlyFilter(e.target.checked)}
                    className="w-4 h-4 rounded border-primary/20"
                  />
                  <label htmlFor="champion-filter-marketplace" className="text-sm cursor-pointer flex items-center gap-2">
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
            {listingsLoading ? (
              'Loading...'
            ) : (
              <>
                Showing <span className="font-semibold text-foreground">{listings.length}</span> {listings.length === 1 ? 'listing' : 'listings'}
                {activeFiltersCount > 0 && ' with active filters'}
              </>
            )}
          </p>
        </div>

        {/* Loading State */}
        {listingsLoading && (
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

        {/* Featured Listings */}
        {!listingsLoading && featuredListings.length > 0 && (
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">Featured Listings</h2>
              <Badge className="bg-gradient-brand text-white">
                {featuredListings.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((listing: any) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isOwner={listing.isOwner}
                  isPublicView={!isAuthenticated}
                  isSaved={savedListingIds.has(listing.id)}
                  isBoosted={listing.boosted || listing.isFeatured}
                  onDelete={handleDeleteListing}
                  onInterested={(id) => toggleSaveMutation.mutate(id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Listings */}
        {!listingsLoading && listings.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">
                {featuredListings.length > 0 ? 'All Listings' : 'Listings'}
              </h2>
              <Badge variant="outline">
                {listings.length} {listings.length === 1 ? 'listing' : 'listings'}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing: any) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isOwner={listing.isOwner}
                  isPublicView={!isAuthenticated}
                  isSaved={savedListingIds.has(listing.id)}
                  isBoosted={listing.boosted || listing.isFeatured}
                  onDelete={handleDeleteListing}
                  onInterested={(id) => toggleSaveMutation.mutate(id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!listingsLoading && listings.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <h3 className="text-lg font-semibold mb-2">No listings found</h3>
              <p className="text-muted-foreground mb-4">
                {activeFiltersCount > 0
                  ? 'Try adjusting your filters to see more results'
                  : isBreeder 
                    ? 'Be the first to create a listing'
                    : 'No listings are currently available'}
              </p>
              {activeFiltersCount > 0 ? (
                <Button onClick={clearAllFilters} variant="outline">
                  Clear All Filters
                </Button>
              ) : isBreeder ? (
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="bg-gradient-brand hover:opacity-90 shadow-card"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Listing
                </Button>
              ) : (
                <Link href="/auth/signin">
                  <Button className="bg-gradient-brand hover:opacity-90">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In to List
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create Listing Dialog - Only for breeders */}
        {isBreeder && (
          <CreateListingDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onSuccess={() => {
              refetchListings();
            }}
          />
        )}
      </div>
    </div>
  );
}
