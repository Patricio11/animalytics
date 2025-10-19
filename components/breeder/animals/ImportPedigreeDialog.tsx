"use client";

import { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  AlertCircle,
  Upload,
  FileText,
  CheckCircle2,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImportPedigreeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: string;
  onSuccess?: () => void;
}

interface ImportPreview {
  totalRows: number;
  animalsToCreate: number;
  linksToUpdate: number;
  warnings: string[];
  rows: Array<{
    name: string;
    registrationNumber: string;
    sex: string;
    breed: string;
    relationship: string;
    action: "create" | "link" | "skip";
  }>;
}

export function ImportPedigreeDialog({
  open,
  onOpenChange,
  animalId,
  onSuccess,
}: ImportPedigreeDialogProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [step, setStep] = useState<"upload" | "preview" | "confirm">("upload");

  // Parse CSV mutation
  const parseMutation = useMutation({
    mutationFn: async (csvContent: string) => {
      // In a real implementation, this would call an API endpoint
      // For now, we'll do basic client-side parsing
      const lines = csvContent.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",");

      const rows = lines.slice(1).map((line) => {
        const values = line.split(",");
        return {
          name: values[0]?.trim() || "",
          registrationNumber: values[1]?.trim() || "",
          sex: values[2]?.trim() || "",
          breed: values[3]?.trim() || "",
          relationship: values[4]?.trim() || "",
          action: "create" as const,
        };
      });

      return {
        totalRows: rows.length,
        animalsToCreate: rows.filter((r) => r.action === "create").length,
        linksToUpdate: rows.length,
        warnings: [
          "This is a preview. No changes have been made yet.",
          "Duplicate animals will be skipped automatically.",
        ],
        rows: rows.slice(0, 10), // Show first 10 for preview
      };
    },
    onSuccess: (data) => {
      setPreview(data);
      setStep("preview");
    },
    onError: () => {
      toast({
        title: "Parse Failed",
        description: "Failed to parse CSV file. Please check the format.",
        variant: "destructive",
      });
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `/api/animals/${animalId}/pedigree/import`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to import pedigree");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Import Successful",
        description: "Pedigree data has been imported successfully",
      });
      onSuccess?.();
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Read and parse file
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        parseMutation.mutate(content);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setStep("upload");
    onOpenChange(false);
  };

  const handleConfirm = () => {
    importMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Pedigree from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import pedigree data. The file should include
            columns: name, registration_number, sex, breed, relationship.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Step 1: Upload */}
          {step === "upload" && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center hover:border-primary/40 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <Upload className="w-12 h-12 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Click to upload CSV file</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or drag and drop
                    </p>
                  </div>
                  <Badge variant="outline" className="mt-2">
                    .csv files only
                  </Badge>
                </label>
              </div>

              {parseMutation.isPending && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>Parsing CSV file...</AlertDescription>
                </Alert>
              )}

              {/* CSV Format Example */}
              <Card className="p-4 bg-muted/50">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Expected CSV Format
                </h4>
                <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
                  {`name,registration_number,sex,breed,relationship
Luna,REG-001,female,Border Collie,Subject
Bella,REG-002,female,Border Collie,Dam
Max,REG-003,male,German Shepherd,Sire`}
                </pre>
              </Card>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === "preview" && preview && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Total Rows</p>
                  <p className="text-2xl font-bold">{preview.totalRows}</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">To Create</p>
                  <p className="text-2xl font-bold text-chart-3">
                    {preview.animalsToCreate}
                  </p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Links</p>
                  <p className="text-2xl font-bold text-chart-4">
                    {preview.linksToUpdate}
                  </p>
                </Card>
              </div>

              {/* Warnings */}
              {preview.warnings.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {preview.warnings.map((warning, i) => (
                        <li key={i} className="text-sm">
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Preview Rows */}
              <div className="space-y-2">
                <h4 className="font-medium">Preview (first 10 rows)</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {preview.rows.map((row, i) => (
                    <Card key={i} className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{row.name}</p>
                            <Badge
                              variant="outline"
                              className={
                                row.sex === "male"
                                  ? "bg-blue-500/10 text-blue-700 border-blue-500/20"
                                  : "bg-pink-500/10 text-pink-700 border-pink-500/20"
                              }
                            >
                              {row.sex}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {row.breed} • {row.registrationNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {row.relationship}
                          </p>
                        </div>
                        <Badge
                          variant={
                            row.action === "create" ? "default" : "secondary"
                          }
                        >
                          {row.action}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>

          {step === "preview" && (
            <Button
              onClick={handleConfirm}
              disabled={importMutation.isPending}
              className="bg-gradient-brand hover:opacity-90 shadow-card"
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm Import
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
