"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Users, PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreederOption {
  id: string;
  name: string;
  email: string;
  organization: string | null;
  isVerified: boolean;
}

interface SelectBreederDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Fired with the selected breeder. Caller is responsible for
   * what to do next (e.g. open the Add Animal dialog with this user).
   */
  onSelect: (breeder: BreederOption) => void;
}

export function SelectBreederDialog({ open, onOpenChange, onSelect }: SelectBreederDialogProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [users, setUsers] = useState<BreederOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Reset state when dialog re-opens
  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedId(null);
    }
  }, [open]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch breeders whenever the search term (debounced) changes or dialog opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const params = new URLSearchParams({ role: "breeder", limit: "50" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    fetch(`/api/admin/users?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(
          (data.users || []).map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            organization: u.organization,
            isVerified: !!u.isVerified,
          }))
        );
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [open, debouncedSearch]);

  const selectedBreeder = useMemo(() => users.find((u) => u.id === selectedId), [users, selectedId]);

  const handleContinue = () => {
    if (!selectedBreeder) return;
    onSelect(selectedBreeder);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-primary" />
            Add Animal — Select Breeder
          </DialogTitle>
          <DialogDescription>
            Pick the breeder this animal belongs to. The animal will be added under their account.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6 min-h-[200px]">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {debouncedSearch ? `No breeders match "${debouncedSearch}"` : "No breeders found"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {users.map((user) => {
                const isSelected = selectedId === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedId(user.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                      isSelected
                        ? "bg-primary/10 border border-primary/40"
                        : "hover:bg-muted/50 border border-transparent"
                    )}
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-gradient-brand text-white text-xs">
                        {user.name?.slice(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground truncate">{user.name}</p>
                        {user.isVerified && (
                          <Badge variant="default" className="text-[10px] shrink-0">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                        {user.organization && <span> · {user.organization}</span>}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleContinue} disabled={!selectedBreeder} className="bg-gradient-brand">
            Continue
            {selectedBreeder && (
              <span className="ml-2 text-xs opacity-90">→ {selectedBreeder.name}</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
