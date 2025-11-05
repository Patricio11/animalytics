"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, AlertTriangle, ChevronsUpDown, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AddPedigreeEntryDialog } from "@/components/breeder/animals/AddPedigreeEntryDialog";

interface EditParentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: string;
  animalName: string;
  currentDamId?: string;
  currentSireId?: string;
  manualSire?: any; // Manual pedigree entry for sire
  manualDam?: any; // Manual pedigree entry for dam
  onSuccess?: () => void;
}

export function EditParentsDialog({
  open,
  onOpenChange,
  animalId,
  animalName,
  currentDamId,
  currentSireId,
  manualSire,
  manualDam,
  onSuccess,
}: EditParentsDialogProps) {
  const { toast } = useToast();
  const [damId, setDamId] = useState<string | null>(null);
  const [sireId, setSireId] = useState<string | null>(null);
  const [damPopoverOpen, setDamPopoverOpen] = useState(false);
  const [sirePopoverOpen, setSirePopoverOpen] = useState(false);
  const [addPedigreeDialogOpen, setAddPedigreeDialogOpen] = useState(false);
  const [addPedigreeConfig, setAddPedigreeConfig] = useState<{
    position: string;
    generation: number;
    label: string;
    requiredSex: "male" | "female";
  } | null>(null);

  // Fetch all animals from API
  const { data: animalsData, isLoading: isLoadingAnimals } = useQuery({
    queryKey: ["animals"],
    queryFn: async () => {
      const response = await fetch("/api/animals");
      if (!response.ok) {
        throw new Error("Failed to fetch animals");
      }
      const json = await response.json();
      // API returns { success: true, data: [...] }
      return json.data || json.animals || json;
    },
    enabled: open, // Only fetch when dialog is open
  });

  // Extract animals array from response
  const allAnimals = Array.isArray(animalsData) ? animalsData : [];

  // Filter animals by sex
  const dams = allAnimals.filter(
    (a: any) => a.sex === "female" && a.id !== animalId
  );

  const sires = allAnimals.filter(
    (a: any) => a.sex === "male" && a.id !== animalId
  );

  // Get selected animal names
  const selectedDam = dams.find((a: any) => a.id === damId);
  const selectedSire = sires.find((a: any) => a.id === sireId);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setDamId(currentDamId || null);
      setSireId(currentSireId || null);
    }
  }, [open, currentDamId, currentSireId]);

  // Update parents mutation
  const updateParentsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/animals/${animalId}/pedigree`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          damId: damId || null,
          sireId: sireId || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update parents");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Parents updated",
        description: "The pedigree has been updated successfully.",
      });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Parents</DialogTitle>
          <DialogDescription>
            Update the sire (father) and dam (mother) for {animalName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Loading State */}
            {isLoadingAnimals && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading animals...</span>
              </div>
            )}

            {!isLoadingAnimals && (
              <>
                {/* Sire (Father) Section - FIRST */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      Sire (Father)
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setAddPedigreeConfig({
                          position: "sire",
                          generation: 1,
                          label: "Sire",
                          requiredSex: "male",
                        });
                        setAddPedigreeDialogOpen(true);
                      }}
                    >
                      {currentSireId || manualSire ? "✏️ Edit Sire" : "+ Add Sire"}
                    </Button>
                  </div>

                  {/* Show manual sire info if exists and no system sire selected */}
                  {manualSire && !sireId && (
                    <div className="p-3 bg-muted/50 rounded-md border border-primary/20">
                      <p className="text-sm font-medium">{manualSire.registeredName || manualSire.name}</p>
                      {manualSire.registrationNumber && (
                        <p className="text-xs text-muted-foreground">Reg: {manualSire.registrationNumber}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">Manual Entry</p>
                    </div>
                  )}

                  <Popover open={sirePopoverOpen} onOpenChange={setSirePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between bg-background border-primary/20"
                      >
                        {selectedSire ? selectedSire.name : "Select sire from system (optional)"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0">
                      <Command>
                        <CommandInput placeholder="Search sires..." className="h-9" />
                        <CommandList>
                          {sires.length === 0 ? (
                            <CommandEmpty className="py-6 text-center text-sm">
                              No male animals found. Add a male animal first.
                            </CommandEmpty>
                          ) : (
                            <CommandGroup>
                              {/* None option */}
                              <CommandItem
                                value="none"
                                onSelect={() => {
                                  setSireId(null);
                                  setSirePopoverOpen(false);
                                }}
                                className="px-3 py-3"
                              >
                                <Check
                                  className={cn(
                                    "mr-3 h-4 w-4 shrink-0",
                                    !sireId ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <span className="text-muted-foreground">No sire selected</span>
                              </CommandItem>

                              {sires.map((sire: any) => (
                                <CommandItem
                                  key={sire.id}
                                  value={`${sire.name}-${sire.id}`}
                                  onSelect={() => {
                                    setSireId(sire.id);
                                    setSirePopoverOpen(false);
                                  }}
                                  className="px-3 py-3"
                                >
                                  <Check
                                    className={cn(
                                      "mr-3 h-4 w-4 shrink-0",
                                      sireId === sire.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col gap-1 min-w-0">
                                    <span className="font-medium truncate">{sire.name}</span>
                                    {sire.registeredName && (
                                      <span className="text-xs text-muted-foreground truncate">
                                        {sire.registeredName}
                                      </span>
                                    )}
                                    {sire.breed?.name && (
                                      <span className="text-xs text-muted-foreground">
                                        {sire.breed.name}
                                      </span>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {sireId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSireId(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear sire
                    </Button>
                  )}
                </div>

                {/* Dam (Mother) Section - SECOND */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      Dam (Mother)
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setAddPedigreeConfig({
                          position: "dam",
                          generation: 1,
                          label: "Dam",
                          requiredSex: "female",
                        });
                        setAddPedigreeDialogOpen(true);
                      }}
                    >
                      {currentDamId || manualDam ? "✏️ Edit Dam" : "+ Add Dam"}
                    </Button>
                  </div>

                  {/* Show manual dam info if exists and no system dam selected */}
                  {manualDam && !damId && (
                    <div className="p-3 bg-muted/50 rounded-md border border-primary/20">
                      <p className="text-sm font-medium">{manualDam.registeredName || manualDam.name}</p>
                      {manualDam.registrationNumber && (
                        <p className="text-xs text-muted-foreground">Reg: {manualDam.registrationNumber}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">Manual Entry</p>
                    </div>
                  )}

                  <Popover open={damPopoverOpen} onOpenChange={setDamPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between bg-background border-primary/20"
                      >
                        {selectedDam ? selectedDam.name : "Select dam from system (optional)"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0">
                      <Command>
                        <CommandInput placeholder="Search dams..." className="h-9" />
                        <CommandList>
                          {dams.length === 0 ? (
                            <CommandEmpty className="py-6 text-center text-sm">
                              No female animals found. Add a female animal first.
                            </CommandEmpty>
                          ) : (
                            <CommandGroup>
                              {/* None option */}
                              <CommandItem
                                value="none"
                                onSelect={() => {
                                  setDamId(null);
                                  setDamPopoverOpen(false);
                                }}
                                className="px-3 py-3"
                              >
                                <Check
                                  className={cn(
                                    "mr-3 h-4 w-4 shrink-0",
                                    !damId ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <span className="text-muted-foreground">No dam selected</span>
                              </CommandItem>

                              {dams.map((dam: any) => (
                                <CommandItem
                                  key={dam.id}
                                  value={`${dam.name}-${dam.id}`}
                                  onSelect={() => {
                                    setDamId(dam.id);
                                    setDamPopoverOpen(false);
                                  }}
                                  className="px-3 py-3"
                                >
                                  <Check
                                    className={cn(
                                      "mr-3 h-4 w-4 shrink-0",
                                      damId === dam.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col gap-1 min-w-0">
                                    <span className="font-medium truncate">{dam.name}</span>
                                    {dam.registeredName && (
                                      <span className="text-xs text-muted-foreground truncate">
                                        {dam.registeredName}
                                      </span>
                                    )}
                                    {dam.breed?.name && (
                                      <span className="text-xs text-muted-foreground">
                                        {dam.breed.name}
                                      </span>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {damId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDamId(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear dam
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
              </>
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
              disabled={updateParentsMutation.isPending || isLoadingAnimals}
              className="bg-gradient-brand hover:opacity-90"
            >
              {updateParentsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Add Pedigree Entry Dialog */}
      {addPedigreeConfig && (
        <AddPedigreeEntryDialog
          open={addPedigreeDialogOpen}
          onOpenChange={setAddPedigreeDialogOpen}
          animalId={animalId}
          position={addPedigreeConfig.position}
          generation={addPedigreeConfig.generation}
          positionLabel={addPedigreeConfig.label}
          requiredSex={addPedigreeConfig.requiredSex}
          existingEntry={
            addPedigreeConfig.position === "sire" ? manualSire :
            addPedigreeConfig.position === "dam" ? manualDam :
            undefined
          }
          onSuccess={() => {
            setAddPedigreeDialogOpen(false);
            setAddPedigreeConfig(null);
            onSuccess?.();
          }}
        />
      )}
    </Dialog>
  );
}
