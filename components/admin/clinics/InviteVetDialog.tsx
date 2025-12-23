"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2, Mail, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InviteVetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinic: any;
}

export function InviteVetDialog({ open, onOpenChange, clinic }: InviteVetDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "vet",
    specialization: "",
    message: "",
  });
  const [invitationSent, setInvitationSent] = useState(false);

  const inviteMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(`/api/admin/clinics/${clinic.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send invitation");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clinics"] });
      setInvitationSent(true);
      toast({
        title: "Invitation Sent",
        description: `Invitation email sent to ${formData.email}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      role: "vet",
      specialization: "",
      message: "",
    });
    setInvitationSent(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetForm, 300); // Reset after dialog closes
  };

  if (invitationSent) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Invitation Sent!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert className="border-green-200 bg-green-50">
              <Mail className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                An invitation email has been sent to <strong>{formData.email}</strong>.
                They will receive a link to create their account and join {clinic.clinicName}.
              </AlertDescription>
            </Alert>

            <div className="text-sm text-muted-foreground space-y-2">
              <p>The invitation includes:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Secure registration link</li>
                <li>Clinic information</li>
                <li>Role assignment: {formData.role}</li>
                {formData.message && <li>Your personal message</li>}
              </ul>
              <p className="mt-4">
                The invitation will expire in <strong>7 days</strong>.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Done</Button>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setInvitationSent(false);
              }}
            >
              Send Another
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Invite Veterinarian to {clinic?.clinicName}
          </DialogTitle>
          <DialogDescription>
            Send an invitation email to a veterinarian to join this clinic. They will receive
            a secure link to create their account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Personal Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="veterinarian@example.com"
                required
              />
              <p className="text-xs text-muted-foreground">
                The invitation will be sent to this email address
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  placeholder="John"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="Smith"
                />
              </div>
            </div>
          </div>

          {/* Role & Specialization */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Role & Specialization</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.role} onValueChange={(value) => updateField("role", value)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main_admin">Main Clinic Admin</SelectItem>
                    <SelectItem value="vet">Veterinarian</SelectItem>
                    <SelectItem value="assistant">Veterinary Assistant</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.role === "main_admin" && "Full clinic management permissions"}
                  {formData.role === "vet" && "Standard veterinarian access"}
                  {formData.role === "assistant" && "Limited assistant access"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => updateField("specialization", e.target.value)}
                  placeholder="e.g., Surgery, Reproduction"
                />
              </div>
            </div>
          </div>

          {/* Personal Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => updateField("message", e.target.value)}
              placeholder="Add a personal message to the invitation email..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              This message will be included in the invitation email
            </p>
          </div>

          {/* Info Alert */}
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              The veterinarian will receive an email with a secure link to create their account.
              The invitation will expire in 7 days.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={inviteMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
