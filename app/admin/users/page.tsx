"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Filter,
  Download,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Copy,
  CheckCheck,
  Heart,
  EyeOff,
  Globe,
  Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BreedMultiSelect } from "@/components/ui/breed-multi-select";
import { useBreeds } from "@/lib/api/queries/breeds";
import { VerifiedCheckmark } from "@/components/ui/verified-badge";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  organization: string | null;
  licenseNumber: string | null;
  isVerified: boolean;
  emailVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
  subscription?: {
    plan: string;
  };
  breederProfileId?: string | null;
  breederProfileSlug?: string | null;
  breederProfileIsPublic?: boolean | null;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUserCredentials, setNewUserCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [selectedBreedIds, setSelectedBreedIds] = useState<string[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "breeder",
    organization: "",
    licenseNumber: "",
    isVerified: false,
    sendWelcomeEmail: true,
  });

  // Fetch breeds for breed selector
  const { data: allBreeds, isLoading: breedsLoading } = useBreeds();

  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (verifiedFilter !== 'all') params.append('verified', verifiedFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch users",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch users",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, verifiedFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchUsers();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Create user
  const handleCreateUser = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          breedIds: formData.role === 'breeder' ? selectedBreedIds : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewUserCredentials({
          email: data.credentials.email,
          password: data.credentials.temporaryPassword,
        });
        toast({
          title: "Success",
          description: "User created successfully",
        });
        fetchUsers();
        // Don't close dialog yet - show credentials first
      } else {
        const error = await res.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.error || "Failed to create user",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create user",
      });
    }
  };

  // Update user
  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "User updated successfully",
        });
        setShowEditDialog(false);
        fetchUsers();
      } else {
        const error = await res.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.error || "Failed to update user",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user",
      });
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        setShowDeleteDialog(false);
        fetchUsers();
      } else {
        const error = await res.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.error || "Failed to delete user",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user",
      });
    }
  };

  // Toggle breeder profile visibility
  const handleToggleProfileVisibility = async (user: User) => {
    try {
      const newIsPublic = !user.breederProfileIsPublic;
      
      const res = await fetch(`/api/admin/users/${user.id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: newIsPublic }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: `Profile ${newIsPublic ? 'published' : 'unpublished'} successfully`,
        });
        fetchUsers();
      } else {
        const error = await res.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.error || "Failed to update profile visibility",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile visibility",
      });
    }
  };

  // Resend credentials email
  const handleResendCredentials = async (user: User) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}/notify`, {
        method: 'POST',
      });

      if (res.ok) {
        toast({
          title: "Email Sent",
          description: `Welcome email with new credentials sent to ${user.email}`,
        });
      } else {
        const error = await res.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.error || "Failed to send credentials email",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send credentials email",
      });
    }
  };

  // Copy credentials
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
      toast({
        title: "Copied!",
        description: "Credentials copied to clipboard",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy to clipboard",
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      admin: 'destructive',
      breeder: 'default',
      pet_owner: 'secondary',
      veterinarian: 'outline',
    };
    return variants[role] || 'default';
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage system users and their roles
            </p>
          </div>
          <Button
            onClick={() => {
              setFormData({
                name: "",
                email: "",
                role: "breeder",
                organization: "",
                licenseNumber: "",
                isVerified: false,
                sendWelcomeEmail: true,
              });
              setNewUserCredentials(null);
              setShowCreateDialog(true);
            }}
            className="bg-gradient-brand hover:opacity-90"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create User
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search users by name, email, or organization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="breeder">Breeder</SelectItem>
                  <SelectItem value="pet_owner">Pet Owner</SelectItem>
                  <SelectItem value="veterinarian">Veterinarian</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="true">Verified Only</SelectItem>
                  <SelectItem value="false">Unverified Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Users ({users.length})</span>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No users found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => {
                  const actionsMenu = (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setFormData({
                              name: user.name,
                              email: user.email,
                              role: user.role,
                              organization: user.organization || "",
                              licenseNumber: user.licenseNumber || "",
                              isVerified: user.isVerified,
                              sendWelcomeEmail: true,
                            });
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResendCredentials(user)}>
                          <Send className="w-4 h-4 mr-2" />
                          Send / Resend Credentials
                        </DropdownMenuItem>
                        {user.role === 'breeder' && user.breederProfileId && (
                          <DropdownMenuItem onClick={() => handleToggleProfileVisibility(user)}>
                            {user.breederProfileIsPublic ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Make Profile Private
                              </>
                            ) : (
                              <>
                                <Globe className="w-4 h-4 mr-2" />
                                Make Profile Public
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );

                  return (
                    <div
                      key={user.id}
                      className="group flex items-center gap-3 p-3 rounded-lg border bg-surface hover:bg-surface-secondary transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                    >
                      {/* Avatar + name + email */}
                      <Avatar className="h-10 w-10 shrink-0">
                        {user.avatar && <AvatarImage src={user.avatar} />}
                        <AvatarFallback>{user.name?.slice(0, 2).toUpperCase() || '??'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground truncate">{user.name}</p>
                          <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs capitalize shrink-0">
                            {user.role}
                          </Badge>
                          {user.isVerified ? (
                            <Badge variant="default" className="gap-1 text-xs shrink-0">
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1 text-xs shrink-0">
                              <XCircle className="w-3 h-3" />
                              Unverified
                            </Badge>
                          )}
                          {user.role === 'breeder' && user.breederProfileId && (
                            user.breederProfileIsPublic ? (
                              <Badge variant="outline" className="gap-1 text-xs shrink-0">
                                <Globe className="w-3 h-3" />
                                Public
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1 text-xs shrink-0 text-muted-foreground">
                                <EyeOff className="w-3 h-3" />
                                Private
                              </Badge>
                            )
                          )}
                        </div>
                        <div className="flex items-center gap-x-3 gap-y-0.5 flex-wrap text-xs text-muted-foreground mt-1">
                          <span className="truncate">{user.email}</span>
                          {user.organization && (
                            <span className="hidden sm:inline truncate">· {user.organization}</span>
                          )}
                        </div>
                      </div>

                      {/* Meta column — hidden on small screens to keep actions visible */}
                      <div className="hidden lg:flex flex-col items-end text-xs text-muted-foreground gap-0.5 shrink-0 min-w-[120px]">
                        <span>Joined {formatDate(user.createdAt)}</span>
                        <span>Last login {formatDate(user.lastLogin)}</span>
                      </div>

                      {/* Actions — stays inside the row at every breakpoint */}
                      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                        {actionsMenu}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create User Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system. They will receive login credentials via email.
              </DialogDescription>
            </DialogHeader>

            {newUserCredentials ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900 dark:text-green-100">User Created Successfully!</h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        A welcome email with login credentials has been sent to the user.
                        You can also copy the credentials below.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Email</Label>
                    <div className="flex gap-2 mt-1">
                      <Input value={newUserCredentials.email} readOnly />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(newUserCredentials.email)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Temporary Password</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={newUserCredentials.password}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(newUserCredentials.password)}
                      >
                        {copiedPassword ? (
                          <CheckCheck className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      User should change this password on first login
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    onClick={() => {
                      setShowCreateDialog(false);
                      setNewUserCredentials(null);
                    }}
                  >
                    Done
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breeder">Breeder</SelectItem>
                        <SelectItem value="pet_owner">Pet Owner</SelectItem>
                        <SelectItem value="veterinarian">Veterinarian</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="Company name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    placeholder="ABC123"
                  />
                </div>

                {/* Breed Preferences - Only show for breeders */}
                {formData.role === "breeder" && (
                  <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-primary" />
                      <Label>Breed Preferences (Optional)</Label>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Select the breeds this breeder works with
                    </p>
                    <BreedMultiSelect
                      breeds={
                        allBreeds?.map((breed) => ({
                          id: breed.id,
                          name: breed.name,
                          sizeCategory: breed.sizeCategory,
                        })) || []
                      }
                      selectedBreedIds={selectedBreedIds}
                      onSelectionChange={setSelectedBreedIds}
                      placeholder="Search and select breeds..."
                      emptyText="No breeds found."
                      disabled={breedsLoading}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isVerified"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isVerified" className="cursor-pointer">
                    Mark as verified
                  </Label>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border/60">
                  <input
                    type="checkbox"
                    id="sendWelcomeEmail"
                    checked={formData.sendWelcomeEmail}
                    onChange={(e) => setFormData({ ...formData, sendWelcomeEmail: e.target.checked })}
                    className="rounded mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="sendWelcomeEmail" className="cursor-pointer font-medium">
                      Send welcome email with login credentials
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.sendWelcomeEmail
                        ? "The user will receive an email with their temporary password right after creation."
                        : "No email will be sent now. You can send it later via \"Send / Resend Credentials\" on the user detail page."}
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateUser}>
                    Create User
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breeder">Breeder</SelectItem>
                      <SelectItem value="pet_owner">Pet Owner</SelectItem>
                      <SelectItem value="veterinarian">Veterinarian</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-organization">Organization</Label>
                  <Input
                    id="edit-organization"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-licenseNumber">License Number</Label>
                <Input
                  id="edit-licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-isVerified"
                  checked={formData.isVerified}
                  onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="edit-isVerified" className="cursor-pointer">
                  Mark as verified
                </Label>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser}>
                  Update User
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this user? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    {selectedUser.avatar && <AvatarImage src={selectedUser.avatar} />}
                    <AvatarFallback>
                      {selectedUser.name?.slice(0, 2).toUpperCase() || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
