"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  PawPrint,
  ShoppingBag,
  BadgeCheck,
  Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AdminAddAnimalDialog } from "@/components/admin/AdminAddAnimalDialog";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  organization: string | null;
  licenseNumber: string | null;
  isVerified: boolean;
  emailVerified: boolean;
  createdByAdmin?: boolean;
  credentialsNotifiedAt?: string | null;
  lastLogin: string | null;
  createdAt: string;
}

interface Animal {
  id: string;
  name: string;
  registeredName?: string;
  sex: 'male' | 'female';
  dateOfBirth?: string;
  profileImageUrl?: string;
  breed?: {
    id: string;
    name: string;
  };
  healthStatus?: string;
  isBreedingActive?: boolean;
  isActive?: boolean;
}

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: userId } = use(params);
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showCreateAnimalDialog, setShowCreateAnimalDialog] = useState(false);
  const [showDeleteAnimalDialog, setShowDeleteAnimalDialog] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  // Fetch user details
  const { data: user, isLoading: userLoading } = useQuery<UserDetail>({
    queryKey: ['admin-user', userId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      return data.user;
    },
  });

  // Fetch user's animals
  const { data: animalsData, isLoading: animalsLoading } = useQuery({
    queryKey: ['admin-user-animals', userId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${userId}/animals`);
      if (!res.ok) throw new Error('Failed to fetch animals');
      return res.json();
    },
  });

  // Fetch breeds for dropdown
  const { data: breedsData } = useQuery({
    queryKey: ['breeds'],
    queryFn: async () => {
      const res = await fetch('/api/breeds');
      if (!res.ok) throw new Error('Failed to fetch breeds');
      return res.json();
    },
  });

  const animals = animalsData?.animals || [];
  const breeds = breedsData?.breeds || [];

  // Notify user mutation
  const notifyUserMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/users/${userId}/notify`, {
        method: 'POST',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to notify user');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
      toast({
        title: "Success",
        description: "User has been notified via email with their login credentials",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  // Delete animal mutation
  const deleteAnimalMutation = useMutation({
    mutationFn: async (animalId: string) => {
      const res = await fetch(`/api/admin/users/${userId}/animals/${animalId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete animal');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-animals', userId] });
      setShowDeleteAnimalDialog(false);
      setSelectedAnimal(null);
      toast({
        title: "Success",
        description: "Animal deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleDeleteAnimal = () => {
    if (!selectedAnimal) return;
    deleteAnimalMutation.mutate(selectedAnimal.id);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-surface-secondary p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface-secondary p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">User not found</p>
              <Button className="mt-4" onClick={() => router.push('/admin/users')}>
                Back to Users
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/users')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage {user.name}'s account and data
            </p>
          </div>
        </div>

        {/* User Info Card */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                {user.avatar && <AvatarImage src={user.avatar} />}
                <AvatarFallback className="text-2xl">
                  {user.name?.slice(0, 2).toUpperCase() || '??'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                    {user.role}
                  </Badge>
                  {user.isVerified && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                  {user.createdByAdmin && !user.credentialsNotifiedAt && (
                    <Badge variant="secondary" className="gap-1">
                      <Mail className="w-3 h-3" />
                      Not Notified
                    </Badge>
                  )}
                  {user.credentialsNotifiedAt && (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Notified
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  {user.organization && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{user.organization}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                  </div>
                  {user.lastLogin && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Last login {formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Notify User Button */}
              {user.createdByAdmin && !user.credentialsNotifiedAt && (
                <div className="ml-auto">
                  <Button
                    onClick={() => notifyUserMutation.mutate()}
                    disabled={notifyUserMutation.isPending}
                    className="bg-gradient-brand"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {notifyUserMutation.isPending ? 'Sending...' : 'Notify User'}
                  </Button>
                </div>
              )}
            </div>
            {user.createdByAdmin && !user.credentialsNotifiedAt && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>⚠️ User Not Notified:</strong> This user was created by admin but hasn't received their login credentials yet. 
                  Add animals and complete their profile, then click "Notify User" to send a welcome email with credentials.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="animals" className="space-y-6">
          <TabsList>
            <TabsTrigger value="animals">
              <PawPrint className="w-4 h-4 mr-2" />
              Animals ({animals.length})
            </TabsTrigger>
            <TabsTrigger value="listings">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="verification">
              <BadgeCheck className="w-4 h-4 mr-2" />
              Verification
            </TabsTrigger>
          </TabsList>

          {/* Animals Tab */}
          <TabsContent value="animals">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Animals</CardTitle>
                  <Button
                    onClick={() => setShowCreateAnimalDialog(true)}
                    className="bg-gradient-brand"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Animal
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {animalsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : animals.length === 0 ? (
                  <div className="text-center py-12">
                    <PawPrint className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No animals yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create an animal for this user to get started
                    </p>
                    <Button
                      onClick={() => setShowCreateAnimalDialog(true)}
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Animal
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {animals.map((animal: Animal) => (
                      <Card key={animal.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                              {animal.profileImageUrl && (
                                <AvatarImage src={animal.profileImageUrl} />
                              )}
                              <AvatarFallback>
                                <PawPrint className="w-8 h-8" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{animal.name}</h3>
                                <Badge variant={animal.sex === 'male' ? 'default' : 'secondary'}>
                                  {animal.sex}
                                </Badge>
                                {animal.isBreedingActive && (
                                  <Badge variant="outline">Breeding Active</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {animal.breed?.name || 'Unknown breed'}
                                {animal.registeredName && ` • ${animal.registeredName}`}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setSelectedAnimal(animal);
                                  setShowDeleteAnimalDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Marketplace Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Listing management coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BadgeCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    <Link href="/admin/verifications" className="text-primary hover:underline">
                      Go to Verifications Dashboard
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Admin Animal Creation Wizard */}
        <AdminAddAnimalDialog
          open={showCreateAnimalDialog}
          onOpenChange={setShowCreateAnimalDialog}
          userId={userId}
          userName={user?.name || 'User'}
        />

        {/* Delete Animal Dialog */}
        <Dialog open={showDeleteAnimalDialog} onOpenChange={setShowDeleteAnimalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Animal</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this animal? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            {selectedAnimal && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    {selectedAnimal.profileImageUrl && (
                      <AvatarImage src={selectedAnimal.profileImageUrl} />
                    )}
                    <AvatarFallback>
                      <PawPrint className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedAnimal.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAnimal.breed?.name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteAnimalDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAnimal}
                disabled={deleteAnimalMutation.isPending}
              >
                {deleteAnimalMutation.isPending ? 'Deleting...' : 'Delete Animal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
