"use client";

import { useState, useMemo } from "react";
import { ListingCard } from "@/components/breeder/marketplace/ListingCard";
import { CreateListingDialog } from "@/components/breeder/marketplace/CreateListingDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MapPin, Store } from "lucide-react";
import { mockMarketplaceListings, ListingCategory, getListingsByCategory } from "@/lib/mock-data/marketplace-listings";

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [activeCategory, setActiveCategory] = useState<ListingCategory | 'all'>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Filter listings
  const filteredListings = useMemo(() => {
    let listings = activeCategory === 'all'
      ? mockMarketplaceListings
      : getListingsByCategory(activeCategory);

    // Search filter
    if (searchQuery) {
      listings = listings.filter(listing =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.breed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Location filter
    if (locationFilter) {
      listings = listings.filter(listing =>
        listing.contact.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    return listings;
  }, [searchQuery, locationFilter, activeCategory]);

  // Featured listings
  const featuredListings = filteredListings.filter(l => l.featured);

  // Category tabs config
  const categoryTabs: { value: ListingCategory | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All Listings', icon: '📋' },
    { value: 'stud-dog', label: 'Stud Dogs', icon: '👑' },
    { value: 'dog-for-sale', label: 'Dogs for Sale', icon: '🐕' },
    { value: 'pups-for-sale', label: 'Puppies', icon: '🐶' },
    { value: 'reproductive-services', label: 'AI Services', icon: '💉' },
    { value: 'frozen-semen', label: 'Frozen Semen', icon: '❄️' },
  ];

  // Count by category
  const getCategoryCount = (category: ListingCategory | 'all') => {
    if (category === 'all') return mockMarketplaceListings.length;
    return getListingsByCategory(category).length;
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Marketplace</h1>
            <p className="text-muted-foreground">Buy and sell quality breeding animals and services</p>
          </div>
          <div className="flex items-center gap-2">
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
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-card bg-surface border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by breed, name, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-primary/20 focus:border-primary"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10 w-full sm:w-[200px] bg-background border-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as ListingCategory | 'all')}>
          <Card className="shadow-card bg-surface border-0">
            <CardContent className="p-2">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-transparent gap-1">
                {categoryTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="data-[state=active]:bg-gradient-brand data-[state=active]:text-white data-[state=active]:shadow-card text-xs sm:text-sm"
                  >
                    <span className="mr-1">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {getCategoryCount(tab.value)}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </CardContent>
          </Card>

          {/* Featured Listings */}
          {featuredListings.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-foreground">Featured Listings</h2>
                <Badge className="bg-gradient-brand text-white">
                  {featuredListings.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </div>
          )}

          {/* All Listings by Category */}
          {categoryTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    {tab.value === 'all' ? 'All' : tab.label}
                  </h2>
                  <Badge variant="outline">
                    {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
                  </Badge>
                </div>
              </div>

              {filteredListings.length === 0 ? (
                <Card className="shadow-card bg-surface border-0">
                  <CardContent className="p-12 text-center space-y-4">
                    <div className="text-6xl">🔍</div>
                    <h3 className="text-lg font-medium text-foreground">No listings found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery || locationFilter
                        ? 'Try adjusting your search filters'
                        : 'Be the first to create a listing in this category'}
                    </p>
                    {!searchQuery && !locationFilter && (
                      <Button
                        onClick={() => setCreateDialogOpen(true)}
                        className="bg-gradient-brand hover:opacity-90 shadow-card"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Listing
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Create Listing Dialog */}
        <CreateListingDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </div>
    </div>
  );
}