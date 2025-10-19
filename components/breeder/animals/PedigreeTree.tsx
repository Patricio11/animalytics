"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PedigreeNode = {
  id: string;
  name: string;
  breed?: string | null;
  sex?: string | null;
  registrationNumber?: string | null;
  dateOfBirth?: string | null;
  color?: string | null;
  profileImageUrl?: string | null;
  dam?: PedigreeNode | null;
  sire?: PedigreeNode | null;
};

interface PedigreeTreeProps {
  node: PedigreeNode;
  generations?: number;
}

export function PedigreeTree({ node, generations = 4 }: PedigreeTreeProps) {
  // Build rows for each generation
  const buildGenerationRows = (root: PedigreeNode, maxGens: number) => {
    const rows: (PedigreeNode | null)[][] = [];

    for (let gen = 0; gen < maxGens; gen++) {
      if (gen === 0) {
        rows.push([root]);
      } else {
        const prevRow = rows[gen - 1];
        const currentRow: (PedigreeNode | null)[] = [];

        prevRow.forEach((node) => {
          if (node) {
            currentRow.push(node.dam ?? null);
            currentRow.push(node.sire ?? null);
          } else {
            currentRow.push(null);
            currentRow.push(null);
          }
        });

        rows.push(currentRow);
      }
    }

    return rows;
  };

  const rows = buildGenerationRows(node, generations);

  return (
    <div className="space-y-6">
      {rows.map((row, genIndex) => (
        <div key={genIndex} className="space-y-2">
          {/* Generation Label */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-primary/5 border-primary/20 text-primary"
            >
              Generation {genIndex}
            </Badge>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Nodes Grid */}
          <div
            className={cn(
              "grid gap-3",
              genIndex === 0 && "grid-cols-1",
              genIndex === 1 && "grid-cols-1 sm:grid-cols-2",
              genIndex === 2 && "grid-cols-2 sm:grid-cols-4",
              genIndex === 3 && "grid-cols-2 sm:grid-cols-4 md:grid-cols-8"
            )}
          >
            {row.map((animal, nodeIndex) => (
              <AnimalNode
                key={`${genIndex}-${nodeIndex}`}
                animal={animal}
                generation={genIndex}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// ANIMAL NODE COMPONENT
// ============================================================================

interface AnimalNodeProps {
  animal: PedigreeNode | null;
  generation: number;
}

function AnimalNode({ animal, generation }: AnimalNodeProps) {
  if (!animal) {
    return (
      <Card className="p-3 bg-muted/30 border-dashed border-muted-foreground/20 min-h-[100px] flex items-center justify-center">
        <p className="text-xs text-muted-foreground text-center">Unknown</p>
      </Card>
    );
  }

  const sexColors = {
    male: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    female: "bg-pink-500/10 text-pink-700 border-pink-500/20",
  };

  const sexColor = animal.sex
    ? sexColors[animal.sex as keyof typeof sexColors]
    : "bg-muted text-muted-foreground border-muted";

  return (
    <Card
      className={cn(
        "p-3 transition-all duration-200 hover:shadow-elevated hover:scale-[1.02] cursor-pointer",
        "bg-surface border-primary/10",
        generation === 0 && "border-2 border-primary shadow-card"
      )}
    >
      <div className="space-y-2">
        {/* Name */}
        <div className="font-semibold text-sm leading-tight line-clamp-1">
          {animal.name}
        </div>

        {/* Sex Badge */}
        {animal.sex && (
          <Badge
            variant="outline"
            className={cn("text-xs font-normal", sexColor)}
          >
            {animal.sex === "male" ? "♂ Male" : "♀ Female"}
          </Badge>
        )}

        {/* Breed */}
        {animal.breed && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {animal.breed}
          </p>
        )}

        {/* Registration Number */}
        {animal.registrationNumber && (
          <p className="text-xs text-muted-foreground font-mono">
            {animal.registrationNumber}
          </p>
        )}

        {/* Date of Birth */}
        {animal.dateOfBirth && (
          <p className="text-xs text-muted-foreground">
            Born: {new Date(animal.dateOfBirth).getFullYear()}
          </p>
        )}

        {/* Color */}
        {animal.color && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {animal.color}
          </p>
        )}
      </div>
    </Card>
  );
}
