"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PedigreeTree } from "@/components/breeder/animals/PedigreeTree";
import { PedigreeTreeHorizontal } from "@/components/breeder/animals/PedigreeTreeHorizontal";
import { EditParentsDialog } from "@/components/breeder/animals/EditParentsDialog";
import { PedigreeDocumentsList } from "@/components/breeder/animals/PedigreeDocumentsList";
import { ImportPedigreeDialog } from "@/components/breeder/animals/ImportPedigreeDialog";
import {
  Download,
  FileText,
  Camera,
  Edit,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Upload,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PedigreeTabProps {
  animalId: string;
  animalName: string;
  animalUserId?: string;
}

export function PedigreeTab({ animalId, animalName, animalUserId }: PedigreeTabProps) {
  const { user } = useAuth();
  const isOwner = user?.id === animalUserId;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [generations, setGenerations] = useState(4);
  const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>('horizontal');
  const [activeSubTab, setActiveSubTab] = useState('certificate');

  // Debug logging - check all props
  console.log('🔍 PedigreeTab received props:', {
    animalId,
    animalName,
    animalUserId,
    animalUserIdType: typeof animalUserId,
  });
  
  console.log('🔍 PedigreeTab ownership check:', {
    userId: user?.id,
    userIdType: typeof user?.id,
    animalUserId,
    animalUserIdType: typeof animalUserId,
    isOwner,
    match: user?.id === animalUserId,
    strictMatch: user?.id === animalUserId,
  });

  // Fetch pedigree data
  const { data, isLoading, error } = useQuery({
    queryKey: ["pedigree", animalId, generations],
    queryFn: async () => {
      const response = await fetch(
        `/api/animals/${animalId}/pedigree?gens=${generations}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch pedigree");
      }
      return response.json();
    },
  });

  // Create snapshot mutation
  const createSnapshotMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/animals/${animalId}/pedigree`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          snapshot: true,
          generations,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create snapshot");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Snapshot Created",
        description: "Pedigree snapshot saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create pedigree snapshot",
        variant: "destructive",
      });
    },
  });

  // Handle CSV export
  const handleExportCSV = () => {
    window.open(
      `/api/animals/${animalId}/pedigree/export?format=csv&gens=${generations}`,
      "_blank"
    );
  };

  // Handle PDF export
  const handleExportPDF = async () => {
    try {
      const response = await fetch(
        `/api/animals/${animalId}/pedigree/export?format=pdf&gens=${generations}`
      );
      const data = await response.json();
      
      // For now, just download the JSON data
      // In a real implementation, you'd use html2canvas + jsPDF to render the tree
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pedigree-${animalName}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export Started",
        description: "Pedigree data exported (PDF rendering coming soon)",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export pedigree",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load pedigree data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pedigree</h2>
          <p className="text-sm text-muted-foreground">
            {isOwner ? `View and manage ${animalName}'s family tree` : `View ${animalName}'s family tree`}
          </p>
          {!isOwner && (
            <p className="text-xs text-amber-600 mt-1">View-only mode</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border border-primary/20 rounded-md p-1">
            <Button
              variant={viewMode === 'horizontal' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('horizontal')}
              className={cn(
                "h-8 px-3",
                viewMode === 'horizontal' && "bg-gradient-brand text-white shadow-card"
              )}
            >
              <LayoutList className="w-4 h-4 mr-1" />
              Certificate
            </Button>
            <Button
              variant={viewMode === 'vertical' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('vertical')}
              className={cn(
                "h-8 px-3",
                viewMode === 'vertical' && "bg-gradient-brand text-white shadow-card"
              )}
            >
              <LayoutGrid className="w-4 h-4 mr-1" />
              Grid
            </Button>
          </div>

          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              className="hover:bg-primary/10 hover:border-primary shadow-card"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Parents
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => createSnapshotMutation.mutate()}
            disabled={createSnapshotMutation.isPending}
            className="hover:bg-primary/10 hover:border-primary shadow-card"
          >
            <Camera className="w-4 h-4 mr-2" />
            {createSnapshotMutation.isPending ? "Saving..." : "Snapshot"}
          </Button>

          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportDialogOpen(true)}
              className="hover:bg-primary/10 hover:border-primary shadow-card"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="hover:bg-primary/10 hover:border-primary shadow-card"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="hover:bg-primary/10 hover:border-primary shadow-card"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Statistics Card */}
      {data?.stats && (
        <Card className="shadow-card bg-surface border-0">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Pedigree Completeness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Present</p>
                <p className="text-2xl font-bold">
                  {data.stats.totalPresent} / {data.stats.totalPossible}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Completeness</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {data.stats.completeness.toFixed(0)}%
                  </p>
                  {data.stats.completeness === 100 ? (
                    <CheckCircle2 className="w-5 h-5 text-chart-3" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-chart-2" />
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Generations</p>
                <p className="text-2xl font-bold">{generations}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-brand transition-all duration-500"
                  style={{ width: `${data.stats.completeness}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sub-Tabs for Certificate and Documents */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="certificate">
            <FileText className="w-4 h-4 mr-2" />
            Pedigree Certificate
          </TabsTrigger>
          <TabsTrigger value="documents">
            <Camera className="w-4 h-4 mr-2" />
            Documents
          </TabsTrigger>
        </TabsList>

        {/* Certificate Tab */}
        <TabsContent value="certificate" className="space-y-6">
          {/* Pedigree Tree - Full Width */}
          <div>
          <Card className="shadow-elevated bg-surface border-0">
            <CardHeader>
              <CardTitle className="text-base">
                {viewMode === 'horizontal' ? 'Pedigree Certificate' : 'Family Tree'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {viewMode === 'horizontal' ? (
                    // Horizontal skeleton
                    <div className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <div className="grid grid-cols-4 gap-4">
                        <Skeleton className="h-32 w-full" />
                        <div className="space-y-4">
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                        <div className="space-y-1">
                          {[...Array(8)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Vertical skeleton
                    [...Array(4)].map((_, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(Math.pow(2, i))].map((_, j) => (
                          <Skeleton key={j} className="h-24 w-full" />
                        ))}
                      </div>
                    ))
                  )}
                </div>
              ) : data?.pedigree ? (
                viewMode === 'horizontal' ? (
                  <PedigreeTreeHorizontal 
                    node={data.pedigree} 
                    generations={3} 
                    onUpdate={() => queryClient.invalidateQueries({ queryKey: ["pedigree", animalId] })}
                    isOwner={isOwner}
                  />
                ) : (
                  <PedigreeTree 
                    node={data.pedigree} 
                    generations={generations}
                    isOwner={isOwner}
                  />
                )
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No pedigree data available yet.
                  </p>
                  {isOwner && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setEditDialogOpen(true)}
                    >
                      Add Parents
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <PedigreeDocumentsList animalId={animalId} />
        </TabsContent>
      </Tabs>

      {/* Edit Parents Dialog */}
      <EditParentsDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        animalId={animalId}
        animalName={animalName}
        currentDamId={data?.pedigree?.dam?.isManualEntry ? undefined : data?.pedigree?.dam?.id}
        currentSireId={data?.pedigree?.sire?.isManualEntry ? undefined : data?.pedigree?.sire?.id}
        manualSire={data?.pedigree?.sire?.isManualEntry ? data?.pedigree?.sire : undefined}
        manualDam={data?.pedigree?.dam?.isManualEntry ? data?.pedigree?.dam : undefined}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["pedigree", animalId] });
        }}
      />

      {/* Import Pedigree Dialog */}
      <ImportPedigreeDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        animalId={animalId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["pedigree", animalId] });
        }}
      />
    </div>
  );
}
