"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Users,
  Mail,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateClinicDialog } from "@/components/admin/clinics/CreateClinicDialog";
import { EditClinicDialog } from "@/components/admin/clinics/EditClinicDialog";
import { InviteVetDialog } from "@/components/admin/clinics/InviteVetDialog";
import { format } from "date-fns";
import Link from "next/link";

export default function AdminClinicsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);

  // Fetch clinics
  const { data, isLoading } = useQuery({
    queryKey: ["admin-clinics", search, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/admin/clinics?${params}`);
      if (!response.ok) throw new Error("Failed to fetch clinics");
      return response.json();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (clinicId: string) => {
      const response = await fetch(`/api/admin/clinics/${clinicId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete clinic");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clinics"] });
      toast({
        title: "Clinic Deleted",
        description: "Clinic has been removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete clinic",
        variant: "destructive",
      });
    },
  });

  // Verify/Unverify mutation
  const verifyMutation = useMutation({
    mutationFn: async ({ clinicId, isVerified }: { clinicId: string; isVerified: boolean }) => {
      const response = await fetch(`/api/admin/clinics/${clinicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified }),
      });
      if (!response.ok) throw new Error("Failed to update clinic");
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-clinics"] });
      toast({
        title: variables.isVerified ? "Clinic Verified" : "Verification Removed",
        description: variables.isVerified
          ? "Clinic is now visible to breeders"
          : "Clinic is no longer visible to breeders",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update clinic verification",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (clinic: any) => {
    setSelectedClinic(clinic);
    setShowEditDialog(true);
  };

  const handleInvite = (clinic: any) => {
    setSelectedClinic(clinic);
    setShowInviteDialog(true);
  };

  const handleDelete = (clinic: any) => {
    if (
      confirm(
        `Are you sure you want to delete ${clinic.clinicName}? This will remove all staff members and pending invitations.`
      )
    ) {
      deleteMutation.mutate(clinic.id);
    }
  };

  const handleVerify = (clinic: any, isVerified: boolean) => {
    verifyMutation.mutate({ clinicId: clinic.id, isVerified });
  };

  const clinics = data?.clinics || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clinic Management</h1>
          <p className="text-muted-foreground">
            Manage veterinary clinics and invite veterinarians
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Create Clinic
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clinics</p>
                <p className="text-2xl font-bold">{pagination.total}</p>
              </div>
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-green-600">
                  {clinics.filter((c: any) => c.isVerified).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {clinics.filter((c: any) => !c.isVerified).length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">
                  {clinics.reduce((sum: number, c: any) => sum + (c.staffCount || 0), 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Clinics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clinics</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
                <SelectItem value="unverified">Unverified Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : clinics.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No clinics found</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first clinic to get started
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Clinic
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clinic</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clinics.map((clinic: any) => (
                    <TableRow key={clinic.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{clinic.clinicName}</p>
                          {clinic.licenseNumber && (
                            <p className="text-xs text-muted-foreground">
                              License: {clinic.licenseNumber}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          {clinic.city && clinic.state
                            ? `${clinic.city}, ${clinic.state}`
                            : clinic.city || clinic.state || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            {clinic.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{clinic.staffCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge
                            variant={clinic.isVerified ? "default" : "secondary"}
                            className={
                              clinic.isVerified
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-yellow-500 hover:bg-yellow-600"
                            }
                          >
                            {clinic.isVerified ? "Verified" : "Pending"}
                          </Badge>
                          {clinic.isActive && (
                            <Badge variant="outline" className="ml-1">
                              Active
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(clinic.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/clinics/${clinic.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(clinic)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleInvite(clinic)}>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Invite Vet
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {clinic.isVerified ? (
                              <DropdownMenuItem
                                onClick={() => handleVerify(clinic, false)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Remove Verification
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleVerify(clinic, true)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Verify Clinic
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(clinic)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateClinicDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
      
      {selectedClinic && (
        <>
          <EditClinicDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            clinic={selectedClinic}
          />
          <InviteVetDialog
            open={showInviteDialog}
            onOpenChange={setShowInviteDialog}
            clinic={selectedClinic}
          />
        </>
      )}
    </div>
  );
}
