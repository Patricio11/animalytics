"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Flag, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  navigation: "Navigation & Menus",
  features: "Features",
  monetization: "Monetization",
  access: "Access & Signup",
  general: "General",
};

const CATEGORY_ORDER = ["navigation", "features", "monetization", "access", "general"];

export default function AdminFeatureFlagsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());

  const [newFlag, setNewFlag] = useState({
    key: "",
    name: "",
    description: "",
    category: "general",
    enabled: true,
  });

  const fetchFlags = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/feature-flags");
      if (!res.ok) throw new Error("Failed to fetch flags");
      const data = await res.json();
      setFlags(data.flags);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to load feature flags" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const toggleFlag = async (flag: FeatureFlag, enabled: boolean) => {
    setPendingKeys((prev) => new Set(prev).add(flag.key));
    // Optimistic update
    setFlags((prev) => prev.map((f) => (f.key === flag.key ? { ...f, enabled } : f)));
    try {
      const res = await fetch(`/api/admin/feature-flags/${flag.key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("Failed to update");
      // Invalidate the public feature flags query so the UI reflects the change
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
      toast({
        title: enabled ? "Enabled" : "Disabled",
        description: `${flag.name} has been ${enabled ? "enabled" : "disabled"}.`,
      });
    } catch {
      // Roll back on error
      setFlags((prev) => prev.map((f) => (f.key === flag.key ? { ...f, enabled: !enabled } : f)));
      toast({ variant: "destructive", title: "Error", description: "Failed to update flag" });
    } finally {
      setPendingKeys((prev) => {
        const next = new Set(prev);
        next.delete(flag.key);
        return next;
      });
    }
  };

  const createFlag = async () => {
    if (!newFlag.key || !newFlag.name) {
      toast({ variant: "destructive", title: "Error", description: "Key and name are required" });
      return;
    }
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFlag),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create");
      }
      toast({ title: "Created", description: `Feature flag "${newFlag.name}" added.` });
      setShowCreate(false);
      setNewFlag({ key: "", name: "", description: "", category: "general", enabled: true });
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
      fetchFlags();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  // Group flags by category
  const grouped = useMemo(() => {
    const filtered = search
      ? flags.filter(
          (f) =>
            f.name.toLowerCase().includes(search.toLowerCase()) ||
            f.key.toLowerCase().includes(search.toLowerCase()) ||
            (f.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
        )
      : flags;

    const groups: Record<string, FeatureFlag[]> = {};
    for (const f of filtered) {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f);
    }
    return groups;
  }, [flags, search]);

  const enabledCount = flags.filter((f) => f.enabled).length;
  const disabledCount = flags.length - enabledCount;

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Flag className="w-7 h-7 text-primary" />
              Feature Flags
            </h1>
            <p className="text-muted-foreground mt-1">
              Enable or disable features and menus across the platform
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="bg-gradient-brand hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Add Flag
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Flag className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total Flags</p>
                <p className="text-2xl font-bold">{flags.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Enabled</p>
                <p className="text-2xl font-bold text-green-600">{enabledCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-xs text-muted-foreground">Disabled</p>
                <p className="text-2xl font-bold text-amber-600">{disabledCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, key or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Flag list, grouped by category */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No feature flags found</p>
              <p className="text-sm text-muted-foreground">
                {search ? "Try a different search" : "Create your first flag to get started"}
              </p>
            </CardContent>
          </Card>
        ) : (
          CATEGORY_ORDER.filter((cat) => grouped[cat]?.length > 0).map((cat) => (
            <Card key={cat}>
              <CardHeader>
                <CardTitle className="text-base">{CATEGORY_LABELS[cat] || cat}</CardTitle>
                <CardDescription>{grouped[cat].length} flag(s)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {grouped[cat].map((flag) => (
                  <div
                    key={flag.key}
                    className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-surface hover:bg-surface-secondary transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground">{flag.name}</p>
                        <Badge variant="outline" className="text-xs font-mono">
                          {flag.key}
                        </Badge>
                        {!flag.enabled && (
                          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                            Disabled
                          </Badge>
                        )}
                      </div>
                      {flag.description && (
                        <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>
                      )}
                    </div>
                    <Switch
                      checked={flag.enabled}
                      disabled={pendingKeys.has(flag.key)}
                      onCheckedChange={(checked) => toggleFlag(flag, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}

        {/* Create Dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Feature Flag</DialogTitle>
              <DialogDescription>
                Create a new feature flag to control a feature across the platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="flag-key">Key *</Label>
                <Input
                  id="flag-key"
                  value={newFlag.key}
                  onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value.replace(/[^a-z0-9_]/gi, '_').toLowerCase() })}
                  placeholder="e.g., new_payments_flow"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lowercase, snake_case identifier used in code
                </p>
              </div>
              <div>
                <Label htmlFor="flag-name">Name *</Label>
                <Input
                  id="flag-name"
                  value={newFlag.name}
                  onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
                  placeholder="e.g., New Payments Flow"
                />
              </div>
              <div>
                <Label htmlFor="flag-description">Description</Label>
                <Textarea
                  id="flag-description"
                  value={newFlag.description}
                  onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                  placeholder="What does this flag control?"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="flag-category">Category</Label>
                <select
                  id="flag-category"
                  value={newFlag.category}
                  onChange={(e) => setNewFlag({ ...newFlag, category: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {CATEGORY_ORDER.map((cat) => (
                    <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="flag-enabled"
                  checked={newFlag.enabled}
                  onCheckedChange={(checked) => setNewFlag({ ...newFlag, enabled: checked })}
                />
                <Label htmlFor="flag-enabled">Enabled by default</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={createFlag}>Create Flag</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
