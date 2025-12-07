"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Truck,
  AlertCircle,
  ArrowRight,
  MessageSquare,
} from "lucide-react";

interface Purchase {
  id: string;
  status: string;
  purchasePrice: number;
  currency: string;
  totalAmount: number;
  paymentMethod: string;
  deliveryMethod: string;
  createdAt: string;
  completedAt: string | null;
  otherParty: {
    id: string;
    name: string;
    image: string | null;
  };
  listing: {
    id: string;
    title: string;
    category: string;
  } | null;
  animal: {
    id: string;
    name: string;
    breed: string;
    photo: string | null;
  } | null;
}

// Status configuration
const statusConfig: Record<string, {
  label: string;
  color: string;
  icon: React.ReactNode;
  description: string;
}> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    icon: <Clock className="h-4 w-4" />,
    description: "Waiting for seller confirmation"
  },
  payment_pending: {
    label: "Payment Pending",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    icon: <AlertCircle className="h-4 w-4" />,
    description: "Awaiting payment"
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    icon: <CheckCircle2 className="h-4 w-4" />,
    description: "Seller has confirmed"
  },
  preparing: {
    label: "Preparing",
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    icon: <Package className="h-4 w-4" />,
    description: "Seller is preparing"
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    icon: <Package className="h-4 w-4" />,
    description: "Ready to collect"
  },
  in_transit: {
    label: "In Transit",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    icon: <Truck className="h-4 w-4" />,
    description: "Being delivered"
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    icon: <CheckCircle2 className="h-4 w-4" />,
    description: "Purchase complete"
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    icon: <XCircle className="h-4 w-4" />,
    description: "Purchase cancelled"
  },
  disputed: {
    label: "Disputed",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    icon: <AlertCircle className="h-4 w-4" />,
    description: "Under review"
  },
};

export default function BuyerPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  // Fetch purchases
  useEffect(() => {
    async function fetchPurchases() {
      try {
        const res = await fetch('/api/purchases?role=buyer');
        if (res.ok) {
          const data = await res.json();
          setPurchases(data.purchases || []);
        }
      } catch (error) {
        console.error('Error fetching purchases:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPurchases();
  }, []);

  // Filter purchases by tab
  const activePurchases = purchases.filter(
    p => !['completed', 'cancelled', 'refunded'].includes(p.status)
  );
  const completedPurchases = purchases.filter(
    p => p.status === 'completed'
  );
  const cancelledPurchases = purchases.filter(
    p => ['cancelled', 'refunded'].includes(p.status)
  );

  // Format date
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // Format price
  function formatPrice(amount: number, currency: string) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount / 100); // Assuming amount is in cents
  }

  // Purchase card component
  function PurchaseCard({ purchase }: { purchase: Purchase }) {
    const status = statusConfig[purchase.status] || statusConfig.pending;

    return (
      <Link href={`/purchases/${purchase.id}`}>
        <Card className="shadow-card hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Image */}
              <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
                {purchase.animal?.photo ? (
                  <img
                    src={purchase.animal.photo}
                    alt={purchase.animal.name}
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold truncate">
                      {purchase.listing?.title || purchase.animal?.name || 'Purchase'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Seller: {purchase.otherParty?.name || 'Unknown'}
                    </p>
                  </div>
                  <p className="font-semibold whitespace-nowrap">
                    {formatPrice(purchase.totalAmount, purchase.currency)}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    {status.icon}
                    {status.label}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(purchase.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mt-1">
                  {status.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Empty state component
  function EmptyState({ type }: { type: string }) {
    const messages = {
      active: {
        title: "No active purchases",
        description: "Start by browsing the marketplace",
        action: "Browse Marketplace",
        href: "/marketplace",
      },
      completed: {
        title: "No completed purchases",
        description: "Your completed purchases will appear here",
        action: "Browse Marketplace",
        href: "/marketplace",
      },
      cancelled: {
        title: "No cancelled purchases",
        description: "Cancelled purchases will appear here",
        action: null,
        href: null,
      },
    };

    const msg = messages[type as keyof typeof messages] || messages.active;

    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="font-medium text-muted-foreground">{msg.title}</p>
        <p className="text-sm text-muted-foreground mt-1">{msg.description}</p>
        {msg.action && (
          <Button variant="ghost" asChild className="mt-2">
            <Link href={msg.href!}>{msg.action}</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Purchases</h1>
          <p className="text-muted-foreground text-sm">
            Track and manage your purchases
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="active" className="relative">
              Active
              {activePurchases.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {activePurchases.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              {completedPurchases.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {completedPurchases.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="shadow-card">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Skeleton className="h-20 w-20 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-4 w-32 mb-3" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : activePurchases.length > 0 ? (
              activePurchases.map((purchase) => (
                <PurchaseCard key={purchase.id} purchase={purchase} />
              ))
            ) : (
              <EmptyState type="active" />
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : completedPurchases.length > 0 ? (
              completedPurchases.map((purchase) => (
                <PurchaseCard key={purchase.id} purchase={purchase} />
              ))
            ) : (
              <EmptyState type="completed" />
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : cancelledPurchases.length > 0 ? (
              cancelledPurchases.map((purchase) => (
                <PurchaseCard key={purchase.id} purchase={purchase} />
              ))
            ) : (
              <EmptyState type="cancelled" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
