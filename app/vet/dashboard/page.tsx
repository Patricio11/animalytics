"use client";

import { useState } from "react";
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
  Users,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Globe,
  Shield,
  Calendar,
  Edit,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InviteStaffDialog } from "@/components/vet/InviteStaffDialog";
import { format } from "date-fns";

export default function VetDashboardPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Fetch vet's clinic information
  const { data, isLoading } = useQuery({
    queryKey: ["vet-clinic"],
    queryFn: async () => {
      const response = await fetch("/api/vet/clinic");
      if (!response.ok) throw new Error("Failed to fetch clinic");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const clinic = data?.clinic;
  const staff = data?.staff || [];
  const userStaffRecord = data?.userStaffRecord;
  const isMainAdmin = userStaffRecord?.role === "main_admin";
  const canInviteStaff = userStaffRecord?.canInviteStaff || false;

  if (!clinic) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You are not associated with any clinic. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clinic Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your clinic and team
          </p>
        </div>
        {canInviteStaff && (
          <Button onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Staff
          </Button>
        )}
      </div>

      {/* Role Badge */}
      {isMainAdmin && (
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            You are the <strong>Main Clinic Administrator</strong>. You have full permissions to manage this clinic and invite staff members.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Staff Members</p>
                <p className="text-2xl font-bold">{staff.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Veterinarians</p>
                <p className="text-2xl font-bold">
                  {staff.filter((s: any) => s.role === "vet" || s.role === "main_admin").length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-bold text-green-600">
                  {clinic.isVerified ? "Verified" : "Pending"}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clinic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Clinic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">{clinic.clinicName}</h3>
              <div className="flex gap-2">
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

            {clinic.description && (
              <p className="text-muted-foreground text-sm">
                {clinic.description}
              </p>
            )}

            {clinic.licenseNumber && (
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  License: {clinic.licenseNumber}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{clinic.email}</span>
            </div>
            {clinic.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{clinic.phone}</span>
              </div>
            )}
            {clinic.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <a
                  href={clinic.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {clinic.website}
                </a>
              </div>
            )}
            {(clinic.address || clinic.city || clinic.state) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  {clinic.address && <>{clinic.address}<br /></>}
                  {clinic.city && clinic.state
                    ? `${clinic.city}, ${clinic.state}`
                    : clinic.city || clinic.state}
                  {clinic.postalCode && ` ${clinic.postalCode}`}
                  {clinic.country && <><br />{clinic.country}</>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emergency Services */}
      {clinic.emergencyAvailable && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">24/7 Emergency Services Available</p>
                {clinic.emergencyPhone && (
                  <p className="text-sm text-green-700">Emergency: {clinic.emergencyPhone}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Staff Members</CardTitle>
            {canInviteStaff && (
              <Button onClick={() => setShowInviteDialog(true)} size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No staff members yet</p>
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
                        {member.userId === userStaffRecord?.userId && (
                          <Badge variant="outline" className="ml-2">You</Badge>
                        )}
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
                          className={member.status === "active" ? "bg-green-500" : ""}
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

      {/* Invite Dialog */}
      {canInviteStaff && (
        <InviteStaffDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          clinic={clinic}
        />
      )}
    </div>
  );
}
