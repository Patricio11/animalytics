"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Truck, Settings, X, CheckCircle } from "lucide-react";

interface DeliverySettingsPromptProps {
  onDismiss?: () => void;
  compact?: boolean;
}

export function DeliverySettingsPrompt({ onDismiss, compact = false }: DeliverySettingsPromptProps) {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSettings() {
      try {
        const res = await fetch('/api/breeder/delivery-settings');
        if (res.ok) {
          const data = await res.json();
          setIsConfigured(data.exists);
        }
      } catch (error) {
        console.error('Error checking delivery settings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkSettings();
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  // Don't show if loading, dismissed, or already configured
  if (isLoading || isDismissed || isConfigured) {
    return null;
  }

  if (compact) {
    return (
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <Truck className="h-4 w-4 text-amber-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-sm">
            Set up delivery options for your listings
          </span>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="h-7">
              <Link href="/settings/delivery">
                <Settings className="h-3 w-3 mr-1" />
                Configure
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={handleDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
      <Truck className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-amber-900 dark:text-amber-100">
        Delivery Settings Not Configured
      </AlertTitle>
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        <p className="mb-3">
          Set up how buyers can receive animals from your listings. Configure pickup, local delivery, and shipping options with your pricing.
        </p>
        <div className="flex items-center gap-3">
          <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700">
            <Link href="/settings/delivery">
              <Settings className="h-4 w-4 mr-2" />
              Configure Delivery Settings
            </Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-amber-700 hover:text-amber-900"
          >
            Remind me later
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Shows delivery settings status - configured or not
 * Used to display current settings in listing forms
 */
export function DeliverySettingsStatus() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/breeder/delivery-settings');
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            setSettings(data.settings);
          }
        }
      } catch (error) {
        console.error('Error fetching delivery settings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []);

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading delivery settings...
      </div>
    );
  }

  if (!settings) {
    return (
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <Truck className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-sm">
          <span className="text-amber-900 dark:text-amber-100 font-medium">
            No delivery settings configured.
          </span>{" "}
          <Link href="/settings/delivery" className="text-amber-700 hover:text-amber-900 underline">
            Set up now
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  const deliveryMethods = [];
  if (settings.offersPickup) deliveryMethods.push('Pickup');
  if (settings.offersLocalDelivery) deliveryMethods.push(`Local Delivery ($${(settings.localDeliveryFee / 100).toFixed(2)})`);
  if (settings.offersShipping) deliveryMethods.push(`Shipping ($${(settings.shippingFee / 100).toFixed(2)})`);

  return (
    <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-green-900 dark:text-green-100 font-medium">
              Delivery options:
            </span>{" "}
            <span className="text-green-800 dark:text-green-200">
              {deliveryMethods.join(', ')}
            </span>
          </div>
          <Link href="/settings/delivery" className="text-green-700 hover:text-green-900 text-xs underline">
            Edit settings
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  );
}
