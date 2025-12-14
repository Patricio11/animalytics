'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  AlertCircle,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { useRouter } from 'next/navigation';

interface ProgesteroneHealthCardProps {
  animalId: string;
  animalName: string;
}

interface HeatCycle {
  id: string;
  startDate: string;
  endDate?: string;
  status: string;
  currentDay?: number;
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

export function ProgesteroneHealthCard({ animalId, animalName }: ProgesteroneHealthCardProps) {
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

  if (isLoading) {
    return (
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Progesterone Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeCycle = cycles?.find(c => c.status === 'active');
  const lastCycle = cycles && cycles.length > 0 
    ? cycles.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]
    : null;

  // Get relevant cycle data
  const cycleToShow = activeCycle || lastCycle;
  const readings = cycleToShow?.readings || [];
  const latestReading = readings.length > 0 ? readings[0] : null;
  const previousReading = readings.length > 1 ? readings[1] : null;

  // Calculate trend
  const trend = latestReading && previousReading
    ? parseFloat(latestReading.progesteroneLevel) - parseFloat(previousReading.progesteroneLevel)
    : 0;

  // Check if in breeding window
  const isInBreedingWindow = latestReading 
    ? parseFloat(latestReading.progesteroneLevel) >= 15 && parseFloat(latestReading.progesteroneLevel) <= 35
    : false;

  // Days since last cycle
  const daysSinceLastCycle = lastCycle && !activeCycle
    ? differenceInDays(new Date(), new Date(lastCycle.startDate))
    : null;

  // Prepare chart data (last 7 readings)
  const chartData = readings
    .slice(0, 7)
    .reverse()
    .map(r => ({
      day: r.day,
      level: parseFloat(r.progesteroneLevel),
    }));

  // Empty state
  if (!cycles || cycles.length === 0) {
    return (
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Progesterone Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              No progesterone tracking data yet
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push('/calculators/progesterone')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Start Tracking
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Progesterone Tracking
          </div>
          {activeCycle && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
              Active Cycle
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3">
          {/* Latest P4 Level */}
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs text-muted-foreground">Latest P4</p>
              {trend !== 0 && (
                trend > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )
              )}
            </div>
            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {latestReading ? `${parseFloat(latestReading.progesteroneLevel).toFixed(1)}` : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">ng/mL</p>
          </div>

          {/* Cycle Status */}
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-muted-foreground mb-1">Cycle Status</p>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {activeCycle ? `Day ${activeCycle.currentDay || 1}` : 'Inactive'}
            </p>
            <p className="text-xs text-muted-foreground">
              {activeCycle ? 'Active' : 'No active cycle'}
            </p>
          </div>

          {/* Last Cycle */}
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-muted-foreground mb-1">Last Cycle</p>
            <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
              {daysSinceLastCycle !== null ? `${daysSinceLastCycle}d` : format(new Date(lastCycle!.startDate), 'MMM dd')}
            </p>
            <p className="text-xs text-muted-foreground">
              {daysSinceLastCycle !== null ? 'ago' : format(new Date(lastCycle!.startDate), 'yyyy')}
            </p>
          </div>
        </div>

        {/* Breeding Window Alert */}
        {activeCycle && isInBreedingWindow && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm text-green-800 dark:text-green-200">
              <strong>Breeding Window Open</strong> - P4 level is optimal for breeding (15-35 ng/mL)
            </AlertDescription>
          </Alert>
        )}

        {/* Mini Sparkline Chart */}
        {chartData.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">
                Recent Trend (Last {chartData.length} readings)
              </p>
              <p className="text-xs text-muted-foreground">
                {chartData[0].level.toFixed(1)} → {chartData[chartData.length - 1].level.toFixed(1)} ng/mL
              </p>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <YAxis hide domain={[0, 'auto']} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border border-primary/20 rounded-lg p-2 shadow-lg">
                            <p className="text-xs font-semibold">Day {payload[0].payload.day}</p>
                            <p className="text-xs text-purple-600">
                              {payload[0].value} ng/mL
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="level"
                    stroke="#9333ea"
                    strokeWidth={2}
                    dot={{ fill: '#9333ea', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Breeding Records */}
        {cycleToShow?.breedingRecords && cycleToShow.breedingRecords.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Breeding Records</p>
            <div className="flex flex-wrap gap-2">
              {cycleToShow.breedingRecords.map((breeding, idx) => (
                <Badge
                  key={breeding.id}
                  variant="outline"
                  className={breeding.isLastMating
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border-red-500"
                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border-green-500"
                  }
                >
                  {breeding.isLastMating ? '🎯 LAST' : `M${idx + 1}`} - {format(new Date(breeding.breedingDate), 'MMM dd')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => router.push(`/animals/${animalId}?tab=progesterone`)}
          >
            View Full Details
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          {activeCycle && (
            <Button
              size="sm"
              className="bg-gradient-brand"
              onClick={() => router.push(`/calculators/progesterone/${activeCycle.id}`)}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Add Reading
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
