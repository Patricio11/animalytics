"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Activity, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { Season } from "@/lib/mock-data/animal-profile-details";
import { format, differenceInDays } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SeasonsTabProps {
  animalId: string;
  seasons: Season[];
}

export function SeasonsTab({ animalId, seasons }: SeasonsTabProps) {
  const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set());

  const sortedSeasons = [...seasons].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const toggleSeason = (seasonId: string) => {
    setExpandedSeasons((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(seasonId)) {
        newSet.delete(seasonId);
      } else {
        newSet.add(seasonId);
      }
      return newSet;
    });
  };

  const getSeasonDuration = (season: Season) => {
    if (!season.endDate) return 'Ongoing';
    const days = differenceInDays(new Date(season.endDate), new Date(season.startDate));
    return `${days} days`;
  };

  const getSeasonStatus = (season: Season) => {
    if (!season.endDate) return { label: 'Active', color: 'bg-chart-3 text-white' };
    const daysSince = differenceInDays(new Date(), new Date(season.endDate));
    if (daysSince < 30) return { label: 'Recent', color: 'bg-chart-4 text-white' };
    return { label: 'Completed', color: 'bg-muted text-muted-foreground' };
  };

  // Calculate average cycle length
  const completedSeasons = seasons.filter(s => s.endDate);
  const avgCycleLength = completedSeasons.length > 0
    ? Math.round(
        completedSeasons.reduce((sum, s) => {
          return sum + differenceInDays(new Date(s.endDate!), new Date(s.startDate));
        }, 0) / completedSeasons.length
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      {seasons.length > 0 && (
        <Card className="shadow-card border-primary/10 bg-gradient-subtle">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">{seasons.length}</div>
                <div className="text-sm text-muted-foreground">Total Seasons</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-chart-3">{avgCycleLength}</div>
                <div className="text-sm text-muted-foreground">Avg Cycle (days)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-chart-4">
                  {seasons[0]?.startDate ? format(new Date(seasons[0].startDate), 'MMM yyyy') : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Last Season</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {seasons.filter(s => !s.endDate).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Now</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Heat Cycles List */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Heat Cycles
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-primary/10 hover:border-primary"
            >
              <Plus className="w-3 h-3 mr-2" />
              Record New Season
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sortedSeasons.length > 0 ? (
            <div className="space-y-3">
              {sortedSeasons.map((season) => {
                const status = getSeasonStatus(season);
                const duration = getSeasonDuration(season);
                const isExpanded = expandedSeasons.has(season.id);
                const hasProgesterone = season.progesteroneReadings && season.progesteroneReadings.length > 0;

                return (
                  <div
                    key={season.id}
                    className="rounded-lg border border-primary/10 bg-background hover:shadow-card transition-all duration-200"
                  >
                    {/* Season Header */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="font-semibold text-foreground">
                              {format(new Date(season.startDate), 'MMM dd, yyyy')}
                              {season.endDate && ` - ${format(new Date(season.endDate), 'MMM dd, yyyy')}`}
                            </div>
                            <Badge className={cn(status.color)}>
                              {status.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {duration}
                            </Badge>
                          </div>

                          {season.notes && (
                            <p className="text-sm text-muted-foreground">{season.notes}</p>
                          )}

                          {hasProgesterone && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-primary">
                              <Activity className="w-4 h-4" />
                              <span>{season.progesteroneReadings!.length} progesterone readings</span>
                            </div>
                          )}
                        </div>

                        {hasProgesterone && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSeason(season.id)}
                            className="hover:bg-primary/10"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Progesterone Readings (Expandable) */}
                    {hasProgesterone && isExpanded && (
                      <div className="px-4 pb-4 border-t border-primary/10 bg-surface-secondary/50">
                        <div className="pt-4 space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <TrendingUp className="w-4 h-4 text-chart-3" />
                            Progesterone Readings
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {season.progesteroneReadings!.map((reading, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-lg bg-background border border-primary/10"
                              >
                                <div className="text-xs text-muted-foreground mb-1">
                                  {format(new Date(reading.date), 'MMM dd, yyyy')}
                                </div>
                                <div className="flex items-baseline gap-2">
                                  <div className="text-xl font-bold text-chart-3">
                                    {reading.value}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {reading.unit}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-primary/20 rounded-lg">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No heat cycles recorded yet</p>
              <Button variant="outline" className="hover:bg-primary/10 hover:border-primary">
                <Plus className="w-4 h-4 mr-2" />
                Record First Season
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracking Info */}
      <Card className="shadow-card border-primary/10 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm">
              <strong className="text-foreground">Season Tracking:</strong>
              <span className="text-muted-foreground"> Recording heat cycles helps predict future seasons and optimal breeding times. Progesterone readings from the mating calculator are automatically linked here.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}