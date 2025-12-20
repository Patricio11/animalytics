"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CreditCard,
  Wallet,
  Building2,
  Banknote,
  Package,
  Truck,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getConversationUrl, type UserRole } from "@/lib/utils/routing";

interface Listing {
  id: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  additionalImages?: string[];
}

interface DeliveryOption {
  method: 'pickup' | 'delivery' | 'shipping';
  available: boolean;
  fee: number;
  feeInternational?: number;
  label: string;
  description: string;
  estimatedDays: number;
  notes?: string | null;
}

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing;
  conversationId?: string;
  userRole: UserRole;
}

type PaymentMethod = "stripe" | "wallet" | "bank_transfer" | "cash";
type DeliveryMethod = "pickup" | "delivery" | "shipping";

export function CheckoutDialog({
  open,
  onOpenChange,
  listing,
  conversationId,
  userRole,
}: CheckoutDialogProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Form state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryPostalCode, setDeliveryPostalCode] = useState("");
  const [deliveryCountry, setDeliveryCountry] = useState("USA");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState("");
  const [buyerNotes, setBuyerNotes] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [platformFee, setPlatformFee] = useState(0);
  const [isLoadingFee, setIsLoadingFee] = useState(true);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [isLoadingDeliveryOptions, setIsLoadingDeliveryOptions] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState(0);

  // Fetch platform fee
  useEffect(() => {
    async function fetchPlatformFee() {
      try {
        setIsLoadingFee(true);
        const response = await fetch(`/api/purchases/calculate-fee?amount=${listing.price}`);
        if (response.ok) {
          const data = await response.json();
          setPlatformFee(data.platformFee || 0);
        }
      } catch (error) {
        console.error("Error fetching platform fee:", error);
        // Use default 5% if API fails
        setPlatformFee(Math.round(listing.price * 0.05));
      } finally {
        setIsLoadingFee(false);
      }
    }

    if (open && listing.price) {
      fetchPlatformFee();
    }
  }, [open, listing.price]);

  // Fetch delivery options
  useEffect(() => {
    async function fetchDeliveryOptions() {
      try {
        setIsLoadingDeliveryOptions(true);
        const response = await fetch(`/api/listings/${listing.id}/delivery-options`);
        if (response.ok) {
          const data = await response.json();
          setDeliveryOptions(data.options || []);
          // Set default delivery method to first available option
          if (data.options && data.options.length > 0) {
            setDeliveryMethod(data.options[0].method);
            setDeliveryFee(data.options[0].fee || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching delivery options:", error);
        // Fallback to pickup only
        setDeliveryOptions([{
          method: 'pickup',
          available: true,
          fee: 0,
          label: 'Pickup',
          description: 'Pick up from breeder\'s location',
          estimatedDays: 0,
        }]);
        setDeliveryMethod('pickup');
        setDeliveryFee(0);
      } finally {
        setIsLoadingDeliveryOptions(false);
      }
    }

    if (open && listing.id) {
      fetchDeliveryOptions();
    }
  }, [open, listing.id]);

  // Update delivery fee when delivery method or country changes
  useEffect(() => {
    const selectedOption = deliveryOptions.find(opt => opt.method === deliveryMethod);
    if (selectedOption) {
      // Check if international shipping
      const isInternational = deliveryMethod === 'shipping' && deliveryCountry && deliveryCountry !== 'USA' && deliveryCountry !== 'US';
      const fee = isInternational && selectedOption.feeInternational !== undefined
        ? selectedOption.feeInternational
        : selectedOption.fee;
      setDeliveryFee(fee);
    }
  }, [deliveryMethod, deliveryCountry, deliveryOptions]);

  const totalAmount = listing.price + platformFee + deliveryFee;

  const handleSubmit = async () => {
    // Validation
    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method.",
        variant: "destructive",
      });
      return;
    }

    if (!deliveryMethod) {
      toast({
        title: "Delivery Method Required",
        description: "Please select a delivery method.",
        variant: "destructive",
      });
      return;
    }

    if (deliveryMethod !== "pickup" && !deliveryAddress) {
      toast({
        title: "Address Required",
        description: "Please enter your delivery address.",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create purchase
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          paymentMethod,
          deliveryMethod,
          deliveryAddress: deliveryMethod !== "pickup" ? deliveryAddress : undefined,
          deliveryCity: deliveryMethod !== "pickup" ? deliveryCity : undefined,
          deliveryState: deliveryMethod !== "pickup" ? deliveryState : undefined,
          deliveryPostalCode: deliveryMethod !== "pickup" ? deliveryPostalCode : undefined,
          deliveryCountry: deliveryMethod !== "pickup" ? deliveryCountry : undefined,
          deliveryNotes,
          scheduledDate: scheduledDate?.toISOString(),
          scheduledTime,
          buyerNotes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create purchase");
      }

      const data = await response.json();

      // If Stripe payment, redirect to payment
      if (paymentMethod === "stripe") {
        // Create Stripe checkout session
        const paymentResponse = await fetch(`/api/purchases/${data.purchase.id}/create-checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();
          if (paymentData.url) {
            // Redirect to Stripe checkout
            window.location.href = paymentData.url;
            return;
          }
        }
      }

      // Success - redirect to purchase details or conversation
      toast({
        title: "Purchase Created!",
        description: "Your purchase has been initiated successfully.",
      });

      onOpenChange(false);

      // Redirect to conversation or purchase details
      if (data.conversationId) {
        const conversationUrl = getConversationUrl(userRole, data.conversationId);
        router.push(conversationUrl);
      } else {
        router.push(`/buyer/purchases/${data.purchase.id}`);
      }
    } catch (error) {
      console.error("Error creating purchase:", error);
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Failed to create purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Complete Your Purchase</DialogTitle>
          <DialogDescription>
            Review the details and complete your purchase of {listing.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Listing Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-4">
              {listing.additionalImages && listing.additionalImages.length > 0 && (
                <div className="h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  <img
                    src={listing.additionalImages[0]}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
                <Badge variant="outline">{listing.category}</Badge>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Info className="h-4 w-4" />
              Price Breakdown
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item Price</span>
                <span className="font-medium">
                  {listing.currency} ${(listing.price / 100).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="font-medium">
                  {isLoadingFee ? (
                    <Loader2 className="h-4 w-4 animate-spin inline" />
                  ) : (
                    `${listing.currency} $${(platformFee / 100).toLocaleString()}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">
                  {isLoadingDeliveryOptions ? (
                    <Loader2 className="h-4 w-4 animate-spin inline" />
                  ) : deliveryFee === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `${listing.currency} $${(deliveryFee / 100).toLocaleString()}`
                  )}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  {listing.currency} ${(totalAmount / 100).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
              <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="stripe" id="stripe" />
                <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Credit/Debit Card</div>
                    <div className="text-xs text-muted-foreground">Secure payment via Stripe</div>
                  </div>
                </Label>
                <Badge variant="secondary">Recommended</Badge>
              </div>

              <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="wallet" id="wallet" />
                <Label htmlFor="wallet" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Wallet className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Wallet Balance</div>
                    <div className="text-xs text-muted-foreground">Pay from your wallet</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Bank Transfer</div>
                    <div className="text-xs text-muted-foreground">Direct bank transfer</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Banknote className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-xs text-muted-foreground">Pay when you receive</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Delivery Method */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Delivery Method</Label>
            {isLoadingDeliveryOptions ? (
              <div className="flex items-center justify-center p-8 border rounded-lg">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading delivery options...</span>
              </div>
            ) : (
              <RadioGroup value={deliveryMethod} onValueChange={(value) => setDeliveryMethod(value as DeliveryMethod)}>
                {deliveryOptions.map((option) => {
                  const Icon = option.method === 'pickup' ? MapPin : option.method === 'delivery' ? Truck : Package;
                  const isInternational = option.method === 'shipping' && deliveryCountry && deliveryCountry !== 'USA' && deliveryCountry !== 'US';
                  const displayFee = isInternational && option.feeInternational !== undefined ? option.feeInternational : option.fee;
                  
                  return (
                    <div key={option.method} className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value={option.method} id={option.method} />
                      <Label htmlFor={option.method} className="cursor-pointer flex-1">
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{option.label}</div>
                              {displayFee === 0 ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-700">FREE</Badge>
                              ) : (
                                <span className="text-sm font-semibold">${(displayFee / 100).toFixed(2)}</span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                            {option.estimatedDays > 0 && (
                              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Est. {option.estimatedDays} {option.estimatedDays === 1 ? 'day' : 'days'}
                              </div>
                            )}
                            {option.notes && (
                              <div className="text-xs text-muted-foreground mt-1 italic">
                                {option.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            )}
          </div>

          {/* Delivery Address (if not pickup) */}
          {deliveryMethod !== "pickup" && (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <Label className="text-base font-semibold">Delivery Address</Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      value={deliveryState}
                      onChange={(e) => setDeliveryState(e.target.value)}
                      placeholder="NY"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="postal">Postal Code *</Label>
                    <Input
                      id="postal"
                      value={deliveryPostalCode}
                      onChange={(e) => setDeliveryPostalCode(e.target.value)}
                      placeholder="10001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select value={deliveryCountry} onValueChange={setDeliveryCountry}>
                      <SelectTrigger id="country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USA">United States</SelectItem>
                        <SelectItem value="CAN">Canada</SelectItem>
                        <SelectItem value="GBR">United Kingdom</SelectItem>
                        <SelectItem value="AUS">Australia</SelectItem>
                        <SelectItem value="ZAF">South Africa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
                  <Textarea
                    id="deliveryNotes"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Any special delivery instructions..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Schedule Pickup/Delivery */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Schedule {deliveryMethod === "pickup" ? "Pickup" : "Delivery"}</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date">Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="time">Time (Optional)</Label>
                <Select value={scheduledTime} onValueChange={setScheduledTime}>
                  <SelectTrigger id="time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="13:00">1:00 PM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                    <SelectItem value="16:00">4:00 PM</SelectItem>
                    <SelectItem value="17:00">5:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={buyerNotes}
              onChange={(e) => setBuyerNotes(e.target.value)}
              placeholder="Any questions or special requests for the seller..."
              rows={3}
            />
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start space-x-2 p-4 border rounded-lg bg-muted/30">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I agree to the terms and conditions
              </label>
              <p className="text-xs text-muted-foreground">
                By purchasing, you agree to our purchase terms, refund policy, and escrow protection terms.
              </p>
            </div>
          </div>

          {/* Escrow Protection Notice */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <strong>Escrow Protection:</strong> Your payment is held securely until you confirm receipt of the animal and all documents.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !agreedToTerms}
            className="bg-gradient-brand hover:opacity-90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Confirm Purchase - {listing.currency} ${(totalAmount / 100).toLocaleString()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
