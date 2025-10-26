"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingCard } from "@/components/breeder/marketplace/ListingCard";
import { CreateListingDialog } from "@/components/breeder/marketplace/CreateListingDialog";
import { 
  ArrowLeft, 
  Plus, 
  Store,
  Filter,
  Grid3x3,
  List
} from "lucide-react";
import Link from "next/link";

export default function MyListingsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch user's listings
  const { data: listingsData, isLoading, refetch } = useQuery({
    queryKey: ['my-listings'],
    queryFn: async () => {
      const response = await fetch('/api/marketplace/listings?userOnly=true');
      if (!response.ok) throw new Error('Failed to fetch listings');
      return response.json();
    },
    enabled: !!session,
  });

  // Redirect if not authenticated
  if (!isPending && !session) {
    router.push('/auth/signin');
    return null;
  }

  const allListings = listingsData?.listings || [];

  // Filter by status
  const listings = statusFilter === 'all' 
    ? allListings 
    : allListings.filter((l: any) => l.status === statusFilter);

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

  // Transform listings
  const transformedListings = listings.map((listing: any) => ({
    id: listing.id,
    category: listing.category?.replace(/_/g, '-') || 'stud-dog',
    animalId: listing.animalId,
    animalName: listing.animal?.name || 'Unknown',
    breederId: listing.userId,
    breederName: listing.user?.name || 'You',
    breederAvatar: listing.user?.avatar,
    breederReputation: 5.0,
    title: listing.title,
    description: listing.description,
    price: listing.price ? listing.price / 100 : undefined,
    currency: listing.currency || 'USD',
    images: listing.additionalImages?.length > 0 
      ? listing.additionalImages 
      : [listing.animal?.profileImageUrl || '/placeholder-dog.jpg'],
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
    isOwner: true,
  }));

  // Handle delete (confirmation is handled by the ListingCard modal)
  const handleDeleteListing = async (listingId: string) => {
    try {
      const response = await fetch(`/api/marketplace/listings/${listingId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete listing');
      
      // Refetch listings after successful delete
      refetch();
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing. Please try again.');
    }
  };

  // Status counts
  const statusCounts = {
    all: allListings.length,
    active: allListings.filter((l: any) => l.status === 'active').length,
    pending: allListings.filter((l: any) => l.status === 'pending').length,
    sold: allListings.filter((l: any) => l.status === 'sold').length,
    expired: allListings.filter((l: any) => l.status === 'expired').length,
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/marketplace')}
              className="hover:bg-primary/10 hover:border-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Listings</h1>
              <p className="text-muted-foreground">Manage your marketplace listings</p>
            </div>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-gradient-brand hover:opacity-90 shadow-card"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Listing
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card 
            className={`shadow-card cursor-pointer transition-all ${statusFilter === 'all' ? 'border-primary border-2' : 'hover:shadow-elevated'}`}
            onClick={() => setStatusFilter('all')}
          >
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">{statusCounts.all}</div>
              <div className="text-sm text-muted-foreground">All Listings</div>
            </CardContent>
          </Card>
          <Card 
            className={`shadow-card cursor-pointer transition-all ${statusFilter === 'active' ? 'border-primary border-2' : 'hover:shadow-elevated'}`}
            onClick={() => setStatusFilter('active')}
          >
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-chart-3">{statusCounts.active}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card 
            className={`shadow-card cursor-pointer transition-all ${statusFilter === 'pending' ? 'border-primary border-2' : 'hover:shadow-elevated'}`}
            onClick={() => setStatusFilter('pending')}
          >
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-chart-4">{statusCounts.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card 
            className={`shadow-card cursor-pointer transition-all ${statusFilter === 'sold' ? 'border-primary border-2' : 'hover:shadow-elevated'}`}
            onClick={() => setStatusFilter('sold')}
          >
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-chart-1">{statusCounts.sold}</div>
              <div className="text-sm text-muted-foreground">Sold</div>
            </CardContent>
          </Card>
          <Card 
            className={`shadow-card cursor-pointer transition-all ${statusFilter === 'expired' ? 'border-primary border-2' : 'hover:shadow-elevated'}`}
            onClick={() => setStatusFilter('expired')}
          >
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-muted-foreground">{statusCounts.expired}</div>
              <div className="text-sm text-muted-foreground">Expired</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {statusFilter === 'all' ? 'All Listings' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Listings`}
            </Badge>
            {statusFilter !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter('all')}
                className="text-xs"
              >
                Clear Filter
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow-card">
                <CardContent className="p-0">
                  <Skeleton className="aspect-video w-full rounded-t-lg" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Listings Grid */}
        {!isLoading && transformedListings.length > 0 && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {transformedListings.map((listing: any) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isOwner={true}
                onDelete={handleDeleteListing}
                onInterested={(id) => {
                  console.log('Interested in listing:', id);
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && transformedListings.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <h3 className="text-lg font-semibold mb-2">
                {statusFilter === 'all' ? 'No listings yet' : `No ${statusFilter} listings`}
              </h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter === 'all' 
                  ? 'Create your first listing to get started'
                  : `You don't have any ${statusFilter} listings`}
              </p>
              {statusFilter === 'all' ? (
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="bg-gradient-brand hover:opacity-90 shadow-card"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Listing
                </Button>
              ) : (
                <Button
                  onClick={() => setStatusFilter('all')}
                  variant="outline"
                >
                  View All Listings
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create Listing Dialog */}
        <CreateListingDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={() => {
            refetch();
          }}
        />
      </div>
    </div>
  );
}
