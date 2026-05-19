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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Mail, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface UnnotifiedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organization: string | null;
  createdAt: string;
}

interface BulkSendWelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function BulkSendWelcomeDialog({ open, onOpenChange, onComplete }: BulkSendWelcomeDialogProps) {
  const { toast } = useToast();
  const [users, setUsers] = useState<UnnotifiedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  // Load unnotified users when dialog opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSelected(new Set());
    setSearch("");
    fetch("/api/admin/users/unnotified")
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
      .catch(() => toast({ variant: "destructive", title: "Error", description: "Failed to load users" }))
      .finally(() => setLoading(false));
  }, [open, toast]);

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.organization?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((u) => selected.has(u.id));
  const someFilteredSelected = filtered.some((u) => selected.has(u.id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filtered.forEach((u) => next.delete(u.id));
      } else {
        filtered.forEach((u) => next.add(u.id));
      }
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = async () => {
    if (selected.size === 0) return;

    setSending(true);
    try {
      const res = await fetch("/api/admin/users/bulk-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: Array.from(selected) }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send emails");
      }

      const { sent, failed } = data;
      if (failed === 0) {
        toast({
          title: "Welcome emails sent",
          description: `Successfully sent to ${sent} ${sent === 1 ? "user" : "users"}.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Partial success",
          description: `Sent to ${sent}, failed for ${failed}. Check the user detail page for failures.`,
        });
      }

      onComplete?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send emails",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Send Welcome Emails
          </DialogTitle>
          <DialogDescription>
            These users were created by an admin but haven't received their login credentials yet.
            Select who to email — a fresh temporary password will be generated for each.
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
            disabled={loading || sending}
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6 min-h-[200px]">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">All caught up!</p>
              <p className="text-sm text-muted-foreground">
                Every admin-created user has already received their welcome email.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No users match "{search}".
            </div>
          ) : (
            <>
              {/* Select-all header */}
              <div className="flex items-center gap-3 px-3 py-2 border-b mb-2 sticky top-0 bg-background z-10">
                <Checkbox
                  id="select-all"
                  checked={allFilteredSelected}
                  onCheckedChange={toggleAll}
                  // Show indeterminate state when some but not all are selected
                  ref={(el: any) => {
                    if (el) el.indeterminate = someFilteredSelected && !allFilteredSelected;
                  }}
                  disabled={sending}
                />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer flex-1">
                  {allFilteredSelected ? "Deselect all" : "Select all"}
                  <span className="text-muted-foreground ml-2">
                    ({filtered.length} {filtered.length === 1 ? "user" : "users"})
                  </span>
                </label>
                {selected.size > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {selected.size} selected
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                {filtered.map((user) => (
                  <label
                    key={user.id}
                    htmlFor={`user-${user.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selected.has(user.id)}
                      onCheckedChange={() => toggleOne(user.id)}
                      disabled={sending}
                    />
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs">
                        {user.name?.slice(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground truncate">{user.name}</p>
                        <Badge variant="outline" className="text-[10px] capitalize">{user.role}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                        {user.organization && <span> · {user.organization}</span>}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                      Created {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Warning when sending lots */}
        {selected.size > 20 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              You're about to send {selected.size} welcome emails. Each gets a fresh temporary password.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={selected.size === 0 || sending || loading}
            className="bg-gradient-brand"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send to {selected.size} {selected.size === 1 ? "user" : "users"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
