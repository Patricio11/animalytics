"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShieldCheck, KeyRound, Send, Crown, AlertCircle, CheckCircle, XCircle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AccountSecurityTabProps {
  userId: string;
  user: any;
}

const SUBSCRIPTION_PLANS = ["free", "premium", "professional", "enterprise"] as const;

export function AccountSecurityTab({ userId, user }: AccountSecurityTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sub = user.subscription || { plan: "free", features: [] };

  const [isVerified, setIsVerified] = useState<boolean>(user.isVerified ?? false);
  const [emailVerified, setEmailVerified] = useState<boolean>(user.emailVerified ?? false);
  const [plan, setPlan] = useState<string>(sub.plan || "free");

  useEffect(() => {
    setIsVerified(user.isVerified ?? false);
    setEmailVerified(user.emailVerified ?? false);
    setPlan(user.subscription?.plan || "free");
  }, [user]);

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isVerified,
          emailVerified,
          subscription: { ...sub, plan },
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      toast({ title: "Saved", description: "Account settings updated." });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  const notify = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/users/${userId}/notify`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send credentials");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      toast({ title: "Email sent", description: "A new welcome email with fresh credentials has been sent." });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  return (
    <div className="space-y-4">
      {/* Verification & Email */}
      <Card className="shadow-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Verification</h2>
          </div>

          <Toggle
            id="acc-verified"
            label="Verified breeder"
            description="Show the verified badge on the user's public profile and listings."
            value={isVerified}
            onChange={setIsVerified}
          />
          <Toggle
            id="acc-email-verified"
            label="Email verified"
            description="Mark the email address as verified. Use carefully — Better Auth normally manages this."
            value={emailVerified}
            onChange={setEmailVerified}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <StatusBadge
              icon={emailVerified ? CheckCircle : XCircle}
              label="Email"
              value={emailVerified ? "Verified" : "Not verified"}
              color={emailVerified ? "text-green-600" : "text-amber-600"}
            />
            <StatusBadge
              icon={isVerified ? CheckCircle : XCircle}
              label="Breeder badge"
              value={isVerified ? "Verified" : "Not verified"}
              color={isVerified ? "text-green-600" : "text-muted-foreground"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="shadow-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Subscription</h2>
          </div>
          <div>
            <Label>Plan</Label>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SUBSCRIPTION_PLANS.map((p) => (
                  <SelectItem key={p} value={p} className="capitalize">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {sub.expiresAt && (
                <>Current expiration: {format(new Date(sub.expiresAt), "MMM d, yyyy")}</>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Credentials */}
      {user.createdByAdmin && (
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Credentials</h2>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border">
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {user.credentialsNotifiedAt ? "Welcome email sent" : "Welcome email not sent yet"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user.credentialsNotifiedAt
                    ? `Last sent ${format(new Date(user.credentialsNotifiedAt), "MMM d, yyyy 'at' p")}`
                    : "User hasn't received their temporary password yet."}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Each send generates a fresh temporary password — safe to use as a "force password reset".
                </p>
              </div>
              <Button onClick={() => notify.mutate()} disabled={notify.isPending} className="bg-gradient-brand shrink-0">
                <Send className="w-4 h-4 mr-2" />
                {notify.isPending
                  ? "Sending..."
                  : user.credentialsNotifiedAt
                  ? "Resend Credentials"
                  : "Send Credentials"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card className="shadow-card">
        <CardContent className="p-6 space-y-2">
          <h3 className="text-base font-semibold">Account Metadata</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <MetaRow label="User ID" value={<code className="text-xs">{user.id}</code>} />
            <MetaRow label="Created" value={format(new Date(user.createdAt), "MMM d, yyyy")} />
            <MetaRow label="Last login" value={user.lastLogin ? format(new Date(user.lastLogin), "MMM d, yyyy 'at' p") : "Never"} />
            <MetaRow label="Created by admin" value={user.createdByAdmin ? "Yes" : "No"} />
            <MetaRow label="Role" value={<Badge variant="outline" className="capitalize">{user.role}</Badge>} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => save.mutate()} disabled={save.isPending} className="bg-gradient-brand">
          <Save className="w-4 h-4 mr-2" />
          {save.isPending ? "Saving..." : "Save Account Settings"}
        </Button>
      </div>
    </div>
  );
}

function Toggle({
  id,
  label,
  description,
  value,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
      <Switch id={id} checked={value} onCheckedChange={onChange} />
      <div className="flex-1">
        <Label htmlFor={id} className="cursor-pointer font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function StatusBadge({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg border bg-surface">
      <Icon className={`w-5 h-5 ${color}`} />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
