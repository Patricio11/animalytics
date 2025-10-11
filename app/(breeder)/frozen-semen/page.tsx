"use client";

import { useState, useMemo } from "react";
import { FrozenSemenCard } from "@/components/breeder/frozen-semen/FrozenSemenCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Search, Snowflake, Package, TrendingUp, AlertTriangle, Loader2, AlertCircle } from "lucide-react";
import { useFrozenSemenBatches, useFrozenSemenStats } from "@/lib/api/queries/frozen-semen";
import Link from "next/link";

type FrozenSemenStatus = 'available' | 'reserved' | 'used' | 'expired';

export default function FrozenSemenInventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch data from API
  const { data: batchesData, isLoading, isError } = useFrozenSemenBatches(
    statusFilter !== 'all' ? { status: statusFilter as any } : undefined
  );
  const { data: statsData } = useFrozenSemenStats();

  // Filter batches client-side for search
  const filteredBatches = useMemo(() => {
    if (!batchesData) return [];

    if (!searchQuery) return batchesData;

    return batchesData.filter((b: any) =>
      b.batchIdentifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.sourceAnimal?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.sourceAnimal?.breed?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [batchesData, searchQuery]);

  // Calculate stats from API data
  const totalBatches = statsData?.totalBatches || 0;
  const availableBatches = statsData?.availableBatches || 0;
  const totalStraws = batchesData?.reduce((sum: number, b: any) => sum + b.strawCount, 0) || 0;
  const strawsRemaining = statsData?.strawsRemaining || 0;
  const lowStockBatches = statsData?.lowStockCount || 0;

  const stats = [
    {
      label: "Total Batches",
      value: totalBatches,
      icon: Package,
      color: "text-foreground",
    },
    {
      label: "Available",
      value: availableBatches,
      icon: Snowflake,
      color: "text-chart-3",
    },
    {
      label: "Straws Remaining",
      value: `${strawsRemaining}/${totalStraws}`,
      icon: TrendingUp,
      color: "text-chart-4",
    },
    {
      label: "Low Stock",
      value: lowStockBatches,
      icon: AlertTriangle,
      color: "text-destructive",
    },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Frozen Semen Inventory</h1>
            <p className="text-muted-foreground">Manage your frozen semen batches and storage</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Snowflake className="w-5 h-5 text-white" />
            </div>
            <Button
              asChild
              className="bg-gradient-brand hover:opacity-90 shadow-card"
            >
              <Link href="/frozen-semen/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Batch
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="hover-elevate shadow-card bg-surface border-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className={`${stat.color} p-2 rounded-lg bg-gradient-subtle`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="shadow-card bg-surface border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by batch ID, animal name, or breed..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-primary/20 focus:border-primary"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FrozenSemenStatus | 'all')}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background border-primary/20 focus:border-primary">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading frozen semen batches...</span>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load frozen semen batches. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Batches Grid */}
        {!isLoading && !isError && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Inventory</h2>
              <Badge variant="outline">
                {filteredBatches.length} {filteredBatches.length === 1 ? 'batch' : 'batches'}
              </Badge>
            </div>

            {filteredBatches.length === 0 ? (
              <Card className="shadow-card bg-surface border-0">
                <CardContent className="p-12 text-center space-y-4">
                  <div className="text-6xl">❄️</div>
                  <h3 className="text-lg font-medium text-foreground">No Batches Found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all'
                      ? 'Try adjusting your search filters'
                      : 'Start by adding your first frozen semen batch'}
                  </p>
                  {!searchQuery && statusFilter === 'all' && (
                    <Button
                      asChild
                      className="bg-gradient-brand hover:opacity-90 shadow-card"
                    >
                      <Link href="/frozen-semen/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Batch
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBatches.map((batch: any) => (
                  <FrozenSemenCard key={batch.id} batch={batch} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}