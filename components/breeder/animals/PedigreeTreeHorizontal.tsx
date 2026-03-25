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

interface PedigreeTreeHorizontalProps {
  node: PedigreeNode;
  generations?: number;
  onUpdate?: () => void;
  isOwner?: boolean;
}

export function PedigreeTreeHorizontal({ node, generations = 3, onUpdate, isOwner = true }: PedigreeTreeHorizontalProps) {
  const { toast } = useToast();
  const pdfRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const [editingAnimal, setEditingAnimal] = useState<PedigreeNode | null>(null);
  const [editPosition, setEditPosition] = useState<'sire' | 'dam' | undefined>(undefined);
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

  // Calculate horizontal connecting lines between parent-child cards
  const calculateLines = useCallback(() => {
    if (!treeRef.current) return;
    const container = treeRef.current;
    const containerRect = container.getBoundingClientRect();
    const newLines: { x1: number; y1: number; x2: number; y2: number }[] = [];

    const pairs: [string, string, string][] = [];
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
        // Connect from the RIGHT edge center of parent
        const px = parentRect.right - containerRect.left;
        const py = parentRect.top + parentRect.height / 2 - containerRect.top;

        for (const childEl of [sireEl, damEl]) {
          if (childEl) {
            const childRect = childEl.getBoundingClientRect();
            // Connect to the LEFT edge center of child
            const cx = childRect.left - containerRect.left;
            const cy = childRect.top + childRect.height / 2 - containerRect.top;
            newLines.push({ x1: px, y1: py, x2: cx, y2: cy });
          }
        }
      }
    }

    setLines(newLines);
  }, [generations]);

  useEffect(() => {
    const timer = setTimeout(calculateLines, 100);
    window.addEventListener("resize", calculateLines);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateLines);
    };
  }, [calculateLines, node]);

  // Handlers
  const handleEditClick = (animal: PedigreeNode | null | undefined, position?: string, generation?: number) => {
    if (animal && !animal.isManualEntry) {
      if (generation === 1 && (position === 'sire' || position === 'dam')) {
        // For direct parents: edit who fills that position for the ROOT animal
        setEditingAnimal(node);
        setEditPosition(position);
      } else {
        // For grandparents+: edit that ancestor's own parents (deep tree editing)
        setEditingAnimal(animal);
        setEditPosition(undefined);
      }
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
    setEditPosition(undefined);
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

  // Build columns for horizontal layout (left to right: subject -> parents -> grandparents -> great-grandparents)
  type ColItem = {
    animal: PedigreeNode | null;
    path: string;
    position: string;
    label: string;
    generation: number;
  };

  const buildColumns = (root: PedigreeNode, maxGens: number): ColItem[][] => {
    const cols: ColItem[][] = [];

    for (let gen = 0; gen < maxGens; gen++) {
      if (gen === 0) {
        cols.push([{ animal: root, path: "subject", position: "subject", label: "Subject", generation: 0 }]);
      } else {
        const prevCol = cols[gen - 1];
        const currentCol: ColItem[] = [];

        for (const item of prevCol) {
          const sirePath = item.path === "subject" ? "sire" : `${item.position}.sire`;
          const damPath = item.path === "subject" ? "dam" : `${item.position}.dam`;

          const sireLabel = gen === 1 ? "Sire" : gen === 2 ? "G.Sire" : "GG.Sire";
          const damLabel = gen === 1 ? "Dam" : gen === 2 ? "G.Dam" : "GG.Dam";

          currentCol.push({
            animal: item.animal?.sire ?? null,
            path: sirePath,
            position: sirePath,
            label: sireLabel,
            generation: gen,
          });
          currentCol.push({
            animal: item.animal?.dam ?? null,
            path: damPath,
            position: damPath,
            label: damLabel,
            generation: gen,
          });
        }

        cols.push(currentCol);
      }
    }

    return cols;
  };

  const columns = buildColumns(node, generations);
  const genLabels = ["Subject", "Parents", "Grandparents", "Great-Grandparents"];

  return (
    <div className="w-full">
      {/* Certificate Header */}
      <div className="mb-6 border-b-2 border-primary/20 pb-4">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-foreground mb-1">Four Generation Pedigree</h1>
            <p className="text-sm text-muted-foreground">Certified Family Tree</p>
          </div>
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
      </div>

      {/* Scrollable Tree Container */}
      <div className="relative w-full overflow-hidden">
        <div className="overflow-x-auto pb-6">
          <div ref={treeRef} className="relative min-w-[1200px]">
            {/* SVG Connector Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <linearGradient id="hLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              {lines.map((line, i) => {
                // Horizontal stepped path: right from parent, then vertical, then right to child
                const midX = line.x1 + (line.x2 - line.x1) * 0.5;
                return (
                  <path
                    key={i}
                    d={`M ${line.x1} ${line.y1} L ${midX} ${line.y1} L ${midX} ${line.y2} L ${line.x2} ${line.y2}`}
                    fill="none"
                    stroke="url(#hLineGradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>

            {/* Horizontal Grid: columns left to right */}
            <div className="relative z-10 flex items-stretch gap-6">
              {columns.map((col, colIdx) => (
                <div
                  key={colIdx}
                  className={cn(
                    "flex flex-col justify-center",
                    colIdx === 0 && "w-56 flex-shrink-0",
                    colIdx === 1 && "w-52 flex-shrink-0",
                    colIdx === 2 && "w-44 flex-shrink-0",
                    colIdx >= 3 && "w-40 flex-shrink-0"
                  )}
                >
                  {/* Generation column label */}
                  <div className="flex items-center justify-center mb-3">
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full whitespace-nowrap",
                        colIdx === 0
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-muted/60 text-muted-foreground border border-border/50"
                      )}
                    >
                      {genLabels[colIdx] || `Gen ${colIdx}`}
                    </span>
                  </div>

                  {/* Cards in this column, grouped in pairs for gen >= 2 */}
                  <div className={cn(
                    "flex flex-col justify-center flex-1",
                    colIdx === 0 && "gap-4",
                    colIdx === 1 && "gap-6",
                    colIdx >= 2 && "gap-2"
                  )}>
                    {(() => {
                      if (colIdx >= 2) {
                        // Group in pairs
                        const groups: typeof col[] = [];
                        for (let i = 0; i < col.length; i += 2) {
                          groups.push(col.slice(i, i + 2));
                        }
                        return groups.map((pair, groupIdx) => (
                          <div key={groupIdx} className={cn("flex flex-col gap-1.5", colIdx === 2 && "mb-2 last:mb-0")}>
                            {pair.map((item) => (
                              <div
                                key={item.path}
                                ref={(el) => registerCardRef(item.path === "subject" ? "subject" : item.position, el)}
                              >
                                <HCard
                                  animal={item.animal}
                                  generation={colIdx}
                                  position={item.position}
                                  label={item.label}
                                  compact={colIdx >= 3}
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
                      // Gen 0, 1 - no grouping
                      return col.map((item) => (
                        <div
                          key={item.path}
                          ref={(el) => registerCardRef(item.path === "subject" ? "subject" : item.position, el)}
                        >
                          <HCard
                            animal={item.animal}
                            generation={colIdx}
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

      {/* Certificate Footer */}
      <div className="mt-6 pt-4 border-t-2 border-primary/20 text-center text-sm text-muted-foreground">
        <p>Generated on {format(new Date(), "MMMM dd, yyyy")}</p>
      </div>

      {/* Edit Parents Dialog */}
      {editingAnimal && (
        <EditParentsDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          animalId={editingAnimal.id}
          animalName={editingAnimal.name}
          currentSireId={editingAnimal.sire?.isManualEntry ? undefined : editingAnimal.sire?.id}
          currentDamId={editingAnimal.dam?.isManualEntry ? undefined : editingAnimal.dam?.id}
          manualSire={editingAnimal.sire?.isManualEntry ? editingAnimal.sire : undefined}
          manualDam={editingAnimal.dam?.isManualEntry ? editingAnimal.dam : undefined}
          editPosition={editPosition}
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
// HORIZONTAL CARD COMPONENT - Matches the vertical tree card style
// ============================================================================

interface HCardProps {
  animal: PedigreeNode | null;
  isOwner?: boolean;
  generation: number;
  position: string;
  label?: string;
  compact?: boolean;
  onEdit?: (animal: PedigreeNode | null | undefined, position: string, generation: number) => void;
  onAddManual?: (position: string, generation: number, label: string) => void;
  onEditManual?: (animal: PedigreeNode, position: string, generation: number, label: string) => void;
  onDelete?: (animalId: string, entryId: string, name: string) => void;
  onCardClick?: (animal: PedigreeNode | null | undefined) => void;
  subjectId?: string;
}

function HCard({
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
}: HCardProps) {
  // Empty slot
  if (!animal) {
    if (!isOwner) {
      return (
        <div
          className={cn(
            "rounded-xl border-2 border-dashed border-muted-foreground/15 bg-muted/10",
            "flex flex-col items-center justify-center text-center",
            compact ? "p-2 min-h-[56px]" : "p-3 min-h-[80px]"
          )}
        >
          <div className="w-7 h-7 rounded-full bg-muted/30 flex items-center justify-center mb-0.5">
            <span className="text-muted-foreground/40 text-sm">?</span>
          </div>
          <p className="text-[9px] text-muted-foreground/50 font-medium">{label || "Unknown"}</p>
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
          compact ? "p-2 min-h-[56px]" : "p-3 min-h-[80px]"
        )}
        onClick={() => onAddManual?.(position, generation, label || position)}
      >
        <div
          className={cn(
            "rounded-full bg-primary/10 flex items-center justify-center mb-1",
            "group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-200",
            compact ? "w-6 h-6" : "w-8 h-8"
          )}
        >
          <Plus className={cn("text-primary", compact ? "w-3 h-3" : "w-4 h-4")} />
        </div>
        <p className={cn("text-primary font-medium", compact ? "text-[8px]" : "text-[10px]")}>
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
    if (canEditSystem) onEdit(animal, position, generation);
    else if (canEditManual) onEditManual(animal, position, generation, label || position);
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground transition-all duration-200",
        "cursor-pointer group relative overflow-hidden",
        "hover:shadow-elevated hover:-translate-y-0.5",
        isSubject && "border-2 border-primary shadow-card ring-2 ring-primary/10",
        !isSubject && isMale && "border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700",
        !isSubject && isFemale && "border-pink-200 dark:border-pink-800 hover:border-pink-300 dark:hover:border-pink-700",
        !isSubject && !isMale && !isFemale && "border-border hover:border-primary/30",
        animal.isManualEntry && "border-dashed border-amber-300 dark:border-amber-700",
        compact ? "p-2" : "p-2.5"
      )}
      onClick={handleClick}
    >
      {/* Left color accent bar */}
      <div
        className={cn(
          "absolute top-0 left-0 bottom-0 w-1 rounded-l-xl",
          isSubject && "bg-gradient-brand",
          !isSubject && isMale && "bg-gradient-to-b from-blue-400 to-blue-500",
          !isSubject && isFemale && "bg-gradient-to-b from-pink-400 to-pink-500",
          !isSubject && !isMale && !isFemale && "bg-gradient-to-b from-gray-300 to-gray-400",
          animal.isManualEntry && !isSubject && "bg-gradient-to-b from-amber-400 to-amber-500"
        )}
      />

      {/* Edit & Delete Buttons */}
      {canEdit && !compact && (
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1">
          <button
            className={cn(
              "rounded-full p-1 shadow-md cursor-pointer hover:scale-110 transition-transform",
              animal.isManualEntry
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            onClick={handleEditButtonClick}
            title="Edit"
          >
            <Edit2 className="w-2.5 h-2.5" />
          </button>
          {animal.isManualEntry && onDelete && subjectId && (
            <button
              className="rounded-full p-1 shadow-md cursor-pointer hover:scale-110 transition-transform bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(subjectId, animal.id, animal.registeredName || animal.name);
              }}
              title="Delete"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      )}

      <div className={cn("space-y-0.5 ml-1.5", compact && "space-y-0")}>
        {/* Role label + sex badge */}
        <div className="flex items-center justify-between gap-1">
          {label && position !== "subject" && (
            <span
              className={cn(
                "text-[8px] font-bold uppercase tracking-widest",
                isMale && "text-blue-500",
                isFemale && "text-pink-500",
                !isMale && !isFemale && "text-muted-foreground"
              )}
            >
              {label}
            </span>
          )}
          {isSubject && (
            <Badge className="bg-gradient-brand text-white border-0 text-[8px] px-1.5 py-0">
              Subject
            </Badge>
          )}
          {animal.sex && !compact && (
            <Badge
              variant="outline"
              className={cn(
                "text-[8px] px-1 py-0 font-medium border",
                isMale && "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
                isFemale && "bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-800"
              )}
            >
              {isMale ? "♂" : "♀"}
            </Badge>
          )}
        </div>

        {/* Manual Entry */}
        {animal.isManualEntry && !compact && (
          <Badge variant="outline" className="text-[8px] bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800 px-1 py-0">
            External
          </Badge>
        )}

        {/* Name */}
        <div
          className={cn(
            "font-bold leading-tight",
            isSubject ? "text-xs" : compact ? "text-[10px]" : "text-[11px]",
            compact ? "line-clamp-1" : "line-clamp-2"
          )}
        >
          {animal.registeredName || animal.name}
        </div>

        {/* Call name */}
        {animal.registeredName && animal.registeredName !== animal.name && !compact && (
          <p className="text-[9px] text-muted-foreground italic leading-tight">
            &ldquo;{animal.name}&rdquo;
          </p>
        )}

        {/* Registration Number */}
        {animal.registrationNumber && (
          <p className={cn("font-mono font-semibold text-primary/80", compact ? "text-[7px]" : "text-[9px]")}>
            {animal.registrationNumber}
          </p>
        )}

        {/* Details */}
        {!compact && (
          <>
            {animal.color && <p className="text-[9px] text-muted-foreground leading-tight">{animal.color}</p>}
            {animal.dateOfBirth && (
              <p className="text-[9px] text-muted-foreground">
                {format(new Date(animal.dateOfBirth), "MM/dd/yyyy")}
              </p>
            )}
          </>
        )}

        {compact && animal.dateOfBirth && (
          <p className="text-[7px] text-muted-foreground">
            {format(new Date(animal.dateOfBirth), "yyyy")}
          </p>
        )}
      </div>
    </div>
  );
}
