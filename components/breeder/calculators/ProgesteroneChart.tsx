'use client';

import { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
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
// PHASE ZONES — calibrated to VIDAS reference chart
// LH Rise = 3 ng/mL | OV = 10 ng/mL | 1st Fresh = 15–18 | Optimal = 25–35 (peak 28)
// ============================================================================

const PHASE_ZONES = [
  { min: 0,  max: 3,  label: 'Baseline',          color: '#9ca3af', opacity: 0.06 },
  { min: 3,  max: 10, label: 'LH Rise',            color: '#a855f7', opacity: 0.08 },
  { min: 10, max: 15, label: 'Ovulation (OV)',      color: '#ef4444', opacity: 0.10 },
  { min: 15, max: 18, label: '1st Mating – Fresh',  color: '#10b981', opacity: 0.14 },
  { min: 18, max: 25, label: 'Fertile Window',      color: '#22c55e', opacity: 0.10 },
  { min: 25, max: 36, label: 'Optimal – Frozen AI', color: '#0ea5e9', opacity: 0.12 },
];

// Milestone reference cards (matching screenshot label boxes)
const PHASE_MILESTONES = [
  { y: 3,  label: 'LH Rise',          color: '#a855f7', vidas_ng: '3 N/G',     vidas_nmol: '10 N/Mols',    idexx: 'IDEXX 6–7 N/Mols'   },
  { y: 10, label: 'OV (Ovulation)',    color: '#ef4444', vidas_ng: '10 N/G',    vidas_nmol: '33 N/Mols',    idexx: 'IDEXX 15–25 N/Mols' },
  { y: 15, label: '1st Mating – Fresh',color: '#10b981', vidas_ng: '15–18 N/G', vidas_nmol: '47–57 N/Mols', idexx: 'IDEXX 38–48 N/Mols' },
  { y: 28, label: 'FERTILE PEAK',      color: '#059669', vidas_ng: '28 N/G',    vidas_nmol: '89 N/Mols',    idexx: 'IDEXX 70+ N/Mols'   },
];

// ============================================================================
// HELPERS
// ============================================================================

function getColorForLevel(level: number): string {
  if (level < 0.8) return '#6b7280'; // Start of Season anchor
  if (level < 3)   return '#9ca3af'; // Baseline
  if (level < 10)  return '#a855f7'; // LH Rise
  if (level < 15)  return '#ef4444'; // Ovulation
  if (level < 18)  return '#10b981'; // 1st Mating Fresh
  if (level < 25)  return '#22c55e'; // Fertile Window
  return '#0ea5e9';                   // Optimal Frozen
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function CustomDot(props: any) {
  const { cx, cy, payload } = props;
  if (!payload || cx == null || cy == null) return null;

  // "Start of Season" anchor — render a flag-style marker
  if (payload.isStartPoint) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={9} fill="#fff" stroke="#6b7280" strokeWidth={2} opacity={0.9} />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#6b7280">S</text>
      </g>
    );
  }

  const color = payload.dotColor || '#8b5cf6';
  return (
    <circle
      cx={cx} cy={cy} r={6}
      fill={color} stroke="#fff" strokeWidth={2}
      style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.25))' }}
    />
  );
}

function CustomActiveDot(props: any) {
  const { cx, cy, payload } = props;
  if (!payload || cx == null || cy == null) return null;
  if (payload.isStartPoint) return null; // No active dot on the anchor

  const color = payload.dotColor || '#8b5cf6';
  return (
    <g>
      <circle cx={cx} cy={cy} r={16} fill={color} opacity={0.15} />
      <circle cx={cx} cy={cy} r={9}  fill={color} stroke="#fff" strokeWidth={3}
        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.35))' }} />
    </g>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  // Start of Season anchor tooltip
  if (data.isStartPoint) {
    return (
      <div className="bg-white dark:bg-gray-900 p-3 rounded-xl shadow-xl border-2 border-gray-200 dark:border-gray-700">
        <p className="font-bold text-gray-600 dark:text-gray-300 mb-1">📍 Start of Season</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{data.date}</p>
        <p className="text-xs text-gray-400 mt-1">Baseline P4 ≈ 0.5 ng/mL</p>
        <p className="text-xs text-gray-400">First test recommended: Day 5–6</p>
      </div>
    );
  }

  const color = data.dotColor || '#8b5cf6';
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-xl border-2"
      style={{ borderColor: `${color}60` }}>
      <p className="font-bold text-gray-900 dark:text-white mb-1">Day {data.day}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{data.date}</p>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="font-bold text-xl" style={{ color }}>
          {data.level.toFixed(1)} ng/mL
        </span>
      </div>
      <div className="text-xs space-y-0.5 text-gray-500 dark:text-gray-400 mb-2">
        <p>VIDAS: {data.level.toFixed(1)} N/G · {(data.level * 3.18).toFixed(0)} N/Mols</p>
        <p>IDEXX: ≈{(data.level * 2.2).toFixed(0)} N/Mols</p>
      </div>
      {data.phase && (
        <Badge variant="secondary" className="text-xs text-white"
          style={{ backgroundColor: color }}>
          {data.phase}
        </Badge>
      )}
      {data.notes && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">{data.notes}</p>
      )}
    </div>
  );
}

// ============================================================================
// MAIN CHART
// ============================================================================

export function ProgesteroneChart({
  readings,
  bitchName,
  startDate,
  estimatedOvulationDay,
  breedingDates = [],
  showPhaseColors = true,
  showBreedingWindow = true,
  height = 500,
}: ProgesteroneChartProps) {

  // Build chart data — always prepend a "Start of Season" anchor at Day 1
  const chartData = useMemo(() => {
    const sorted = [...readings]
      .sort((a, b) => a.day - b.day)
      .map((r) => ({
        day: r.day,
        level: r.progesteroneLevel,
        phase: r.phase,
        dotColor: r.phaseColor || getColorForLevel(r.progesteroneLevel),
        date: typeof r.testDate === 'string'
          ? new Date(r.testDate).toLocaleDateString()
          : r.testDate.toLocaleDateString(),
        notes: r.notes,
        isStartPoint: false,
      }));

    // Inject "Start of Season" anchor at Day 1 unless a reading already exists there
    const firstReadingDay = sorted[0]?.day ?? 999;
    if (firstReadingDay > 1) {
      const dateLabel = startDate
        ? (typeof startDate === 'string'
            ? new Date(startDate).toLocaleDateString()
            : startDate.toLocaleDateString())
        : 'Day 1';

      sorted.unshift({
        day: 1,
        level: 0.5,           // Realistic baseline at start of season
        phase: 'Start of Season',
        dotColor: '#6b7280',
        date: dateLabel,
        notes: 'Start of Season — baseline P4',
        isStartPoint: true,
      });
    }

    return sorted;
  }, [readings, startDate]);

  const stats = useMemo(() => {
    if (!readings.length) return null;
    const levels = readings.map(r => r.progesteroneLevel);
    const maxLevel = Math.max(...levels);
    const latest = readings.reduce((a, b) => b.day > a.day ? b : a, readings[0]);
    return { maxLevel, latest, total: readings.length };
  }, [readings]);

  // Y-axis always shows at least 35 so the Optimal Frozen zone is visible
  const yMax = stats ? Math.max(Math.ceil(stats.maxLevel * 1.15), 35) : 35;

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!readings.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progesterone Chart</CardTitle>
          <CardDescription>
            No readings yet — add the first progesterone reading to see the progression
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 gap-5 text-muted-foreground">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
              {PHASE_MILESTONES.map((m) => (
                <div key={m.label} className="rounded-lg p-3 text-center"
                  style={{ backgroundColor: `${m.color}15`, border: `2px solid ${m.color}40` }}>
                  <p className="text-xs font-bold mb-1" style={{ color: m.color }}>{m.label}</p>
                  <p className="text-xs">VIDAS {m.vidas_ng}</p>
                  <p className="text-xs text-muted-foreground">{m.idexx}</p>
                </div>
              ))}
            </div>
            <p className="text-sm">Start entering readings — the chart will rise or fall with each result</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Chart ────────────────────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <CardTitle>Progesterone Progression</CardTitle>
            <CardDescription>
              {bitchName && `${bitchName} · `}
              {stats?.total} reading{stats?.total !== 1 ? 's' : ''}
              {startDate && ` · Started ${typeof startDate === 'string'
                ? new Date(startDate).toLocaleDateString()
                : startDate.toLocaleDateString()}`}
            </CardDescription>
          </div>
          {stats && (
            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Current</p>
                <p className="font-bold text-lg"
                  style={{ color: getColorForLevel(stats.latest.progesteroneLevel) }}>
                  {stats.latest.progesteroneLevel.toFixed(1)}
                  <span className="text-xs font-normal text-muted-foreground ml-1">ng/mL</span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Peak</p>
                <p className="font-bold text-lg text-green-600">
                  {stats.maxLevel.toFixed(1)}
                  <span className="text-xs font-normal text-muted-foreground ml-1">ng/mL</span>
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
            margin={{ top: 24, right: 130, left: 20, bottom: 48 }}
          >
            <defs>
              {/* Gradient fill under curve — transitions from purple → transparent */}
              <linearGradient id="progAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#8b5cf6" stopOpacity={0.20} />
                <stop offset="60%"  stopColor="#8b5cf6" stopOpacity={0.06} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.00} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />

            {/* X axis */}
            <XAxis
              dataKey="day"
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              label={{
                value: 'Days from Start of Season',
                position: 'insideBottom',
                offset: -28,
                style: { fontWeight: 600, fontSize: 12, fill: '#6b7280' },
              }}
            />

            {/* Y axis — always 0 → yMax */}
            <YAxis
              stroke="#6b7280"
              domain={[0, yMax]}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              label={{
                value: 'Progesterone ng/mL (VIDAS)',
                angle: -90,
                position: 'insideLeft',
                offset: 12,
                style: { fontWeight: 600, fontSize: 11, fill: '#6b7280' },
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* ── Colored phase background bands ───────────────────────── */}
            {showPhaseColors && PHASE_ZONES.map((zone) => (
              <ReferenceArea
                key={zone.label}
                y1={zone.min}
                y2={Math.min(zone.max, yMax)}
                fill={zone.color}
                fillOpacity={zone.opacity}
                stroke="none"
              />
            ))}

            {/* ── Breeding window highlight (15–35) ────────────────────── */}
            {showBreedingWindow && (
              <ReferenceArea
                y1={15} y2={Math.min(35, yMax)}
                fill="#10b981" fillOpacity={0.05}
                stroke="#10b981" strokeOpacity={0.2} strokeDasharray="4 4"
              />
            )}

            {/* ── "Start of Season" vertical marker at Day 1 ───────────── */}
            <ReferenceLine
              x={1}
              stroke="#6b7280"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{
                value: 'Start of Season',
                position: 'insideTopLeft',
                fill: '#6b7280',
                fontSize: 10,
                fontWeight: 600,
              }}
            />

            {/* ── "Day 5-6: First test recommended" marker ─────────────── */}
            <ReferenceLine
              x={5.5}
              stroke="#9ca3af"
              strokeWidth={1}
              strokeDasharray="3 3"
              strokeOpacity={0.4}
              label={{
                value: 'Day 5–6: 1st test',
                position: 'top',
                fill: '#9ca3af',
                fontSize: 9,
              }}
            />

            {/* ── Horizontal milestone threshold lines ─────────────────── */}
            <ReferenceLine
              y={3}
              stroke="#a855f7" strokeWidth={1.5} strokeDasharray="5 3"
              label={{
                value: 'LH Rise  3 N/G | 10 Nmols | IDEXX 6-7',
                position: 'right',
                fill: '#a855f7', fontSize: 10, fontWeight: 600,
              }}
            />
            <ReferenceLine
              y={10}
              stroke="#ef4444" strokeWidth={2} strokeDasharray="5 3"
              label={{
                value: 'OV  10 N/G | 33 Nmols | IDEXX 15-25',
                position: 'right',
                fill: '#ef4444', fontSize: 10, fontWeight: 700,
              }}
            />
            <ReferenceLine
              y={15}
              stroke="#10b981" strokeWidth={1.5} strokeDasharray="5 3"
              label={{
                value: '1st Fresh  15-18 N/G | IDEXX 38-48',
                position: 'right',
                fill: '#10b981', fontSize: 10, fontWeight: 600,
              }}
            />
            <ReferenceLine
              y={25}
              stroke="#0ea5e9" strokeWidth={1.5} strokeDasharray="3 3" strokeOpacity={0.7}
              label={{
                value: 'Frozen AI  25 N/G',
                position: 'right',
                fill: '#0ea5e9', fontSize: 10,
              }}
            />
            <ReferenceLine
              y={28}
              stroke="#059669" strokeWidth={2} strokeDasharray="5 3"
              label={{
                value: 'FERTILE  28 N/G | 89 Nmols | IDEXX 70+',
                position: 'right',
                fill: '#059669', fontSize: 10, fontWeight: 700,
              }}
            />

            {/* ── Estimated ovulation vertical line ────────────────────── */}
            {estimatedOvulationDay && (
              <ReferenceLine
                x={estimatedOvulationDay}
                stroke="#ef4444" strokeWidth={2} strokeDasharray="6 3"
                label={{
                  value: '🔴 OV',
                  position: 'top',
                  fill: '#ef4444', fontSize: 13, fontWeight: 'bold',
                }}
              />
            )}

            {/* ── Mating date vertical lines ────────────────────────────── */}
            {breedingDates.map((b, i) => {
              const day = b.day ?? chartData.find(d => d.date === b.date)?.day;
              if (!day) return null;
              const isLast = b.isLastMating;
              return (
                <ReferenceLine
                  key={i}
                  x={day}
                  stroke={isLast ? '#ef4444' : '#10b981'}
                  strokeWidth={isLast ? 3 : 2}
                  strokeDasharray={isLast ? '7 3' : undefined}
                  label={{
                    value: isLast ? '🎯 LAST' : `M${i + 1}`,
                    position: 'top',
                    fill: isLast ? '#ef4444' : '#10b981',
                    fontSize: isLast ? 13 : 12,
                    fontWeight: isLast ? 'bold' : 'normal',
                  }}
                />
              );
            })}

            {/* ── Soft gradient area under the curve ───────────────────── */}
            <Area
              type="natural"
              dataKey="level"
              fill="url(#progAreaGrad)"
              stroke="none"
              connectNulls
            />

            {/* ── Main progesterone line ────────────────────────────────── */}
            {/* type="natural" gives a smooth organic curve like the reference chart */}
            <Line
              type="natural"
              dataKey="level"
              stroke="#8b5cf6"
              strokeWidth={3}
              strokeLinejoin="round"
              strokeLinecap="round"
              dot={<CustomDot />}
              activeDot={<CustomActiveDot />}
              name="Progesterone (ng/mL)"
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* ── Phase reference legend ──────────────────────────────────────── */}
        {showPhaseColors && (
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm font-semibold text-foreground mb-4">
              Progesterone Phase Reference (VIDAS Chart)
            </p>

            {/* Milestone cards — mirroring the screenshot label boxes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {PHASE_MILESTONES.map((m) => (
                <div key={m.label} className="rounded-lg p-3"
                  style={{ backgroundColor: `${m.color}18`, border: `2px solid ${m.color}50` }}>
                  <p className="text-xs font-bold mb-2" style={{ color: m.color }}>{m.label}</p>
                  <p className="text-xs text-foreground font-medium">VIDAS {m.vidas_ng}</p>
                  <p className="text-xs text-muted-foreground">VIDAS {m.vidas_nmol}</p>
                  <p className="text-xs text-muted-foreground">{m.idexx}</p>
                </div>
              ))}
            </div>

            {/* Colour phase strip */}
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {PHASE_ZONES.map((zone) => (
                <div key={zone.label} className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: zone.color }} />
                  <span className="text-xs whitespace-nowrap">
                    <span className="font-medium text-foreground">{zone.label}</span>
                    <span className="text-muted-foreground">
                      {' '}({zone.min}–{zone.max === 36 ? '35+' : zone.max} ng/mL)
                    </span>
                  </span>
                </div>
              ))}
            </div>

            {/* OPTIMAL note */}
            <div className="mt-4 p-3 rounded-lg"
              style={{ backgroundColor: '#0ea5e915', border: '2px solid #0ea5e940' }}>
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-300 mb-1">
                ❄️ OPTIMAL — Frozen AI window (25–35 ng/mL · peak at 28 N/G · VIDAS 89 N/Mols)
              </p>
              <p className="text-xs text-muted-foreground">
                1× Mating frozen semen · 2nd mating fresh semen · IDEXX 70+ N/Mols at peak
              </p>
            </div>
          </div>
        )}

        {/* ── Breeding records ───────────────────────────────────────────── */}
        {breedingDates.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm font-semibold text-foreground mb-2">Breeding Records</p>
            <div className="flex flex-wrap gap-2">
              {breedingDates.map((b, i) => (
                <Badge key={i} variant="secondary"
                  className={b.isLastMating
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border-2 border-red-500'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                  }>
                  {b.isLastMating ? '🎯 LAST MATING' : `M${i + 1}`} · {b.date} ({b.method})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
