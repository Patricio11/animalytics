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
} from "recharts";
import { format, differenceInDays } from "date-fns";

interface ProgesteroneReading {
  date: string;
  value: number;
  unit: "ng/mL" | "nmol/L";
}

interface SeasonProgesteroneChartProps {
  readings: ProgesteroneReading[];
}

export function SeasonProgesteroneChart({ readings }: SeasonProgesteroneChartProps) {
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
      };
    });
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
            formatter={(value: number, name: string, props: { payload: { displayDate: string; day: number } }) => {
              return [
                `${value} ${unit}`,
                `${props.payload.displayDate} (Day ${props.payload.day})`,
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
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--chart-3))"
            strokeWidth={3}
            dot={{
              fill: "hsl(var(--chart-3))",
              strokeWidth: 2,
              r: 5,
              stroke: "hsl(var(--surface))",
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
              <span className="text-muted-foreground">Optimal breeding:</span>
              <span className="font-medium text-foreground">8-25 ng/mL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}