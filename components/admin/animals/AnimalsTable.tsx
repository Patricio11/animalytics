"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Eye, Edit, Trash2, MoreVertical, ArrowUpDown, User } from "lucide-react";
import { format, differenceInYears, differenceInMonths } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { AdminAddAnimalDialog } from "@/components/admin/AdminAddAnimalDialog";
import type { Animal, AnimalFilters } from "@/lib/api/queries/admin-animals";
import { deleteAnimal } from "@/lib/api/queries/admin-animals";

interface AnimalsTableProps {
  animals: Animal[];
  filters: AnimalFilters;
  onFiltersChange: (filters: AnimalFilters) => void;
  selectedAnimals: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function AnimalsTable({
  animals,
  filters,
  onFiltersChange,
  selectedAnimals,
  onSelectionChange,
}: AnimalsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [animalToEdit, setAnimalToEdit] = useState<Animal | null>(null);

  const handleSort = (column: 'name' | 'breed' | 'dateOfBirth' | 'createdAt') => {
    const newOrder = filters.sortBy === column && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    onFiltersChange({
      ...filters,
      sortBy: column,
      sortOrder: newOrder,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(animals.map(a => a.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedAnimals, id]);
    } else {
      onSelectionChange(selectedAnimals.filter(aid => aid !== id));
    }
  };

  const handleDelete = async () => {
    if (!animalToDelete) return;

    try {
      await deleteAnimal(animalToDelete.id);
      
      toast({
        title: "Animal Deleted",
        description: `${animalToDelete.name} has been deleted successfully.`,
      });

      queryClient.invalidateQueries({ queryKey: ['admin-animals'] });
      setDeleteDialogOpen(false);
      setAnimalToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete animal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return 'Unknown';
    
    const dob = new Date(dateOfBirth);
    const years = differenceInYears(new Date(), dob);
    const months = differenceInMonths(new Date(), dob) % 12;
    
    if (years === 0) {
      return `${months}mo`;
    }
    return `${years}y ${months}mo`;
  };

  const allSelected = animals.length > 0 && selectedAnimals.length === animals.length;
  const someSelected = selectedAnimals.length > 0 && selectedAnimals.length < animals.length;

  return (
    <>
      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
                />
              </TableHead>
              <TableHead className="w-16">Photo</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('name')}
                  className="hover:bg-transparent p-0 h-auto font-semibold"
                >
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('breed')}
                  className="hover:bg-transparent p-0 h-auto font-semibold"
                >
                  Breed
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Sex & Age</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Breeder</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('createdAt')}
                  className="hover:bg-transparent p-0 h-auto font-semibold"
                >
                  Created
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {animals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  No animals found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            ) : (
              animals.map((animal) => (
                <TableRow key={animal.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Checkbox
                      checked={selectedAnimals.includes(animal.id)}
                      onCheckedChange={(checked) => handleSelectOne(animal.id, checked as boolean)}
                      aria-label={`Select ${animal.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={animal.profileImageUrl || undefined} alt={animal.name} />
                      <AvatarFallback>{animal.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <button
                        onClick={() => router.push(`/admin/animals/${animal.id}`)}
                        className="font-medium text-left hover:text-primary transition-colors"
                      >
                        {animal.name}
                      </button>
                      {animal.registeredName && (
                        <span className="text-xs text-muted-foreground">{animal.registeredName}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{animal.breed?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <Badge variant={animal.sex === 'male' ? 'default' : 'secondary'} className="w-fit">
                        {animal.sex === 'male' ? 'Male' : 'Female'}
                      </Badge>
                      <span className="text-xs text-muted-foreground mt-1">
                        {getAge(animal.dateOfBirth)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {animal.owner ? (
                      <button
                        onClick={() => router.push(`/admin/users/${animal.owner!.id}`)}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        <User className="w-3 h-3" />
                        <span className="text-sm">{animal.owner.name || animal.owner.email}</span>
                      </button>
                    ) : animal.ownerName ? (
                      <span className="text-sm text-muted-foreground">{animal.ownerName}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {animal.breederName ? (
                      <span className="text-sm">{animal.breederName}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {animal.location ? (
                      <span className="text-sm">{animal.location}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {animal.registrationNumber && (
                        <Badge variant="outline" className="text-xs w-fit">
                          {animal.registrationNumber}
                        </Badge>
                      )}
                      {animal.microchipNumber && (
                        <span className="text-xs text-muted-foreground">
                          MC: {animal.microchipNumber}
                        </span>
                      )}
                      {!animal.registrationNumber && !animal.microchipNumber && (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(animal.createdAt), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/animals/${animal.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setAnimalToEdit(animal);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setAnimalToDelete(animal);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Animal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{animalToDelete?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {animalToEdit && (
        <AdminAddAnimalDialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setAnimalToEdit(null);
              queryClient.invalidateQueries({ queryKey: ['admin-animals'] });
            }
          }}
          userId={animalToEdit.userId}
          userName={animalToEdit.owner?.name || animalToEdit.owner?.email || 'User'}
          animalId={animalToEdit.id}
          mode="edit"
          initialData={{
            name: animalToEdit.name,
            registeredName: animalToEdit.registeredName || '',
            type: animalToEdit.sex === 'male' ? 'dog' : 'bitch',
            breed: animalToEdit.breed?.name || '',
            breedId: animalToEdit.breed?.id,
            dateOfBirth: animalToEdit.dateOfBirth ? new Date(animalToEdit.dateOfBirth) : undefined,
            profilePhotoUrl: animalToEdit.profileImageUrl,
            color: animalToEdit.color || '',
            markings: animalToEdit.markings || '',
            weight: animalToEdit.weight ? animalToEdit.weight.toString() : '',
            height: animalToEdit.height ? animalToEdit.height.toString() : '',
            microchipId: animalToEdit.microchipNumber || '',
            registrationNumber: animalToEdit.registrationNumber || '',
            description: animalToEdit.bio || '',
            breederName: animalToEdit.breederName || '',
            ownerName: animalToEdit.ownerName || '',
          }}
        />
      )}
    </>
  );
}
