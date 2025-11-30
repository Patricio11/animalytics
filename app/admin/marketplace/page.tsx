"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  ShoppingBag,
  Clock,
  AlertCircle,
  Image as ImageIcon,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface Listing {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  status: string;
  breed: string | null;
  sex: string | null;
  age: string | null;
  additionalImages: string[] | null;
  requiresApproval: boolean;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectedBy: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  viewCount: number;
  inquiryCount: number;
  createdAt: string;
  publishedAt: string | null;
}

export default function AdminMarketplacePage() {
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Statistics
  const [stats, setStats] = useState({
    pending: 0,
    active: 0,
    rejected: 0,
    total: 0,
  });

  // Fetch listings
  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const res = await fetch(`/api/admin/listings?${params}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch listings",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch listings",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/listings?limit=1000');
      if (res.ok) {
        const data = await res.json();
        const allListings = data.listings;

        setStats({
          pending: allListings.filter((l: Listing) => l.status === 'pending').length,
          active: allListings.filter((l: Listing) => l.status === 'active').length,
          rejected: allListings.filter((l: Listing) => l.status === 'removed').length,
          total: allListings.length,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchStats();
  }, [page, statusFilter, categoryFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchListings();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Approve listing
  const handleApprove = async (listingId: string) => {
    try {
      const res = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Listing approved successfully",
        });
        fetchListings();
        fetchStats();
      } else {
        const error = await res.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.error || "Failed to approve listing",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve listing",
      });
    }
  };

  // Reject listing
  const handleReject = async () => {
    if (!selectedListing) return;

    if (!rejectionReason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a rejection reason",
      });
      return;
    }

    try {
      const res = await fetch(`/api/admin/listings/${selectedListing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          rejectionReason: rejectionReason.trim(),
        }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Listing rejected successfully",
        });
        setShowRejectDialog(false);
        setRejectionReason("");
        fetchListings();
        fetchStats();
      } else {
        const error = await res.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.error || "Failed to reject listing",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject listing",
      });
    }
  };

  // Delete listing
  const handleDelete = async () => {
    if (!selectedListing) return;

    try {
      const res = await fetch(`/api/admin/listings/${selectedListing.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Listing deleted successfully",
        });
        setShowDeleteDialog(false);
        fetchListings();
        fetchStats();
      } else {
        const error = await res.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.error || "Failed to delete listing",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete listing",
      });
    }
  };

  const formatCurrency = (cents: number | null) => {
    if (!cents) return 'N/A';
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "destructive" | "secondary" | "outline"; icon: any }> = {
      pending: { variant: 'outline', icon: Clock },
      active: { variant: 'default', icon: CheckCircle },
      removed: { variant: 'destructive', icon: XCircle },
      draft: { variant: 'secondary', icon: AlertCircle },
      sold: { variant: 'secondary', icon: CheckCircle },
    };

    const config = variants[status] || { variant: 'default', icon: AlertCircle };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Marketplace Moderation</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve marketplace listings
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <h3 className="text-2xl font-bold text-amber-600">{stats.pending}</h3>
                </div>
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/20">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <h3 className="text-2xl font-bold text-green-600">{stats.active}</h3>
                </div>
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <h3 className="text-2xl font-bold text-red-600">{stats.rejected}</h3>
                </div>
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Listings</p>
                  <h3 className="text-2xl font-bold text-foreground">{stats.total}</h3>
                </div>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by title, breed, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="removed">Rejected</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="dog_for_sale">Dog for Sale</SelectItem>
                  <SelectItem value="pups_for_sale">Pups for Sale</SelectItem>
                  <SelectItem value="stud_dog">Stud Dog</SelectItem>
                  <SelectItem value="frozen_semen">Frozen Semen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-80" />
            ))
          ) : listings.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No listings found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            listings.map((listing) => (
              <Card key={listing.id} className="shadow-card hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative h-48 bg-muted">
                  {listing.additionalImages && listing.additionalImages.length > 0 ? (
                    <img
                      src={listing.additionalImages[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(listing.status)}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {listing.description || 'No description'}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-semibold text-primary">
                        {formatCurrency(listing.price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Seller:</span>
                      <span className="font-medium">{listing.userName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant="outline" className="text-xs">
                        {listing.category.replace('_', ' ')}
                      </Badge>
                    </div>
                    {listing.breed && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Breed:</span>
                        <span>{listing.breed}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {listing.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1"
                          onClick={() => handleApprove(listing.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => {
                            setSelectedListing(listing);
                            setRejectionReason("");
                            setShowRejectDialog(true);
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedListing(listing);
                            setShowViewDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/marketplace/${listing.id}`} target="_blank">
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            View in Marketplace
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedListing(listing);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Listing
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* View Details Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Listing Details</DialogTitle>
            </DialogHeader>

            {selectedListing && (
              <div className="space-y-4">
                {selectedListing.additionalImages && selectedListing.additionalImages.length > 0 && (
                  <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
                    <img
                      src={selectedListing.additionalImages[0]}
                      alt={selectedListing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Title</Label>
                    <p className="font-medium">{selectedListing.title}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Price</Label>
                    <p className="font-medium text-primary">{formatCurrency(selectedListing.price)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Category</Label>
                    <p className="font-medium">{selectedListing.category.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedListing.status)}</div>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedListing.description || 'No description'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Seller</Label>
                    <p className="font-medium">{selectedListing.userName}</p>
                    <p className="text-sm text-muted-foreground">{selectedListing.userEmail}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <p className="text-sm">{formatDate(selectedListing.createdAt)}</p>
                  </div>
                </div>

                {selectedListing.breed && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Breed</Label>
                      <p className="font-medium">{selectedListing.breed}</p>
                    </div>
                    {selectedListing.sex && (
                      <div>
                        <Label className="text-muted-foreground">Sex</Label>
                        <p className="font-medium capitalize">{selectedListing.sex}</p>
                      </div>
                    )}
                    {selectedListing.age && (
                      <div>
                        <Label className="text-muted-foreground">Age</Label>
                        <p className="font-medium">{selectedListing.age}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedListing.approvedAt && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Approved on {formatDate(selectedListing.approvedAt)}
                    </p>
                  </div>
                )}

                {selectedListing.rejectedAt && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300 mb-1">
                      Rejected on {formatDate(selectedListing.rejectedAt)}
                    </p>
                    {selectedListing.rejectionReason && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Reason: {selectedListing.rejectionReason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Listing</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this listing. This will be shared with the seller.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Images do not meet quality standards, missing required information..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject Listing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Listing</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete this listing? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            {selectedListing && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedListing.title}</p>
                <p className="text-sm text-muted-foreground">
                  by {selectedListing.userName}
                </p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Listing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
