"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  Search,
  MessageSquare,
  Trash2,
} from "lucide-react";

export default function BuyerSavedPage() {
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch saved listings
  useEffect(() => {
    async function fetchSaved() {
      try {
        // TODO: Implement saved listings API
        // For now, show empty state
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching saved listings:', error);
        setIsLoading(false);
      }
    }

    fetchSaved();
  }, []);

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className=" mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Saved Listings</h1>
            <p className="text-muted-foreground text-sm">
              Listings you've saved for later
            </p>
          </div>
          <Button asChild>
            <Link href="/marketplace">
              <Search className="h-4 w-4 mr-2" />
              Browse More
            </Link>
          </Button>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="shadow-card">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <Skeleton className="h-6 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : savedListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedListings.map((listing) => (
              <Card key={listing.id} className="shadow-card overflow-hidden">
                <Link href={`/marketplace/${listing.slug || listing.id}`}>
                  <div className="h-48 bg-muted relative">
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Heart className="h-12 w-12 text-muted-foreground opacity-50" />
                      </div>
                    )}
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Remove from saved
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/marketplace/${listing.slug || listing.id}`}>
                    <h3 className="font-semibold truncate hover:text-primary">
                      {listing.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-3">
                    {listing.breed} • {listing.location}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-lg">
                      ${listing.price?.toLocaleString()}
                    </p>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No saved listings</h3>
              <p className="text-muted-foreground mb-4">
                Save listings you're interested in to view them later
              </p>
              <Button asChild>
                <Link href="/marketplace">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Marketplace
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
