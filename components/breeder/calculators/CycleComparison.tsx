'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface HeatCycleData {
  id: string;
  startDate: Date | string;
  endDate?: Date | string;
  readings: Array<{
    day: number;
    progesteroneLevel: number;
  }>;
  estimatedOvulationDay?: number;
  successful?: boolean; // Did breeding result in pregnancy?
  litterSize?: number;
}

export interface CycleComparisonProps {
  cycles: HeatCycleData[];
  bitchName?: string;
  currentCycleId?: string;
}

// ============================================================================
// COLORS FOR DIFFERENT CYCLES
// ============================================================================

const CYCLE_COLORS = [
  '#8b5cf6', // Purple - Current/Latest
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Orange
  '#ef4444', // Red
  '#6366f1', // Indigo
];

// ============================================================================
// COMPONENT
// ============================================================================

export function CycleComparison({
  cycles,
  bitchName,
  currentCycleId,
}: CycleComparisonProps) {
  // Prepare comparison data
  const comparisonData = useMemo(() => {
    if (cycles.length === 0) return [];

    // Find max day across all cycles
    const maxDay = Math.max(
      ...cycles.flatMap(cycle => cycle.readings.map(r => r.day))
    );

    // Create data points for each day
    const data: any[] = [];
    for (let day = 1; day <= maxDay; day++) {
      const dataPoint: any = { day };

      cycles.forEach((cycle, index) => {
        const reading = cycle.readings.find(r => r.day === day);
        if (reading) {
          dataPoint[`cycle${index}`] = reading.progesteroneLevel;
        }
      });

      data.push(dataPoint);
    }

    return data;
  }, [cycles]);

  // Calculate cycle statistics
  const cycleStats = useMemo(() => {
    return cycles.map((cycle) => {
      const levels = cycle.readings.map(r => r.progesteroneLevel);
      const peakLevel = Math.max(...levels);
      const peakDay = cycle.readings.find(r => r.progesteroneLevel === peakLevel)?.day;
      const avgLevel = levels.reduce((a, b) => a + b, 0) / levels.length;

      return {
        id: cycle.id,
        startDate: typeof cycle.startDate === 'string' 
          ? new Date(cycle.startDate) 
          : cycle.startDate,
        peakLevel,
        peakDay,
        avgLevel,
        ovulationDay: cycle.estimatedOvulationDay,
        successful: cycle.successful,
        litterSize: cycle.litterSize,
        totalReadings: cycle.readings.length,
      };
    });
  }, [cycles]);

  // Compare current cycle to previous cycles
  const comparison = useMemo(() => {
    if (cycles.length < 2 || !currentCycleId) return null;

    const currentIndex = cycles.findIndex(c => c.id === currentCycleId);
    if (currentIndex === -1) return null;

    const current = cycleStats[currentIndex];
    const previous = cycleStats.filter((_, i) => i !== currentIndex);

    const avgPreviousPeak = previous.reduce((sum, c) => sum + c.peakLevel, 0) / previous.length;
    const avgPreviousOvulation = previous
      .filter(c => c.ovulationDay)
      .reduce((sum, c) => sum + (c.ovulationDay || 0), 0) / previous.filter(c => c.ovulationDay).length;

    return {
      peakDiff: current.peakLevel - avgPreviousPeak,
      ovulationDiff: current.ovulationDay 
        ? (current.ovulationDay - avgPreviousOvulation)
        : null,
      successfulPrevious: previous.filter(c => c.successful).length,
      totalPrevious: previous.length,
    };
  }, [cycles, currentCycleId, cycleStats]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const day = payload[0].payload.day;

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">
          Day {day}
        </p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Cycle {index + 1}:
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {entry.value.toFixed(1)} ng/mL
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (cycles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cycle Comparison</CardTitle>
          <CardDescription>
            No previous cycles available for comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-400">
            <p>Complete at least 2 heat cycles to see comparisons</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main comparison chart */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Cycle Comparison</CardTitle>
          <CardDescription>
            {bitchName && `${bitchName} - `}
            Comparing {cycles.length} heat cycles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={comparisonData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

              <XAxis
                dataKey="day"
                label={{ value: 'Day of Heat Cycle', position: 'insideBottom', offset: -10 }}
                stroke="#6b7280"
              />

              <YAxis
                label={{ value: 'Progesterone (ng/mL)', angle: -90, position: 'insideLeft' }}
                stroke="#6b7280"
                domain={[0, 'auto']}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="top"
                height={36}
                iconType="line"
              />

              {/* Reference lines for breeding window */}
              <ReferenceLine y={15} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.3} />
              <ReferenceLine y={25} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.3} />

              {/* Lines for each cycle */}
              {cycles.map((cycle, index) => (
                <Line
                  key={cycle.id}
                  type="monotone"
                  dataKey={`cycle${index}`}
                  stroke={CYCLE_COLORS[index % CYCLE_COLORS.length]}
                  strokeWidth={cycle.id === currentCycleId ? 3 : 2}
                  dot={{ r: cycle.id === currentCycleId ? 5 : 3 }}
                  name={`Cycle ${index + 1}${cycle.id === currentCycleId ? ' (Current)' : ''}`}
                  strokeOpacity={cycle.id === currentCycleId ? 1 : 0.6}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cycle statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cycleStats.map((stat, index) => {
          const cycle = cycles[index];
          const isCurrent = cycle.id === currentCycleId;

          return (
            <Card key={cycle.id} className={isCurrent ? 'ring-2 ring-purple-500' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Cycle {index + 1}
                      {isCurrent && (
                        <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800">
                          Current
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      <Calendar className="inline w-3 h-3 mr-1" />
                      {stat.startDate.toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {stat.successful !== undefined && (
                    <Badge
                      variant={stat.successful ? 'default' : 'secondary'}
                      className={stat.successful ? 'bg-green-100 text-green-800' : ''}
                    >
                      {stat.successful ? '✓ Successful' : 'No Pregnancy'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Peak Level</p>
                    <p className="font-bold text-lg text-purple-600 dark:text-purple-400">
                      {stat.peakLevel.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-400">Day {stat.peakDay}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Ovulation</p>
                    <p className="font-bold text-lg text-red-600 dark:text-red-400">
                      {stat.ovulationDay ? `Day ${stat.ovulationDay}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Average</p>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                      {stat.avgLevel.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Readings</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                      {stat.totalReadings}
                    </p>
                  </div>
                </div>
                {stat.litterSize !== undefined && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Litter Size</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {stat.litterSize} puppies
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison insights */}
      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle>Cycle Insights</CardTitle>
            <CardDescription>
              How does the current cycle compare to previous cycles?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Peak level comparison */}
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  comparison.peakDiff > 0 
                    ? 'bg-green-100 text-green-600' 
                    : comparison.peakDiff < 0 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {comparison.peakDiff > 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : comparison.peakDiff < 0 ? (
                    <TrendingDown className="w-5 h-5" />
                  ) : (
                    <Minus className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Peak Level
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {comparison.peakDiff > 0 ? '+' : ''}
                    {comparison.peakDiff.toFixed(1)} ng/mL vs average
                  </p>
                </div>
              </div>

              {/* Ovulation timing comparison */}
              {comparison.ovulationDiff !== null && (
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    Math.abs(comparison.ovulationDiff) <= 1
                      ? 'bg-green-100 text-green-600'
                      : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Ovulation Timing
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {comparison.ovulationDiff > 0 ? '+' : ''}
                      {comparison.ovulationDiff.toFixed(0)} days vs average
                    </p>
                  </div>
                </div>
              )}

              {/* Success rate */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Historical Success
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {comparison.successfulPrevious} of {comparison.totalPrevious} previous cycles
                    ({((comparison.successfulPrevious / comparison.totalPrevious) * 100).toFixed(0)}%)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
