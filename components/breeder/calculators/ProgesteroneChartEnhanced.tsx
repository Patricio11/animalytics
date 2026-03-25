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
  ComposedChart,
  Label,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Beaker } from 'lucide-react';
import { PROGESTERONE_PHASES, formatPhaseValues, type PhaseReferenceValues } from '@/lib/utils/progesterone-reference-values';
import type { ProgesteroneMachine } from '@/lib/utils/progesterone-machine-conversion';

// ============================================================================
// TYPES
// ============================================================================

export interface ProgesteroneReadingEnhanced {
  day: number;
  testDate: Date | string;
  progesteroneLevel: number; // Normalized VIDAS ng/mL
  rawValue?: number; // Original machine value
  machine?: ProgesteroneMachine;
  phase?: string;
  phaseColor?: string;
  notes?: string;
}

export interface ProgesteroneChartEnhancedProps {
  readings: ProgesteroneReadingEnhanced[];
  bitchName?: string;
  startDate?: Date | string;
  estimatedOvulationDay?: number;
  breedingDates?: Array<{ date: string; method: string; isLastMating?: boolean; day?: number }>;
  showPhaseZones?: boolean;
  showMachineInfo?: boolean;
  height?: number;
}

// ============================================================================
// CHART COMPONENT
// ============================================================================

export function ProgesteroneChartEnhanced({
  readings,
  bitchName,
  startDate,
  estimatedOvulationDay,
  breedingDates = [],
  showPhaseZones = true,
  showMachineInfo = true,
  height = 500,
}: ProgesteroneChartEnhancedProps) {
  // Prepare chart data
  const chartData = useMemo(() => {
    return readings
      .sort((a, b) => a.day - b.day)
      .map((reading) => {
        const level = reading.progesteroneLevel;
        return {
          day: reading.day,
          level: level,
          rawValue: reading.rawValue,
          machine: reading.machine,
          phase: reading.phase,
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
    const lastReading = readings.reduce((latest, current) => 
      current.day > latest.day ? current : latest
    , readings[0]);

    // Check if multiple machines used
    const machines = new Set(readings.map(r => r.machine).filter(Boolean));
    const multipleMachines = machines.size > 1;

    return {
      maxLevel,
      minLevel,
      avgLevel,
      lastReading,
      totalReadings: readings.length,
      multipleMachines,
      machines: Array.from(machines),
    };
  }, [readings]);

  // Custom dot component
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;

    // Color based on phase — calibrated to VIDAS reference chart
    let color = '#8b5cf6';
    if (payload.level < 3)  color = '#9ca3af'; // Baseline
    else if (payload.level < 10) color = '#a855f7'; // LH Rise
    else if (payload.level < 15) color = '#ef4444'; // Ovulation (OV = 10)
    else if (payload.level < 18) color = '#10b981'; // 1st Mating Fresh
    else if (payload.level < 25) color = '#22c55e'; // Fertile Window
    else color = '#0ea5e9';                          // Optimal Frozen

    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={color}
        stroke="#fff"
        strokeWidth={2}
        className="drop-shadow-md"
      />
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border-2 border-primary/20">
        <p className="font-semibold text-foreground mb-2">
          Day {data.day}
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          {data.date}
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-primary">
              {data.level.toFixed(1)} ng/mL
            </span>
            <span className="text-xs text-muted-foreground">(VIDAS equiv.)</span>
          </div>
          {data.machine && data.machine !== 'VIDAS' && data.rawValue && (
            <div className="flex items-center gap-2 text-sm">
              <Beaker className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {data.rawValue.toFixed(1)} on {data.machine}
              </span>
            </div>
          )}
          {data.phase && (
            <Badge variant="secondary" className="text-xs">
              {data.phase}
            </Badge>
          )}
          {data.notes && (
            <p className="text-xs text-muted-foreground italic mt-2">
              {data.notes}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (readings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progesterone Progression Chart</CardTitle>
          <CardDescription>
            No progesterone readings available yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Add progesterone readings to see the progression chart</p>
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
            <CardTitle className="flex items-center gap-2">
              Progesterone Progression Chart
              {stats?.multipleMachines && (
                <Badge variant="outline" className="text-xs">
                  <Beaker className="w-3 h-3 mr-1" />
                  Multiple Machines
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {bitchName && `${bitchName} - `}
              {stats?.totalReadings} readings
              {startDate && ` (Started ${typeof startDate === 'string' ? new Date(startDate).toLocaleDateString() : startDate.toLocaleDateString()})`}
            </CardDescription>
          </div>
          {stats && (
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground">Current</p>
                <p className="font-bold text-primary">
                  {stats.lastReading.progesteroneLevel.toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Peak</p>
                <p className="font-bold text-green-600">
                  {stats.maxLevel.toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Average</p>
                <p className="font-bold text-blue-600">
                  {stats.avgLevel.toFixed(1)}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Machine Info Alert */}
        {showMachineInfo && stats?.multipleMachines && (
          <Alert className="mb-6 border-blue-500/50 bg-blue-500/10">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="ml-2 text-sm">
              <strong>Multiple machines detected:</strong> {stats.machines.join(', ')}. 
              All values normalized to VIDAS standard for consistent interpretation.
            </AlertDescription>
          </Alert>
        )}

        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={chartData}
            margin={{ top: 40, right: 30, left: 20, bottom: 60 }}
          >
            <defs>
              {/* Gradient for area fill */}
              <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />

            <XAxis
              dataKey="day"
              label={{ 
                value: 'Days from Start of Season', 
                position: 'insideBottom', 
                offset: -10,
                style: { fontWeight: 600 }
              }}
              stroke="#6b7280"
            />

            <YAxis
              label={{ 
                value: 'Progesterone (ng/mL - VIDAS equivalent)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontWeight: 600 }
              }}
              stroke="#6b7280"
              domain={[0, 'auto']}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="top"
              height={36}
              iconType="line"
            />

            {/* Phase Zone Reference Areas */}
            {showPhaseZones && (
              <>
                {/* LH Rise Zone */}
                <ReferenceArea
                  y1={3}
                  y2={5}
                  fill="#a855f7"
                  fillOpacity={0.1}
                  label={{
                    value: 'LH Rise',
                    position: 'insideTopRight',
                    fill: '#a855f7',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
                
                {/* Ovulation Zone */}
                <ReferenceArea
                  y1={10}
                  y2={12}
                  fill="#ef4444"
                  fillOpacity={0.15}
                  label={{
                    value: 'Ovulation',
                    position: 'insideTopRight',
                    fill: '#ef4444',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
                
                {/* 1st Mating Fresh Zone */}
                <ReferenceArea
                  y1={15}
                  y2={18}
                  fill="#10b981"
                  fillOpacity={0.15}
                  label={{
                    value: '1st Mating Fresh',
                    position: 'insideTopRight',
                    fill: '#10b981',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
                
                {/* Optimal Frozen Zone */}
                <ReferenceArea
                  y1={25}
                  y2={35}
                  fill="#0ea5e9"
                  fillOpacity={0.15}
                  label={{
                    value: 'OPTIMAL - Frozen',
                    position: 'insideTopRight',
                    fill: '#0ea5e9',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                />
              </>
            )}

            {/* Key threshold lines */}
            <ReferenceLine y={3} stroke="#a855f7" strokeDasharray="3 3" strokeOpacity={0.4} />
            <ReferenceLine y={10} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.4} />
            <ReferenceLine y={15} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.4} />
            <ReferenceLine y={28} stroke="#059669" strokeDasharray="3 3" strokeOpacity={0.4} />

            {/* Ovulation day marker */}
            {estimatedOvulationDay && (
              <ReferenceLine
                x={estimatedOvulationDay}
                stroke="#ef4444"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: 'OV',
                  position: 'top',
                  fill: '#ef4444',
                  fontSize: 14,
                  fontWeight: 'bold',
                }}
              />
            )}

            {/* Breeding dates markers */}
            {breedingDates.map((breeding, index) => {
              const breedingDay = breeding.day || chartData.find(d => d.date === breeding.date)?.day;
              if (!breedingDay) return null;

              return (
                <ReferenceLine
                  key={index}
                  x={breedingDay}
                  stroke={breeding.isLastMating ? '#ef4444' : '#10b981'}
                  strokeWidth={breeding.isLastMating ? 3 : 2}
                  label={{
                    value: breeding.isLastMating ? '🎯 LAST' : `M${index + 1}`,
                    position: 'top',
                    fontSize: breeding.isLastMating ? 14 : 12,
                    fontWeight: breeding.isLastMating ? 'bold' : 'normal',
                    fill: breeding.isLastMating ? '#ef4444' : '#10b981',
                  }}
                />
              );
            })}

            {/* Main progression line */}
            <Line
              type="monotone"
              dataKey="level"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={<CustomDot />}
              name="Progesterone Level (VIDAS equiv.)"
              fill="url(#colorLevel)"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Phase Reference Legend */}
        {showPhaseZones && (
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Beaker className="w-4 h-4" />
              Progesterone Phase Reference (Machine Correlations)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROGESTERONE_PHASES.slice(2, 9).map((phase) => {
                const values = formatPhaseValues(phase);
                return (
                  <div 
                    key={phase.phase} 
                    className="p-3 rounded-lg border-2 transition-all hover:shadow-md"
                    style={{ 
                      borderColor: `${phase.color}40`,
                      backgroundColor: `${phase.color}10`
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{phase.icon}</span>
                      <h4 className="font-semibold text-sm" style={{ color: phase.color }}>
                        {phase.phase}
                      </h4>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>• {values.vidas}</p>
                      <p>• {values.vidasNmol}</p>
                      <p>• {values.idexx}</p>
                    </div>
                    {phase.breedingAction && (
                      <p className="text-xs font-medium mt-2" style={{ color: phase.color }}>
                        {phase.breedingAction}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Breeding Records */}
        {breedingDates.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm font-semibold text-foreground mb-3">
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
