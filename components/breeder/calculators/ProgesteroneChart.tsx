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
  breedingDates?: Array<{ date: string; method: string; isLastMating?: boolean; day?: number }>;
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
  // Helper function to get color based on progesterone level
  const getColorForLevel = (level: number) => {
    if (level < 1.5) return '#9ca3af'; // Gray - Anestrus
    if (level < 4) return '#a855f7'; // Purple - LH Surge
    if (level < 9) return '#ef4444'; // Red - Ovulation
    if (level < 15) return '#f59e0b'; // Amber - Egg Maturation
    if (level < 25) return '#10b981'; // Green - Fertile Window
    return '#059669'; // Dark Green - Late Stage
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    return readings
      .sort((a, b) => a.day - b.day)
      .map((reading) => {
        const level = reading.progesteroneLevel;
        return {
          day: reading.day,
          level: level,
          phase: reading.phase,
          phaseColor: reading.phaseColor || getColorForLevel(level),
          dotColor: getColorForLevel(level),
          date: typeof reading.testDate === 'string' 
            ? new Date(reading.testDate).toLocaleDateString() 
            : reading.testDate.toLocaleDateString(),
          notes: reading.notes,
        };
      });
  }, [readings]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (readings.length === 0) return null;

    const levels = readings.map(r => r.progesteroneLevel);
    const maxLevel = Math.max(...levels);
    const minLevel = Math.min(...levels);
    const avgLevel = levels.reduce((a, b) => a + b, 0) / levels.length;
    // Get the reading with the highest day number (latest reading)
    const lastReading = readings.reduce((latest, current) => 
      current.day > latest.day ? current : latest
    , readings[0]);

    return {
      maxLevel,
      minLevel,
      avgLevel,
      lastReading,
      totalReadings: readings.length,
    };
  }, [readings]);

  // Custom dot component with dynamic colors
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={payload.dotColor}
        stroke="#fff"
        strokeWidth={2}
        className="drop-shadow-md"
      />
    );
  };

  // Custom active dot with glow effect
  const CustomActiveDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;

    return (
      <>
        <circle
          cx={cx}
          cy={cy}
          r={12}
          fill={payload.dotColor}
          opacity={0.3}
          className="animate-pulse"
        />
        <circle
          cx={cx}
          cy={cy}
          r={8}
          fill={payload.dotColor}
          stroke="#fff"
          strokeWidth={3}
          className="drop-shadow-lg"
        />
      </>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border-2 border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">
          Day {data.day}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {data.date}
        </p>
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.dotColor }}
          />
          <span className="font-bold text-lg" style={{ color: data.dotColor }}>
            {data.level.toFixed(1)} ng/mL
          </span>
        </div>
        {data.phase && (
          <Badge 
            variant="secondary" 
            className="text-xs text-white"
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
              {/* Gradient for area fill */}
              <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
              </linearGradient>
              
              {/* Multi-color gradient for line stroke */}
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9ca3af" />
                <stop offset="20%" stopColor="#a855f7" />
                <stop offset="40%" stopColor="#ef4444" />
                <stop offset="60%" stopColor="#f59e0b" />
                <stop offset="80%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
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
              const breedingDay = breeding.day || chartData.find(d => d.date === breeding.date)?.day;
              if (!breedingDay) return null;

              const isLast = breeding.isLastMating;
              const matingNumber = index + 1;

              return (
                <ReferenceLine
                  key={index}
                  x={breedingDay}
                  stroke={isLast ? '#ef4444' : '#10b981'}
                  strokeWidth={isLast ? 3 : 2}
                  strokeDasharray={isLast ? '5 5' : undefined}
                  label={{
                    value: isLast ? `🎯 LAST` : `M${matingNumber}`,
                    position: 'top',
                    fontSize: isLast ? 14 : 12,
                    fontWeight: isLast ? 'bold' : 'normal',
                    fill: isLast ? '#ef4444' : '#10b981',
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

            {/* Main line with gradient and custom dots */}
            <Line
              type="monotone"
              dataKey="level"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={<CustomActiveDot />}
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
              Breeding Records
            </p>
            <div className="flex flex-wrap gap-2">
              {breedingDates.map((breeding, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className={breeding.isLastMating 
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border-2 border-red-500" 
                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                  }
                >
                  {breeding.isLastMating ? '🎯 LAST MATING' : `M${index + 1}`} - {breeding.date} ({breeding.method})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
