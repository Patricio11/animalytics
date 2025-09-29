"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Activity, ChevronDown, ChevronUp } from "lucide-react";
import { Season } from "@/lib/mock-data/animal-profile-details";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { SeasonProgesteroneChart } from "./SeasonProgesteroneChart";

interface SeasonCardProps {
  season: Season;
  onEdit: (season: Season) => void;
  onDelete: (seasonId: string) => void;
}

export function SeasonCard({ season, onEdit, onDelete }: SeasonCardProps) {
  const [showChart, setShowChart] = useState(false);

  const getSeasonStatus = () => {
    if (!season.endDate) return { label: 'Active', color: 'bg-chart-3 text-white' };
    const daysSince = differenceInDays(new Date(), new Date(season.endDate));
    if (daysSince < 30) return { label: 'Recent', color: 'bg-chart-4 text-white' };
    return { label: 'Completed', color: 'bg-muted text-muted-foreground' };
  };

  const getDuration = () => {
    const start = new Date(season.startDate);
    const end = season.endDate ? new Date(season.endDate) : new Date();
    const days = differenceInDays(end, start);
    return days >= 0 ? `${days} days` : 'Invalid';
  };

  const hasProgesterone = season.progesteroneReadings && season.progesteroneReadings.length > 0;
  const status = getSeasonStatus();

  return (
    <Card className="shadow-card border-primary/10 hover:shadow-elevated transition-all duration-200">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="font-semibold text-foreground">
                {format(new Date(season.startDate), 'MMM dd, yyyy')}
                {season.endDate && ` - ${format(new Date(season.endDate), 'MMM dd, yyyy')}`}
              </div>
              <Badge className={cn(status.color)}>
                {status.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getDuration()}
              </Badge>
            </div>

            {season.notes && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {season.notes}
              </p>
            )}

            {hasProgesterone && (
              <div className="flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-primary font-medium">
                  {season.progesteroneReadings!.length} progesterone reading{season.progesteroneReadings!.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-primary/10"
              onClick={() => onEdit(season)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(season.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            {hasProgesterone && (
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-primary/10"
                onClick={() => setShowChart(!showChart)}
              >
                {showChart ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Progesterone Readings Grid (when not expanded) */}
        {hasProgesterone && !showChart && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-3 border-t border-primary/10">
            {season.progesteroneReadings!.map((reading, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-surface-secondary border border-primary/10"
              >
                <div className="text-xs text-muted-foreground mb-1">
                  {format(new Date(reading.date), 'MMM dd')}
                </div>
                <div className="flex items-baseline gap-1">
                  <div className="text-lg font-bold text-chart-3">
                    {reading.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {reading.unit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Progesterone Chart (when expanded) */}
        {hasProgesterone && showChart && (
          <div className="pt-4 border-t border-primary/10">
            <SeasonProgesteroneChart readings={season.progesteroneReadings!} />
          </div>
        )}

        {/* Empty Progesterone State */}
        {!hasProgesterone && (
          <div className="pt-3 border-t border-primary/10">
            <p className="text-sm text-muted-foreground text-center py-2">
              No progesterone readings recorded for this cycle
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}