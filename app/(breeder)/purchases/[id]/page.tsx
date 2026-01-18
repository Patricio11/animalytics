"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Truck,
  AlertCircle,
  FileText,
  Download,
  Calendar,
  DollarSign,
  Shield,
  Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Status configuration
const statusConfig: Record<string, {
  label: string;
  color: string;
  icon: React.ReactNode;
  step: number;
}> = {
  pending: { label: "Pending", color: "text-yellow-600", icon: <Clock className="h-5 w-5" />, step: 1 },
  confirmed: { label: "Confirmed", color: "text-blue-600", icon: <CheckCircle2 className="h-5 w-5" />, step: 2 },
  preparing: { label: "Preparing", color: "text-indigo-600", icon: <Package className="h-5 w-5" />, step: 3 },
  ready_for_pickup: { label: "Ready", color: "text-green-600", icon: <Package className="h-5 w-5" />, step: 4 },
  in_transit: { label: "In Transit", color: "text-purple-600", icon: <Truck className="h-5 w-5" />, step: 4 },
  completed: { label: "Completed", color: "text-green-600", icon: <CheckCircle2 className="h-5 w-5" />, step: 5 },
  cancelled: { label: "Cancelled", color: "text-red-600", icon: <XCircle className="h-5 w-5" />, step: 0 },
  disputed: { label: "Disputed", color: "text-red-600", icon: <AlertCircle className="h-5 w-5" />, step: 0 },
};

export default function PurchaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const purchaseId = params.id as string;

  const [purchase, setPurchase] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch purchase details
  useEffect(() => {
    async function fetchPurchase() {
      try {
        const res = await fetch(`/api/purchases/${purchaseId}`);
        if (res.ok) {
          const data = await res.json();
          setPurchase(data);
          setTimeline(data.timeline || []);
          setDocuments(data.documents || []);
        } else if (res.status === 404) {
          router.push('/purchases');
        }
      } catch (error) {
        console.error('Error fetching purchase:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (purchaseId) {
      fetchPurchase();
    }
  }, [purchaseId, router]);

  // Handle payment
  async function handlePayment() {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/purchases/${purchaseId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: 'stripe' }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Open Stripe checkout in new window
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          toast({
            title: "Error",
            description: "Payment link not available",
            variant: "destructive",
          });
        }
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.error || "Failed to initiate payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  // Handle actions
  async function handleAction(action: string, reason?: string) {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });

      if (res.ok) {
        const data = await res.json();
        setPurchase((prev: any) => ({ ...prev, purchase: data.purchase }));

        // Refetch timeline
        const timelineRes = await fetch(`/api/purchases/${purchaseId}/timeline`);
        if (timelineRes.ok) {
          const timelineData = await timelineRes.json();
          setTimeline(timelineData.timeline || []);
        }

        toast({
          title: "Success",
          description: action === 'complete'
            ? "Purchase marked as complete!"
            : action === 'cancel'
            ? "Purchase cancelled"
            : "Action completed",
        });

        setShowCancelDialog(false);
        setShowDisputeDialog(false);
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.error || "Failed to complete action",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  // Format price
  function formatPrice(amount: number, currency: string) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount / 100);
  }

  // Format date
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  // Get initials
  function getInitials(name: string) {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '??';
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-secondary p-4 sm:p-6 lg:p-8">
        <div className=" mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="h-24 w-24 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <p className="text-muted-foreground">Purchase not found</p>
      </div>
    );
  }

  const status = statusConfig[purchase.purchase.status] || statusConfig.pending;
  const isActive = !['completed', 'cancelled', 'refunded', 'disputed'].includes(purchase.purchase.status);

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/purchases">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Purchase Details</h1>
            <p className="text-sm text-muted-foreground">
              Order #{purchase.purchase.id.substring(0, 8)}
            </p>
          </div>
        </div>

        {/* Status Banner */}
        <Card className={`shadow-card border-l-4 ${
          purchase.purchase.status === 'completed' ? 'border-l-green-500' :
          purchase.purchase.status === 'cancelled' ? 'border-l-red-500' :
          'border-l-primary'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={status.color}>{status.icon}</div>
                <div>
                  <p className="font-semibold">{status.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {purchase.purchase.status === 'pending' && "Waiting for seller confirmation"}
                    {purchase.purchase.status === 'confirmed' && "Seller has confirmed your order"}
                    {purchase.purchase.status === 'preparing' && "Your order is being prepared"}
                    {purchase.purchase.status === 'ready_for_pickup' && "Ready for pickup/delivery"}
                    {purchase.purchase.status === 'in_transit' && "Your order is on the way"}
                    {purchase.purchase.status === 'completed' && "Order complete - Thank you!"}
                    {purchase.purchase.status === 'cancelled' && "This order has been cancelled"}
                  </p>
                </div>
              </div>
              {/* Make Payment Button - Only show for PET OWNER if payment not completed */}
              {purchase.userRole === 'pet_owner' &&
               purchase.purchase.paymentStatus !== 'completed' && 
               purchase.purchase.paymentStatus !== 'processing' &&
               (purchase.purchase.status === 'pending' || purchase.purchase.status === 'payment_pending') && (
                <Button onClick={handlePayment} disabled={isProcessing} className="bg-primary">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Make Payment'}
                </Button>
              )}
              
              {/* Mark as Dispatched Button - Only show for SELLER after payment */}
              {purchase.userRole === 'seller' &&
               purchase.purchase.paymentStatus === 'completed' &&
               (purchase.purchase.status === 'payment_completed' || purchase.purchase.status === 'confirmed') && (
                <Button onClick={() => handleAction('dispatch')} disabled={isProcessing} className="bg-primary">
                  <Truck className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Mark as Dispatched'}
                </Button>
              )}
              
              {/* Confirm Receipt Button - Only show for PET OWNER when item is ready/in transit */}
              {purchase.userRole === 'pet_owner' &&
               (purchase.purchase.status === 'ready_for_pickup' || purchase.purchase.status === 'in_transit') && (
                <Button onClick={() => handleAction('complete')} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Confirm Receipt'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Animal/Listing Info */}
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {(purchase.animal?.primaryPhotoUrl || purchase.listing?.additionalImages?.[0]) ? (
                      <img
                        src={purchase.animal?.primaryPhotoUrl || purchase.listing?.additionalImages?.[0]}
                        alt={purchase.animal?.name || purchase.listing?.title}
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {purchase.listing?.title || purchase.animal?.name || 'Purchase'}
                    </h3>
                    {purchase.animal && (
                      <p className="text-sm text-muted-foreground">
                        {purchase.animal.breed} • {purchase.animal.sex}
                      </p>
                    )}
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {formatPrice(purchase.purchase.totalAmount, purchase.purchase.currency)}
                      </p>
                      <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                        {purchase.purchase.platformFee > 0 && (
                          <p>Platform fee: {formatPrice(purchase.purchase.platformFee, purchase.purchase.currency)}</p>
                        )}
                        {purchase.purchase.deliveryFee !== undefined && purchase.purchase.deliveryFee > 0 && (
                          <p>Delivery fee: {formatPrice(purchase.purchase.deliveryFee, purchase.purchase.currency)}</p>
                        )}
                        {purchase.purchase.deliveryFee === 0 && purchase.purchase.deliveryMethod !== 'pickup' && (
                          <p className="text-green-600">Free delivery</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="timeline">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="mt-4">
                <Card className="shadow-card">
                  <CardContent className="p-6">
                    {timeline.length > 0 ? (
                      <div className="space-y-6">
                        {timeline.map((event, index) => (
                          <div key={event.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                              }`}>
                                <CheckCircle2 className="h-4 w-4" />
                              </div>
                              {index < timeline.length - 1 && (
                                <div className="w-px h-full bg-border mt-2" />
                              )}
                            </div>
                            <div className="flex-1 pb-6">
                              <p className="font-medium">{event.eventTitle}</p>
                              <p className="text-sm text-muted-foreground">
                                {event.eventDescription}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(event.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No timeline events yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="mt-4">
                <Card className="shadow-card">
                  <CardContent className="p-6 space-y-4">
                    {/* Price Breakdown */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Price Breakdown</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Item Price</span>
                          <span className="font-medium">
                            {formatPrice(purchase.purchase.purchasePrice, purchase.purchase.currency)}
                          </span>
                        </div>
                        {purchase.purchase.platformFee > 0 && (
                          <div className="flex justify-between">
                            <span>Platform Fee</span>
                            <span className="font-medium">
                              {formatPrice(purchase.purchase.platformFee, purchase.purchase.currency)}
                            </span>
                          </div>
                        )}
                        {purchase.purchase.deliveryFee !== undefined && (
                          <div className="flex justify-between">
                            <span>Delivery Fee</span>
                            <span className={`font-medium ${purchase.purchase.deliveryFee === 0 ? 'text-green-600' : ''}`}>
                              {purchase.purchase.deliveryFee === 0 ? 'FREE' : formatPrice(purchase.purchase.deliveryFee, purchase.purchase.currency)}
                            </span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-bold text-base">
                          <span>Total</span>
                          <span className="text-primary">
                            {formatPrice(purchase.purchase.totalAmount, purchase.purchase.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                      <p className="capitalize">{purchase.purchase.paymentMethod?.replace('_', ' ')}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Delivery Method</p>
                      <p className="capitalize">{purchase.purchase.deliveryMethod?.replace('_', ' ')}</p>
                    </div>
                    {purchase.purchase.scheduledDate && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Scheduled Date</p>
                          <p>{new Date(purchase.purchase.scheduledDate).toLocaleDateString()}</p>
                        </div>
                      </>
                    )}
                    {purchase.purchase.deliveryAddress && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Delivery Address</p>
                          <p>{purchase.purchase.deliveryAddress}</p>
                          <p>
                            {[
                              purchase.purchase.deliveryCity,
                              purchase.purchase.deliveryState,
                              purchase.purchase.deliveryPostalCode
                            ].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      </>
                    )}
                    {purchase.purchase.petOwnerNotes && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Your Notes</p>
                          <p>{purchase.purchase.petOwnerNotes}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="mt-4">
                <Card className="shadow-card">
                  <CardContent className="p-6">
                    {documents.length > 0 ? (
                      <div className="space-y-3">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">{doc.documentName}</p>
                                <p className="text-xs text-muted-foreground">{doc.documentType}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" asChild>
                              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No documents yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Seller Info & Actions */}
          <div className="space-y-6">
            {/* Seller Card */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Seller</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    {purchase.seller?.image ? (
                      <AvatarImage src={purchase.seller.image} />
                    ) : null}
                    <AvatarFallback>{getInitials(purchase.seller?.name || '')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{purchase.seller?.name}</p>
                    <p className="text-sm text-muted-foreground">{purchase.seller?.email}</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/messages">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Pet Owner
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Actions */}
            {isActive && (
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Cancel Button */}
                  <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                        Cancel Purchase
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancel Purchase</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to cancel this purchase? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <Textarea
                        placeholder="Reason for cancellation (optional)"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                      />
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowCancelDialog(false)}>
                          Keep Purchase
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleAction('cancel', cancelReason)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? "Cancelling..." : "Cancel Purchase"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Dispute Button */}
                  <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="w-full text-muted-foreground">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Open Dispute
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Open Dispute</DialogTitle>
                        <DialogDescription>
                          Please describe your issue. Our team will review and help resolve it.
                        </DialogDescription>
                      </DialogHeader>
                      <Textarea
                        placeholder="Describe the issue..."
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        rows={4}
                      />
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowDisputeDialog(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleAction('dispute', disputeReason)}
                          disabled={isProcessing || !disputeReason.trim()}
                        >
                          {isProcessing ? "Submitting..." : "Submit Dispute"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}

            {/* Order Info */}
            <Card className="shadow-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Order Date</span>
                  <span>{new Date(purchase.purchase.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono text-xs">{purchase.purchase.id.substring(0, 8)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
