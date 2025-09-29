"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Baby, Calendar, AlertCircle, CheckCircle2, Heart } from "lucide-react";
import { Litter } from "@/lib/mock-data/animal-profile-details";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

interface LitterDetailsTabProps {
  animalId: string;
  litters: Litter[];
}

export function LitterDetailsTab({ animalId, litters }: LitterDetailsTabProps) {
  const sortedLitters = [...litters].sort(
    (a, b) => new Date(b.matingDate).getTime() - new Date(a.matingDate).getTime()
  );

  const expectedLitters = litters.filter(l => l.status === 'expected');
  const whelpedLitters = litters.filter(l => l.status === 'whelped' || l.status === 'archived');
  const totalPuppies = whelpedLitters.reduce((sum, l) => sum + (l.puppyCount || 0), 0);
  const avgLitterSize = whelpedLitters.length > 0
    ? (totalPuppies / whelpedLitters.length).toFixed(1)
    : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'expected':
        return { label: 'Expected', color: 'bg-chart-2 text-white' };
      case 'whelped':
        return { label: 'Recently Whelped', color: 'bg-chart-3 text-white' };
      case 'archived':
        return { label: 'Archived', color: 'bg-muted text-muted-foreground' };
      default:
        return { label: status, color: 'bg-muted text-muted-foreground' };
    }
  };

  const getDaysUntilWhelping = (expectedDate: string) => {
    const days = differenceInDays(new Date(expectedDate), new Date());
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      {litters.length > 0 && (
        <Card className="shadow-card border-primary/10 bg-gradient-subtle">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">{litters.length}</div>
                <div className="text-sm text-muted-foreground">Total Litters</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-chart-3">{totalPuppies}</div>
                <div className="text-sm text-muted-foreground">Total Puppies</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-chart-4">{avgLitterSize}</div>
                <div className="text-sm text-muted-foreground">Avg Per Litter</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {litters.filter(l => !l.complications).length}
                </div>
                <div className="text-sm text-muted-foreground">No Complications</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Litters List */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Baby className="w-5 h-5 text-primary" />
              Litter History
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-primary/10 hover:border-primary"
            >
              <Plus className="w-3 h-3 mr-2" />
              Record New Litter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sortedLitters.length > 0 ? (
            <div className="space-y-4">
              {sortedLitters.map((litter) => {
                const statusBadge = getStatusBadge(litter.status);
                const isExpected = litter.status === 'expected';
                const daysUntil = isExpected ? getDaysUntilWhelping(litter.expectedWhelpingDate) : null;

                return (
                  <div
                    key={litter.id}
                    className="p-4 rounded-lg border border-primary/10 bg-background hover:shadow-card transition-all duration-200"
                  >
                    {/* Litter Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <div className="font-semibold text-foreground">
                            Mated {format(new Date(litter.matingDate), 'MMM dd, yyyy')}
                          </div>
                          <Badge className={cn(statusBadge.color)}>
                            {statusBadge.label}
                          </Badge>
                          {litter.complications && (
                            <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Complications
                            </Badge>
                          )}
                          {!litter.complications && !isExpected && (
                            <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/20">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Healthy
                            </Badge>
                          )}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Sire: <span className="font-medium text-foreground">{litter.sireName}</span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-primary/10"
                      >
                        View Details
                      </Button>
                    </div>

                    {/* Litter Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {isExpected ? (
                        <>
                          <div className="p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
                            <div className="text-xs text-muted-foreground mb-1">Expected Date</div>
                            <div className="font-semibold text-foreground">
                              {format(new Date(litter.expectedWhelpingDate), 'MMM dd, yyyy')}
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-chart-4/10 border border-chart-4/20">
                            <div className="text-xs text-muted-foreground mb-1">Time Until</div>
                            <div className="font-semibold text-foreground">{daysUntil}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          {litter.whelpingDate && (
                            <div className="p-3 rounded-lg bg-surface-secondary border border-primary/10">
                              <div className="text-xs text-muted-foreground mb-1">Whelped</div>
                              <div className="font-semibold text-foreground">
                                {format(new Date(litter.whelpingDate), 'MMM dd, yyyy')}
                              </div>
                            </div>
                          )}
                          {litter.puppyCount !== undefined && (
                            <div className="p-3 rounded-lg bg-chart-3/10 border border-chart-3/20">
                              <div className="text-xs text-muted-foreground mb-1">Puppies</div>
                              <div className="text-2xl font-bold text-chart-3">{litter.puppyCount}</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Puppies List (if available) */}
                    {litter.puppies && litter.puppies.length > 0 && (
                      <div className="pt-4 border-t border-primary/10">
                        <div className="text-sm font-medium text-foreground mb-3">Puppies</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {litter.puppies.map((puppy) => (
                            <div
                              key={puppy.id}
                              className="p-3 rounded-lg bg-surface-secondary border border-primary/10 flex items-center justify-between"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="font-medium text-foreground">
                                    {puppy.name || `Puppy #${puppy.id}`}
                                  </div>
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {puppy.sex}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {puppy.weight} kg • {puppy.color}
                                </div>
                              </div>
                              <Badge
                                className={cn(
                                  "capitalize text-xs",
                                  puppy.status === 'healthy' && "bg-chart-3/10 text-chart-3 border-chart-3/20",
                                  puppy.status === 'sold' && "bg-chart-4/10 text-chart-4 border-chart-4/20",
                                  puppy.status === 'retained' && "bg-primary/10 text-primary border-primary/20"
                                )}
                              >
                                {puppy.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Complications Notes */}
                    {litter.complications && litter.complicationNotes && (
                      <div className="pt-4 border-t border-primary/10 mt-4">
                        <div className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-destructive" />
                          Complications
                        </div>
                        <p className="text-sm text-muted-foreground">{litter.complicationNotes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-primary/20 rounded-lg">
              <Baby className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No litters recorded yet</p>
              <Button variant="outline" className="hover:bg-primary/10 hover:border-primary">
                <Plus className="w-4 h-4 mr-2" />
                Record First Litter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Litter Tracking Info */}
      <Card className="shadow-card border-primary/10 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm">
              <strong className="text-foreground">Litter Tracking:</strong>
              <span className="text-muted-foreground"> Comprehensive litter records help track breeding success rates and are automatically used in conception rating calculations for future matings.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}