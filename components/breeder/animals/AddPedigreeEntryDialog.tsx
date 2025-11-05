"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Check, ChevronsUpDown, Database, FileEdit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AddPedigreeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: string;
  position: string; // 'dam', 'sire', 'dam.dam', etc.
  generation: number;
  positionLabel: string; // 'Dam', 'Sire', 'Granddam', etc.
  requiredSex?: "male" | "female"; // Based on position
  animalBreed?: string | null; // Breed from the animal (auto-populated)
  existingEntry?: any; // Existing manual pedigree entry to edit
  onSuccess?: () => void;
}

export function AddPedigreeEntryDialog({
  open,
  onOpenChange,
  animalId,
  position,
  generation,
  positionLabel,
  requiredSex,
  animalBreed,
  existingEntry,
  onSuccess,
}: AddPedigreeEntryDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<"system" | "manual">("system");
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const [manualFormData, setManualFormData] = useState({
    name: "",
    registeredName: "",
    registrationNumber: "",
    microchipNumber: "",
    sex: requiredSex || ("" as "male" | "female" | ""),
    dateOfBirth: "",
    color: "",
    notes: "",
  });

  const updateManualFormData = (field: string, value: any) => {
    setManualFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Pre-populate form when editing existing entry
  useEffect(() => {
    if (open && existingEntry) {
      // Set mode to manual since we have an existing manual entry
      setMode("manual");
      
      // Pre-fill the form with existing data
      setManualFormData({
        name: existingEntry.name || "",
        registeredName: existingEntry.registeredName || "",
        registrationNumber: existingEntry.registrationNumber || "",
        microchipNumber: existingEntry.microchipNumber || "",
        sex: existingEntry.sex || requiredSex || "",
        dateOfBirth: existingEntry.dateOfBirth || "",
        color: existingEntry.color || "",
        notes: existingEntry.notes || "",
      });
    } else if (open && !existingEntry) {
      // Reset to defaults when adding new entry
      setMode("system");
      setManualFormData({
        name: "",
        registeredName: "",
        registrationNumber: "",
        microchipNumber: "",
        sex: requiredSex || "",
        dateOfBirth: "",
        color: "",
        notes: "",
      });
      setSelectedAnimalId(null);
    }
  }, [open, existingEntry, requiredSex]);

  // Fetch all animals from API
  const { data: animalsData, isLoading: isLoadingAnimals } = useQuery({
    queryKey: ["animals"],
    queryFn: async () => {
      const response = await fetch("/api/animals");
      if (!response.ok) {
        throw new Error("Failed to fetch animals");
      }
      const json = await response.json();
      return json.data || json.animals || json;
    },
    enabled: open && mode === "system",
  });

  const allAnimals = Array.isArray(animalsData) ? animalsData : [];

  // Filter by required sex if specified
  const filteredAnimals = requiredSex
    ? allAnimals.filter((a: any) => a.sex === requiredSex && a.id !== animalId)
    : allAnimals.filter((a: any) => a.id !== animalId);

  const selectedAnimal = filteredAnimals.find((a: any) => a.id === selectedAnimalId);

  // Link system animal mutation
  const linkAnimalMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAnimalId) throw new Error("No animal selected");

      const response = await fetch(`/api/animals/${animalId}/pedigree`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          damId: position.endsWith("dam") ? selectedAnimalId : null,
          sireId: position.endsWith("sire") ? selectedAnimalId : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to link animal");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Animal Linked",
        description: `${positionLabel} has been linked successfully`,
      });
      resetAndClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create manual entry mutation
  const createManualEntryMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/animals/${animalId}/pedigree/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position,
          generation,
          name: manualFormData.name,
          registeredName: manualFormData.registeredName || null,
          registrationNumber: manualFormData.registrationNumber || null,
          microchipNumber: manualFormData.microchipNumber || null,
          breed: animalBreed || null,
          sex: manualFormData.sex || null,
          dateOfBirth: manualFormData.dateOfBirth || null,
          color: manualFormData.color || null,
          notes: manualFormData.notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add manual entry");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Entry Added",
        description: `${positionLabel} has been added to the pedigree`,
      });
      resetAndClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetAndClose = () => {
    setSelectedAnimalId(null);
    setManualFormData({
      name: "",
      registeredName: "",
      registrationNumber: "",
      microchipNumber: "",
      sex: requiredSex || "",
      dateOfBirth: "",
      color: "",
      notes: "",
    });
    setMode("system");
    queryClient.invalidateQueries({ queryKey: ["pedigree", animalId] });
    onSuccess?.();
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "system") {
      if (!selectedAnimalId) {
        toast({
          title: "Validation Error",
          description: "Please select an animal",
          variant: "destructive",
        });
        return;
      }
      linkAnimalMutation.mutate();
    } else {
      // Validate required fields
      if (!manualFormData.registeredName.trim()) {
        toast({
          title: "Validation Error",
          description: "Registered Name is required",
          variant: "destructive",
        });
        return;
      }
      if (!manualFormData.registrationNumber.trim()) {
        toast({
          title: "Validation Error",
          description: "Registration Number is required",
          variant: "destructive",
        });
        return;
      }
      if (!manualFormData.color.trim()) {
        toast({
          title: "Validation Error",
          description: "Color is required",
          variant: "destructive",
        });
        return;
      }
      createManualEntryMutation.mutate();
    }
  };

  const isPending = linkAnimalMutation.isPending || createManualEntryMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add {positionLabel}</DialogTitle>
          <DialogDescription>
            Select an animal from your system or add an external animal manually
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "system" | "manual")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="system" className="gap-2">
              <Database className="w-4 h-4" />
              Select from System
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2">
              <FileEdit className="w-4 h-4" />
              Add Manual Entry
            </TabsTrigger>
          </TabsList>

          {/* System Animal Selection */}
          <TabsContent value="system" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Select Animal</Label>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between bg-background border-primary/20"
                    disabled={isLoadingAnimals}
                  >
                    {isLoadingAnimals ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading animals...
                      </>
                    ) : selectedAnimal ? (
                      selectedAnimal.name
                    ) : (
                      `Select ${positionLabel.toLowerCase()}...`
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[600px] p-0">
                  <Command>
                    <CommandInput placeholder="Search animals..." className="h-9" />
                    <CommandList>
                      {filteredAnimals.length === 0 ? (
                        <CommandEmpty className="py-6 text-center text-sm">
                          {requiredSex
                            ? `No ${requiredSex} animals found. Add a ${requiredSex} animal first.`
                            : "No animals found."}
                        </CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {filteredAnimals.map((animal: any) => (
                            <CommandItem
                              key={animal.id}
                              value={`${animal.name}-${animal.id}`}
                              onSelect={() => {
                                setSelectedAnimalId(animal.id);
                                setPopoverOpen(false);
                              }}
                              className="px-3 py-3"
                            >
                              <Check
                                className={cn(
                                  "mr-3 h-4 w-4 shrink-0",
                                  selectedAnimalId === animal.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col gap-1 min-w-0">
                                <span className="font-medium truncate">{animal.name}</span>
                                {animal.registeredName && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    {animal.registeredName}
                                  </span>
                                )}
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                  {animal.breed?.name && <span>{animal.breed.name}</span>}
                                  {animal.sex && (
                                    <span className="capitalize">• {animal.sex}</span>
                                  )}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                This will link an existing animal from your system to this position in the pedigree tree.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Manual Entry Form */}
          <TabsContent value="manual" className="space-y-4 mt-4">
            {/* Registered Name and Registration Number - Same Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Registered Name - Required */}
              <div className="space-y-2">
                <Label htmlFor="registeredName" className="text-base font-semibold">
                  Registered Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="registeredName"
                  value={manualFormData.registeredName}
                  onChange={(e) => updateManualFormData("registeredName", e.target.value)}
                  placeholder="Full registered/official name"
                  className="border-primary/20 focus:border-primary"
                  required
                />
              </div>

              {/* Registration Number - Required */}
              <div className="space-y-2">
                <Label htmlFor="registrationNumber" className="text-base font-semibold">
                  Registration Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="registrationNumber"
                  value={manualFormData.registrationNumber}
                  onChange={(e) => updateManualFormData("registrationNumber", e.target.value)}
                  placeholder="Official registration number"
                  className="border-primary/20 focus:border-primary"
                  required
                />
              </div>
            </div>

            {/* Call Name and Color - Same Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Call Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Call Name</Label>
                <Input
                  id="name"
                  value={manualFormData.name}
                  onChange={(e) => updateManualFormData("name", e.target.value)}
                  placeholder="Everyday name"
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              {/* Color - Required */}
              <div className="space-y-2">
                <Label htmlFor="color">
                  Color <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="color"
                  value={manualFormData.color}
                  onChange={(e) => updateManualFormData("color", e.target.value)}
                  placeholder="Coat color"
                  className="border-primary/20 focus:border-primary"
                  required
                />
              </div>
            </div>

            {/* Sex, Date of Birth, and Microchip - Three Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sex */}
              <div className="space-y-2">
                <Label htmlFor="sex">Sex</Label>
                <Select
                  value={manualFormData.sex}
                  onValueChange={(value) => updateManualFormData("sex", value)}
                  disabled={!!requiredSex}
                >
                  <SelectTrigger className="border-primary/20 focus:border-primary">
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={manualFormData.dateOfBirth}
                  onChange={(e) => updateManualFormData("dateOfBirth", e.target.value)}
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              {/* Microchip Number */}
              <div className="space-y-2">
                <Label htmlFor="microchipNumber">Microchip</Label>
                <Input
                  id="microchipNumber"
                  value={manualFormData.microchipNumber}
                  onChange={(e) => updateManualFormData("microchipNumber", e.target.value)}
                  placeholder="Microchip number"
                  className="border-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={manualFormData.notes}
                onChange={(e) => updateManualFormData("notes", e.target.value)}
                placeholder="Additional information about this animal..."
                className="border-primary/20 focus:border-primary min-h-[80px]"
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Note:</strong> Registered Name, Registration Number, and Color are required. This entry will be stored as external pedigree data.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {(linkAnimalMutation.isError || createManualEntryMutation.isError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {linkAnimalMutation.error?.message ||
                createManualEntryMutation.error?.message ||
                "An error occurred"}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isPending ||
              (mode === "system" && !selectedAnimalId) ||
              (mode === "manual" && (!manualFormData.registeredName.trim() || !manualFormData.registrationNumber.trim() || !manualFormData.color.trim()))
            }
            className="bg-gradient-brand hover:opacity-90"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === "system" ? "Linking..." : "Adding..."}
              </>
            ) : mode === "system" ? (
              "Link Animal"
            ) : (
              "Add Entry"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
