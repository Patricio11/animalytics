"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CURRENCIES } from "@/lib/utils/currency";
import {
  Heart,
  Search,
  MessageSquare,
  Trash2,
  MapPin,
} from "lucide-react";

export default function PetOwnerSavedPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch saved listings
  const { data, isLoading } = useQuery({
    queryKey: ['saved-listings'],
    queryFn: async () => {
      const response = await fetch('/api/marketplace/saved');
      if (!response.ok) throw new Error('Failed to fetch saved listings');
      return response.json();
    },
  });

  const savedListings = data?.saved || [];

  // Remove from saved mutation
  const removeMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const response = await fetch('/api/marketplace/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });
      if (!response.ok) throw new Error('Failed to remove listing');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-listings'] });
      toast({
        title: "Listing Removed",
        description: "Listing removed from your saved items",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove listing",
        variant: "destructive",
      });
    },
  });

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
            {savedListings.map((item: any) => {
              const listing = item.listing;
              const images = listing.additionalImages?.length > 0 
                ? listing.additionalImages 
                : [listing.animal?.profilePhotoUrl || '/placeholder-dog.jpg'];
              
              return (
                <Card key={listing.id} className="shadow-card overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/marketplace/${listing.id}`}>
                    <div className="h-48 bg-muted relative group">
                      <img
                        src={images[0]}
                        alt={listing.title}
                        className="w-full h-full object-contain bg-muted/30 group-hover:scale-105 transition-transform duration-300"
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 shadow-lg"
                        onClick={(e) => {
                          e.preventDefault();
                          removeMutation.mutate(listing.id);
                        }}
                        disabled={removeMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {listing.status !== 'active' && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="capitalize">
                            {listing.status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <Link href={`/marketplace/${listing.id}`}>
                        <h3 className="font-semibold truncate hover:text-primary transition-colors">
                          {listing.title}
                        </h3>
                      </Link>
                      {listing.breed && (
                        <p className="text-sm text-muted-foreground">
                          {listing.breed}
                        </p>
                      )}
                    </div>
                    
                    {listing.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{listing.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2">
                      {listing.price ? (
                        <p className="font-bold text-lg text-primary">
                          {CURRENCIES[listing.currency as keyof typeof CURRENCIES]?.symbol || listing.currency}
                          {(listing.price / 100).toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Contact for price</p>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                      >
                        <Link href={`/marketplace/${listing.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
