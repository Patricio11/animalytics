"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAnimals } from "@/lib/api/queries/animals";
import { authClient } from "@/lib/auth/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PedigreeTree } from "@/components/breeder/animals/PedigreeTree";
import { PedigreeTreeHorizontal } from "@/components/breeder/animals/PedigreeTreeHorizontal";
import { ImportPedigreeDialog } from "@/components/breeder/animals/ImportPedigreeDialog";
import { 
  Download, 
  Upload, 
  Edit, 
  Search, 
  AlertCircle, 
  GitBranch,
  Eye,
  Globe,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PedigreePage() {
  const { data: session } = authClient.useSession();
  const { data: animals, isLoading: animalsLoading } = useAnimals();
  const queryClient = useQueryClient();

  const [selectedAnimalId, setSelectedAnimalId] = useState<string>("");
  const [globalSearch, setGlobalSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [treeOrientation, setTreeOrientation] = useState<"vertical" | "horizontal">("horizontal");
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Fetch pedigree data for selected animal
  const { data: pedigreeData, isLoading: pedigreeLoading } = useQuery({
    queryKey: ["pedigree", selectedAnimalId],
    queryFn: async () => {
      if (!selectedAnimalId) return null;
      const response = await fetch(`/api/animals/${selectedAnimalId}/pedigree?gens=4`);
      if (!response.ok) throw new Error("Failed to fetch pedigree");
      return response.json();
    },
    enabled: !!selectedAnimalId,
  });

  // Filter animals based on search and global toggle
  const filteredAnimals = useMemo(() => {
    if (!animals) return [];
    
    let filtered = globalSearch ? animals : animals.filter((a: any) => a.userId === session?.user?.id);
    
    if (searchQuery) {
      filtered = filtered.filter((animal: any) => 
        animal.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animal.registeredName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animal.breed?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [animals, globalSearch, searchQuery, session?.user?.id]);

  // Get selected animal
  const selectedAnimal = useMemo(() => {
    if (!selectedAnimalId || !animals) return null;
    return animals.find((a: any) => a.id === selectedAnimalId);
  }, [selectedAnimalId, animals]);

  // Check if current user is owner
  const isOwner = selectedAnimal?.userId === session?.user?.id;

  // Handle PDF export
  const handleExportPDF = async () => {
    if (!selectedAnimal) return;
    
    try {
      // Trigger browser print dialog for PDF export
      window.print();
    } catch (error) {
      console.error('Error exporting pedigree:', error);
    }
  };


  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Pedigree Viewer</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                View and manage animal pedigrees
              </p>
            </div>
          </div>
        </div>

        {/* Animal Selector Card */}
        <Card className="shadow-card bg-surface border-0">
          <CardHeader>
            <CardTitle>Select Animal</CardTitle>
            <CardDescription>
              Choose an animal to view its pedigree
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Global Search Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {globalSearch ? (
                  <Globe className="w-5 h-5 text-primary" />
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
                <div>
                  <Label htmlFor="global-search" className="text-sm font-medium">
                    {globalSearch ? "Search All Animals" : "My Animals Only"}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {globalSearch 
                      ? "Search across all animals in the system" 
                      : "Only show animals you own"}
                  </p>
                </div>
              </div>
              <Switch
                id="global-search"
                checked={globalSearch}
                onCheckedChange={setGlobalSearch}
              />
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, registered name, or breed..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Animal Selector */}
            {animalsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : filteredAnimals.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {searchQuery 
                    ? "No animals found matching your search." 
                    : globalSearch 
                    ? "No animals available in the system." 
                    : "You don't have any animals yet."}
                </AlertDescription>
              </Alert>
            ) : (
              <Select value={selectedAnimalId} onValueChange={setSelectedAnimalId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose an animal..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredAnimals.map((animal: any) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {animal.registeredName || animal.name}
                        </span>
                        {animal.registeredName && animal.name && (
                          <span className="text-xs text-muted-foreground">
                            ({animal.name})
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          • {animal.breed?.name}
                        </span>
                        {animal.userId !== session?.user?.id && (
                          <span className="text-xs text-muted-foreground italic">
                            (Public)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Selected Animal Info */}
            {selectedAnimal && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">
                      {selectedAnimal.registeredName || selectedAnimal.name}
                    </p>
                    {selectedAnimal.registeredName && selectedAnimal.name && (
                      <p className="text-sm text-muted-foreground italic">
                        Call name: {selectedAnimal.name}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {selectedAnimal.breed?.name} • {selectedAnimal.sex === 'male' ? '♂ Male' : '♀ Female'}
                    </p>
                  </div>
                  {isOwner && (
                    <div className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                      Owner
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pedigree Display */}
        {selectedAnimal && (
          <Card className="shadow-card bg-surface border-0">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Pedigree Tree</CardTitle>
                  <CardDescription>
                    {selectedAnimal.registeredName || selectedAnimal.name}'s family tree
                  </CardDescription>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Orientation Toggle */}
                  <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
                    <Button
                      size="sm"
                      variant={treeOrientation === "horizontal" ? "default" : "ghost"}
                      onClick={() => setTreeOrientation("horizontal")}
                      className="h-8"
                    >
                      Horizontal
                    </Button>
                    <Button
                      size="sm"
                      variant={treeOrientation === "vertical" ? "default" : "ghost"}
                      onClick={() => setTreeOrientation("vertical")}
                      className="h-8"
                    >
                      Vertical
                    </Button>
                  </div>

                  <Separator orientation="vertical" className="h-8" />

                  {/* Download Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportPDF}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>

                  {/* Owner-Only Actions */}
                  {isOwner && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowImportDialog(true)}
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Import
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Pedigree Tree Display with Animation */}
              {pedigreeLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : pedigreeData?.pedigree ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {treeOrientation === "horizontal" ? (
                    <PedigreeTreeHorizontal
                      node={pedigreeData.pedigree}
                      generations={3}
                      onUpdate={() => queryClient.invalidateQueries({ queryKey: ["pedigree", selectedAnimalId] })}
                    />
                  ) : (
                    <PedigreeTree
                      node={pedigreeData.pedigree}
                      generations={4}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No pedigree data available for this animal yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!selectedAnimal && !animalsLoading && (
          <Card className="shadow-card bg-surface border-0">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Eye className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Animal Selected
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Select an animal from the dropdown above to view its pedigree tree.
                    {!globalSearch && " Toggle global search to see all animals in the system."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        {isOwner && selectedAnimal && (
          <ImportPedigreeDialog
            open={showImportDialog}
            onOpenChange={setShowImportDialog}
            animalId={selectedAnimal.id}
          />
        )}
      </div>
    </div>
  );
}
