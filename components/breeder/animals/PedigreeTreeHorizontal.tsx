"use client";

import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Edit2, Plus, Download, Loader2 } from "lucide-react";
import { EditParentsDialog } from "@/components/breeder/animals/EditParentsDialog";
import { AddPedigreeEntryDialog } from "@/components/breeder/animals/AddPedigreeEntryDialog";
import { PedigreeCertificatePDF } from "@/components/breeder/animals/PedigreeCertificatePDF";
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
}

export function PedigreeTreeHorizontal({ node, generations = 3, onUpdate }: PedigreeTreeHorizontalProps) {
  const { toast } = useToast();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [editingAnimal, setEditingAnimal] = useState<PedigreeNode | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addManualDialogOpen, setAddManualDialogOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [manualEntryConfig, setManualEntryConfig] = useState<{
    position: string;
    generation: number;
    label: string;
    requiredSex?: "male" | "female";
  } | null>(null);

  const handleEditClick = (animal: PedigreeNode | null | undefined) => {
    if (animal && !animal.isManualEntry) {
      setEditingAnimal(animal);
      setEditDialogOpen(true);
    }
  };

  const handleAddManualClick = (position: string, generation: number, label: string) => {
    // Determine required sex based on position
    const requiredSex = position.endsWith("dam") ? "female" : position.endsWith("sire") ? "male" : undefined;
    setManualEntryConfig({ position, generation, label, requiredSex });
    setAddManualDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setEditingAnimal(null);
    if (onUpdate) {
      onUpdate();
    }
  };

  const handleManualEntrySuccess = () => {
    setAddManualDialogOpen(false);
    setManualEntryConfig(null);
    if (onUpdate) {
      onUpdate();
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
          author: 'Animalytics',
          keywords: 'pedigree, certificate, breeding, genealogy',
          creator: 'Animalytics Professional Pedigree System',
        },
        {
          filename: `pedigree-${node.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`,
          quality: 2,
          orientation: 'landscape',
        }
      );

      toast({
        title: "PDF Generated",
        description: "Your pedigree certificate has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      {/* Certificate Header */}
      <div className="mb-8 border-b-2 border-primary/20 pb-6">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">Three Generation Pedigree</h1>
            <p className="text-muted-foreground">Certified Family Tree • Click any animal to edit parents</p>
          </div>
          <Button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="bg-gradient-brand hover:opacity-90"
            size="icon"
            title="Download PDF Certificate"
          >
            {isGeneratingPDF ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Horizontal Tree Layout */}
      <div className="relative min-w-[900px]">
        <div className="grid grid-cols-4 gap-4">
          {/* Generation 0 - Subject (Left) */}
          <div className="col-span-1 flex items-center">
            <PedigreeCard 
              animal={node} 
              generation={0} 
              position="subject" 
              onEdit={handleEditClick}
              onAddManual={handleAddManualClick}
            />
          </div>

          {/* Generation 1 - Parents */}
          <div className="col-span-1 flex flex-col justify-center gap-8">
            <div className="relative">
              <PedigreeCard animal={node.sire} generation={1} position="sire" label="SIRE" onEdit={handleEditClick} onAddManual={handleAddManualClick} />
              {/* Connecting line to subject */}
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            <div className="relative">
              <PedigreeCard animal={node.dam} generation={1} position="dam" label="DAM" onEdit={handleEditClick} onAddManual={handleAddManualClick} />
              {/* Connecting line to subject */}
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
          </div>

          {/* Generation 2 - Grandparents */}
          <div className="col-span-1 flex flex-col justify-center gap-4">
            {/* Sire's parents */}
            <div className="relative">
              <PedigreeCard animal={node.sire?.sire} generation={2} position="sire.sire" label="GRANDSIRE" onEdit={handleEditClick} onAddManual={handleAddManualClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            <div className="relative">
              <PedigreeCard animal={node.sire?.dam} generation={2} position="sire.dam" label="GRANDDAM" onEdit={handleEditClick} onAddManual={handleAddManualClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            {/* Dam's parents */}
            <div className="relative">
              <PedigreeCard animal={node.dam?.sire} generation={2} position="dam.sire" label="GRANDSIRE" onEdit={handleEditClick} onAddManual={handleAddManualClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            <div className="relative">
              <PedigreeCard animal={node.dam?.dam} generation={2} position="dam.dam" label="GRANDDAM" onEdit={handleEditClick} onAddManual={handleAddManualClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
          </div>

          {/* Generation 3 - Great Grandparents */}
          <div className="col-span-1 flex flex-col justify-center gap-2">
            {/* Sire's Sire's parents */}
            <div className="relative">
              <PedigreeCard animal={node.sire?.sire?.sire} generation={3} position="sire.sire.sire" compact onEdit={handleEditClick} onAddManual={handleAddManualClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            <div className="relative">
              <PedigreeCard animal={node.sire?.sire?.dam} generation={3} position="sire.sire.dam" compact onEdit={handleEditClick} onAddManual={handleAddManualClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            {/* Sire's Dam's parents */}
            <div className="relative">
              <PedigreeCard animal={node.sire?.dam?.sire} generation={3} position="sire.dam.sire" compact onEdit={handleEditClick} onAddManual={handleAddManualClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            <div className="relative">
              <PedigreeCard animal={node.sire?.dam?.dam} generation={3} position="sire.dam.dam" compact onEdit={handleEditClick} onAddManual={handleAddManualClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            {/* Dam's Sire's parents */}
            <div className="relative">
              <PedigreeCard animal={node.dam?.sire?.sire} generation={3} position="dam.sire.sire" compact onEdit={handleEditClick} onAddManual={handleAddManualClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            <div className="relative">
              <PedigreeCard animal={node.dam?.sire?.dam} generation={3} position="dam.sire.dam" compact onEdit={handleEditClick} onAddManual={handleAddManualClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            {/* Dam's Dam's parents */}
            <div className="relative">
              <PedigreeCard animal={node.dam?.dam?.sire} generation={3} position="dam.dam.sire" compact onEdit={handleEditClick} onAddManual={handleAddManualClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            <div className="relative">
              <PedigreeCard animal={node.dam?.dam?.dam} generation={3} position="dam.dam.dam" compact onEdit={handleEditClick} onAddManual={handleAddManualClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Footer */}
      <div className="mt-8 pt-6 border-t-2 border-primary/20 text-center text-sm text-muted-foreground">
        <p>Generated on {format(new Date(), 'MMMM dd, yyyy')}</p>
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
          onSuccess={handleManualEntrySuccess}
        />
      )}

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
// PEDIGREE CARD COMPONENT
// ============================================================================

interface PedigreeCardProps {
  animal: PedigreeNode | null | undefined;
  generation: number;
  position: string;
  label?: string;
  compact?: boolean;
  onEdit?: (animal: PedigreeNode | null | undefined) => void;
  onAddManual?: (position: string, generation: number, label: string) => void;
}

function PedigreeCard({ animal, generation, position, label, compact = false, onEdit, onAddManual }: PedigreeCardProps) {
  if (!animal) {
    return (
      <Card 
        className={cn(
          "border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10",
          compact ? "p-2 min-h-[60px]" : "p-3 min-h-[100px]",
          "flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
        )}
        onClick={() => onAddManual && onAddManual(position, generation, label || position)}
      >
        <Plus className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
        <p className="text-xs text-primary font-medium text-center">
          {compact ? "Add" : `Add ${label || "Parent"}`}
        </p>
      </Card>
    );
  }

  const sexColors = {
    male: "border-l-4 border-l-blue-500",
    female: "border-l-4 border-l-pink-500",
  };

  const sexIndicator = animal.sex
    ? sexColors[animal.sex as keyof typeof sexColors]
    : "";

  const canEdit = !animal.isManualEntry && onEdit;

  return (
    <Card
      className={cn(
        "transition-all duration-200 bg-surface border border-primary/10 relative group",
        compact ? "p-2" : "p-3",
        generation === 0 && "border-2 border-primary shadow-card",
        animal.isManualEntry && "border-dashed border-amber-500/40 bg-amber-50/5",
        canEdit && "cursor-pointer hover:shadow-lg hover:border-primary/30",
        sexIndicator
      )}
      onClick={() => canEdit && onEdit(animal)}
    >
      {/* Edit Button Overlay */}
      {canEdit && !compact && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
            <Edit2 className="w-3 h-3" />
          </div>
        </div>
      )}
      <div className={cn("space-y-1", compact && "space-y-0.5")}>
        {/* Label (DAM, SIRE, etc.) */}
        {label && !compact && (
          <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
            {label}
          </div>
        )}

        {/* Manual Entry Indicator */}
        {animal.isManualEntry && !compact && (
          <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/30 mb-1">
            External
          </Badge>
        )}
        
        {/* Registered Name (Primary - Bold) */}
        <div className={cn(
          "font-bold leading-tight",
          compact ? "text-xs line-clamp-1" : "text-sm line-clamp-2"
        )}>
          {animal.registeredName || animal.name}
        </div>
        
        {/* Call Name (Secondary - if different from registered name) */}
        {animal.registeredName && animal.registeredName !== animal.name && !compact && (
          <p className="text-[10px] text-muted-foreground leading-tight">
            Call name: {animal.name}
          </p>
        )}

        {/* Registration Number */}
        {animal.registrationNumber && (
          <p className={cn(
            "text-primary font-mono font-semibold",
            compact ? "text-[9px]" : "text-[10px]"
          )}>
            {animal.registrationNumber}
          </p>
        )}

        {/* Color */}
        {animal.color && !compact && (
          <p className="text-[10px] text-muted-foreground">
            Color: {animal.color}
          </p>
        )}

        {/* Date of Birth */}
        {animal.dateOfBirth && (
          <p className={cn(
            "text-muted-foreground",
            compact ? "text-[9px]" : "text-[10px]"
          )}>
            DOB: {format(new Date(animal.dateOfBirth), 'MM/dd/yyyy')}
          </p>
        )}
      </div>
    </Card>
  );
}
