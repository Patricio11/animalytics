"use client";

import { useState, useCallback } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  AlertCircle,
  Camera,
  Upload,
  CheckCircle2,
  X,
  ImageIcon,
  FileText,
  Scan,
  Edit,
  Trash2,
  Save,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadMultipleFiles, STORAGE_PATHS, FILE_VALIDATION } from "@/lib/supabase";
import type { ExtractedPedigreeEntry } from "@/lib/services/pedigree-scanner";

interface ScanPedigreeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: string;
  animalName: string;
  animalBreed?: string | null;
  onSuccess?: () => void;
}

type Step = "upload" | "scanning" | "review" | "saving";

export function ScanPedigreeDialog({
  open,
  onOpenChange,
  animalId,
  animalName,
  animalBreed,
  onSuccess,
}: ScanPedigreeDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [entries, setEntries] = useState<ExtractedPedigreeEntry[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [scanMeta, setScanMeta] = useState<{
    animalName?: string;
    animalRegistration?: string;
    breedDetected?: string;
    issuingOrganization?: string;
    countryOfOrigin?: string;
    warnings: string[];
  }>({ warnings: [] });

  // Handle file selection (images + PDFs)
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((f) =>
      f.type.startsWith("image/") || f.type === "application/pdf"
    );

    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid file type",
        description: "Only images and PDF files are accepted.",
        variant: "destructive",
      });
    }

    if (validFiles.length + files.length > 4) {
      toast({
        title: "Too many files",
        description: "You can upload a maximum of 4 files.",
        variant: "destructive",
      });
      return;
    }

    setFiles((prev) => [...prev, ...validFiles]);

    // Generate previews (images get thumbnail, PDFs get placeholder)
    validFiles.forEach((file) => {
      if (file.type === "application/pdf") {
        setPreviews((prev) => [...prev, `pdf:${file.name}`]);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });
  }, [files.length, toast]);

  // Remove a file
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload files to Supabase, then scan with AI
  const scanMutation = useMutation({
    mutationFn: async () => {
      // Step 1: Upload files to Supabase (images use IMAGE validation, PDFs use DOCUMENT)
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      const pdfFiles = files.filter((f) => f.type === "application/pdf");

      const imageResults = imageFiles.length > 0
        ? await uploadMultipleFiles(imageFiles, STORAGE_PATHS.PEDIGREE_DOCUMENTS, FILE_VALIDATION.IMAGE)
        : [];
      const pdfResults = pdfFiles.length > 0
        ? await uploadMultipleFiles(pdfFiles, STORAGE_PATHS.PEDIGREE_DOCUMENTS, FILE_VALIDATION.DOCUMENT)
        : [];

      const successfulImages = imageResults.filter((r) => r.success && r.url);
      const successfulPdfs = pdfResults.filter((r) => r.success && r.url);

      if (successfulImages.length + successfulPdfs.length === 0) {
        throw new Error("Failed to upload files. Please try again.");
      }

      const imageUrls = successfulImages.map((r) => r.url!);
      const pdfUrls = successfulPdfs.map((r) => r.url!);
      setUploadedUrls([...imageUrls, ...pdfUrls]);

      // Step 2: Send to AI for scanning
      const response = await fetch(`/api/animals/${animalId}/pedigree/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrls, pdfUrls }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Scan failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.entries?.length > 0) {
        setEntries(data.entries);
        setScanMeta({
          animalName: data.animalName,
          animalRegistration: data.animalRegistration,
          breedDetected: data.breedDetected,
          issuingOrganization: data.issuingOrganization,
          countryOfOrigin: data.countryOfOrigin,
          warnings: data.warnings || [],
        });
        setStep("review");
        toast({
          title: "Scan complete!",
          description: `Found ${data.entries.length} ancestors in the pedigree.`,
        });
      } else {
        setStep("upload");
        toast({
          title: "No data found",
          description:
            data.warnings?.[0] ||
            "Could not extract pedigree data. Try clearer images.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      setStep("upload");
      toast({
        title: "Scan failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save extracted entries
  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/animals/${animalId}/pedigree/scan/save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entries: entries.map((e) => ({
              position: e.position,
              generation: e.generation,
              name: e.name,
              registeredName: e.registeredName,
              registrationNumber: e.registrationNumber,
              breed: e.breed,
              sex: e.sex,
              dateOfBirth: e.dateOfBirth,
              color: e.color,
              titles: e.titles,
            })),
            clearExisting: false,
            defaultBreed: animalBreed || undefined,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Save failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Pedigree saved!",
        description: data.message,
      });
      onSuccess?.();
      handleClose();
    },
    onError: (error: Error) => {
      setStep("review");
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Start scan
  const handleScan = () => {
    setStep("scanning");
    scanMutation.mutate();
  };

  // Save entries
  const handleSave = () => {
    setStep("saving");
    saveMutation.mutate();
  };

  // Update an entry
  const updateEntry = (index: number, updates: Partial<ExtractedPedigreeEntry>) => {
    setEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, ...updates } : entry))
    );
  };

  // Remove an entry
  const removeEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  // Reset and close
  const handleClose = () => {
    setStep("upload");
    setFiles([]);
    setPreviews([]);
    setUploadedUrls([]);
    setEntries([]);
    setEditingIndex(null);
    setScanMeta({ warnings: [] });
    onOpenChange(false);
  };

  // Get human-readable position label
  const getPositionLabel = (position: string): string => {
    const labels: Record<string, string> = {
      sire: "Sire (Father)",
      dam: "Dam (Mother)",
      "sire.sire": "Paternal Grandsire",
      "sire.dam": "Paternal Granddam",
      "dam.sire": "Maternal Grandsire",
      "dam.dam": "Maternal Granddam",
      "sire.sire.sire": "Pat. Great-Grandsire",
      "sire.sire.dam": "Pat. Great-Granddam",
      "sire.dam.sire": "Pat. Great-Grandsire",
      "sire.dam.dam": "Pat. Great-Granddam",
      "dam.sire.sire": "Mat. Great-Grandsire",
      "dam.sire.dam": "Mat. Great-Granddam",
      "dam.dam.sire": "Mat. Great-Grandsire",
      "dam.dam.dam": "Mat. Great-Granddam",
    };
    return labels[position] || position;
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-chart-3 text-white";
    if (confidence >= 50) return "bg-chart-2 text-white";
    return "bg-destructive text-white";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Pedigree Scanner
          </DialogTitle>
          <DialogDescription>
            Upload photos of the pedigree certificate for{" "}
            <strong>{animalName}</strong> and let AI extract the family tree
            automatically.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-2">
          {(["upload", "scanning", "review", "saving"] as Step[]).map(
            (s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step === s
                      ? "bg-primary text-primary-foreground"
                      : ["upload", "scanning", "review", "saving"].indexOf(step) > i
                      ? "bg-chart-3 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {["upload", "scanning", "review", "saving"].indexOf(step) >
                  i ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {s === "upload"
                    ? "Upload"
                    : s === "scanning"
                    ? "Scanning"
                    : s === "review"
                    ? "Review"
                    : "Save"}
                </span>
                {i < 3 && (
                  <div className="flex-1 h-0.5 bg-muted rounded" />
                )}
              </div>
            )
          )}
        </div>

        {/* STEP 1: Upload */}
        {step === "upload" && (
          <div className="space-y-4">
            <Alert>
              <Camera className="w-4 h-4" />
              <AlertDescription>
                Upload photos or a PDF of the pedigree certificate. For photos,
                ensure good lighting and readable text. You can upload up to 4
                files.
              </AlertDescription>
            </Alert>

            {/* Upload zone */}
            <div
              className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center hover:border-primary/40 transition-colors cursor-pointer"
              onClick={() =>
                document.getElementById("pedigree-scan-input")?.click()
              }
            >
              <input
                id="pedigree-scan-input"
                type="file"
                accept="image/*,application/pdf"
                multiple
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-foreground font-medium mb-1">
                Click to upload photos or a PDF
              </p>
              <p className="text-sm text-muted-foreground">
                JPG, PNG, WEBP or PDF • Up to 10MB each • Max 4 files
              </p>
            </div>

            {/* File previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden border border-primary/10"
                  >
                    {preview.startsWith("pdf:") ? (
                      <div className="w-full h-32 bg-surface-secondary flex flex-col items-center justify-center gap-2">
                        <FileText className="w-10 h-10 text-destructive" />
                        <span className="text-xs text-muted-foreground truncate px-2 max-w-full">
                          {preview.replace("pdf:", "")}
                        </span>
                      </div>
                    ) : (
                      <img
                        src={preview}
                        alt={`Certificate page ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2">
                      {preview.startsWith("pdf:") ? "PDF" : `Page ${index + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Scanning */}
        {step === "scanning" && (
          <div className="py-12 text-center space-y-6">
            <div className="relative mx-auto w-20 h-20">
              <Scan className="w-20 h-20 text-primary animate-pulse" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground mb-2">
                Analyzing pedigree certificate...
              </p>
              <p className="text-sm text-muted-foreground">
                AI is reading the document and extracting the family tree. This
                may take 10-30 seconds.
              </p>
            </div>
            <Progress value={undefined} className="w-64 mx-auto" />
          </div>
        )}

        {/* STEP 3: Review */}
        {step === "review" && (
          <div className="space-y-4">
            {/* Scan metadata */}
            {(scanMeta.breedDetected || scanMeta.issuingOrganization) && (
              <div className="flex flex-wrap gap-2">
                {scanMeta.breedDetected && (
                  <Badge variant="outline">
                    Breed: {scanMeta.breedDetected}
                  </Badge>
                )}
                {scanMeta.issuingOrganization && (
                  <Badge variant="outline">
                    Registry: {scanMeta.issuingOrganization}
                  </Badge>
                )}
                {scanMeta.countryOfOrigin && (
                  <Badge variant="outline">
                    Country: {scanMeta.countryOfOrigin}
                  </Badge>
                )}
                <Badge className="bg-chart-3 text-white">
                  {entries.length} ancestors found
                </Badge>
              </div>
            )}

            {/* Warnings */}
            {scanMeta.warnings.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  {scanMeta.warnings.map((w, i) => (
                    <p key={i}>{w}</p>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            {/* Entries table */}
            <ScrollArea className="h-[400px] rounded-lg border border-primary/10">
              <div className="space-y-2 p-3">
                {entries
                  .sort((a, b) => a.generation - b.generation || a.position.localeCompare(b.position))
                  .map((entry, index) => (
                    <Card
                      key={index}
                      className={`border-primary/10 ${
                        editingIndex === index
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                    >
                      <CardContent className="p-3">
                        {editingIndex === index ? (
                          /* Edit mode */
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary">
                                {getPositionLabel(entry.position)}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingIndex(null)}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Done
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="col-span-2 space-y-1">
                                <Label className="text-xs font-semibold">Registered Name *</Label>
                                <Input
                                  value={entry.registeredName || ""}
                                  onChange={(e) =>
                                    updateEntry(index, {
                                      registeredName: e.target.value,
                                      name: entry.name === entry.registeredName || !entry.name
                                        ? e.target.value
                                        : entry.name,
                                    })
                                  }
                                  className="h-8 text-sm"
                                  placeholder="Official registered name"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Call Name</Label>
                                <Input
                                  value={entry.name !== entry.registeredName ? entry.name : ""}
                                  onChange={(e) =>
                                    updateEntry(index, {
                                      name: e.target.value || entry.registeredName || "",
                                    })
                                  }
                                  className="h-8 text-sm"
                                  placeholder="Everyday name (optional)"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">
                                  Registration #
                                </Label>
                                <Input
                                  value={entry.registrationNumber || ""}
                                  onChange={(e) =>
                                    updateEntry(index, {
                                      registrationNumber: e.target.value,
                                    })
                                  }
                                  className="h-8 text-sm"
                                  placeholder="e.g., KUSA 12345"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Color</Label>
                                <Input
                                  value={entry.color || ""}
                                  onChange={(e) =>
                                    updateEntry(index, {
                                      color: e.target.value,
                                    })
                                  }
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">
                                  Titles (comma separated)
                                </Label>
                                <Input
                                  value={entry.titles?.join(", ") || ""}
                                  onChange={(e) =>
                                    updateEntry(index, {
                                      titles: e.target.value
                                        .split(",")
                                        .map((t) => t.trim())
                                        .filter(Boolean),
                                    })
                                  }
                                  className="h-8 text-sm"
                                  placeholder="Ch., GCh."
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Breed</Label>
                                <Input
                                  value={entry.breed || ""}
                                  onChange={(e) =>
                                    updateEntry(index, {
                                      breed: e.target.value,
                                    })
                                  }
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">
                                  Date of Birth
                                </Label>
                                <Input
                                  type="date"
                                  value={entry.dateOfBirth || ""}
                                  onChange={(e) =>
                                    updateEntry(index, {
                                      dateOfBirth: e.target.value,
                                    })
                                  }
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* View mode */
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge
                                  variant="secondary"
                                  className="text-xs shrink-0"
                                >
                                  Gen {entry.generation}
                                </Badge>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {getPositionLabel(entry.position)}
                                </span>
                                <Badge
                                  className={`text-xs ${getConfidenceColor(
                                    entry.confidence
                                  )}`}
                                >
                                  {entry.confidence}%
                                </Badge>
                              </div>
                              <p className="font-medium text-foreground mt-1 truncate">
                                {entry.titles?.length
                                  ? `${entry.titles.join(" ")} `
                                  : ""}
                                {entry.registeredName || entry.name}
                              </p>
                              {entry.registeredName && entry.name && entry.name !== entry.registeredName && (
                                <p className="text-[10px] text-muted-foreground">
                                  Call name: {entry.name}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                                {entry.registrationNumber && (
                                  <span>#{entry.registrationNumber}</span>
                                )}
                                {entry.color && <span>{entry.color}</span>}
                                {entry.breed && <span>{entry.breed}</span>}
                                {entry.dateOfBirth && (
                                  <span>DOB: {entry.dateOfBirth}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-7 h-7 hover:bg-primary/10"
                                onClick={() => setEditingIndex(index)}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-7 h-7 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => removeEntry(index)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* STEP 4: Saving */}
        {step === "saving" && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <p className="text-lg font-medium text-foreground">
              Saving pedigree data...
            </p>
            <p className="text-sm text-muted-foreground">
              Writing {entries.length} entries to the database.
            </p>
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="gap-2">
          {step === "upload" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleScan}
                disabled={files.length === 0}
                className="bg-gradient-brand hover:opacity-90 shadow-card"
              >
                <Scan className="w-4 h-4 mr-2" />
                Scan Pedigree ({files.length} file
                {files.length !== 1 ? "s" : ""})
              </Button>
            </>
          )}

          {step === "scanning" && (
            <Button
              variant="outline"
              onClick={() => {
                setStep("upload");
              }}
              disabled={scanMutation.isPending}
            >
              Cancel
            </Button>
          )}

          {step === "review" && (
            <>
              <Button
                variant="outline"
                onClick={() => setStep("upload")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Re-scan
              </Button>
              <Button
                onClick={handleSave}
                disabled={entries.length === 0}
                className="bg-gradient-brand hover:opacity-90 shadow-card"
              >
                <Save className="w-4 h-4 mr-2" />
                Save {entries.length} Entries
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
