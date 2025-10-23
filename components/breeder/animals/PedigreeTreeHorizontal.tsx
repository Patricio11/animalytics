"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Edit2, Plus } from "lucide-react";
import { EditParentsDialog } from "@/components/breeder/animals/EditParentsDialog";

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
  const [editingAnimal, setEditingAnimal] = useState<PedigreeNode | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditClick = (animal: PedigreeNode | null | undefined) => {
    if (animal && !animal.isManualEntry) {
      setEditingAnimal(animal);
      setEditDialogOpen(true);
    }
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setEditingAnimal(null);
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      {/* Certificate Header */}
      <div className="mb-8 text-center border-b-2 border-primary/20 pb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Three Generation Pedigree</h1>
        <p className="text-muted-foreground">Certified Family Tree • Click any animal to edit parents</p>
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
            />
          </div>

          {/* Generation 1 - Parents */}
          <div className="col-span-1 flex flex-col justify-center gap-8">
            <div className="relative">
              <PedigreeCard animal={node.dam} generation={1} position="dam" label="DAM" onEdit={handleEditClick} />
              {/* Connecting line to subject */}
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            <div className="relative">
              <PedigreeCard animal={node.sire} generation={1} position="sire" label="SIRE" onEdit={handleEditClick} />
              {/* Connecting line to subject */}
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
          </div>

          {/* Generation 2 - Grandparents */}
          <div className="col-span-1 flex flex-col justify-center gap-4">
            {/* Dam's parents */}
            <div className="relative">
              <PedigreeCard animal={node.dam?.dam} generation={2} position="granddam-dam" label="GRANDDAM" onEdit={handleEditClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            <div className="relative">
              <PedigreeCard animal={node.dam?.sire} generation={2} position="grandsire-dam" label="GRANDSIRE" onEdit={handleEditClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            {/* Sire's parents */}
            <div className="relative">
              <PedigreeCard animal={node.sire?.dam} generation={2} position="granddam-sire" label="GRANDDAM" onEdit={handleEditClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            <div className="relative">
              <PedigreeCard animal={node.sire?.sire} generation={2} position="grandsire-sire" label="GRANDSIRE" onEdit={handleEditClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
          </div>

          {/* Generation 3 - Great Grandparents */}
          <div className="col-span-1 flex flex-col justify-center gap-2">
            {/* Dam's Dam's parents */}
            <div className="relative">
              <PedigreeCard animal={node.dam?.dam?.dam} generation={3} position="ggd-dd" compact onEdit={handleEditClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            <div className="relative">
              <PedigreeCard animal={node.dam?.dam?.sire} generation={3} position="ggs-dd" compact onEdit={handleEditClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            {/* Dam's Sire's parents */}
            <div className="relative">
              <PedigreeCard animal={node.dam?.sire?.dam} generation={3} position="ggd-ds" compact onEdit={handleEditClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            <div className="relative">
              <PedigreeCard animal={node.dam?.sire?.sire} generation={3} position="ggs-ds" compact onEdit={handleEditClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            {/* Sire's Dam's parents */}
            <div className="relative">
              <PedigreeCard animal={node.sire?.dam?.dam} generation={3} position="ggd-sd" compact onEdit={handleEditClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            <div className="relative">
              <PedigreeCard animal={node.sire?.dam?.sire} generation={3} position="ggs-sd" compact onEdit={handleEditClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            {/* Sire's Sire's parents */}
            <div className="relative">
              <PedigreeCard animal={node.sire?.sire?.dam} generation={3} position="ggd-ss" compact onEdit={handleEditClick} />
              <div className="absolute right-full top-1/2 w-4 h-px bg-border" />
            </div>
            <div className="relative">
              <PedigreeCard animal={node.sire?.sire?.sire} generation={3} position="ggs-ss" compact onEdit={handleEditClick} />
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
}

function PedigreeCard({ animal, generation, position, label, compact = false, onEdit }: PedigreeCardProps) {
  if (!animal) {
    return (
      <Card className={cn(
        "border-dashed border-muted-foreground/20 bg-muted/10",
        compact ? "p-2 min-h-[60px]" : "p-3 min-h-[100px]",
        "flex items-center justify-center"
      )}>
        <p className="text-xs text-muted-foreground text-center">Unknown</p>
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
        
        {/* Name */}
        <div className={cn(
          "font-bold leading-tight line-clamp-1",
          compact ? "text-xs" : "text-sm"
        )}>
          {animal.name}
        </div>
        
        {/* Registered Name */}
        {animal.registeredName && !compact && (
          <p className="text-[10px] text-muted-foreground italic line-clamp-2 leading-tight" title={animal.registeredName}>
            {animal.registeredName}
          </p>
        )}

        {/* Registration Number */}
        {animal.registrationNumber && (
          <p className={cn(
            "text-muted-foreground font-mono",
            compact ? "text-[9px]" : "text-[10px]"
          )}>
            Reg: {animal.registrationNumber}
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
