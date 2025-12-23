"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  CheckCircle,
  XCircle,
  UserPlus,
  ArrowLeft,
  Edit,
  Calendar,
  Shield,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EditClinicDialog } from "@/components/admin/clinics/EditClinicDialog";
import { InviteVetDialog } from "@/components/admin/clinics/InviteVetDialog";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";

export default function ClinicDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Fetch clinic details
  const { data, isLoading } = useQuery({
    queryKey: ["admin-clinic", id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/clinics/${id}`);
      if (!response.ok) throw new Error("Failed to fetch clinic");
      return response.json();
    },
  });

  // Verify mutation
  const verifyMutation = useMutation({
    mutationFn: async (isVerified: boolean) => {
      const response = await fetch(`/api/admin/clinics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified }),
      });
      if (!response.ok) throw new Error("Failed to update clinic");
      return response.json();
    },
    onSuccess: (data, isVerified) => {
      queryClient.invalidateQueries({ queryKey: ["admin-clinic", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-clinics"] });
      toast({
        title: isVerified ? "Clinic Verified" : "Verification Removed",
        description: isVerified
          ? "Clinic is now visible to breeders"
          : "Clinic is no longer visible to breeders",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const clinic = data?.clinic;
  const staff = data?.staff || [];

  if (!clinic) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Clinic not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/clinics">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clinics
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{clinic.clinicName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant={clinic.isVerified ? "default" : "secondary"}
                className={
                  clinic.isVerified
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }
              >
                {clinic.isVerified ? "Verified" : "Pending Verification"}
              </Badge>
              {clinic.isActive && (
                <Badge variant="outline">Active</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Vet
          </Button>
          {clinic.isVerified ? (
            <Button
              variant="outline"
              onClick={() => verifyMutation.mutate(false)}
              disabled={verifyMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Remove Verification
            </Button>
          ) : (
            <Button
              onClick={() => verifyMutation.mutate(true)}
              disabled={verifyMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Verify Clinic
            </Button>
          )}
        </div>
      </div>

      {/* Verification Alert */}
      {!clinic.isVerified && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This clinic is not yet verified. It will not be visible to breeders until verified.
          </AlertDescription>
        </Alert>
      )}

      {/* Clinic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{clinic.email}</p>
              </div>
            </div>
            {clinic.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{clinic.phone}</p>
                </div>
              </div>
            )}
            {clinic.website && (
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a
                    href={clinic.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {clinic.website}
                  </a>
                </div>
              </div>
            )}
            {(clinic.address || clinic.city || clinic.state) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">
                    {clinic.address && <>{clinic.address}<br /></>}
                    {clinic.city && clinic.state
                      ? `${clinic.city}, ${clinic.state}`
                      : clinic.city || clinic.state}
                    {clinic.postalCode && ` ${clinic.postalCode}`}
                    {clinic.country && <><br />{clinic.country}</>}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clinic Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {clinic.licenseNumber && (
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="font-medium">{clinic.licenseNumber}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Staff Members</p>
                <p className="font-medium">{staff.length} veterinarians</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {format(new Date(clinic.createdAt), "MMMM dd, yyyy")}
                </p>
              </div>
            </div>
            {clinic.emergencyAvailable && (
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Emergency Services</p>
                  <p className="font-medium text-green-600">24/7 Available</p>
                  {clinic.emergencyPhone && (
                    <p className="text-sm mt-1">{clinic.emergencyPhone}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {clinic.description && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{clinic.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Staff Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Staff Members</CardTitle>
            <Button onClick={() => setShowInviteDialog(true)} size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No staff members yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Invite veterinarians to join this clinic
              </p>
              <Button onClick={() => setShowInviteDialog(true)} size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Veterinarian
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member: any) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.user?.name || "—"}
                      </TableCell>
                      <TableCell>{member.user?.email || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={member.role === "main_admin" ? "default" : "secondary"}>
                          {member.role === "main_admin" && "Main Admin"}
                          {member.role === "vet" && "Veterinarian"}
                          {member.role === "assistant" && "Assistant"}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.specialization || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={member.status === "active" ? "default" : "secondary"}
                          className={
                            member.status === "active"
                              ? "bg-green-500"
                              : ""
                          }
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(member.joinedAt), "MMM dd, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EditClinicDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        clinic={clinic}
      />
      <InviteVetDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        clinic={clinic}
      />
    </div>
  );
}
