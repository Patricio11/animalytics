"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Heart,
  ShoppingBag,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Award,
  Eye,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  users: {
    total: number;
    breeders: number;
    petOwners: number;
    veterinarians: number;
    admins: number;
    verified: number;
    newThisMonth: number;
  };
  animals: {
    total: number;
    active: number;
    breeding: number;
    champions: number;
  };
  listings: {
    total: number;
    active: number;
    sold: number;
    draft: number;
    featured: number;
    totalViews: number;
  };
  purchases: {
    total: number;
    pending: number;
    completed: number;
    inEscrow: number;
    disputed: number;
    totalRevenue: number;
    revenueThisMonth: number;
  };
  messages: {
    total: number;
    active: number;
    thisWeek: number;
  };
}

interface RecentActivity {
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
    createdAt: string;
  }>;
  listings: Array<{
    id: string;
    title: string;
    category: string;
    status: string;
    price: number | null;
    createdAt: string;
  }>;
  purchases: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data.statistics);
          setRecentActivity(data.recentActivity);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-secondary p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats || !recentActivity) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    );
  }

  const formatCurrency = (cents: number | null) => {
    if (!cents) return '$0.00';
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, string> = {
      admin: 'destructive',
      breeder: 'default',
      pet_owner: 'secondary',
      veterinarian: 'outline',
    };
    return variants[role] || 'default';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'default',
      sold: 'secondary',
      draft: 'outline',
      pending: 'outline',
      completed: 'default',
      in_escrow: 'secondary',
      disputed: 'destructive',
    };
    return variants[status] || 'default';
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            System overview and analytics
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Users Card */}
          <Link href="/admin/users">
            <Card className="shadow-card hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <Users className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    +{stats.users.newThisMonth} this month
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-foreground">{stats.users.total.toLocaleString()}</h3>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <div className="mt-4 text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Breeders:</span>
                    <span className="font-medium">{stats.users.breeders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pet Owners:</span>
                    <span className="font-medium">{stats.users.petOwners}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Verified:</span>
                    <span className="font-medium">{stats.users.verified}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Animals Card */}
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <Heart className="w-6 h-6" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {stats.animals.champions} Champions
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{stats.animals.total.toLocaleString()}</h3>
              <p className="text-sm text-muted-foreground">Total Animals</p>
              <div className="mt-4 text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span className="font-medium">{stats.animals.active}</span>
                </div>
                <div className="flex justify-between">
                  <span>Breeding:</span>
                  <span className="font-medium">{stats.animals.breeding}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Listings Card */}
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {stats.listings.totalViews?.toLocaleString() || 0}
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{stats.listings.total.toLocaleString()}</h3>
              <p className="text-sm text-muted-foreground">Total Listings</p>
              <div className="mt-4 text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span className="font-medium text-green-600">{stats.listings.active}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sold:</span>
                  <span className="font-medium">{stats.listings.sold}</span>
                </div>
                <div className="flex justify-between">
                  <span>Featured:</span>
                  <span className="font-medium">{stats.listings.featured}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Card */}
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                  <DollarSign className="w-6 h-6" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {stats.purchases.completed} completed
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                {formatCurrency(stats.purchases.totalRevenue)}
              </h3>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <div className="mt-4 text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>This Month:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(stats.purchases.revenueThisMonth)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>In Escrow:</span>
                  <span className="font-medium">{stats.purchases.inEscrow}</span>
                </div>
                <div className="flex justify-between">
                  <span>Disputed:</span>
                  <span className="font-medium text-amber-600">{stats.purchases.disputed}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{stats.messages.total}</h3>
                  <p className="text-sm text-muted-foreground">Conversations</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.messages.thisWeek} this week
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{stats.listings.sold}</h3>
                  <p className="text-sm text-muted-foreground">Successful Sales</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((stats.listings.sold / stats.listings.total) * 100).toFixed(1)}% conversion
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{stats.animals.champions}</h3>
                  <p className="text-sm text-muted-foreground">Champion Animals</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((stats.animals.champions / stats.animals.total) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Users</span>
                <Link href="/admin/users">
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                    View All
                  </Badge>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.users.slice(0, 5).map((user) => (
                  <Link key={user.id} href={`/admin/users`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                      <Avatar className="h-10 w-10">
                        {user.avatar && <AvatarImage src={user.avatar} />}
                        <AvatarFallback>
                          {user.name?.slice(0, 2).toUpperCase() || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getRoleBadge(user.role) as any} className="text-xs mb-1">
                          {user.role}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Listings */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Listings</span>
                <Badge variant="outline">Latest</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.listings.slice(0, 5).map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{listing.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {listing.category.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <Badge variant={getStatusBadge(listing.status) as any} className="text-xs mb-1">
                        {listing.status}
                      </Badge>
                      {listing.price && (
                        <p className="text-sm font-medium text-primary">
                          {formatCurrency(listing.price)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Purchases */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.purchases.slice(0, 5).map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                      <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        Transaction {purchase.id.slice(0, 8)}...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(purchase.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {formatCurrency(purchase.amount)}
                    </p>
                    <Badge variant={getStatusBadge(purchase.status) as any} className="text-xs">
                      {purchase.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
