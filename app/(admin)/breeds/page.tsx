"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Heart,
  Eye,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Breed {
  id: string;
  name: string;
  successRating: number | null;
  sizeCategory: string | null;
  averageWeight: number | null;
  averageHeight: number | null;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBreedsPage() {
  const { toast } = useToast();
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBreed, setSelectedBreed] = useState<Breed | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    successRating: "",
    sizeCategory: "",
    averageWeight: "",
    averageHeight: "",
    description: "",
    imageUrl: "",
  });

  // Fetch breeds
  const fetchBreeds = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });

      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/admin/breeds?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBreeds(data.breeds);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch breeds",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch breeds",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBreeds();
  }, [page]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchBreeds();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Create breed
  const handleCreateBreed = async () => {
    try {
      const body: any = {
        name: formData.name,
      };

      if (formData.successRating) body.successRating = parseFloat(formData.successRating);
      if (formData.sizeCategory) body.sizeCategory = formData.sizeCategory;
      if (formData.averageWeight) body.averageWeight = parseFloat(formData.averageWeight);
      if (formData.averageHeight) body.averageHeight = parseFloat(formData.averageHeight);
      if (formData.description) body.description = formData.description;
      if (formData.imageUrl) body.imageUrl = formData.imageUrl;

      const res = await fetch('/api/admin/breeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Breed created successfully",
        });
        setShowCreateDialog(false);
        fetchBreeds();
      } else {
        const error = await res.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.error || "Failed to create breed",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create breed",
      });
    }
  };

  // Update breed
  const handleUpdateBreed = async () => {
    if (!selectedBreed) return;

    try {
      const body: any = {
        name: formData.name,
      };

      if (formData.successRating) body.successRating = parseFloat(formData.successRating);
      if (formData.sizeCategory) body.sizeCategory = formData.sizeCategory;
      if (formData.averageWeight) body.averageWeight = parseFloat(formData.averageWeight);
      if (formData.averageHeight) body.averageHeight = parseFloat(formData.averageHeight);
      if (formData.description) body.description = formData.description;
      if (formData.imageUrl) body.imageUrl = formData.imageUrl;

      const res = await fetch(`/api/admin/breeds/${selectedBreed.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Breed updated successfully",
        });
        setShowEditDialog(false);
        fetchBreeds();
      } else {
        const error = await res.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.error || "Failed to update breed",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update breed",
      });
    }
  };

  // Delete breed
  const handleDeleteBreed = async () => {
    if (!selectedBreed) return;

    try {
      const res = await fetch(`/api/admin/breeds/${selectedBreed.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Breed deleted successfully",
        });
        setShowDeleteDialog(false);
        fetchBreeds();
      } else {
        const error = await res.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.error || "Failed to delete breed",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete breed",
      });
    }
  };

  const getSizeBadge = (size: string | null) => {
    if (!size) return null;
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      small: 'secondary',
      medium: 'default',
      large: 'outline',
      giant: 'outline',
    };
    return (
      <Badge variant={variants[size] || 'default'}>
        {size}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Breed Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage dog breeds and their characteristics
            </p>
          </div>
          <Button
            onClick={() => {
              setFormData({
                name: "",
                successRating: "",
                sizeCategory: "",
                averageWeight: "",
                averageHeight: "",
                description: "",
                imageUrl: "",
              });
              setShowCreateDialog(true);
            }}
            className="bg-gradient-brand hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Breed
          </Button>
        </div>

        {/* Search */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search breeds by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Breeds Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Breeds ({breeds.length})</span>
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
            ) : breeds.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No breeds found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or add a new breed
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Breed</TableHead>
                      <TableHead>Size Category</TableHead>
                      <TableHead>Success Rating</TableHead>
                      <TableHead>Avg. Weight</TableHead>
                      <TableHead>Avg. Height</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {breeds.map((breed) => (
                      <TableRow key={breed.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {breed.imageUrl ? (
                              <img
                                src={breed.imageUrl}
                                alt={breed.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <Heart className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{breed.name}</p>
                              {breed.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {breed.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getSizeBadge(breed.sizeCategory)}
                        </TableCell>
                        <TableCell>
                          {breed.successRating ? (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{breed.successRating}</span>
                              <span className="text-xs text-muted-foreground">/5.0</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {breed.averageWeight ? (
                            <span>{breed.averageWeight} kg</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {breed.averageHeight ? (
                            <span>{breed.averageHeight} cm</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedBreed(breed);
                                  setFormData({
                                    name: breed.name,
                                    successRating: breed.successRating?.toString() || "",
                                    sizeCategory: breed.sizeCategory || "",
                                    averageWeight: breed.averageWeight?.toString() || "",
                                    averageHeight: breed.averageHeight?.toString() || "",
                                    description: breed.description || "",
                                    imageUrl: breed.imageUrl || "",
                                  });
                                  setShowEditDialog(true);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Breed
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedBreed(breed);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Breed
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

        {/* Create Breed Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Breed</DialogTitle>
              <DialogDescription>
                Add a new dog breed to the system
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Breed Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., German Shepherd"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sizeCategory">Size Category</Label>
                  <Select
                    value={formData.sizeCategory}
                    onValueChange={(value) => setFormData({ ...formData, sizeCategory: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="giant">Giant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="successRating">Success Rating (1-5)</Label>
                  <Input
                    id="successRating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.successRating}
                    onChange={(e) => setFormData({ ...formData, successRating: e.target.value })}
                    placeholder="4.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="averageWeight">Average Weight (kg)</Label>
                  <Input
                    id="averageWeight"
                    type="number"
                    step="0.1"
                    value={formData.averageWeight}
                    onChange={(e) => setFormData({ ...formData, averageWeight: e.target.value })}
                    placeholder="30.5"
                  />
                </div>
                <div>
                  <Label htmlFor="averageHeight">Average Height (cm)</Label>
                  <Input
                    id="averageHeight"
                    type="number"
                    step="0.1"
                    value={formData.averageHeight}
                    onChange={(e) => setFormData({ ...formData, averageHeight: e.target.value })}
                    placeholder="60"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the breed characteristics..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBreed}>
                  Create Breed
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Breed Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Breed</DialogTitle>
              <DialogDescription>
                Update breed information
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Breed Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-sizeCategory">Size Category</Label>
                  <Select
                    value={formData.sizeCategory}
                    onValueChange={(value) => setFormData({ ...formData, sizeCategory: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="giant">Giant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-successRating">Success Rating (1-5)</Label>
                  <Input
                    id="edit-successRating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.successRating}
                    onChange={(e) => setFormData({ ...formData, successRating: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-averageWeight">Average Weight (kg)</Label>
                  <Input
                    id="edit-averageWeight"
                    type="number"
                    step="0.1"
                    value={formData.averageWeight}
                    onChange={(e) => setFormData({ ...formData, averageWeight: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-averageHeight">Average Height (cm)</Label>
                  <Input
                    id="edit-averageHeight"
                    type="number"
                    step="0.1"
                    value={formData.averageHeight}
                    onChange={(e) => setFormData({ ...formData, averageHeight: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="edit-imageUrl">Image URL</Label>
                <Input
                  id="edit-imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateBreed}>
                  Update Breed
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Breed Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Breed</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this breed? This action cannot be undone if no animals are associated with it.
              </DialogDescription>
            </DialogHeader>

            {selectedBreed && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {selectedBreed.imageUrl ? (
                    <img
                      src={selectedBreed.imageUrl}
                      alt={selectedBreed.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Heart className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{selectedBreed.name}</p>
                    {selectedBreed.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {selectedBreed.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteBreed}>
                Delete Breed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
