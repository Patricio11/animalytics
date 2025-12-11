'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  Calendar,
  TrendingUp,
  Plus,
  ExternalLink,
  AlertCircle,
  Heart,
  Sparkles,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface ProgesteroneTabProps {
  animalId: string;
  animalName: string;
}

interface HeatCycle {
  id: string;
  startDate: string;
  endDate?: string;
  status: string;
  currentDay?: number;
  estimatedOvulationDay?: number;
  estimatedWhelpingDate?: string;
  breedingMethod?: string;
  readings?: Array<{
    id: string;
    day: number;
    progesteroneLevel: string;
    testDate: string;
    phase?: string;
  }>;
  breedingRecords?: Array<{
    id: string;
    breedingDate: string;
    isLastMating: boolean;
  }>;
}

export function ProgesteroneTab({ animalId, animalName }: ProgesteroneTabProps) {
  const router = useRouter();

  // Fetch heat cycles for this animal
  const { data: cycles, isLoading } = useQuery<HeatCycle[]>({
    queryKey: ['heat-cycles', animalId],
    queryFn: async () => {
      const response = await fetch(`/api/heat-cycles?bitchId=${animalId}`);
      if (!response.ok) throw new Error('Failed to fetch heat cycles');
      return response.json();
    },
  });

  const activeCycle = cycles?.find(c => c.status === 'active');
  const completedCycles = cycles?.filter(c => c.status !== 'active') || [];

  // Calculate stats
  const totalCycles = cycles?.length || 0;
  const totalReadings = cycles?.reduce((sum, cycle) => sum + (cycle.readings?.length || 0), 0) || 0;
  const lastCycleDate = cycles && cycles.length > 0 
    ? cycles.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0].startDate
    : null;

  const handleStartCycle = () => {
    router.push('/calculators/progesterone');
  };

  const handleViewCycle = (cycleId: string) => {
    router.push(`/calculators/progesterone/${cycleId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card bg-surface border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cycles</p>
                <p className="text-2xl font-bold text-foreground">{totalCycles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-surface border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Readings</p>
                <p className="text-2xl font-bold text-foreground">{totalReadings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-surface border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Cycle</p>
                <p className="text-lg font-bold text-foreground">
                  {lastCycleDate ? format(new Date(lastCycleDate), 'MMM dd, yyyy') : 'None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Cycle Alert */}
      {activeCycle && (
        <Alert className="border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
          <Activity className="h-5 w-5 text-green-600" />
          <AlertDescription>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                  🎯 Active Heat Cycle in Progress
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Started {format(new Date(activeCycle.startDate), 'MMM dd, yyyy')} • 
                  Day {activeCycle.currentDay || 1}
                  {activeCycle.readings && activeCycle.readings.length > 0 && (
                    <> • Last P4: {parseFloat(activeCycle.readings[0].progesteroneLevel).toFixed(1)} ng/mL</>
                  )}
                </p>
                {activeCycle.breedingRecords && activeCycle.breedingRecords.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activeCycle.breedingRecords.map((breeding, idx) => (
                      <Badge 
                        key={breeding.id}
                        variant="secondary"
                        className={breeding.isLastMating 
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border border-red-500"
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                        }
                      >
                        {breeding.isLastMating ? (
                          <>
                            <Sparkles className="w-3 h-3 mr-1" />
                            LAST MATING - {format(new Date(breeding.breedingDate), 'MMM dd')}
                          </>
                        ) : (
                          <>
                            <Heart className="w-3 h-3 mr-1" />
                            M{idx + 1} - {format(new Date(breeding.breedingDate), 'MMM dd')}
                          </>
                        )}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => handleViewCycle(activeCycle.id)}
                className="bg-gradient-brand"
              >
                View Details
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <Card className="shadow-card bg-surface border-0">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage progesterone tracking for {animalName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleStartCycle}
              className="bg-gradient-brand"
              disabled={!!activeCycle}
            >
              <Plus className="w-4 h-4 mr-2" />
              Start New Heat Cycle
            </Button>
            {activeCycle && (
              <Button
                variant="outline"
                onClick={() => handleViewCycle(activeCycle.id)}
              >
                <Activity className="w-4 h-4 mr-2" />
                Add Reading to Active Cycle
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push('/calculators/progesterone')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              View Full Calculator
            </Button>
          </div>
          {activeCycle && (
            <p className="text-sm text-muted-foreground mt-3">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              You have an active cycle. Complete it before starting a new one.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Heat Cycle History */}
      <Card className="shadow-card bg-surface border-0">
        <CardHeader>
          <CardTitle>Heat Cycle History</CardTitle>
          <CardDescription>
            {completedCycles.length === 0 
              ? 'No completed cycles yet' 
              : `${completedCycles.length} completed cycle${completedCycles.length !== 1 ? 's' : ''}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {completedCycles.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No heat cycle history yet</p>
              <Button onClick={handleStartCycle} className="bg-gradient-brand">
                <Plus className="w-4 h-4 mr-2" />
                Start First Heat Cycle
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {completedCycles.map((cycle) => {
                const daysSinceStart = cycle.endDate 
                  ? differenceInDays(new Date(cycle.endDate), new Date(cycle.startDate))
                  : null;
                const lastReading = cycle.readings && cycle.readings.length > 0 
                  ? cycle.readings[0] 
                  : null;

                return (
                  <Card key={cycle.id} className="border hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                              {cycle.status === 'completed' ? 'Completed' : cycle.status === 'pregnant' ? 'Pregnant' : 'Ended'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(cycle.startDate), 'MMM dd, yyyy')}
                              {cycle.endDate && ` - ${format(new Date(cycle.endDate), 'MMM dd, yyyy')}`}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Duration</p>
                              <p className="text-sm font-semibold">
                                {daysSinceStart ? `${daysSinceStart} days` : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Readings</p>
                              <p className="text-sm font-semibold">{cycle.readings?.length || 0}</p>
                            </div>
                            {lastReading && (
                              <div>
                                <p className="text-xs text-muted-foreground">Peak P4</p>
                                <p className="text-sm font-semibold text-purple-600">
                                  {parseFloat(lastReading.progesteroneLevel).toFixed(1)} ng/mL
                                </p>
                              </div>
                            )}
                            {cycle.estimatedOvulationDay && (
                              <div>
                                <p className="text-xs text-muted-foreground">Ovulation</p>
                                <p className="text-sm font-semibold text-red-600">
                                  Day {cycle.estimatedOvulationDay}
                                </p>
                              </div>
                            )}
                          </div>

                          {cycle.breedingRecords && cycle.breedingRecords.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {cycle.breedingRecords.map((breeding, idx) => (
                                <Badge 
                                  key={breeding.id}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {breeding.isLastMating ? '🎯 LAST' : `M${idx + 1}`} - {format(new Date(breeding.breedingDate), 'MMM dd')}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCycle(cycle.id)}
                        >
                          View
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
