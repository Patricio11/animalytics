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
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
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
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, AlertTriangle, Check, ChevronsUpDown, Database, FileEdit, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function getAnimalPhoto(animal: any): string | null {
  if (!animal?.photos?.length) return animal?.profileImageUrl || null;
  const primary = animal.photos.find((p: any) => p.category === 'profile' && p.isPrimary);
  const anyProfile = animal.photos.find((p: any) => p.category === 'profile');
  return primary?.fileUrl || anyProfile?.fileUrl || animal.photos[0]?.fileUrl || animal.profileImageUrl || null;
}

function AnimalAvatar({ animal, size = 8 }: { animal: any; size?: number }) {
  const photo = getAnimalPhoto(animal);
  const initials = (animal?.name || '?')[0].toUpperCase();
  const sizeClass = `w-${size} h-${size}`;
  if (photo) {
    return (
      <img
        src={photo}
        alt={animal.name}
        className={cn(sizeClass, "rounded-full object-cover shrink-0")}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  return (
    <div className={cn(sizeClass, "rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-semibold text-primary")}>
      {initials}
    </div>
  );
}

interface EditParentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: string;
  animalName: string;
  currentDamId?: string;
  currentSireId?: string;
  manualSire?: any;
  manualDam?: any;
  editPosition?: 'sire' | 'dam'; // if set, show only that section
  onSuccess?: () => void;
}

function ParentSection({
  label,
  requiredSex,
  animalId,
  allAnimals,
  isLoadingAnimals,
  currentSystemId,
  manualEntry,
  onSystemSelect,
  onManualChange,
}: {
  label: string;
  requiredSex: "male" | "female";
  animalId: string;
  allAnimals: any[];
  isLoadingAnimals: boolean;
  currentSystemId: string | null;
  manualEntry: any;
  onSystemSelect: (id: string | null) => void;
  onManualChange: (data: any) => void;
}) {
  const defaultTab = currentSystemId ? "system" : manualEntry ? "manual" : "system";
  const [tab, setTab] = useState<"system" | "manual">(defaultTab);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(currentSystemId);
  const [manual, setManual] = useState({
    registeredName: manualEntry?.registeredName || "",
    registrationNumber: manualEntry?.registrationNumber || "",
    name: manualEntry?.name || "",
    color: manualEntry?.color || "",
    sex: requiredSex,
    dateOfBirth: manualEntry?.dateOfBirth || "",
    microchipNumber: manualEntry?.microchipNumber || "",
    notes: manualEntry?.notes || "",
  });

  // Re-sync when dialog re-opens
  useEffect(() => {
    setSelectedId(currentSystemId);
    setTab(currentSystemId ? "system" : manualEntry ? "manual" : "system");
    setManual({
      registeredName: manualEntry?.registeredName || "",
      registrationNumber: manualEntry?.registrationNumber || "",
      name: manualEntry?.name || "",
      color: manualEntry?.color || "",
      sex: requiredSex,
      dateOfBirth: manualEntry?.dateOfBirth || "",
      microchipNumber: manualEntry?.microchipNumber || "",
      notes: manualEntry?.notes || "",
    });
  }, [currentSystemId, manualEntry, requiredSex]);

  const filtered = allAnimals.filter(
    (a: any) => a.sex === requiredSex && a.id !== animalId
  );
  const selectedAnimal = filtered.find((a: any) => a.id === selectedId);

  const updateManual = (field: string, value: string) => {
    const updated = { ...manual, [field]: value };
    setManual(updated);
    onManualChange(updated);
  };

  const handleSystemSelect = (id: string) => {
    setSelectedId(id);
    onSystemSelect(id);
    setPopoverOpen(false);
  };

  const handleTabChange = (v: string) => {
    setTab(v as "system" | "manual");
    if (v === "system") {
      onManualChange(null);
    } else {
      onSystemSelect(null);
      setSelectedId(null);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">{label}</Label>

      <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="system" className="gap-2">
            <Database className="w-4 h-4" />
            Select from System
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-2">
            <FileEdit className="w-4 h-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        {/* System Animal Selection */}
        <TabsContent value="system" className="space-y-3 mt-3">
          {/* Global search indicator */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span>Searching all animals in the system</span>
          </div>

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                className="w-full justify-between bg-background border-primary/20 h-auto py-2"
                disabled={isLoadingAnimals}
              >
                {isLoadingAnimals ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading animals...</>
                ) : selectedAnimal ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <AnimalAvatar animal={selectedAnimal} size={6} />
                    <span className="truncate font-medium">{selectedAnimal.name}{selectedAnimal.registeredName ? ` — ${selectedAnimal.registeredName}` : ""}</span>
                  </div>
                ) : (
                  `Select ${label.toLowerCase()}...`
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[500px] p-0">
              <Command>
                <CommandInput placeholder={`Search ${requiredSex === "male" ? "sires" : "dams"}...`} className="h-9" />
                <CommandList>
                  {filtered.length === 0 ? (
                    <CommandEmpty className="py-6 text-center text-sm">
                      No {requiredSex} animals found.
                    </CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {filtered.map((animal: any) => (
                        <CommandItem
                          key={animal.id}
                          value={[animal.name, animal.registeredName, animal.breed?.name].filter(Boolean).join(" ")}
                          onSelect={() => handleSystemSelect(animal.id)}
                          className="px-3 py-2"
                        >
                          <Check className={cn("mr-2 h-4 w-4 shrink-0", selectedId === animal.id ? "opacity-100" : "opacity-0")} />
                          <AnimalAvatar animal={animal} size={8} />
                          <div className="flex flex-col gap-0.5 min-w-0 ml-2">
                            <span className="font-medium truncate">{animal.name}</span>
                            {animal.registeredName && (
                              <span className="text-xs text-muted-foreground truncate">{animal.registeredName}</span>
                            )}
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              {animal.breed?.name && <span>{animal.breed.name}</span>}
                              {animal.sex && <span className="capitalize">• {animal.sex}</span>}
                              {animal.breeder?.name && <span>• by {animal.breeder.name}</span>}
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

          {selectedId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full"
              onClick={() => { setSelectedId(null); onSystemSelect(null); }}
            >
              Remove {label}
            </Button>
          )}
        </TabsContent>

        {/* Manual Entry Form */}
        <TabsContent value="manual" className="space-y-3 mt-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`${label}-regname`}>Registered Name <span className="text-destructive">*</span></Label>
              <Input
                id={`${label}-regname`}
                value={manual.registeredName}
                onChange={(e) => updateManual("registeredName", e.target.value)}
                placeholder="Full registered name"
                className="border-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${label}-regno`}>Registration Number <span className="text-destructive">*</span></Label>
              <Input
                id={`${label}-regno`}
                value={manual.registrationNumber}
                onChange={(e) => updateManual("registrationNumber", e.target.value)}
                placeholder="Reg. number"
                className="border-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${label}-name`}>Call Name</Label>
              <Input
                id={`${label}-name`}
                value={manual.name}
                onChange={(e) => updateManual("name", e.target.value)}
                placeholder="Everyday name"
                className="border-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${label}-color`}>Color <span className="text-destructive">*</span></Label>
              <Input
                id={`${label}-color`}
                value={manual.color}
                onChange={(e) => updateManual("color", e.target.value)}
                placeholder="Coat color"
                className="border-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${label}-dob`}>Date of Birth</Label>
              <DatePicker
                date={manual.dateOfBirth ? new Date(manual.dateOfBirth + 'T00:00:00') : undefined}
                onDateChange={(d) => updateManual("dateOfBirth", d ? format(d, 'yyyy-MM-dd') : '')}
                className="border-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${label}-chip`}>Microchip</Label>
              <Input
                id={`${label}-chip`}
                value={manual.microchipNumber}
                onChange={(e) => updateManual("microchipNumber", e.target.value)}
                placeholder="Microchip number"
                className="border-primary/20"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${label}-notes`}>Notes</Label>
            <Textarea
              id={`${label}-notes`}
              value={manual.notes}
              onChange={(e) => updateManual("notes", e.target.value)}
              placeholder="Additional information..."
              className="border-primary/20 min-h-[60px]"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
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
  editPosition,
  onSuccess,
}: EditParentsDialogProps) {
  const { toast } = useToast();

  const [sireId, setSireId] = useState<string | null>(currentSireId || null);
  const [damId, setDamId] = useState<string | null>(currentDamId || null);
  const [sireManual, setSireManual] = useState<any>(null);
  const [damManual, setDamManual] = useState<any>(null);

  useEffect(() => {
    if (open) {
      setSireId(currentSireId || null);
      setDamId(currentDamId || null);
      setSireManual(null);
      setDamManual(null);
    }
  }, [open, currentSireId, currentDamId]);

  // Fetch all animals system-wide so any animal can be selected as a parent
  const { data: animalsData, isLoading: isLoadingAnimals } = useQuery({
    queryKey: ["animals", "global"],
    queryFn: async () => {
      const response = await fetch("/api/animals?global=true");
      if (!response.ok) throw new Error("Failed to fetch animals");
      const json = await response.json();
      return json.data || json.animals || json;
    },
    enabled: open,
  });
  const allAnimals: any[] = Array.isArray(animalsData) ? animalsData : [];

  // Save mutation — handles system link + manual entries
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Update system-linked parents
      const res = await fetch(`/api/animals/${animalId}/pedigree`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sireId: sireId || null, damId: damId || null }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update parents");
      }

      // Save sire manual entry if provided
      if (sireManual?.registeredName && !sireId) {
        await fetch(`/api/animals/${animalId}/pedigree/manual`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ position: "sire", generation: 1, sex: "male", ...sireManual }),
        });
      }

      // Save dam manual entry if provided
      if (damManual?.registeredName && !damId) {
        await fetch(`/api/animals/${animalId}/pedigree/manual`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ position: "dam", generation: 1, sex: "female", ...damManual }),
        });
      }
    },
    onSuccess: () => {
      toast({ title: "Parents updated", description: "Pedigree updated successfully." });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editPosition === 'sire' ? 'Edit Sire (Father)' : editPosition === 'dam' ? 'Edit Dam (Mother)' : 'Edit Parents'}
          </DialogTitle>
          <DialogDescription>
            {editPosition === 'sire'
              ? `Change or remove the sire (father) for ${animalName}`
              : editPosition === 'dam'
              ? `Change or remove the dam (mother) for ${animalName}`
              : `Update the sire (father) and dam (mother) for ${animalName}`}
          </DialogDescription>
        </DialogHeader>

        {isLoadingAnimals ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading animals...</span>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {(!editPosition || editPosition === 'sire') && (
              <ParentSection
                label="Sire (Father)"
                requiredSex="male"
                animalId={animalId}
                allAnimals={allAnimals}
                isLoadingAnimals={isLoadingAnimals}
                currentSystemId={sireId}
                manualEntry={manualSire}
                onSystemSelect={(id) => setSireId(id)}
                onManualChange={(data) => setSireManual(data)}
              />
            )}

            {!editPosition && <Separator />}

            {(!editPosition || editPosition === 'dam') && (
              <ParentSection
                label="Dam (Mother)"
                requiredSex="female"
                animalId={animalId}
                allAnimals={allAnimals}
                isLoadingAnimals={isLoadingAnimals}
                currentSystemId={damId}
                manualEntry={manualDam}
                onSystemSelect={(id) => setDamId(id)}
                onManualChange={(data) => setDamManual(data)}
              />
            )}

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                The system will validate that these parent assignments don't create circular relationships in the pedigree tree.
              </AlertDescription>
            </Alert>

            {saveMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{saveMutation.error?.message || "Failed to update parents"}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saveMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || isLoadingAnimals}
            className="bg-gradient-brand hover:opacity-90"
          >
            {saveMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
