"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Edit2, Plus, Download, Loader2, Trash2 } from "lucide-react";
import { EditParentsDialog } from "@/components/breeder/animals/EditParentsDialog";
import { AddPedigreeEntryDialog } from "@/components/breeder/animals/AddPedigreeEntryDialog";
import { PedigreeCertificatePDF } from "@/components/breeder/animals/PedigreeCertificatePDF";
import { PedigreeAnimalModal } from "@/components/breeder/animals/PedigreeAnimalModal";
import { generatePDFWithMetadata } from "@/lib/utils/pdf-generator";
import { useToast } from "@/hooks/use-toast";

type PedigreeNode = {
  id: string;
  name: string;
  registeredName?: string | null;
  breed?: string | null;
  sex?: string | null;
  registrationNumber?: string | null;
  dateOfBirth?: string | null;
  color?: string | null;
  profileImageUrl?: string | null;
  dam?: PedigreeNode | null;
  sire?: PedigreeNode | null;
  isManualEntry?: boolean;
};

interface PedigreeTreeProps {
  node: PedigreeNode;
  generations?: number;
  onUpdate?: () => void;
  isOwner?: boolean;
}

// ============================================================================
// MAIN TREE COMPONENT
// ============================================================================

export function PedigreeTree({ node, generations = 3, onUpdate, isOwner = true }: PedigreeTreeProps) {
  const { toast } = useToast();
  const pdfRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const [editingAnimal, setEditingAnimal] = useState<PedigreeNode | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addManualDialogOpen, setAddManualDialogOpen] = useState(false);
  const [viewingAnimal, setViewingAnimal] = useState<PedigreeNode | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<{ animalId: string; entryId: string; name: string } | null>(null);
  const [manualEntryConfig, setManualEntryConfig] = useState<{
    position: string;
    generation: number;
    label: string;
    requiredSex?: "male" | "female";
    existingEntry?: PedigreeNode;
  } | null>(null);

  // SVG line drawing
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const registerCardRef = useCallback((key: string, el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(key, el);
    } else {
      cardRefs.current.delete(key);
    }
  }, []);

  // Calculate connecting lines between parent-child cards
  const calculateLines = useCallback(() => {
    if (!treeRef.current) return;
    const container = treeRef.current;
    const containerRect = container.getBoundingClientRect();
    const newLines: { x1: number; y1: number; x2: number; y2: number }[] = [];

    // Build pairs: parent path -> [sire path, dam path]
    const pairs: [string, string, string][] = [];

    // Helper to build all parent-child pairs recursively
    const buildPairs = (nodePath: string, depth: number) => {
      if (depth >= generations - 1) return;
      const sirePath = nodePath ? `${nodePath}.sire` : "sire";
      const damPath = nodePath ? `${nodePath}.dam` : "dam";
      pairs.push([nodePath || "subject", sirePath, damPath]);
      buildPairs(sirePath, depth + 1);
      buildPairs(damPath, depth + 1);
    };
    buildPairs("", 0);

    for (const [parentPath, sirePath, damPath] of pairs) {
      const parentEl = cardRefs.current.get(parentPath);
      const sireEl = cardRefs.current.get(sirePath);
      const damEl = cardRefs.current.get(damPath);

      if (parentEl) {
        const parentRect = parentEl.getBoundingClientRect();
        const px = parentRect.left + parentRect.width / 2 - containerRect.left;
        const py = parentRect.bottom - containerRect.top;

        for (const childEl of [sireEl, damEl]) {
          if (childEl) {
            const childRect = childEl.getBoundingClientRect();
            const cx = childRect.left + childRect.width / 2 - containerRect.left;
            const cy = childRect.top - containerRect.top;
            newLines.push({ x1: px, y1: py, x2: cx, y2: cy });
          }
        }
      }
    }

    setLines(newLines);
  }, [generations]);

  useEffect(() => {
    // Calculate lines after render
    const timer = setTimeout(calculateLines, 100);
    window.addEventListener("resize", calculateLines);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateLines);
    };
  }, [calculateLines, node]);

  // Handlers
  const handleEditClick = (animal: PedigreeNode | null | undefined) => {
    if (animal && !animal.isManualEntry) {
      setEditingAnimal(animal);
      setEditDialogOpen(true);
    }
  };

  const handleCardClick = (animal: PedigreeNode | null | undefined) => {
    if (animal) {
      setViewingAnimal(animal);
      setViewModalOpen(true);
    }
  };

  const handleAddManualClick = (position: string, generation: number, label: string) => {
    const requiredSex = position.endsWith("dam") ? "female" : position.endsWith("sire") ? "male" : undefined;
    setManualEntryConfig({ position, generation, label, requiredSex });
    setAddManualDialogOpen(true);
  };

  const handleEditManualClick = (animal: PedigreeNode, position: string, generation: number, label: string) => {
    const requiredSex = position.endsWith("dam") ? "female" : position.endsWith("sire") ? "male" : undefined;
    setManualEntryConfig({ position, generation, label, requiredSex, existingEntry: animal });
    setAddManualDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setEditingAnimal(null);
    onUpdate?.();
  };

  const handleManualEntrySuccess = () => {
    setAddManualDialogOpen(false);
    setManualEntryConfig(null);
    onUpdate?.();
  };

  const handleDeleteClick = (animalId: string, entryId: string, name: string) => {
    setEntryToDelete({ animalId, entryId, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    try {
      const response = await fetch(`/api/animals/${entryToDelete.animalId}/pedigree/manual/${entryToDelete.entryId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete entry");
      toast({ title: "Entry Deleted", description: "Pedigree entry has been removed successfully" });
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
      onUpdate?.();
    } catch {
      toast({ title: "Error", description: "Failed to delete pedigree entry", variant: "destructive" });
    }
  };

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setIsGeneratingPDF(true);
    try {
      await generatePDFWithMetadata(
        pdfRef.current,
        {
          title: `Pedigree Certificate - ${node.name}`,
          subject: `Three Generation Pedigree for ${node.name}`,
          author: "Animalytics",
          keywords: "pedigree, certificate, breeding, genealogy",
          creator: "Animalytics Professional Pedigree System",
        },
        {
          filename: `pedigree-${node.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.pdf`,
          quality: 2,
          orientation: "landscape",
        }
      );
      toast({ title: "PDF Generated", description: "Your pedigree certificate has been downloaded successfully" });
    } catch {
      toast({ title: "Error", description: "Failed to generate PDF. Please try again.", variant: "destructive" });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Build generation rows from tree structure
  const buildRows = (root: PedigreeNode, maxGens: number) => {
    type RowItem = {
      animal: PedigreeNode | null;
      path: string;
      position: string; // "subject", "sire", "dam", "sire.sire", etc.
      label: string;
      generation: number;
    };

    const rows: RowItem[][] = [];

    for (let gen = 0; gen < maxGens; gen++) {
      if (gen === 0) {
        rows.push([{ animal: root, path: "subject", position: "subject", label: "Subject", generation: 0 }]);
      } else {
        const prevRow = rows[gen - 1];
        const currentRow: RowItem[] = [];

        for (const item of prevRow) {
          // Sire (father) first, then Dam (mother)
          const sirePath = item.path === "subject" ? "sire" : `${item.position}.sire`;
          const damPath = item.path === "subject" ? "dam" : `${item.position}.dam`;

          const sireAnimal = item.animal?.sire ?? null;
          const damAnimal = item.animal?.dam ?? null;

          const sireLabel = gen === 1 ? "Sire" : gen === 2 ? "G.Sire" : "GG.Sire";
          const damLabel = gen === 1 ? "Dam" : gen === 2 ? "G.Dam" : "GG.Dam";

          currentRow.push({
            animal: sireAnimal,
            path: sirePath,
            position: sirePath,
            label: sireLabel,
            generation: gen,
          });
          currentRow.push({
            animal: damAnimal,
            path: damPath,
            position: damPath,
            label: damLabel,
            generation: gen,
          });
        }

        rows.push(currentRow);
      }
    }

    return rows;
  };

  const rows = buildRows(node, generations);

  // Generation labels
  const genLabels = ["Subject", "Parents", "Grandparents", "Great-Grandparents", "GG-Grandparents"];

  return (
    <div className="w-full">
      {/* Download PDF button */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          variant="outline"
          size="sm"
          className="hover:bg-primary/10 hover:border-primary shadow-card"
        >
          {isGeneratingPDF ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {isGeneratingPDF ? "Generating..." : "Download PDF"}
        </Button>
      </div>

      {/* Scrollable Tree Container */}
      <div className="relative w-full overflow-hidden">
        <div className="overflow-x-auto pb-6">
          <div ref={treeRef} className="relative" style={{ minWidth: `${Math.max(900, generations >= 4 ? rows[rows.length - 1].length * 172 + (rows[rows.length - 1].length / 2 - 1) * 20 : 900)}px` }}>
            {/* SVG Connector Lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
            >
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            {lines.map((line, i) => {
              const midY = line.y1 + (line.y2 - line.y1) * 0.5;
              return (
                <path
                  key={i}
                  d={`M ${line.x1} ${line.y1} L ${line.x1} ${midY} L ${line.x2} ${midY} L ${line.x2} ${line.y2}`}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>

          {/* Generation Rows */}
          <div className="relative z-10 space-y-10">
            {rows.map((row, genIndex) => (
              <div key={genIndex} className="space-y-2">
                {/* Generation Label */}
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap",
                      genIndex === 0
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-muted/60 text-muted-foreground border border-border/50"
                    )}
                  >
                    {genLabels[genIndex] || `Gen ${genIndex}`}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>

                {/* Cards Row - grouped in pairs under each parent */}
                <div
                  className={cn(
                    "flex justify-center",
                    genIndex === 0 && "gap-4",
                    genIndex >= 1 && "gap-8"
                  )}
                >
                  {(() => {
                    // Group items in pairs (sire+dam from same parent) for gen >= 2
                    if (genIndex >= 2) {
                      const groups: typeof row[] = [];
                      for (let i = 0; i < row.length; i += 2) {
                        groups.push(row.slice(i, i + 2));
                      }
                      return groups.map((pair, groupIdx) => (
                        <div key={groupIdx} className="flex gap-3">
                          {pair.map((item) => (
                            <div
                              key={item.path}
                              ref={(el) => registerCardRef(item.path === "subject" ? "subject" : item.position, el)}
                              className={cn(
                                "flex-shrink-0",
                                genIndex === 2 && "w-44",
                                genIndex >= 3 && "w-40"
                              )}
                            >
                              <TreeCard
                                animal={item.animal}
                                generation={genIndex}
                                position={item.position}
                                label={item.label}
                                compact={genIndex >= 3}
                                isOwner={isOwner}
                                subjectId={node.id}
                                onEdit={handleEditClick}
                                onAddManual={handleAddManualClick}
                                onEditManual={handleEditManualClick}
                                onDelete={handleDeleteClick}
                                onCardClick={handleCardClick}
                              />
                            </div>
                          ))}
                        </div>
                      ));
                    }
                    // Gen 0 and 1: no grouping needed
                    return row.map((item) => (
                      <div
                        key={item.path}
                        ref={(el) => registerCardRef(item.path === "subject" ? "subject" : item.position, el)}
                        className={cn(
                          "flex-shrink-0",
                          genIndex === 0 && "w-64",
                          genIndex === 1 && "w-52"
                        )}
                      >
                        <TreeCard
                          animal={item.animal}
                          generation={genIndex}
                          position={item.position}
                          label={item.label}
                          compact={false}
                          isOwner={isOwner}
                          subjectId={node.id}
                          onEdit={handleEditClick}
                          onAddManual={handleAddManualClick}
                          onEditManual={handleEditManualClick}
                          onDelete={handleDeleteClick}
                          onCardClick={handleCardClick}
                        />
                      </div>
                    ));
                  })()}
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Parents Dialog */}
      {editingAnimal && (
        <EditParentsDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          animalId={editingAnimal.id}
          animalName={editingAnimal.name}
          currentDamId={editingAnimal.dam?.id}
          currentSireId={editingAnimal.sire?.id}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Add Pedigree Entry Dialog */}
      {manualEntryConfig && (
        <AddPedigreeEntryDialog
          open={addManualDialogOpen}
          onOpenChange={setAddManualDialogOpen}
          animalId={node.id}
          position={manualEntryConfig.position}
          generation={manualEntryConfig.generation}
          positionLabel={manualEntryConfig.label}
          requiredSex={manualEntryConfig.requiredSex}
          animalBreed={node.breed}
          existingEntry={manualEntryConfig.existingEntry}
          onSuccess={handleManualEntrySuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pedigree Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{entryToDelete?.name}</span> from
              the pedigree? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Animal Profile Modal */}
      <PedigreeAnimalModal
        animal={viewingAnimal}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        isOwner={isOwner}
        onEdit={
          viewingAnimal?.isManualEntry
            ? () => {
                setViewModalOpen(false);
                const position = "";
                const generation = 0;
                const label = viewingAnimal.name;
                handleEditManualClick(viewingAnimal, position, generation, label);
              }
            : undefined
        }
      />

      {/* Hidden PDF Component for Generation */}
      <div className="fixed left-[-9999px] top-0">
        <PedigreeCertificatePDF
          ref={pdfRef}
          node={node}
          generations={generations}
          breederName="Professional Breeder"
          breederKennel="Premium Kennel"
        />
      </div>
    </div>
  );
}

// ============================================================================
// TREE CARD COMPONENT - Beautiful individual animal card
// ============================================================================

interface TreeCardProps {
  animal: PedigreeNode | null;
  isOwner?: boolean;
  generation: number;
  position: string;
  label?: string;
  compact?: boolean;
  onEdit?: (animal: PedigreeNode | null | undefined) => void;
  onAddManual?: (position: string, generation: number, label: string) => void;
  onEditManual?: (animal: PedigreeNode, position: string, generation: number, label: string) => void;
  onDelete?: (animalId: string, entryId: string, name: string) => void;
  onCardClick?: (animal: PedigreeNode | null | undefined) => void;
  subjectId?: string;
}

function TreeCard({
  animal,
  generation,
  position,
  label,
  compact = false,
  onEdit,
  onAddManual,
  onEditManual,
  onDelete,
  onCardClick,
  subjectId,
  isOwner = true,
}: TreeCardProps) {
  // Empty slot
  if (!animal) {
    if (!isOwner) {
      return (
        <div
          className={cn(
            "rounded-xl border-2 border-dashed border-muted-foreground/15 bg-muted/10",
            "flex flex-col items-center justify-center text-center",
            compact ? "p-2 min-h-[72px]" : "p-4 min-h-[100px]"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center mb-1">
            <span className="text-muted-foreground/40 text-lg">?</span>
          </div>
          <p className="text-[10px] text-muted-foreground/50 font-medium">{label || "Unknown"}</p>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "rounded-xl border-2 border-dashed border-primary/25 bg-primary/[0.03]",
          "hover:bg-primary/[0.07] hover:border-primary/40",
          "flex flex-col items-center justify-center text-center cursor-pointer",
          "transition-all duration-200 group",
          compact ? "p-2 min-h-[72px]" : "p-4 min-h-[100px]"
        )}
        onClick={() => onAddManual?.(position, generation, label || position)}
      >
        <div
          className={cn(
            "rounded-full bg-primary/10 flex items-center justify-center mb-1.5",
            "group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-200",
            compact ? "w-7 h-7" : "w-9 h-9"
          )}
        >
          <Plus className={cn("text-primary", compact ? "w-3.5 h-3.5" : "w-4 h-4")} />
        </div>
        <p className={cn("text-primary font-medium", compact ? "text-[9px]" : "text-[11px]")}>
          Add {label || "Parent"}
        </p>
      </div>
    );
  }

  // Filled card
  const isMale = animal.sex === "male";
  const isFemale = animal.sex === "female";
  const isSubject = generation === 0;

  const canEditSystem = isOwner && !animal.isManualEntry && onEdit;
  const canEditManual = isOwner && animal.isManualEntry && onEditManual;
  const canEdit = canEditSystem || canEditManual;

  const handleClick = () => onCardClick?.(animal);
  const handleEditButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canEditSystem) onEdit(animal);
    else if (canEditManual) onEditManual(animal, position, generation, label || position);
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground transition-all duration-200",
        "cursor-pointer group relative overflow-hidden",
        "hover:shadow-elevated hover:-translate-y-0.5",
        // Subject card - prominent
        isSubject && "border-2 border-primary shadow-card ring-2 ring-primary/10",
        // Male/Female color coding
        !isSubject && isMale && "border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700",
        !isSubject && isFemale && "border-pink-200 dark:border-pink-800 hover:border-pink-300 dark:hover:border-pink-700",
        !isSubject && !isMale && !isFemale && "border-border hover:border-primary/30",
        // Manual entry
        animal.isManualEntry && "border-dashed border-amber-300 dark:border-amber-700",
        compact ? "p-2.5" : "p-3"
      )}
      onClick={handleClick}
    >
      {/* Top color accent bar */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 rounded-t-xl",
          isSubject && "bg-gradient-brand",
          !isSubject && isMale && "bg-gradient-to-r from-blue-400 to-blue-500",
          !isSubject && isFemale && "bg-gradient-to-r from-pink-400 to-pink-500",
          !isSubject && !isMale && !isFemale && "bg-gradient-to-r from-gray-300 to-gray-400",
          animal.isManualEntry && !isSubject && "bg-gradient-to-r from-amber-400 to-amber-500"
        )}
      />

      {/* Edit & Delete Buttons */}
      {canEdit && !compact && (
        <div className="absolute top-2.5 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1">
          <button
            className={cn(
              "rounded-full p-1.5 shadow-md cursor-pointer hover:scale-110 transition-transform",
              animal.isManualEntry
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            onClick={handleEditButtonClick}
            title="Edit"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          {animal.isManualEntry && onDelete && subjectId && (
            <button
              className="rounded-full p-1.5 shadow-md cursor-pointer hover:scale-110 transition-transform bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(subjectId, animal.id, animal.registeredName || animal.name);
              }}
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      <div className={cn("space-y-1.5 mt-1", compact && "space-y-0.5")}>
        {/* Role label + sex badge row */}
        <div className="flex items-center justify-between gap-1">
          {label && position !== "subject" && (
            <span
              className={cn(
                "text-[9px] font-bold uppercase tracking-widest",
                isMale && "text-blue-500",
                isFemale && "text-pink-500",
                !isMale && !isFemale && "text-muted-foreground"
              )}
            >
              {label}
            </span>
          )}
          {isSubject && (
            <Badge className="bg-gradient-brand text-white border-0 text-[9px] px-2 py-0">
              Subject
            </Badge>
          )}
          {animal.sex && !compact && (
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] px-1.5 py-0 font-medium border",
                isMale && "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
                isFemale && "bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-800"
              )}
            >
              {isMale ? "♂" : "♀"}
            </Badge>
          )}
        </div>

        {/* Manual Entry Indicator */}
        {animal.isManualEntry && !compact && (
          <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800 px-1.5 py-0">
            External
          </Badge>
        )}

        {/* Name */}
        <div
          className={cn(
            "font-bold leading-tight",
            isSubject ? "text-sm" : compact ? "text-[11px]" : "text-xs",
            compact ? "line-clamp-1" : "line-clamp-2"
          )}
        >
          {animal.registeredName || animal.name}
        </div>

        {/* Call name if different */}
        {animal.registeredName && animal.registeredName !== animal.name && !compact && (
          <p className="text-[10px] text-muted-foreground italic leading-tight">
            &ldquo;{animal.name}&rdquo;
          </p>
        )}

        {/* Registration Number */}
        {animal.registrationNumber && (
          <p
            className={cn(
              "font-mono font-semibold text-primary/80",
              compact ? "text-[8px]" : "text-[10px]"
            )}
          >
            {animal.registrationNumber}
          </p>
        )}

        {/* Details - hidden on compact */}
        {!compact && (
          <>
            {animal.color && (
              <p className="text-[10px] text-muted-foreground leading-tight">
                {animal.color}
              </p>
            )}
            {animal.dateOfBirth && (
              <p className="text-[10px] text-muted-foreground">
                {format(new Date(animal.dateOfBirth), "yyyy")}
              </p>
            )}
          </>
        )}

        {/* Compact: just show year */}
        {compact && animal.dateOfBirth && (
          <p className="text-[8px] text-muted-foreground">
            {format(new Date(animal.dateOfBirth), "yyyy")}
          </p>
        )}
      </div>
    </div>
  );
}
