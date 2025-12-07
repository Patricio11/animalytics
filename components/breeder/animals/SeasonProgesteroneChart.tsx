"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Dot,
} from "recharts";
import { format, differenceInDays, addDays } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Baby, Calendar, AlertCircle } from "lucide-react";

interface ProgesteroneReading {
  date: string;
  value: number;
  unit: "ng/mL" | "nmol/L";
  completed?: boolean;
}

interface SeasonProgesteroneChartProps {
  readings: ProgesteroneReading[];
  matingDate?: string; // First mating date
}

export function SeasonProgesteroneChart({ readings, matingDate }: SeasonProgesteroneChartProps) {
  const chartData = useMemo(() => {
    if (!readings || readings.length === 0) return [];

    // Sort readings by date
    const sortedReadings = [...readings].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate day relative to first reading (Day 0)
    const firstDate = new Date(sortedReadings[0].date);

    return sortedReadings.map((reading) => {
      const dayNumber = differenceInDays(new Date(reading.date), firstDate);
      return {
        day: dayNumber,
        value: reading.value,
        unit: reading.unit,
        date: reading.date,
        displayDate: format(new Date(reading.date), "MMM dd"),
        completed: reading.completed || false,
      };
    });
  }, [readings]);

  // Pregnancy detection and calculations
  const pregnancyInfo = useMemo(() => {
    if (!readings || readings.length === 0 || !matingDate) return null;

    // Check if progesterone stays >= 2.5 ng/mL (pregnancy indicator)
    const hasDroppedBelow25 = readings.some(r => r.value < 2.5);
    const isPregnant = !hasDroppedBelow25 && readings.length > 0;

    if (!isPregnant) return null;

    // Calculate expected whelping date (63 days from mating)
    const mating = new Date(matingDate);
    const whelpingDate = addDays(mating, 63);
    const day28Date = addDays(mating, 28);

    // Calculate day 28 relative to first reading
    const firstDate = new Date(readings[0].date);
    const day28Number = differenceInDays(day28Date, firstDate);
    const whelpingDayNumber = differenceInDays(whelpingDate, firstDate);

    return {
      isPregnant,
      whelpingDate,
      day28Date,
      day28Number,
      whelpingDayNumber,
    };
  }, [readings, matingDate]);

  // Calculate dynamic Y-axis domain
  const yAxisDomain = useMemo(() => {
    if (!readings || readings.length === 0) return [0, 15];
    
    const values = readings.map(r => r.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    
    // Add 20% padding to max value
    const paddedMax = Math.ceil(maxValue * 1.2);
    
    return [0, paddedMax];
  }, [readings]);

  if (!readings || readings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No progesterone readings to display
      </div>
    );
  }

  // Get unit from first reading (assuming all use same unit)
  const unit = readings[0]?.unit || "ng/mL";

  return (
    <div className="w-full">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-foreground mb-1">
          Progesterone Levels Over Time
        </h4>
        <p className="text-xs text-muted-foreground">
          Day 0 represents {format(new Date(readings[0].date), "MMM dd, yyyy")}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--primary) / 0.1)"
          />
          <XAxis
            dataKey="day"
            label={{
              value: "Day of Cycle",
              position: "insideBottom",
              offset: -5,
              style: {
                fill: "hsl(var(--muted-foreground))",
                fontSize: 12,
              },
            }}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickFormatter={(value) => `Day ${value}`}
          />
          <YAxis
            domain={yAxisDomain}
            label={{
              value: `Progesterone (${unit})`,
              angle: -90,
              position: "insideLeft",
              style: {
                fill: "hsl(var(--muted-foreground))",
                fontSize: 12,
                textAnchor: "middle",
              },
            }}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--surface))",
              border: "1px solid hsl(var(--primary) / 0.2)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
            labelStyle={{
              color: "hsl(var(--foreground))",
              fontWeight: 600,
              marginBottom: "4px",
            }}
            itemStyle={{
              color: "hsl(var(--chart-3))",
            }}
            formatter={(value: number, name: string, props: { payload?: { displayDate: string; day: number } }) => {
              return [
                `${value} ${unit}`,
                props.payload ? `${props.payload.displayDate} (Day ${props.payload.day})` : '',
              ];
            }}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "12px",
            }}
            iconType="line"
          />
          {/* Reference line for pregnancy threshold */}
          <ReferenceLine
            y={2.5}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="3 3"
            label={{
              value: "Pregnancy Threshold (2.5)",
              position: "insideTopRight",
              fill: "hsl(var(--muted-foreground))",
              fontSize: 10,
            }}
          />

          {/* Day 28 reminder line */}
          {pregnancyInfo && pregnancyInfo.day28Number >= 0 && (
            <ReferenceLine
              x={pregnancyInfo.day28Number}
              stroke="hsl(var(--chart-4))"
              strokeDasharray="5 5"
              label={{
                value: "Day 28 Test",
                position: "top",
                fill: "hsl(var(--chart-4))",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          )}

          {/* Expected whelping date line */}
          {pregnancyInfo && pregnancyInfo.whelpingDayNumber >= 0 && (
            <ReferenceLine
              x={pregnancyInfo.whelpingDayNumber}
              stroke="hsl(var(--chart-1))"
              strokeDasharray="5 5"
              label={{
                value: "Expected Puppies",
                position: "top",
                fill: "hsl(var(--chart-1))",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          )}

          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--chart-3))"
            strokeWidth={3}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              // Green circle for completed tests, regular for pending
              const isCompleted = payload.completed;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={isCompleted ? 6 : 5}
                  fill={isCompleted ? "hsl(var(--chart-3))" : "hsl(var(--surface))"}
                  stroke={"hsl(var(--chart-3))"}
                  strokeWidth={2}
                />
              );
            }}
            activeDot={{
              r: 7,
              fill: "hsl(var(--chart-3))",
              stroke: "hsl(var(--surface))",
              strokeWidth: 2,
            }}
            name="Progesterone Level"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Pregnancy Status Alert */}
      {pregnancyInfo && (
        <Alert className="mt-4 border-chart-1/50 bg-chart-1/10">
          <Baby className="h-4 w-4 text-chart-1" />
          <AlertDescription className="ml-2">
            <div className="space-y-2">
              <div className="font-semibold text-foreground flex items-center gap-2">
                <Badge className="bg-chart-1 text-white">Pregnancy Detected</Badge>
                <span className="text-sm">Progesterone levels remain elevated (≥2.5 ng/mL)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-chart-1" />
                  <span className="text-muted-foreground">Expected Whelping:</span>
                  <span className="font-semibold text-foreground">
                    {format(pregnancyInfo.whelpingDate, "MMM dd, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-chart-4" />
                  <span className="text-muted-foreground">Day 28 Test Due:</span>
                  <span className="font-semibold text-foreground">
                    {format(pregnancyInfo.day28Date, "MMM dd, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Legend for chart markers */}
      <div className="mt-4 p-3 rounded-lg bg-surface-secondary border border-primary/10">
        <div className="text-xs space-y-2">
          <div className="font-semibold text-foreground mb-2">Chart Legend:</div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-chart-3 border-2 border-surface"></div>
              <span className="text-muted-foreground">Completed Test</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-surface border-2 border-chart-3"></div>
              <span className="text-muted-foreground">Pending Test</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reference Information */}
      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <div className="text-xs space-y-1">
          <div className="font-semibold text-foreground mb-2">
            Progesterone Reference Ranges:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pre-ovulation:</span>
              <span className="font-medium text-foreground">&lt; 2 ng/mL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ovulation:</span>
              <span className="font-medium text-foreground">5-10 ng/mL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Post-ovulation:</span>
              <span className="font-medium text-foreground">15-90 ng/mL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pregnancy threshold:</span>
              <span className="font-medium text-foreground">≥2.5 ng/mL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}