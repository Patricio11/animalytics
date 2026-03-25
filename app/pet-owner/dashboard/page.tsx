"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  ShoppingBag,
  Heart,
  Search,
  Bell,
  ArrowRight,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle
} from "lucide-react";
import { authClient } from "@/lib/auth/client";

// Stats card component
function StatsCard({
  title,
  value,
  icon,
  description,
  href
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  href?: string;
}) {
  const content = (
    <Card className="shadow-card hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

// Activity item component
function ActivityItem({
  icon,
  title,
  description,
  time,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{title}</p>
        <p className="text-sm text-muted-foreground truncate">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

// Purchase status badge
function PurchaseStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "Pending", variant: "secondary" },
    confirmed: { label: "Confirmed", variant: "default" },
    preparing: { label: "Preparing", variant: "default" },
    ready_for_pickup: { label: "Ready", variant: "default" },
    in_transit: { label: "In Transit", variant: "default" },
    completed: { label: "Completed", variant: "outline" },
    cancelled: { label: "Cancelled", variant: "destructive" },
  };

  const config = statusConfig[status] || { label: status, variant: "secondary" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default function PetOwnerDashboard() {
  const { data: session } = authClient.useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    savedListings: 0,
    conversations: 0,
    unreadMessages: 0,
    totalPurchases: 0,
    activePurchases: 0,
    completedPurchases: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activePurchases, setActivePurchases] = useState<any[]>([]);

  // Fetch dashboard data
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch pet owner stats
        const statsRes = await fetch('/api/pet-owner/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            savedListings: statsData.savedListings || 0,
            conversations: statsData.totalConversations || 0,
            unreadMessages: statsData.unreadMessages || 0,
            totalPurchases: statsData.purchases?.total || 0,
            activePurchases: statsData.purchases?.active || 0,
            completedPurchases: statsData.purchases?.completed || 0,
          });
        }

        // Fetch recent purchases
        const purchasesRes = await fetch('/api/purchases?role=pet_owner');
        if (purchasesRes.ok) {
          const purchasesData = await purchasesRes.json();
          // Get active purchases (not completed or cancelled)
          const active = purchasesData.purchases?.filter(
            (p: any) => !['completed', 'cancelled', 'refunded'].includes(p.status)
          ).slice(0, 3) || [];
          setActivePurchases(active);
        }

        // Fetch recent conversations for activity
        const conversationsRes = await fetch('/api/conversations');
        if (conversationsRes.ok) {
          const conversationsData = await conversationsRes.json();
          const recentConvos = conversationsData.conversations?.slice(0, 3).map((c: any) => ({
            icon: <MessageSquare className="h-4 w-4" />,
            title: `Message from ${c.otherParticipant?.name || 'Seller'}`,
            description: c.lastMessagePreview || 'New conversation',
            time: c.lastMessageAt ? formatRelativeTime(c.lastMessageAt) : 'Recently',
            href: `/pet-owner/messages/${c.id}`,
          })) || [];
          setRecentActivity(recentConvos);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Format relative time
  function formatRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  const userName = session?.user?.name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Welcome back, {userName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your account
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button asChild className="bg-gradient-brand hover:opacity-90">
            <Link href="/marketplace">
              <Search className="h-4 w-4 mr-2" />
              Browse Listings
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/pet-owner/messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
              {stats.unreadMessages > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                  {stats.unreadMessages}
                </Badge>
              )}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/pet-owner/saved">
              <Heart className="h-4 w-4 mr-2" />
              Saved
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="shadow-card">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatsCard
                title="Saved Listings"
                value={stats.savedListings}
                icon={<Heart className="h-5 w-5" />}
                href="/pet-owner/saved"
              />
              <StatsCard
                title="Messages"
                value={stats.conversations}
                icon={<MessageSquare className="h-5 w-5" />}
                description={stats.unreadMessages > 0 ? `${stats.unreadMessages} unread` : undefined}
                href="/pet-owner/messages"
              />
              <StatsCard
                title="Active Purchases"
                value={stats.activePurchases}
                icon={<Package className="h-5 w-5" />}
                href="/pet-owner/purchases"
              />
              <StatsCard
                title="Completed"
                value={stats.completedPurchases}
                icon={<CheckCircle2 className="h-5 w-5" />}
                href="/pet-owner/purchases?status=completed"
              />
            </>
          )}
        </div>

        {/* Main Content Grid - Facebook Style */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Activity Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Purchases */}
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">Active Purchases</CardTitle>
                  <CardDescription>Track your ongoing purchases</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/pet-owner/purchases">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-3">
                        <Skeleton className="h-12 w-12 rounded" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                ) : activePurchases.length > 0 ? (
                  <div className="space-y-3">
                    {activePurchases.map((purchase) => (
                      <Link
                        key={purchase.id}
                        href={`/pet-owner/purchases/${purchase.id}`}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                          {purchase.animal?.photo ? (
                            <img
                              src={purchase.animal.photo}
                              alt={purchase.animal.name}
                              className="h-full w-full object-cover rounded"
                            />
                          ) : (
                            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {purchase.listing?.title || purchase.animal?.name || 'Purchase'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {purchase.otherParty?.name || 'Seller'}
                          </p>
                        </div>
                        <PurchaseStatusBadge status={purchase.status} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No active purchases</p>
                    <Button variant="ghost" asChild className="mt-2">
                      <Link href="/marketplace">Browse Marketplace</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Your latest interactions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3 p-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-48 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length > 0 ? (
                  <div className="space-y-1">
                    {recentActivity.map((activity, index) => (
                      <ActivityItem key={index} {...activity} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/marketplace?category=pups_for_sale">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Puppies
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/marketplace?category=dog_for_sale">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Dogs
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/breeders">
                    <Search className="h-4 w-4 mr-2" />
                    Find Breeders
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Have questions about buying? We're here to help.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/help">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Help Center
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="shadow-card bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Buyer Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>Always communicate through our messaging system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>Ask for health certificates and pedigree papers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>Meet the animal before completing purchase</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
