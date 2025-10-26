"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Baby, Calendar, AlertCircle, Heart, FileText } from "lucide-react";
import type { Litter } from "@/lib/types/animal";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

interface LitterCardProps {
  litter: Litter;
  onEdit: (litter: Litter) => void;
  onDelete: (litterId: string) => void;
}

export function LitterCard({ litter, onEdit, onDelete }: LitterCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expected':
        return 'bg-chart-4 text-white';
      case 'whelped':
        return 'bg-chart-3 text-white';
      case 'archived':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'expected':
        return 'Expected';
      case 'whelped':
        return 'Whelped';
      case 'archived':
        return 'Archived';
      default:
        return status;
    }
  };

  // Calculate days until/since whelping
  const getDaysInfo = () => {
    if (litter.whelpingDate) {
      const daysSince = differenceInDays(new Date(), new Date(litter.whelpingDate));
      return {
        label: daysSince === 0 ? 'Whelped today' : `Whelped ${daysSince} days ago`,
        isUpcoming: false,
      };
    } else {
      const daysUntil = differenceInDays(new Date(litter.expectedWhelpingDate), new Date());
      if (daysUntil < 0) {
        return {
          label: `Overdue by ${Math.abs(daysUntil)} days`,
          isUpcoming: false,
        };
      }
      return {
        label: daysUntil === 0 ? 'Expected today!' : `${daysUntil} days until whelping`,
        isUpcoming: true,
      };
    }
  };

  // Calculate gestation days
  const getGestationDays = () => {
    const endDate = litter.whelpingDate ? new Date(litter.whelpingDate) : new Date();
    const startDate = new Date(litter.matingDate);
    return differenceInDays(endDate, startDate);
  };

  const daysInfo = getDaysInfo();
  const gestationDays = getGestationDays();
  const hasPuppyDetails = litter.puppies && litter.puppies.length > 0;

  return (
    <Card className="shadow-card border-primary/10 hover:shadow-elevated transition-all duration-200">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="font-semibold text-foreground">
                Sire: {litter.sireName}
              </div>
              <Badge className={cn("capitalize", getStatusColor(litter.status))}>
                {getStatusLabel(litter.status)}
              </Badge>
              {litter.status === 'expected' && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {daysInfo.label}
                </Badge>
              )}
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Mating: {format(new Date(litter.matingDate), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Baby className="w-4 h-4" />
                <span>
                  {litter.whelpingDate
                    ? `Whelped: ${format(new Date(litter.whelpingDate), 'MMM dd, yyyy')}`
                    : `Expected: ${format(new Date(litter.expectedWhelpingDate), 'MMM dd, yyyy')}`}
                </span>
              </div>
              {litter.whelpingDate && (
                <div className="flex items-center gap-2">
                  <span className="text-xs">
                    Gestation: {gestationDays} days
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-primary/10"
              onClick={() => onEdit(litter)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(litter.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Puppy Info Grid */}
        {(litter.puppyCount !== undefined || litter.survivingPuppies !== undefined) && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 pt-3 border-t border-primary/10">
            {litter.puppyCount !== undefined && (
              <div className="p-3 rounded-lg bg-surface-secondary border border-primary/10">
                <div className="text-xs text-muted-foreground mb-1">Total Puppies</div>
                <div className="text-2xl font-bold text-chart-3">{litter.puppyCount}</div>
              </div>
            )}

            {litter.survivingPuppies !== undefined && (
              <div className="p-3 rounded-lg bg-surface-secondary border border-primary/10">
                <div className="text-xs text-muted-foreground mb-1">Surviving</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-chart-4">{litter.survivingPuppies}</div>
                  {litter.puppyCount && litter.survivingPuppies === litter.puppyCount && (
                    <Heart className="w-4 h-4 text-chart-3 fill-chart-3" />
                  )}
                </div>
              </div>
            )}

            {hasPuppyDetails && (
              <div className="p-3 rounded-lg bg-surface-secondary border border-primary/10">
                <div className="text-xs text-muted-foreground mb-1">Detailed Records</div>
                <div className="text-2xl font-bold text-foreground">{litter.puppies!.length}</div>
              </div>
            )}
          </div>
        )}

        {/* Complications Alert */}
        {litter.complications && (
          <div className="mb-4 pt-3 border-t border-primary/10">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <strong className="text-destructive">Complications Reported</strong>
                {litter.complicationNotes && (
                  <p className="text-muted-foreground mt-1">{litter.complicationNotes}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {litter.notes && (
          <div className="pt-3 border-t border-primary/10">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Notes
            </div>
            <p className="text-sm text-foreground">{litter.notes}</p>
          </div>
        )}

        {/* Puppy Details Preview */}
        {hasPuppyDetails && (
          <div className="pt-3 border-t border-primary/10">
            <div className="text-xs text-muted-foreground mb-2">Puppy Details</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {litter.puppies!.map((puppy) => (
                <div
                  key={puppy.id}
                  className="p-2 rounded-lg bg-surface-secondary border border-primary/10"
                >
                  <div className="text-xs font-medium text-foreground">
                    {puppy.name || `Puppy #${puppy.id.slice(-1)}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {puppy.sex === 'male' ? '♂' : '♀'} {puppy.color}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {puppy.weight} kg
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs mt-1",
                      puppy.status === 'retained' && "bg-primary/10 text-primary border-primary/20",
                      puppy.status === 'sold' && "bg-chart-4/10 text-chart-4 border-chart-4/20"
                    )}
                  >
                    {puppy.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expected Litter Info */}
        {litter.status === 'expected' && !litter.whelpingDate && (
          <div className="mt-4 pt-3 border-t border-primary/10">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-chart-4/10 border border-chart-4/20">
              <Baby className="w-4 h-4 text-chart-4 mt-0.5" />
              <div className="text-sm text-foreground">
                <strong>Pregnancy in Progress</strong>
                <p className="text-muted-foreground text-xs mt-1">
                  Day {differenceInDays(new Date(), new Date(litter.matingDate))} of gestation • {daysInfo.label}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}