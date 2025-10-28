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
  ReferenceArea,
  Area,
  ComposedChart,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// TYPES
// ============================================================================

export interface ProgesteroneReading {
  day: number;
  testDate: Date | string;
  progesteroneLevel: number;
  phase?: string;
  phaseColor?: string;
  notes?: string;
}

export interface ProgesteroneChartProps {
  readings: ProgesteroneReading[];
  bitchName?: string;
  startDate?: Date | string;
  estimatedOvulationDay?: number;
  breedingDates?: Array<{ date: string; method: string }>;
  showPhaseColors?: boolean;
  showBreedingWindow?: boolean;
  height?: number;
}

// ============================================================================
// PHASE DEFINITIONS
// ============================================================================

const PHASE_ZONES = [
  { min: 0, max: 1.5, label: 'Anestrus', color: '#9ca3af' },
  { min: 1.5, max: 4, label: 'LH Surge', color: '#a855f7' },
  { min: 4, max: 9, label: 'Ovulation', color: '#ef4444' },
  { min: 9, max: 15, label: 'Egg Maturation', color: '#f59e0b' },
  { min: 15, max: 25, label: 'Fertile Window', color: '#10b981' },
  { min: 25, max: 50, label: 'Late Stage', color: '#059669' },
];

const BREEDING_WINDOW = { min: 15, max: 35 };

// ============================================================================
// CHART COMPONENT
// ============================================================================

export function ProgesteroneChart({
  readings,
  bitchName,
  startDate,
  estimatedOvulationDay,
  breedingDates = [],
  showPhaseColors = true,
  showBreedingWindow = true,
  height = 400,
}: ProgesteroneChartProps) {
  // Prepare chart data
  const chartData = useMemo(() => {
    return readings
      .sort((a, b) => a.day - b.day)
      .map((reading) => ({
        day: reading.day,
        level: reading.progesteroneLevel,
        phase: reading.phase,
        phaseColor: reading.phaseColor,
        date: typeof reading.testDate === 'string' 
          ? new Date(reading.testDate).toLocaleDateString() 
          : reading.testDate.toLocaleDateString(),
        notes: reading.notes,
      }));
  }, [readings]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (readings.length === 0) return null;

    const levels = readings.map(r => r.progesteroneLevel);
    const maxLevel = Math.max(...levels);
    const minLevel = Math.min(...levels);
    const avgLevel = levels.reduce((a, b) => a + b, 0) / levels.length;
    const lastReading = readings[readings.length - 1];

    return {
      maxLevel,
      minLevel,
      avgLevel,
      lastReading,
      totalReadings: readings.length,
    };
  }, [readings]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">
          Day {data.day}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {data.date}
        </p>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
            {data.level.toFixed(1)} ng/mL
          </span>
        </div>
        {data.phase && (
          <Badge 
            variant="secondary" 
            className="text-xs"
            style={{ backgroundColor: data.phaseColor || '#9ca3af' }}
          >
            {data.phase}
          </Badge>
        )}
        {data.notes && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
            {data.notes}
          </p>
        )}
      </div>
    );
  };

  if (readings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progesterone Chart</CardTitle>
          <CardDescription>
            No progesterone readings available yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-400">
            <p>Add progesterone readings to see the chart</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Progesterone Levels Over Time</CardTitle>
            <CardDescription>
              {bitchName && `${bitchName} - `}
              {stats?.totalReadings} readings
              {startDate && ` (Started ${typeof startDate === 'string' ? new Date(startDate).toLocaleDateString() : startDate.toLocaleDateString()})`}
            </CardDescription>
          </div>
          {stats && (
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400">Current</p>
                <p className="font-bold text-purple-600 dark:text-purple-400">
                  {stats.lastReading.progesteroneLevel.toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400">Peak</p>
                <p className="font-bold text-green-600 dark:text-green-400">
                  {stats.maxLevel.toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400">Average</p>
                <p className="font-bold text-blue-600 dark:text-blue-400">
                  {stats.avgLevel.toFixed(1)}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
              </linearGradient>
            </defs>

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

            {/* Breeding window reference area */}
            {showBreedingWindow && (
              <ReferenceArea
                y1={BREEDING_WINDOW.min}
                y2={BREEDING_WINDOW.max}
                fill="#10b981"
                fillOpacity={0.1}
                label={{
                  value: 'Breeding Window',
                  position: 'insideTopRight',
                  fill: '#059669',
                  fontSize: 12,
                }}
              />
            )}

            {/* Ovulation day reference line */}
            {estimatedOvulationDay && (
              <ReferenceLine
                x={estimatedOvulationDay}
                stroke="#ef4444"
                strokeDasharray="3 3"
                strokeWidth={2}
                label={{
                  value: 'Ovulation',
                  position: 'top',
                  fill: '#ef4444',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              />
            )}

            {/* Breeding dates markers */}
            {breedingDates.map((breeding, index) => {
              const breedingDay = chartData.find(d => d.date === breeding.date)?.day;
              if (!breedingDay) return null;

              return (
                <ReferenceLine
                  key={index}
                  x={breedingDay}
                  stroke="#10b981"
                  strokeWidth={2}
                  label={{
                    value: '🎯',
                    position: 'top',
                    fontSize: 16,
                  }}
                />
              );
            })}

            {/* Phase threshold lines */}
            <ReferenceLine y={4} stroke="#a855f7" strokeDasharray="3 3" strokeOpacity={0.3} />
            <ReferenceLine y={9} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.3} />
            <ReferenceLine y={15} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.3} />

            {/* Area under curve */}
            <Area
              type="monotone"
              dataKey="level"
              fill="url(#colorLevel)"
              stroke="none"
            />

            {/* Main line */}
            <Line
              type="monotone"
              dataKey="level"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', r: 5 }}
              activeDot={{ r: 8, fill: '#7c3aed' }}
              name="Progesterone Level"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Phase legend */}
        {showPhaseColors && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Progesterone Phases
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {PHASE_ZONES.map((phase) => (
                <div key={phase.label} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: phase.color }}
                  />
                  <div className="text-xs">
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      {phase.label}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {phase.min}-{phase.max} ng/mL
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Breeding dates list */}
        {breedingDates.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Breeding Dates
            </p>
            <div className="flex flex-wrap gap-2">
              {breedingDates.map((breeding, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                  🎯 {breeding.date} ({breeding.method})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
