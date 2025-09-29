"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, FileText } from "lucide-react";
import { SemenAssessment } from "@/lib/mock-data/animal-profile-details";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SemenAssessmentCardProps {
  assessment: SemenAssessment;
  onEdit: (assessment: SemenAssessment) => void;
  onDelete: (assessmentId: string) => void;
}

export function SemenAssessmentCard({ assessment, onEdit, onDelete }: SemenAssessmentCardProps) {
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'bg-chart-3 text-white';
      case 'good':
        return 'bg-chart-4 text-white';
      case 'fair':
        return 'bg-chart-2 text-white';
      case 'poor':
        return 'bg-destructive text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getParameterStatus = (value: number, parameter: string) => {
    if (parameter === 'motility') {
      if (value >= 80) return { color: 'text-chart-3', label: 'Excellent' };
      if (value >= 70) return { color: 'text-chart-4', label: 'Good' };
      if (value >= 50) return { color: 'text-chart-2', label: 'Fair' };
      return { color: 'text-destructive', label: 'Poor' };
    }
    if (parameter === 'concentration') {
      if (value >= 500) return { color: 'text-chart-3', label: 'Excellent' };
      if (value >= 300) return { color: 'text-chart-4', label: 'Good' };
      if (value >= 200) return { color: 'text-chart-2', label: 'Fair' };
      return { color: 'text-destructive', label: 'Poor' };
    }
    if (parameter === 'morphology') {
      if (value >= 85) return { color: 'text-chart-3', label: 'Excellent' };
      if (value >= 80) return { color: 'text-chart-4', label: 'Good' };
      if (value >= 60) return { color: 'text-chart-2', label: 'Fair' };
      return { color: 'text-destructive', label: 'Poor' };
    }
    return { color: 'text-foreground', label: 'Normal' };
  };

  const isFullAssessment = assessment.volume > 0;
  const motilityStatus = getParameterStatus(assessment.motility, 'motility');
  const concentrationStatus = getParameterStatus(assessment.concentration, 'concentration');
  const morphologyStatus = getParameterStatus(assessment.morphology, 'morphology');

  return (
    <Card className="shadow-card border-primary/10 hover:shadow-elevated transition-all duration-200">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="font-semibold text-foreground">
                {format(new Date(assessment.date), 'MMM dd, yyyy')}
              </div>
              <Badge className={cn("capitalize", getQualityColor(assessment.quality))}>
                {assessment.quality}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {isFullAssessment ? 'Full Lab' : 'Visual'}
              </Badge>
            </div>
            {assessment.technician && (
              <div className="text-sm text-muted-foreground">
                By {assessment.technician}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-primary/10"
              onClick={() => onEdit(assessment)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(assessment.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Parameters Grid - Only for full assessments */}
        {isFullAssessment && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-surface-secondary border border-primary/10">
              <div className="text-xs text-muted-foreground mb-1">Volume</div>
              <div className="text-lg font-bold text-foreground">{assessment.volume} mL</div>
            </div>

            <div className="p-3 rounded-lg bg-surface-secondary border border-primary/10">
              <div className="text-xs text-muted-foreground mb-1">Concentration</div>
              <div className="flex items-baseline gap-1">
                <div className={cn("text-lg font-bold", concentrationStatus.color)}>
                  {assessment.concentration}
                </div>
                <div className="text-xs text-muted-foreground">M/mL</div>
              </div>
              <div className={cn("text-xs", concentrationStatus.color)}>
                {concentrationStatus.label}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-secondary border border-primary/10">
              <div className="text-xs text-muted-foreground mb-1">Motility</div>
              <div className="flex items-baseline gap-1">
                <div className={cn("text-lg font-bold", motilityStatus.color)}>
                  {assessment.motility}%
                </div>
              </div>
              <div className={cn("text-xs", motilityStatus.color)}>
                {motilityStatus.label}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-secondary border border-primary/10">
              <div className="text-xs text-muted-foreground mb-1">Morphology</div>
              <div className="flex items-baseline gap-1">
                <div className={cn("text-lg font-bold", morphologyStatus.color)}>
                  {assessment.morphology}%
                </div>
              </div>
              <div className={cn("text-xs", morphologyStatus.color)}>
                {morphologyStatus.label}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {assessment.notes && (
          <div className="pt-3 border-t border-primary/10">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Notes
            </div>
            <p className="text-sm text-foreground">{assessment.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}