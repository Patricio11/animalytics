"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Truck,
  AlertCircle,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Sale {
  id: string;
  status: string;
  purchasePrice: number;
  currency: string;
  totalAmount: number;
  paymentMethod: string;
  deliveryMethod: string;
  createdAt: string;
  completedAt: string | null;
  notes: string | null;
  otherParty: {
    id: string;
    name: string;
    email: string;
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
  nextAction?: string;
  nextStatus?: string;
}> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    icon: <Clock className="h-4 w-4" />,
    description: "Waiting for your confirmation",
    nextAction: "Confirm Order",
    nextStatus: "confirmed",
  },
  payment_pending: {
    label: "Payment Pending",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    icon: <AlertCircle className="h-4 w-4" />,
    description: "Waiting for buyer payment",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    icon: <CheckCircle2 className="h-4 w-4" />,
    description: "Order confirmed",
    nextAction: "Start Preparing",
    nextStatus: "preparing",
  },
  preparing: {
    label: "Preparing",
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    icon: <Package className="h-4 w-4" />,
    description: "Preparing for delivery/pickup",
    nextAction: "Mark Ready",
    nextStatus: "ready_for_pickup",
  },
  ready_for_pickup: {
    label: "Ready",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    icon: <Package className="h-4 w-4" />,
    description: "Ready for pickup/delivery",
    nextAction: "Complete Sale",
    nextStatus: "completed",
  },
  in_transit: {
    label: "In Transit",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    icon: <Truck className="h-4 w-4" />,
    description: "Being delivered",
    nextAction: "Mark Delivered",
    nextStatus: "completed",
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    icon: <CheckCircle2 className="h-4 w-4" />,
    description: "Sale complete",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    icon: <XCircle className="h-4 w-4" />,
    description: "Order cancelled",
  },
  disputed: {
    label: "Disputed",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    icon: <AlertCircle className="h-4 w-4" />,
    description: "Under review",
  },
};

export default function SellerSalesPage() {
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionNotes, setActionNotes] = useState("");

  // Fetch sales
  useEffect(() => {
    async function fetchSales() {
      try {
        const res = await fetch('/api/purchases?role=seller');
        if (res.ok) {
          const data = await res.json();
          setSales(data.purchases || []);
        }
      } catch (error) {
        console.error('Error fetching sales:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSales();
  }, []);

  // Filter sales by tab
  const pendingSales = sales.filter(
    s => s.status === 'pending'
  );
  const activeSales = sales.filter(
    s => ['confirmed', 'preparing', 'ready_for_pickup', 'in_transit', 'payment_pending'].includes(s.status)
  );
  const completedSales = sales.filter(
    s => s.status === 'completed'
  );
  const cancelledSales = sales.filter(
    s => ['cancelled', 'disputed'].includes(s.status)
  );

  // Calculate stats
  const totalRevenue = completedSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const pendingRevenue = [...pendingSales, ...activeSales].reduce((sum, s) => sum + s.totalAmount, 0);

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
    }).format(amount / 100);
  }

  // Get initials
  function getInitials(name: string) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Handle status update
  async function handleStatusUpdate(sale: Sale, newStatus: string) {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/purchases/${sale.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: newStatus === 'confirmed' ? 'confirm' :
                  newStatus === 'preparing' ? 'prepare' :
                  newStatus === 'ready_for_pickup' ? 'ready' :
                  newStatus === 'completed' ? 'complete' : newStatus,
          notes: actionNotes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state
      setSales(prev => prev.map(s =>
        s.id === sale.id ? { ...s, status: newStatus } : s
      ));

      toast({
        title: "Status Updated",
        description: `Order has been marked as ${statusConfig[newStatus]?.label || newStatus}`,
      });

      setActionDialogOpen(false);
      setActionNotes("");
      setSelectedSale(null);
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  // Sale card component
  function SaleCard({ sale }: { sale: Sale }) {
    const status = statusConfig[sale.status] || statusConfig.pending;

    return (
      <Card className="shadow-card hover:shadow-lg transition-all">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Image */}
            <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
              {sale.animal?.photo ? (
                <img
                  src={sale.animal.photo}
                  alt={sale.animal.name}
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
                    {sale.listing?.title || sale.animal?.name || 'Order'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-5 w-5">
                      {sale.otherParty?.image && <AvatarImage src={sale.otherParty.image} />}
                      <AvatarFallback className="text-[10px]">
                        {getInitials(sale.otherParty?.name || 'B')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {sale.otherParty?.name || 'Buyer'}
                    </span>
                  </div>
                </div>
                <p className="font-semibold whitespace-nowrap">
                  {formatPrice(sale.totalAmount, sale.currency)}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                  {status.icon}
                  {status.label}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(sale.createdAt)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3">
                {status.nextAction && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedSale(sale);
                      setActionDialogOpen(true);
                    }}
                    className="bg-primary"
                  >
                    {status.nextAction}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href={`/purchases/${sale.id}`}>
                    View Details
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  function EmptyState({ type }: { type: string }) {
    const messages = {
      pending: {
        title: "No pending orders",
        description: "New purchase requests will appear here",
      },
      active: {
        title: "No active orders",
        description: "Orders being processed will appear here",
      },
      completed: {
        title: "No completed sales",
        description: "Your completed sales will appear here",
      },
      cancelled: {
        title: "No cancelled orders",
        description: "Cancelled orders will appear here",
      },
    };

    const msg = messages[type as keyof typeof messages] || messages.pending;

    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="font-medium text-muted-foreground">{msg.title}</p>
        <p className="text-sm text-muted-foreground mt-1">{msg.description}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Sales Management</h1>
          <p className="text-muted-foreground text-sm">
            Manage your orders and track sales
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingSales.length}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeSales.length}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatPrice(totalRevenue, 'USD')}</p>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatPrice(pendingRevenue, 'USD')}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingSales.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                  {pendingSales.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">
              Active
              {activeSales.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {activeSales.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
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
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : pendingSales.length > 0 ? (
              pendingSales.map((sale) => (
                <SaleCard key={sale.id} sale={sale} />
              ))
            ) : (
              <EmptyState type="pending" />
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : activeSales.length > 0 ? (
              activeSales.map((sale) => (
                <SaleCard key={sale.id} sale={sale} />
              ))
            ) : (
              <EmptyState type="active" />
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : completedSales.length > 0 ? (
              completedSales.map((sale) => (
                <SaleCard key={sale.id} sale={sale} />
              ))
            ) : (
              <EmptyState type="completed" />
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : cancelledSales.length > 0 ? (
              cancelledSales.map((sale) => (
                <SaleCard key={sale.id} sale={sale} />
              ))
            ) : (
              <EmptyState type="cancelled" />
            )}
          </TabsContent>
        </Tabs>

        {/* Action Dialog */}
        <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedSale && statusConfig[selectedSale.status]?.nextAction}
              </DialogTitle>
              <DialogDescription>
                Update the status of this order
              </DialogDescription>
            </DialogHeader>

            {selectedSale && (
              <div className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium">
                    {selectedSale.listing?.title || selectedSale.animal?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Buyer: {selectedSale.otherParty?.name}
                  </p>
                  <p className="text-sm font-semibold mt-1">
                    {formatPrice(selectedSale.totalAmount, selectedSale.currency)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actionNotes">Notes (Optional)</Label>
                  <Textarea
                    id="actionNotes"
                    placeholder="Add any notes for this status update..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setActionDialogOpen(false);
                  setSelectedSale(null);
                  setActionNotes("");
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedSale && statusConfig[selectedSale.status]?.nextStatus) {
                    handleStatusUpdate(selectedSale, statusConfig[selectedSale.status].nextStatus!);
                  }
                }}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
