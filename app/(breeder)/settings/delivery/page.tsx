"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  Truck,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  Save,
  Loader2,
} from "lucide-react";

interface DeliverySettings {
  breederId?: string;
  offersPickup: boolean;
  offersLocalDelivery: boolean;
  offersShipping: boolean;
  pickupLocation: string;
  pickupInstructions: string;
  localDeliveryFee: number;
  localDeliveryNotes: string;
  localDeliveryEstimatedDays: number;
  shippingFee: number;
  shippingFeeInternational: number | null;
  shippingEstimatedDays: number;
  shippingNotes: string;
  deliveryPolicy: string;
  isActive: boolean;
}

export default function DeliverySettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<DeliverySettings>({
    offersPickup: true,
    offersLocalDelivery: false,
    offersShipping: false,
    pickupLocation: "",
    pickupInstructions: "",
    localDeliveryFee: 0,
    localDeliveryNotes: "",
    localDeliveryEstimatedDays: 1,
    shippingFee: 0,
    shippingFeeInternational: null,
    shippingEstimatedDays: 3,
    shippingNotes: "",
    deliveryPolicy: "",
    isActive: true,
  });

  // Fetch existing settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/breeder/delivery-settings');
        if (res.ok) {
          const data = await res.json();
          if (data.exists && data.settings) {
            // Convert fees from cents to dollars for display
            setSettings({
              ...data.settings,
              localDeliveryFee: (data.settings.localDeliveryFee || 0) / 100,
              shippingFee: (data.settings.shippingFee || 0) / 100,
              shippingFeeInternational: data.settings.shippingFeeInternational 
                ? data.settings.shippingFeeInternational / 100 
                : null,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast({
          title: "Error",
          description: "Failed to load delivery settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, [toast]);

  // Handle save
  async function handleSave() {
    // Validation
    if (!settings.offersPickup && !settings.offersLocalDelivery && !settings.offersShipping) {
      toast({
        title: "Validation Error",
        description: "At least one delivery method must be enabled",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Convert fees from dollars to cents for storage
      const payload = {
        ...settings,
        localDeliveryFee: Math.round(settings.localDeliveryFee * 100),
        shippingFee: Math.round(settings.shippingFee * 100),
        shippingFeeInternational: settings.shippingFeeInternational 
          ? Math.round(settings.shippingFeeInternational * 100) 
          : null,
      };

      const res = await fetch('/api/breeder/delivery-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Success",
          description: data.message || "Delivery settings saved successfully",
        });
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.error || "Failed to save settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Delivery & Shipping Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure how pet owners can receive animals from your listings
        </p>
      </div>

      <div className="space-y-6">
        {/* Delivery Options */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Delivery Options
            </CardTitle>
            <CardDescription>
              Choose which delivery methods you offer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="offersPickup">Offer Pickup</Label>
                <p className="text-sm text-muted-foreground">
                  Pet owners can pick up from your location (always free)
                </p>
              </div>
              <Switch
                id="offersPickup"
                checked={settings.offersPickup}
                onCheckedChange={(checked) => setSettings({ ...settings, offersPickup: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="offersLocalDelivery">Offer Local Delivery</Label>
                <p className="text-sm text-muted-foreground">
                  You deliver to pet owner's location
                </p>
              </div>
              <Switch
                id="offersLocalDelivery"
                checked={settings.offersLocalDelivery}
                onCheckedChange={(checked) => setSettings({ ...settings, offersLocalDelivery: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="offersShipping">Offer Shipping</Label>
                <p className="text-sm text-muted-foreground">
                  Ship to pet owner's address
                </p>
              </div>
              <Switch
                id="offersShipping"
                checked={settings.offersShipping}
                onCheckedChange={(checked) => setSettings({ ...settings, offersShipping: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pickup Settings */}
        {settings.offersPickup && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Pickup Settings
              </CardTitle>
              <CardDescription>
                Configure pickup location and instructions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pickupLocation">Pickup Location</Label>
                <Input
                  id="pickupLocation"
                  placeholder="e.g., 123 Main St, City, State, ZIP"
                  value={settings.pickupLocation}
                  onChange={(e) => setSettings({ ...settings, pickupLocation: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Address or description of where pet owners can pick up
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupInstructions">Pickup Instructions</Label>
                <Textarea
                  id="pickupInstructions"
                  placeholder="e.g., Available Mon-Fri 9AM-5PM. Please call ahead to schedule."
                  value={settings.pickupInstructions}
                  onChange={(e) => setSettings({ ...settings, pickupInstructions: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Local Delivery Settings */}
        {settings.offersLocalDelivery && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Local Delivery Settings
              </CardTitle>
              <CardDescription>
                Configure local delivery fees and details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="localDeliveryFee">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Delivery Fee
                  </Label>
                  <Input
                    id="localDeliveryFee"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={settings.localDeliveryFee}
                    onChange={(e) => setSettings({ ...settings, localDeliveryFee: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Flat rate fee in USD (0 for free delivery)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="localDeliveryEstimatedDays">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Estimated Days
                  </Label>
                  <Input
                    id="localDeliveryEstimatedDays"
                    type="number"
                    min="0"
                    placeholder="1"
                    value={settings.localDeliveryEstimatedDays}
                    onChange={(e) => setSettings({ ...settings, localDeliveryEstimatedDays: parseInt(e.target.value) || 1 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Typical delivery time in days
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="localDeliveryNotes">Delivery Notes</Label>
                <Textarea
                  id="localDeliveryNotes"
                  placeholder="e.g., Delivery available within 50km radius. We'll contact you to schedule."
                  value={settings.localDeliveryNotes}
                  onChange={(e) => setSettings({ ...settings, localDeliveryNotes: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shipping Settings */}
        {settings.offersShipping && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Shipping Settings
              </CardTitle>
              <CardDescription>
                Configure shipping fees and details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingFee">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Domestic Shipping Fee
                  </Label>
                  <Input
                    id="shippingFee"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={settings.shippingFee}
                    onChange={(e) => setSettings({ ...settings, shippingFee: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Flat rate for domestic shipping
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingFeeInternational">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    International Shipping Fee
                  </Label>
                  <Input
                    id="shippingFeeInternational"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00 (optional)"
                    value={settings.shippingFeeInternational || ""}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      shippingFeeInternational: e.target.value ? parseFloat(e.target.value) : null 
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use domestic rate
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingEstimatedDays">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Estimated Shipping Days
                </Label>
                <Input
                  id="shippingEstimatedDays"
                  type="number"
                  min="0"
                  placeholder="3"
                  value={settings.shippingEstimatedDays}
                  onChange={(e) => setSettings({ ...settings, shippingEstimatedDays: parseInt(e.target.value) || 3 })}
                />
                <p className="text-xs text-muted-foreground">
                  Typical shipping time in business days
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingNotes">Shipping Notes</Label>
                <Textarea
                  id="shippingNotes"
                  placeholder="e.g., We use FedEx Express with tracking. Insurance included."
                  value={settings.shippingNotes}
                  onChange={(e) => setSettings({ ...settings, shippingNotes: e.target.value })}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Information about carriers, tracking, insurance, etc.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delivery Policy */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Delivery Policy (Optional)
            </CardTitle>
            <CardDescription>
              Your delivery terms and conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="deliveryPolicy"
              placeholder="e.g., All animals must be picked up/delivered within 7 days of purchase. Health certificate provided. Pet owner responsible for any additional shipping requirements."
              value={settings.deliveryPolicy}
              onChange={(e) => setSettings({ ...settings, deliveryPolicy: e.target.value })}
              rows={5}
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-brand"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
