"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, AlertTriangle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditParentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: string;
  animalName: string;
  currentDamId?: string;
  currentSireId?: string;
  onSuccess?: () => void;
}

export function EditParentsDialog({
  open,
  onOpenChange,
  animalId,
  animalName,
  currentDamId,
  currentSireId,
  onSuccess,
}: EditParentsDialogProps) {
  const { toast } = useToast();
  const [damId, setDamId] = useState<string>("none");
  const [sireId, setSireId] = useState<string>("none");
  const [searchDam, setSearchDam] = useState("");
  const [searchSire, setSearchSire] = useState("");

  // Mock animal search - in real implementation, this would be an API call
  const mockAnimals = [
    { id: "1", name: "Bella", sex: "female", breed: "Labrador" },
    { id: "2", name: "Luna", sex: "female", breed: "Border Collie" },
    { id: "3", name: "Max", sex: "male", breed: "German Shepherd" },
    { id: "4", name: "Charlie", sex: "male", breed: "Golden Retriever" },
    { id: "5", name: "Daisy", sex: "female", breed: "Poodle" },
  ];

  // Filter animals by sex and search term
  const dams = mockAnimals.filter(
    (a) =>
      a.sex === "female" &&
      a.id !== animalId &&
      (a.name.toLowerCase().includes(searchDam.toLowerCase()) ||
        a.breed.toLowerCase().includes(searchDam.toLowerCase()))
  );

  const sires = mockAnimals.filter(
    (a) =>
      a.sex === "male" &&
      a.id !== animalId &&
      (a.name.toLowerCase().includes(searchSire.toLowerCase()) ||
        a.breed.toLowerCase().includes(searchSire.toLowerCase()))
  );

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setDamId(currentDamId || "none");
      setSireId(currentSireId || "none");
      setSearchDam("");
      setSearchSire("");
    }
  }, [open, currentDamId, currentSireId]);

  // Update parents mutation
  const updateParentsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/animals/${animalId}/pedigree`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          damId: damId === "none" ? null : damId,
          sireId: sireId === "none" ? null : sireId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update parents");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Parents Updated",
        description: "Parent links have been updated successfully",
      });

      // Show warnings if any
      if (data.warnings && data.warnings.length > 0) {
        data.warnings.forEach((warning: string) => {
          toast({
            title: "Warning",
            description: warning,
            variant: "default",
          });
        });
      }

      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParentsMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Parents</DialogTitle>
          <DialogDescription>
            Update the dam (mother) and sire (father) for {animalName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Dam (Mother) Section */}
            <div className="space-y-3">
              <Label htmlFor="dam" className="text-base font-semibold">
                Dam (Mother)
              </Label>

              {/* Search Input */}
              <Input
                placeholder="Search for dam by name or breed..."
                value={searchDam}
                onChange={(e) => setSearchDam(e.target.value)}
                className="border-primary/20 focus:border-primary"
              />

              {/* Dam Select */}
              <Select value={damId} onValueChange={setDamId}>
                <SelectTrigger className="border-primary/20 focus:border-primary">
                  <SelectValue placeholder="Select dam (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground">No dam selected</span>
                  </SelectItem>
                  {dams.map((dam) => (
                    <SelectItem key={dam.id} value={dam.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{dam.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({dam.breed})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {damId && damId !== "none" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDamId("none")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear dam
                </Button>
              )}
            </div>

            {/* Sire (Father) Section */}
            <div className="space-y-3">
              <Label htmlFor="sire" className="text-base font-semibold">
                Sire (Father)
              </Label>

              {/* Search Input */}
              <Input
                placeholder="Search for sire by name or breed..."
                value={searchSire}
                onChange={(e) => setSearchSire(e.target.value)}
                className="border-primary/20 focus:border-primary"
              />

              {/* Sire Select */}
              <Select value={sireId} onValueChange={setSireId}>
                <SelectTrigger className="border-primary/20 focus:border-primary">
                  <SelectValue placeholder="Select sire (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground">No sire selected</span>
                  </SelectItem>
                  {sires.map((sire) => (
                    <SelectItem key={sire.id} value={sire.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{sire.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({sire.breed})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {sireId && sireId !== "none" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSireId("none")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear sire
                </Button>
              )}
            </div>

            {/* Info Alert */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                The system will validate that these parent assignments don't create
                circular relationships in the pedigree tree.
              </AlertDescription>
            </Alert>

            {/* Error Display */}
            {updateParentsMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {updateParentsMutation.error?.message ||
                    "Failed to update parents"}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateParentsMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-brand hover:opacity-90 shadow-card"
              disabled={updateParentsMutation.isPending}
            >
              {updateParentsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Parents"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
