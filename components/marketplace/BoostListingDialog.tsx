"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Zap,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Rocket,
} from "lucide-react";

// Platform icon mapping using emoji for simplicity
const PLATFORM_ICONS: Record<string, string> = {
  system: "⚡",
  facebook: "📘",
  instagram: "📷",
  tiktok: "🎵",
  twitter: "𝕏",
  youtube: "▶️",
  all_social: "🌐",
  all_platforms: "🌐", // legacy
};

interface BoostListingDialogProps {
  listingId: string;
  listingTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BoostListingDialog({
  listingId,
  listingTitle,
  open,
  onOpenChange,
  onSuccess,
}: BoostListingDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [durationDays, setDurationDays] = useState<number>(7);

  // Fetch pricing
  const { data: pricingData, isLoading: pricingLoading } = useQuery({
    queryKey: ["boost-pricing"],
    queryFn: async () => {
      const response = await fetch("/api/marketplace/boost-pricing");
      if (!response.ok) throw new Error("Failed to fetch pricing");
      return response.json();
    },
    enabled: open,
  });

  // Fetch wallet balance
  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet-balance"],
    queryFn: async () => {
      const response = await fetch("/api/wallet");
      if (!response.ok) throw new Error("Failed to fetch wallet");
      return response.json();
    },
    enabled: open,
  });

  // Boost mutation
  const boostMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/marketplace/listings/${listingId}/boost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platforms: selectedPlatforms, durationDays }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to boost listing");
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Listing Boosted!",
        description: `Your listing will be promoted for ${durationDays} days across ${selectedPlatforms.length} platform(s).`,
      });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-listings"] });
      setSelectedPlatforms([]);
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Boost Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pricing = pricingData?.pricing || [];
  const hasAllSocial = selectedPlatforms.includes("all_social") || selectedPlatforms.includes("all_platforms");

  // Split pricing into system and social media
  const systemPricing = pricing.filter((p: any) => p.platform === "system");
  const socialPricing = pricing.filter((p: any) => p.platform !== "system");

  // Calculate total
  const totalAmount = useMemo(() => {
    if (selectedPlatforms.length === 0) return 0;

    return selectedPlatforms.reduce((sum: number, platform: string) => {
      // If all_social is selected, only count the bundle price for social (skip individual social)
      if (hasAllSocial && platform !== "system" && platform !== "all_social" && platform !== "all_platforms") {
        return sum;
      }
      const p = pricing.find((pr: any) => pr.platform === platform);
      return sum + (p ? p.pricePerDay * durationDays : 0);
    }, 0);
  }, [selectedPlatforms, durationDays, pricing, hasAllSocial]);

  // Get wallet balance for the pricing currency
  const pricingCurrency = pricing[0]?.currency || "USD";
  const walletBalance = walletData?.wallet?.balances?.[pricingCurrency] || 0;
  const hasEnoughBalance = walletBalance >= totalAmount;

  const togglePlatform = (platform: string) => {
    // System boost is independent — can be toggled alongside social platforms
    if (platform === "system") {
      setSelectedPlatforms((prev) =>
        prev.includes("system")
          ? prev.filter((p) => p !== "system")
          : [...prev, "system"]
      );
      return;
    }

    // All social bundle
    if (platform === "all_social" || platform === "all_platforms") {
      if (hasAllSocial) {
        // Remove all social selections, keep system if selected
        setSelectedPlatforms((prev) => prev.filter((p) => p === "system"));
      } else {
        // Select the bundle, keep system if selected
        const hasSystem = selectedPlatforms.includes("system");
        setSelectedPlatforms(hasSystem ? ["system", "all_social"] : ["all_social"]);
      }
      return;
    }

    // If all_social was selected, switch to individual social + keep system
    if (hasAllSocial) {
      const hasSystem = selectedPlatforms.includes("system");
      setSelectedPlatforms(hasSystem ? ["system", platform] : [platform]);
      return;
    }

    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const isLoading = pricingLoading || walletLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Boost Listing
          </DialogTitle>
          <DialogDescription>
            Promote <span className="font-medium text-foreground">{listingTitle}</span> with in-app priority and social media exposure
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : pricing.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Boost pricing has not been configured yet. Please contact the administrator.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6 py-2">
            {/* Animalytics System Boost */}
            {systemPricing.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Animalytics System</Label>
                <p className="text-xs text-muted-foreground -mt-1">
                  Priority placement at the top of the marketplace with featured styling and &quot;Boosted&quot; badge
                </p>
                <div className="space-y-2">
                  {systemPricing.map((p: any) => {
                    const isSelected = selectedPlatforms.includes(p.platform);
                    return (
                      <div
                        key={p.platform}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/30 hover:bg-muted/30"
                        )}
                        onClick={() => togglePlatform(p.platform)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox checked={isSelected} />
                          <span className="text-lg">{PLATFORM_ICONS[p.platform] || "⚡"}</span>
                          <div>
                            <div className="font-medium text-sm">{p.displayName}</div>
                            {p.description && (
                              <div className="text-xs text-muted-foreground">{p.description}</div>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className="font-mono">
                          {(p.pricePerDay / 100).toFixed(2)} {p.currency}/day
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Social Media Platforms */}
            {socialPricing.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Social Media Advertising</Label>
                <p className="text-xs text-muted-foreground -mt-1">
                  Your listing will be promoted as an ad on the selected social media platforms
                </p>
                <div className="space-y-2">
                  {socialPricing.map((p: any) => {
                    const isBundleOption = p.platform === "all_social" || p.platform === "all_platforms";
                    const isSelected = isBundleOption
                      ? hasAllSocial
                      : !hasAllSocial && selectedPlatforms.includes(p.platform);

                    return (
                      <div
                        key={p.platform}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/30 hover:bg-muted/30",
                          isBundleOption && "border-dashed"
                        )}
                        onClick={() => togglePlatform(p.platform)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox checked={isSelected} />
                          <span className="text-lg">{PLATFORM_ICONS[p.platform] || "📢"}</span>
                          <div>
                            <div className="font-medium text-sm">{p.displayName}</div>
                            {p.description && (
                              <div className="text-xs text-muted-foreground">{p.description}</div>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className="font-mono">
                          {(p.pricePerDay / 100).toFixed(2)} {p.currency}/day
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Duration</Label>
              <Select
                value={String(durationDays)}
                onValueChange={(v) => setDurationDays(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="7">7 Days (Popular)</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Summary */}
            {selectedPlatforms.length > 0 && (
              <div className="rounded-lg bg-surface-secondary p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {selectedPlatforms.includes("system") && "System Boost"}
                    {selectedPlatforms.includes("system") && selectedPlatforms.length > 1 && " + "}
                    {hasAllSocial ? "All Social Media" : selectedPlatforms.filter(p => p !== "system").length > 0 ? `${selectedPlatforms.filter(p => p !== "system").length} social platform(s)` : ""}
                    {" "}× {durationDays} days
                  </span>
                  <span className="font-mono font-semibold">
                    {(totalAmount / 100).toFixed(2)} {pricingCurrency}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary">
                    {(totalAmount / 100).toFixed(2)} {pricingCurrency}
                  </span>
                </div>
              </div>
            )}

            {/* Wallet Balance */}
            <div className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              hasEnoughBalance || totalAmount === 0
                ? "border-chart-3/30 bg-chart-3/5"
                : "border-destructive/30 bg-destructive/5"
            )}>
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Wallet Balance</span>
              </div>
              <span className="font-mono font-semibold text-sm">
                {(walletBalance / 100).toFixed(2)} {pricingCurrency}
              </span>
            </div>

            {totalAmount > 0 && !hasEnoughBalance && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Insufficient wallet balance. You need {((totalAmount - walletBalance) / 100).toFixed(2)} {pricingCurrency} more. Please top up your wallet first.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => boostMutation.mutate()}
            disabled={
              selectedPlatforms.length === 0 ||
              totalAmount === 0 ||
              !hasEnoughBalance ||
              boostMutation.isPending
            }
            className="bg-gradient-brand hover:opacity-90 shadow-card"
          >
            {boostMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Boost Now — {totalAmount > 0 ? `${(totalAmount / 100).toFixed(2)} ${pricingCurrency}` : "Select platforms"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
