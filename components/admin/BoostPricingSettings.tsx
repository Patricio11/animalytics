"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, DollarSign, Loader2 } from "lucide-react";

const PLATFORM_OPTIONS = [
  { value: "system", label: "Animalytics System", icon: "⚡", group: "system" },
  { value: "profile_boost", label: "Profile Boost (Landing Page)", icon: "🚀", group: "system" },
  { value: "facebook", label: "Facebook", icon: "📘", group: "social" },
  { value: "instagram", label: "Instagram", icon: "📷", group: "social" },
  { value: "tiktok", label: "TikTok", icon: "🎵", group: "social" },
  { value: "twitter", label: "X (Twitter)", icon: "𝕏", group: "social" },
  { value: "youtube", label: "YouTube", icon: "▶️", group: "social" },
  { value: "all_social", label: "All Social Media (Bundle)", icon: "🌐", group: "social" },
];

interface PricingForm {
  id?: string;
  platform: string;
  displayName: string;
  pricePerDay: string;
  currency: string;
  isActive: boolean;
  description: string;
  sortOrder: number;
}

const defaultForm: PricingForm = {
  platform: "",
  displayName: "",
  pricePerDay: "",
  currency: "USD",
  isActive: true,
  description: "",
  sortOrder: 0,
};

export function BoostPricingSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<PricingForm>(defaultForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-boost-pricing"],
    queryFn: async () => {
      const response = await fetch("/api/admin/marketplace/boost-pricing");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: PricingForm) => {
      const response = await fetch("/api/admin/marketplace/boost-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          pricePerDay: Math.round(parseFloat(formData.pricePerDay) * 100), // Convert to cents
        }),
      });
      if (!response.ok) throw new Error("Failed to save");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Boost pricing updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin-boost-pricing"] });
      setDialogOpen(false);
      setForm(defaultForm);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save pricing", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/marketplace/boost-pricing?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Pricing entry removed" });
      queryClient.invalidateQueries({ queryKey: ["admin-boost-pricing"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete pricing", variant: "destructive" });
    },
  });

  const handleEdit = (pricing: any) => {
    setForm({
      id: pricing.id,
      platform: pricing.platform,
      displayName: pricing.displayName,
      pricePerDay: (pricing.pricePerDay / 100).toFixed(2),
      currency: pricing.currency,
      isActive: pricing.isActive,
      description: pricing.description || "",
      sortOrder: pricing.sortOrder || 0,
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const handlePlatformSelect = (platform: string) => {
    const option = PLATFORM_OPTIONS.find((p) => p.value === platform);
    setForm((prev) => ({
      ...prev,
      platform,
      displayName: prev.displayName || option?.label || platform,
    }));
  };

  const pricing = data?.pricing || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Boost Pricing</h3>
          <p className="text-sm text-muted-foreground">
            Configure pricing per social media platform for listing boosts
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-gradient-brand hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Add Platform
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : pricing.length === 0 ? (
        <Card className="shadow-card border-0">
          <CardContent className="p-8 text-center">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
            <h4 className="font-semibold mb-2">No Pricing Configured</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Add social media platform pricing to enable listing boosts
            </p>
            <Button onClick={handleAdd} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add First Platform
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {pricing.map((p: any) => {
            const icon = PLATFORM_OPTIONS.find((o) => o.value === p.platform)?.icon || "📢";
            return (
              <Card key={p.id} className="shadow-card border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{p.displayName}</span>
                          <Badge variant={p.isActive ? "default" : "secondary"}>
                            {p.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {p.description && (
                          <p className="text-xs text-muted-foreground">{p.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {(p.pricePerDay / 100).toFixed(2)} {p.currency}
                        </div>
                        <div className="text-xs text-muted-foreground">per day</div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(p)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate(p.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Platform Pricing" : "Add Platform Pricing"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={form.platform} onValueChange={handlePlatformSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.icon} {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder="e.g. Facebook"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price Per Day</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.pricePerDay}
                  onChange={(e) => setForm((f) => ({ ...f, pricePerDay: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="ZAR">ZAR</SelectItem>
                    <SelectItem value="AUD">AUD</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Post on our Facebook page with 50K+ followers"
              />
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(form)}
              disabled={!form.platform || !form.displayName || !form.pricePerDay || saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {form.id ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
