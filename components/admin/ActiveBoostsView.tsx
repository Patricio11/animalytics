"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  ExternalLink,
  Calendar,
  User,
  Loader2,
  LinkIcon,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

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

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  expired: { label: "Expired", variant: "outline" },
  pending: { label: "Pending", variant: "outline" },
};

interface Boost {
  id: string;
  listingId: string;
  userId: string;
  platforms: string[];
  startDate: string;
  endDate: string;
  durationDays: number;
  totalAmount: number;
  currency: string;
  status: string;
  socialMediaPostUrls: Record<string, string>;
  createdAt: string;
  listingTitle: string;
  listingSlug: string | null;
  userName: string;
  userEmail: string;
}

export function ActiveBoostsView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBoost, setSelectedBoost] = useState<Boost | null>(null);
  const [postUrls, setPostUrls] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin-boosts", statusFilter],
    queryFn: async () => {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const response = await fetch(`/api/admin/marketplace/boosts${params}`);
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, socialMediaPostUrls, status }: { id: string; socialMediaPostUrls?: Record<string, string>; status?: string }) => {
      const response = await fetch("/api/admin/marketplace/boosts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, socialMediaPostUrls, status }),
      });
      if (!response.ok) throw new Error("Failed to update");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Updated", description: "Boost updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin-boosts"] });
      setEditDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update boost", variant: "destructive" });
    },
  });

  const handleEditUrls = (boost: Boost) => {
    setSelectedBoost(boost);
    setPostUrls(boost.socialMediaPostUrls || {});
    setEditDialogOpen(true);
  };

  const handleSaveUrls = () => {
    if (!selectedBoost) return;
    updateMutation.mutate({ id: selectedBoost.id, socialMediaPostUrls: postUrls });
  };

  const handleStatusChange = (boostId: string, newStatus: string) => {
    updateMutation.mutate({ id: boostId, status: newStatus });
  };

  const boosts: Boost[] = data?.boosts || [];

  const totalRevenue = boosts.reduce((sum, b) => sum + b.totalAmount, 0);
  const activeCount = boosts.filter((b) => b.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Active Boosts</h3>
          <p className="text-sm text-muted-foreground">
            View and manage all listing boosts
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Active Boosts</div>
            <div className="text-xl font-bold text-primary">{activeCount}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            <div className="text-xl font-bold text-chart-3">
              {(totalRevenue / 100).toFixed(2)} {boosts[0]?.currency || "USD"}
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : boosts.length === 0 ? (
        <Card className="shadow-card border-0">
          <CardContent className="p-8 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
            <h4 className="font-semibold mb-2">No Boosts Found</h4>
            <p className="text-sm text-muted-foreground">
              {statusFilter !== "all"
                ? "No boosts match the selected filter"
                : "No listings have been boosted yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {boosts.map((boost) => (
            <Card key={boost.id} className="shadow-card border-0">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/marketplace/${boost.listingSlug || boost.listingId}`}
                        className="font-semibold text-primary hover:underline"
                        target="_blank"
                      >
                        {boost.listingTitle}
                      </Link>
                      <Badge variant={STATUS_CONFIG[boost.status]?.variant || "outline"}>
                        {STATUS_CONFIG[boost.status]?.label || boost.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {boost.userName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(boost.startDate), "MMM dd")} — {format(new Date(boost.endDate), "MMM dd, yyyy")}
                      </span>
                      <span>{boost.durationDays} days</span>
                    </div>
                    {/* Platform badges */}
                    <div className="flex gap-1.5 flex-wrap">
                      {boost.platforms.map((platform) => (
                        <Badge key={platform} variant="secondary" className="text-xs gap-1">
                          {PLATFORM_ICONS[platform] || "📢"} {platform}
                          {boost.socialMediaPostUrls?.[platform] && (
                            <a
                              href={boost.socialMediaPostUrls[platform]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Right: Amount + Actions */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {(boost.totalAmount / 100).toFixed(2)} {boost.currency}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditUrls(boost)}
                        title="Add social media post URLs"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        title="View listing"
                      >
                        <Link href={`/marketplace/${boost.listingSlug || boost.listingId}`} target="_blank">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Post URLs Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Social Media Post URLs</DialogTitle>
          </DialogHeader>
          {selectedBoost && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Add the URLs of social media posts for <span className="font-medium text-foreground">{selectedBoost.listingTitle}</span>
              </p>
              {selectedBoost.platforms.map((platform) => (
                <div key={platform} className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <span>{PLATFORM_ICONS[platform] || "📢"}</span>
                    {platform}
                  </Label>
                  <Input
                    value={postUrls[platform] || ""}
                    onChange={(e) =>
                      setPostUrls((prev) => ({ ...prev, [platform]: e.target.value }))
                    }
                    placeholder={`https://${platform}.com/...`}
                  />
                </div>
              ))}

              <div className="space-y-1">
                <Label>Status</Label>
                <Select
                  value={selectedBoost.status}
                  onValueChange={(v) => handleStatusChange(selectedBoost.id, v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveUrls}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save URLs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
