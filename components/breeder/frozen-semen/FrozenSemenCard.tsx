"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FrozenSemenBatch } from "@/lib/types/frozen-semen";
import { getStatusLabel, getStatusColor } from "@/lib/mock-data/frozen-semen";
import { Calendar, Building2, Package, Beaker, Eye, Edit } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface FrozenSemenCardProps {
  batch: FrozenSemenBatch;
  onEdit?: (batchId: string) => void;
}

export function FrozenSemenCard({ batch, onEdit }: FrozenSemenCardProps) {
  const utilisationPercent = Math.round(
    ((batch.numberOfStraws - batch.strawsRemaining) / batch.numberOfStraws) * 100
  );

  return (
    <Card className="shadow-card border-0 hover:shadow-elevated transition-all duration-200 bg-surface">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-brand flex items-center justify-center">
                <span className="text-2xl">❄️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{batch.batchIdentifier}</h3>
                <p className="text-sm text-muted-foreground">{batch.sourceAnimalName} - {batch.breed}</p>
              </div>
            </div>
          </div>
          <Badge className={cn(getStatusColor(batch.status), "shadow-card")}>
            {getStatusLabel(batch.status)}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Straws Remaining</div>
            <div className="text-2xl font-bold text-foreground">
              {batch.strawsRemaining}
              <span className="text-sm text-muted-foreground font-normal"> / {batch.numberOfStraws}</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-surface-secondary rounded-full h-2 overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  batch.strawsRemaining === 0
                    ? "bg-muted"
                    : batch.strawsRemaining <= 3
                    ? "bg-destructive"
                    : batch.strawsRemaining <= 5
                    ? "bg-chart-2"
                    : "bg-chart-3"
                )}
                style={{ width: `${(batch.strawsRemaining / batch.numberOfStraws) * 100}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {utilisationPercent}% utilized
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Quality</div>
            <div className="text-lg font-semibold text-foreground capitalize">
              {batch.semenAssessment?.quality || 'Not assessed'}
            </div>
            {batch.semenAssessment && (
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">
                  {batch.semenAssessment.motility}% motility
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Collected:</span>
            <span className="font-medium text-foreground">
              {format(new Date(batch.collectionDate), 'MMM dd, yyyy')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="w-4 h-4" />
            <span>Clinic:</span>
            <span className="font-medium text-foreground">{batch.clinicName}</span>
          </div>

          {batch.registrationNumber && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Beaker className="w-4 h-4" />
              <span>Registration:</span>
              <span className="font-medium text-foreground">{batch.registrationNumber}</span>
            </div>
          )}

          {batch.usageHistory && batch.usageHistory.length > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="w-4 h-4" />
              <span>Used in:</span>
              <span className="font-medium text-foreground">
                {batch.usageHistory.length} {batch.usageHistory.length === 1 ? 'breeding' : 'breedings'}
              </span>
            </div>
          )}
        </div>

        {/* Storage Notes */}
        {batch.storageNotes && (
          <div className="p-3 rounded-lg bg-surface-secondary border border-primary/10">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {batch.storageNotes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            asChild
            className="flex-1 bg-gradient-brand hover:opacity-90 shadow-card"
          >
            <Link href={`/frozen-semen/${batch.id}`}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Link>
          </Button>
          {onEdit && (
            <Button
              variant="outline"
              size="icon"
              className="hover:bg-primary/10 hover:border-primary shadow-card"
              onClick={() => onEdit(batch.id)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}