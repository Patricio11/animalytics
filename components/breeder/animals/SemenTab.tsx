"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Microscope, TrendingUp, FileText } from "lucide-react";
import { SemenAssessment } from "@/lib/mock-data/animal-profile-details";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SemenTabProps {
  animalId: string;
  assessments: SemenAssessment[];
}

export function SemenTab({ animalId, assessments }: SemenTabProps) {
  const sortedAssessments = [...assessments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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

  // Calculate average quality over time
  const averageMotility = assessments.length > 0
    ? (assessments.reduce((sum, a) => sum + a.motility, 0) / assessments.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      {assessments.length > 0 && (
        <Card className="shadow-card border-primary/10 bg-gradient-subtle">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">{assessments.length}</div>
                <div className="text-sm text-muted-foreground">Total Assessments</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-chart-3">{averageMotility}%</div>
                <div className="text-sm text-muted-foreground">Avg Motility</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-chart-4">
                  {assessments[0]?.quality ? assessments[0].quality.charAt(0).toUpperCase() + assessments[0].quality.slice(1) : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Latest Quality</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {assessments[0]?.date ? format(new Date(assessments[0].date), 'MMM yyyy') : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Last Assessment</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessments List */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Microscope className="w-5 h-5 text-primary" />
              Semen Assessments
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-primary/10 hover:border-primary"
            >
              <Plus className="w-3 h-3 mr-2" />
              New Assessment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sortedAssessments.length > 0 ? (
            <div className="space-y-4">
              {sortedAssessments.map((assessment) => {
                const motilityStatus = getParameterStatus(assessment.motility, 'motility');
                const concentrationStatus = getParameterStatus(assessment.concentration, 'concentration');
                const morphologyStatus = getParameterStatus(assessment.morphology, 'morphology');

                return (
                  <div
                    key={assessment.id}
                    className="p-4 rounded-lg border border-primary/10 bg-background hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-semibold text-foreground">
                            {format(new Date(assessment.date), 'MMM dd, yyyy')}
                          </div>
                          <Badge className={cn("capitalize", getQualityColor(assessment.quality))}>
                            {assessment.quality}
                          </Badge>
                        </div>
                        {assessment.technician && (
                          <div className="text-sm text-muted-foreground">
                            By {assessment.technician}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                        <FileText className="w-4 h-4 mr-2" />
                        View Report
                      </Button>
                    </div>

                    {/* Parameters Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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

                    {/* Notes */}
                    {assessment.notes && (
                      <div className="pt-3 border-t border-primary/10">
                        <div className="text-xs text-muted-foreground mb-1">Notes</div>
                        <p className="text-sm text-foreground">{assessment.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-primary/20 rounded-lg">
              <Microscope className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No semen assessments recorded yet</p>
              <Button variant="outline" className="hover:bg-primary/10 hover:border-primary">
                <Plus className="w-4 h-4 mr-2" />
                Record First Assessment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quality Trend Info */}
      {assessments.length > 0 && (
        <Card className="shadow-card border-primary/10 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm">
                <strong className="text-foreground">Fertility Tracking:</strong>
                <span className="text-muted-foreground"> Regular semen assessments help track fertility over time and can be linked to mating calculations for accurate conception ratings.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}