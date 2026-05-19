"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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
import { Eye, Edit, Trash2, MoreVertical, User, MapPin, Hash } from "lucide-react";
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

function getAge(dateOfBirth: string | null) {
  if (!dateOfBirth) return "Unknown";
  const dob = new Date(dateOfBirth);
  const years = differenceInYears(new Date(), dob);
  const months = differenceInMonths(new Date(), dob) % 12;
  if (years === 0) return `${months}mo`;
  return `${years}y ${months}mo`;
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

  const handleSelectAll = (checked: boolean) => {
    onSelectionChange(checked ? animals.map((a) => a.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    onSelectionChange(checked ? [...selectedAnimals, id] : selectedAnimals.filter((aid) => aid !== id));
  };

  const handleDelete = async () => {
    if (!animalToDelete) return;
    try {
      await deleteAnimal(animalToDelete.id);
      toast({
        title: "Animal Deleted",
        description: `${animalToDelete.name} has been deleted successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-animals"] });
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

  const allSelected = animals.length > 0 && selectedAnimals.length === animals.length;
  const someSelected = selectedAnimals.length > 0 && selectedAnimals.length < animals.length;

  if (animals.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-12 text-center text-muted-foreground">
        No animals found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <>
      {/* Select-all header */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/40 border border-border/60 mb-2">
        <Checkbox
          checked={allSelected}
          onCheckedChange={handleSelectAll}
          aria-label="Select all animals"
          className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
        />
        <span className="text-sm font-medium text-muted-foreground">
          {allSelected
            ? "Deselect all"
            : someSelected
            ? `${selectedAnimals.length} selected`
            : "Select all"}
        </span>
      </div>

      {/* Animal cards */}
      <div className="space-y-2">
        {animals.map((animal) => {
          const isSelected = selectedAnimals.includes(animal.id);
          const sex = animal.sex === "male" ? "Male" : "Female";

          const actionsMenu = (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreVertical className="w-4 h-4" />
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
          );

          return (
            <div
              key={animal.id}
              className="group flex items-center gap-3 p-3 rounded-lg border bg-surface hover:bg-surface-secondary transition-colors cursor-pointer"
              onClick={() => router.push(`/admin/animals/${animal.id}`)}
            >
              {/* Selection checkbox */}
              <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => handleSelectOne(animal.id, checked as boolean)}
                  aria-label={`Select ${animal.name}`}
                />
              </div>

              {/* Avatar */}
              <Avatar className="h-11 w-11 shrink-0">
                <AvatarImage src={animal.profileImageUrl || undefined} alt={animal.name} />
                <AvatarFallback className="bg-gradient-brand text-white text-xs">
                  {animal.name?.charAt(0)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>

              {/* Name + badges + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-foreground truncate">
                    {animal.registeredName || animal.name}
                  </p>
                  <Badge
                    variant={animal.sex === "male" ? "default" : "secondary"}
                    className="text-[10px] shrink-0"
                  >
                    {sex}
                  </Badge>
                  {animal.breed?.name && (
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {animal.breed.name}
                    </Badge>
                  )}
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {getAge(animal.dateOfBirth)}
                  </span>
                </div>
                <div className="flex items-center gap-x-3 gap-y-0.5 flex-wrap text-xs text-muted-foreground mt-1">
                  {animal.registeredName && animal.name && (
                    <span className="italic truncate">Call: {animal.name}</span>
                  )}
                  {animal.owner && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/users/${animal.owner!.id}`);
                      }}
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      <User className="w-3 h-3" />
                      {animal.owner.name || animal.owner.email}
                    </button>
                  )}
                  {animal.location && (
                    <span className="inline-flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3" />
                      {animal.location}
                    </span>
                  )}
                  {animal.registrationNumber && (
                    <span className="inline-flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {animal.registrationNumber}
                    </span>
                  )}
                </div>
              </div>

              {/* Right meta — desktop only */}
              <div className="hidden lg:flex flex-col items-end text-xs text-muted-foreground gap-0.5 shrink-0 min-w-[110px]">
                <span>Added {format(new Date(animal.createdAt), "MMM d, yyyy")}</span>
                {animal.breederName && <span className="truncate max-w-[160px]">Breeder: {animal.breederName}</span>}
              </div>

              {/* Actions */}
              <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                {actionsMenu}
              </div>
            </div>
          );
        })}
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
              queryClient.invalidateQueries({ queryKey: ["admin-animals"] });
            }
          }}
          userId={animalToEdit.userId}
          userName={animalToEdit.owner?.name || animalToEdit.owner?.email || "User"}
          animalId={animalToEdit.id}
          mode="edit"
          initialData={{
            name: animalToEdit.name,
            registeredName: animalToEdit.registeredName || "",
            type: animalToEdit.sex === "male" ? "dog" : "bitch",
            breed: animalToEdit.breed?.name || "",
            breedId: animalToEdit.breed?.id,
            dateOfBirth: animalToEdit.dateOfBirth ? new Date(animalToEdit.dateOfBirth) : undefined,
            profilePhotoUrl: animalToEdit.profileImageUrl,
            color: animalToEdit.color || "",
            markings: animalToEdit.markings || "",
            weight: animalToEdit.weight ? animalToEdit.weight.toString() : "",
            height: animalToEdit.height ? animalToEdit.height.toString() : "",
            microchipId: animalToEdit.microchipNumber || "",
            registrationNumber: animalToEdit.registrationNumber || "",
            description: animalToEdit.bio || "",
            breederName: animalToEdit.breederName || "",
            ownerName: animalToEdit.ownerName || "",
          }}
        />
      )}
    </>
  );
}
