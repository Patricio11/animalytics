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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

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
  const [showEditAnimalDialog, setShowEditAnimalDialog] = useState(false);
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

  // Animal form state
  const [animalForm, setAnimalForm] = useState({
    name: '',
    registeredName: '',
    breedId: '',
    sex: 'male' as 'male' | 'female',
    dateOfBirth: '',
    microchipNumber: '',
    registrationNumber: '',
    color: '',
    bio: '',
    healthStatus: 'good' as 'excellent' | 'good' | 'fair' | 'poor',
    isBreedingActive: false,
  });

  // Create animal mutation
  const createAnimalMutation = useMutation({
    mutationFn: async (data: typeof animalForm) => {
      const res = await fetch(`/api/admin/users/${userId}/animals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create animal');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-animals', userId] });
      setShowCreateAnimalDialog(false);
      resetAnimalForm();
      toast({
        title: "Success",
        description: "Animal created successfully",
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

  // Update animal mutation
  const updateAnimalMutation = useMutation({
    mutationFn: async ({ animalId, data }: { animalId: string; data: Partial<typeof animalForm> }) => {
      const res = await fetch(`/api/admin/users/${userId}/animals/${animalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update animal');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-animals', userId] });
      setShowEditAnimalDialog(false);
      setSelectedAnimal(null);
      toast({
        title: "Success",
        description: "Animal updated successfully",
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

  const resetAnimalForm = () => {
    setAnimalForm({
      name: '',
      registeredName: '',
      breedId: '',
      sex: 'male',
      dateOfBirth: '',
      microchipNumber: '',
      registrationNumber: '',
      color: '',
      bio: '',
      healthStatus: 'good',
      isBreedingActive: false,
    });
  };

  const handleCreateAnimal = () => {
    createAnimalMutation.mutate(animalForm);
  };

  const handleEditAnimal = () => {
    if (!selectedAnimal) return;
    updateAnimalMutation.mutate({
      animalId: selectedAnimal.id,
      data: animalForm,
    });
  };

  const handleDeleteAnimal = () => {
    if (!selectedAnimal) return;
    deleteAnimalMutation.mutate(selectedAnimal.id);
  };

  const openEditDialog = (animal: Animal) => {
    setSelectedAnimal(animal);
    setAnimalForm({
      name: animal.name,
      registeredName: animal.registeredName || '',
      breedId: animal.breed?.id || '',
      sex: animal.sex,
      dateOfBirth: animal.dateOfBirth || '',
      microchipNumber: '',
      registrationNumber: '',
      color: '',
      bio: '',
      healthStatus: (animal.healthStatus as any) || 'good',
      isBreedingActive: animal.isBreedingActive || false,
    });
    setShowEditAnimalDialog(true);
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
            </div>
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
                    onClick={() => {
                      resetAnimalForm();
                      setShowCreateAnimalDialog(true);
                    }}
                    className="bg-gradient-brand"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Animal
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
                      onClick={() => {
                        resetAnimalForm();
                        setShowCreateAnimalDialog(true);
                      }}
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Animal
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
                                onClick={() => openEditDialog(animal)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
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

        {/* Create Animal Dialog */}
        <Dialog open={showCreateAnimalDialog} onOpenChange={setShowCreateAnimalDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Animal for {user.name}</DialogTitle>
              <DialogDescription>
                Add a new animal to this user's account
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={animalForm.name}
                    onChange={(e) => setAnimalForm({ ...animalForm, name: e.target.value })}
                    placeholder="Max"
                  />
                </div>
                <div>
                  <Label htmlFor="registeredName">Registered Name</Label>
                  <Input
                    id="registeredName"
                    value={animalForm.registeredName}
                    onChange={(e) => setAnimalForm({ ...animalForm, registeredName: e.target.value })}
                    placeholder="Champion Max of..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="breedId">Breed *</Label>
                  <Select
                    value={animalForm.breedId}
                    onValueChange={(value) => setAnimalForm({ ...animalForm, breedId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select breed" />
                    </SelectTrigger>
                    <SelectContent>
                      {breeds.map((breed: any) => (
                        <SelectItem key={breed.id} value={breed.id}>
                          {breed.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sex">Sex *</Label>
                  <Select
                    value={animalForm.sex}
                    onValueChange={(value: 'male' | 'female') => setAnimalForm({ ...animalForm, sex: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={animalForm.dateOfBirth}
                    onChange={(e) => setAnimalForm({ ...animalForm, dateOfBirth: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="healthStatus">Health Status</Label>
                  <Select
                    value={animalForm.healthStatus}
                    onValueChange={(value: any) => setAnimalForm({ ...animalForm, healthStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={animalForm.bio}
                  onChange={(e) => setAnimalForm({ ...animalForm, bio: e.target.value })}
                  placeholder="Tell us about this animal..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isBreedingActive"
                  checked={animalForm.isBreedingActive}
                  onChange={(e) => setAnimalForm({ ...animalForm, isBreedingActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isBreedingActive" className="cursor-pointer">
                  Breeding Active
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateAnimalDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateAnimal}
                disabled={!animalForm.name || !animalForm.breedId || createAnimalMutation.isPending}
              >
                {createAnimalMutation.isPending ? 'Creating...' : 'Create Animal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Animal Dialog */}
        <Dialog open={showEditAnimalDialog} onOpenChange={setShowEditAnimalDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Animal</DialogTitle>
              <DialogDescription>
                Update animal information
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={animalForm.name}
                    onChange={(e) => setAnimalForm({ ...animalForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-registeredName">Registered Name</Label>
                  <Input
                    id="edit-registeredName"
                    value={animalForm.registeredName}
                    onChange={(e) => setAnimalForm({ ...animalForm, registeredName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-breedId">Breed *</Label>
                  <Select
                    value={animalForm.breedId}
                    onValueChange={(value) => setAnimalForm({ ...animalForm, breedId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select breed" />
                    </SelectTrigger>
                    <SelectContent>
                      {breeds.map((breed: any) => (
                        <SelectItem key={breed.id} value={breed.id}>
                          {breed.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-sex">Sex *</Label>
                  <Select
                    value={animalForm.sex}
                    onValueChange={(value: 'male' | 'female') => setAnimalForm({ ...animalForm, sex: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
                  <Input
                    id="edit-dateOfBirth"
                    type="date"
                    value={animalForm.dateOfBirth}
                    onChange={(e) => setAnimalForm({ ...animalForm, dateOfBirth: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-healthStatus">Health Status</Label>
                  <Select
                    value={animalForm.healthStatus}
                    onValueChange={(value: any) => setAnimalForm({ ...animalForm, healthStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-bio">Bio</Label>
                <Textarea
                  id="edit-bio"
                  value={animalForm.bio}
                  onChange={(e) => setAnimalForm({ ...animalForm, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-isBreedingActive"
                  checked={animalForm.isBreedingActive}
                  onChange={(e) => setAnimalForm({ ...animalForm, isBreedingActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="edit-isBreedingActive" className="cursor-pointer">
                  Breeding Active
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditAnimalDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleEditAnimal}
                disabled={!animalForm.name || !animalForm.breedId || updateAnimalMutation.isPending}
              >
                {updateAnimalMutation.isPending ? 'Updating...' : 'Update Animal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
