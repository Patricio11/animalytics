"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PawPrint,
  TrendingUp,
  Users,
  MapPin,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnimalsFilters } from "@/components/admin/animals/AnimalsFilters";
import { AnimalsTable } from "@/components/admin/animals/AnimalsTable";
import { useAdminAnimals, bulkDeleteAnimals, type AnimalFilters } from "@/lib/api/queries/admin-animals";

export default function AdminAnimalsPage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<AnimalFilters>({
    page: 1,
    limit: 25,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    status: 'active',
  });
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const { data, isLoading, isError } = useAdminAnimals(filters);

  const handleFiltersChange = (newFilters: AnimalFilters) => {
    setFilters(newFilters);
    setSelectedAnimals([]); // Clear selection on filter change
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 25,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      status: 'active',
    });
    setSelectedAnimals([]);
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteAnimals(selectedAnimals);
      
      toast({
        title: "Animals Deleted",
        description: `Successfully deleted ${selectedAnimals.length} animal(s).`,
      });

      setSelectedAnimals([]);
      setBulkDeleteDialogOpen(false);
      
      // Refresh data
      handleFiltersChange({ ...filters });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete animals. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    if (!data?.animals) return;

    const headers = [
      'Name',
      'Registered Name',
      'Breed',
      'Sex',
      'Date of Birth',
      'Owner',
      'Breeder',
      'Location',
      'Registration Number',
      'Microchip Number',
      'Created At',
    ];

    const rows = data.animals.map(animal => [
      animal.name,
      animal.registeredName || '',
      animal.breed?.name || '',
      animal.sex,
      animal.dateOfBirth || '',
      animal.owner?.name || animal.ownerName || '',
      animal.breederName || '',
      animal.location || '',
      animal.registrationNumber || '',
      animal.microchipNumber || '',
      animal.createdAt,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `animals-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Exported ${data.animals.length} animal(s) to CSV.`,
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
    setSelectedAnimals([]);
  };

  const handleLimitChange = (newLimit: string) => {
    setFilters({ ...filters, limit: parseInt(newLimit), page: 1 });
    setSelectedAnimals([]);
  };

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <Card className="shadow-card bg-surface border-0">
          <CardContent className="py-8 text-center">
            <p className="text-destructive">Failed to load animals. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = data?.stats;
  const pagination = data?.pagination;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-brand shadow-md">
              <PawPrint className="w-6 h-6 text-white" />
            </div>
            Animal Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all animals in the system with advanced filtering and bulk actions
          </p>
        </div>
      </div>

      {/* Stats Dashboard */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-card bg-surface border-0">
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Animals */}
          <Card className="shadow-card bg-surface border-0 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Animals</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalAnimals}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.activeAnimals} active, {stats.inactiveAnimals} inactive
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-brand/10">
                  <PawPrint className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Additions */}
          <Card className="shadow-card bg-surface border-0 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent (30d)</p>
                  <p className="text-3xl font-bold mt-2">{stats.recentAdditions}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    New animals this month
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* With Pedigree */}
          <Card className="shadow-card bg-surface border-0 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">With Pedigree</p>
                  <p className="text-3xl font-bold mt-2">{stats.withPedigree}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.totalAnimals > 0 
                      ? Math.round((stats.withPedigree / stats.totalAnimals) * 100)
                      : 0}% of total
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Breed */}
          <Card className="shadow-card bg-surface border-0 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Top Breed</p>
                  <p className="text-xl font-bold mt-2 truncate">
                    {stats.topBreeds[0]?.breed || 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.topBreeds[0]?.count || 0} animals
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <AnimalsFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Animals Table */}
        <div className="lg:col-span-3 space-y-4">
          {/* Bulk Actions Bar */}
          {selectedAnimals.length > 0 && (
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      {selectedAnimals.length} selected
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAnimals([])}
                      className="text-muted-foreground"
                    >
                      Clear selection
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportCSV}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Selected
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setBulkDeleteDialogOpen(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Selected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Table Header with Export */}
          <Card className="shadow-card bg-surface border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Animals
                  {pagination && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({pagination.totalCount} total)
                    </span>
                  )}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={!data?.animals || data.animals.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export All
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Table */}
          {isLoading ? (
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : data?.animals ? (
            <AnimalsTable
              animals={data.animals}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              selectedAnimals={selectedAnimals}
              onSelectionChange={setSelectedAnimals}
            />
          ) : null}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page:</span>
                    <Select
                      value={filters.limit?.toString() || '25'}
                      onValueChange={handleLimitChange}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Animals</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedAnimals.length}</strong> animal(s)? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90">
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
