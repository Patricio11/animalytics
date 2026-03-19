"use client";

import { useState } from "react";
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
  Rocket,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Star,
  Zap,
  Globe,
  TrendingUp,
} from "lucide-react";

const DURATION_OPTIONS = [
  { days: 3, label: "3 Days" },
  { days: 7, label: "7 Days", popular: true },
  { days: 14, label: "14 Days" },
  { days: 30, label: "30 Days" },
];

const BENEFITS = [
  { icon: Globe, label: "Featured on the landing page" },
  { icon: Star, label: "Highlighted in breeders directory" },
  { icon: TrendingUp, label: "Increased profile visibility" },
  { icon: Zap, label: '"Boosted" badge on your profile' },
];

interface BoostProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BoostProfileDialog({
  open,
  onOpenChange,
  onSuccess,
}: BoostProfileDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [durationDays, setDurationDays] = useState<number>(7);

  // Fetch current boost status and pricing
  const { data: boostData, isLoading } = useQuery({
    queryKey: ["profile-boost-status"],
    queryFn: async () => {
      const response = await fetch("/api/breeder/boost");
      if (!response.ok) throw new Error("Failed to fetch boost status");
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

  const boostMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/breeder/boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationDays }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to boost profile");
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Profile Boosted!",
        description: `Your profile will be featured on the landing page for ${durationDays} days.`,
      });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["profile-boost-status"] });
      queryClient.invalidateQueries({ queryKey: ["breeder-profile"] });
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

  const pricing = boostData?.pricing;
  const activeBoost = boostData?.boost;
  const pricingCurrency = pricing?.currency || "USD";
  const pricePerDay = pricing?.pricePerDay || 0;
  const totalAmount = pricePerDay * durationDays;

  const walletBalance = walletData?.wallet?.balances?.[pricingCurrency] || 0;
  const hasEnoughBalance = walletBalance >= totalAmount;

  const isPageLoading = isLoading || walletLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            Boost Your Profile
          </DialogTitle>
          <DialogDescription>
            Get your profile featured on the Animalytics landing page and reach thousands of potential buyers.
          </DialogDescription>
        </DialogHeader>

        {isPageLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : activeBoost ? (
          /* Already boosted */
          <div className="py-4 space-y-4">
            <div className="rounded-2xl border border-chart-3/30 bg-chart-3/5 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-chart-3/15 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <p className="font-semibold text-chart-3">Profile is currently boosted</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Active until{" "}
                  <span className="font-medium text-foreground">
                    {new Date(activeBoost.endDate).toLocaleDateString("en-ZA", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              You can boost again once your current boost expires.
            </p>
          </div>
        ) : !pricing ? (
          <Alert className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Profile boost pricing has not been configured yet. Please contact the administrator.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-5 py-2">
            {/* Benefits */}
            <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/3 to-primary-pink/3 p-4 space-y-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">What you get</p>
              {BENEFITS.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{benefit.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Duration Selector */}
            <div className="space-y-3">
              <p className="text-sm font-semibold">Select Duration</p>
              <div className="grid grid-cols-4 gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => setDurationDays(opt.days)}
                    className={cn(
                      "relative flex flex-col items-center justify-center p-3 rounded-xl border text-sm font-medium transition-all",
                      durationDays === opt.days
                        ? "border-primary bg-primary/8 text-primary shadow-sm"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    )}
                  >
                    {opt.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-gradient-brand text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">
                        Popular
                      </span>
                    )}
                    <span className="font-bold">{opt.days}</span>
                    <span className="text-xs text-muted-foreground">days</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="rounded-xl bg-surface-secondary border border-border/50 p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {(pricePerDay / 100).toFixed(2)} {pricingCurrency} × {durationDays} days
                </span>
                <span className="font-mono font-semibold">
                  {(totalAmount / 100).toFixed(2)} {pricingCurrency}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold text-primary">
                  {(totalAmount / 100).toFixed(2)} {pricingCurrency}
                </span>
              </div>
            </div>

            {/* Wallet Balance */}
            <div className={cn(
              "flex items-center justify-between p-3 rounded-xl border",
              hasEnoughBalance
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

            {!hasEnoughBalance && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Insufficient balance. You need {((totalAmount - walletBalance) / 100).toFixed(2)} {pricingCurrency} more. Please top up your wallet first.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {!activeBoost && pricing && (
            <Button
              onClick={() => boostMutation.mutate()}
              disabled={!hasEnoughBalance || boostMutation.isPending || isPageLoading}
              className="bg-gradient-brand hover:opacity-90 shadow-card border-none"
            >
              {boostMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Boosting...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Boost for {(totalAmount / 100).toFixed(2)} {pricingCurrency}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
