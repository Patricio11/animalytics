"use client";

import { MarketplaceCard } from "@/components/breeder/MarketplaceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, MapPin } from "lucide-react";

export default function Marketplace() {
  // todo: remove mock functionality
  const mockListings = [
    {
      id: "1",
      name: "Champion Duke",
      breed: "Labrador Retriever",
      age: 3,
      gender: 'male' as const,
      price: 15000,
      location: "Melbourne, VIC",
      imageUrl: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&crop=face",
      seller: "Premier Kennels",
      description: "Award-winning bloodline with excellent temperament and show record",
      isFeatured: true,
    },
    {
      id: "2",
      name: "Luna Belle",
      breed: "Border Collie",
      age: 2,
      gender: 'female' as const,
      price: 8500,
      location: "Sydney, NSW",
      imageUrl: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=400&fit=crop&crop=face",
      seller: "Agility Stars",
      description: "Exceptional working dog with proven agility competition background",
    },
    {
      id: "3",
      name: "Golden Grace",
      breed: "Golden Retriever",
      age: 4,
      gender: 'female' as const,
      price: 12000,
      location: "Brisbane, QLD",
      imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop&crop=face",
      seller: "Golden Dreams",
      description: "Beautiful female with excellent breeding history and gentle nature",
    },
    {
      id: "4",
      name: "Storm",
      breed: "German Shepherd",
      age: 5,
      gender: 'male' as const,
      price: 18000,
      location: "Perth, WA",
      imageUrl: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=400&fit=crop&crop=face",
      seller: "Elite Guard Dogs",
      description: "Proven working dog with protection training and excellent genetics",
      isFeatured: true,
    },
    {
      id: "5",
      name: "Ruby Rose",
      breed: "Australian Cattle Dog",
      age: 2,
      gender: 'female' as const,
      price: 6500,
      location: "Adelaide, SA",
      imageUrl: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=400&fit=crop&crop=face",
      seller: "Outback Breeders",
      description: "Energetic working dog with excellent herding instincts",
    },
    {
      id: "6",
      name: "Zeus",
      breed: "Rottweiler",
      age: 4,
      gender: 'male' as const,
      price: 14000,
      location: "Darwin, NT",
      imageUrl: "https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=400&h=400&fit=crop&crop=face",
      seller: "Guardian Kennels",
      description: "Powerful guardian with gentle family temperament and show quality",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
          <p className="text-muted-foreground">Buy and sell quality breeding animals</p>
        </div>
        <Button data-testid="button-create-listing">
          <Plus className="w-4 h-4 mr-2" />
          Create Listing
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by breed, name..."
            className="pl-10"
            data-testid="input-search-listings"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Location"
            className="pl-10 w-full sm:w-[160px]"
            data-testid="input-location"
          />
        </div>
        <Select>
          <SelectTrigger className="w-full sm:w-[140px]" data-testid="select-price-range">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="0-5000">$0 - $5,000</SelectItem>
            <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
            <SelectItem value="10000-20000">$10,000 - $20,000</SelectItem>
            <SelectItem value="20000+">$20,000+</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full sm:w-[120px]" data-testid="select-gender">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" data-testid="button-advanced-filter">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Featured Section */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Featured Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockListings.filter(listing => listing.isFeatured).map((listing) => (
            <MarketplaceCard key={listing.id} {...listing} />
          ))}
        </div>
      </section>

      {/* All Listings */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">All Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockListings.map((listing) => (
            <MarketplaceCard key={listing.id} {...listing} />
          ))}
        </div>
      </section>
    </div>
  );
}