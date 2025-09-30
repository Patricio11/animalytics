"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

interface MatingRecord {
  id: string;
  matingDate: string;
  damId: string;
  damName: string;
  sireId: string;
  sireName: string;
  progesteroneReadings?: {
    date: string;
    value: number;
    unit: 'ng/mL' | 'nmol/L';
  }[];
  whelpingDate?: string;
  litterSize?: number;
  success: boolean;
}

interface MatingHistoryComparisonProps {
  matings: MatingRecord[];
  availableDams: { id: string; name: string }[];
  availableSires: { id: string; name: string }[];
}

export function MatingHistoryComparison({
  matings,
  availableDams,
  availableSires,
}: MatingHistoryComparisonProps) {
  const [selectedDam, setSelectedDam] = useState<string>("all");
  const [selectedSire, setSelectedSire] = useState<string>("all");
  const [comparisonMatings, setComparisonMatings] = useState<string[]>([]);

  // Filter matings based on selected dam and sire
  const filteredMatings = matings.filter(mating => {
    const matchesDam = selectedDam === "all" || mating.damId === selectedDam;
    const matchesSire = selectedSire === "all" || mating.sireId === selectedSire;
    return matchesDam && matchesSire;
  });

  // Add/remove mating from comparison
  const toggleComparison = (matingId: string) => {
    setComparisonMatings(prev => {
      if (prev.includes(matingId)) {
        return prev.filter(id => id !== matingId);
      } else if (prev.length < 3) {
        return [...prev, matingId];
      }
      return prev;
    });
  };

  // Get selected matings for comparison
  const selectedMatingsForComparison = filteredMatings.filter(m =>
    comparisonMatings.includes(m.id)
  );

  // Prepare progesterone chart data
  const prepareProgesteroneData = () => {
    const dataMap = new Map<string, any>();

    selectedMatingsForComparison.forEach((mating, index) => {
      if (!mating.progesteroneReadings) return;

      mating.progesteroneReadings.forEach(reading => {
        const daysFromMating = differenceInDays(
          new Date(reading.date),
          new Date(mating.matingDate)
        );
        const key = `Day ${daysFromMating}`;

        if (!dataMap.has(key)) {
          dataMap.set(key, { day: daysFromMating });
        }

        const matingLabel = `${mating.damName} × ${mating.sireName} (${format(new Date(mating.matingDate), 'MMM yyyy')})`;
        dataMap.get(key)[matingLabel] = reading.value;
      });
    });

    return Array.from(dataMap.values()).sort((a, b) => a.day - b.day);
  };

  const chartData = prepareProgesteroneData();

  const colors = ['#10b981', '#3b82f6', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card className="shadow-card bg-surface border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            Mating History Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dam-filter">Filter by Dam</Label>
              <Select value={selectedDam} onValueChange={setSelectedDam}>
                <SelectTrigger id="dam-filter" className="bg-background border-primary/20 focus:border-primary">
                  <SelectValue placeholder="All Dams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dams</SelectItem>
                  {availableDams.map((dam) => (
                    <SelectItem key={dam.id} value={dam.id}>
                      {dam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sire-filter">Filter by Sire</Label>
              <Select value={selectedSire} onValueChange={setSelectedSire}>
                <SelectTrigger id="sire-filter" className="bg-background border-primary/20 focus:border-primary">
                  <SelectValue placeholder="All Sires" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sires</SelectItem>
                  {availableSires.map((sire) => (
                    <SelectItem key={sire.id} value={sire.id}>
                      {sire.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-chart-4/10 border border-chart-4/20">
            <p className="text-sm text-muted-foreground">
              Select up to 3 matings to compare progesterone levels and outcomes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mating Selection */}
      <Card className="shadow-card bg-surface border-0">
        <CardHeader>
          <CardTitle className="text-base">Available Matings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredMatings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No matings found for the selected filters</p>
            </div>
          ) : (
            filteredMatings.map((mating) => {
              const isSelected = comparisonMatings.includes(mating.id);
              const hasProgesterone = mating.progesteroneReadings && mating.progesteroneReadings.length > 0;

              return (
                <div
                  key={mating.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all cursor-pointer",
                    isSelected
                      ? "border-primary bg-gradient-subtle shadow-card"
                      : "border-primary/10 hover:border-primary/30 bg-surface-secondary"
                  )}
                  onClick={() => toggleComparison(mating.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">
                          {mating.damName} × {mating.sireName}
                        </span>
                        <Badge variant={mating.success ? "default" : "destructive"} className="text-xs">
                          {mating.success ? 'Success' : 'Unsuccessful'}
                        </Badge>
                        {!hasProgesterone && (
                          <Badge variant="outline" className="text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            No Progesterone Data
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {format(new Date(mating.matingDate), 'MMM dd, yyyy')}
                        </span>
                        {mating.litterSize && (
                          <span>Litter: {mating.litterSize} puppies</span>
                        )}
                        {hasProgesterone && (
                          <span>
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                            {mating.progesteroneReadings!.length} readings
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComparison(mating.id);
                      }}
                    >
                      {isSelected ? 'Remove' : 'Compare'}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      {comparisonMatings.length > 0 && (
        <Card className="shadow-card bg-surface border-0">
          <CardHeader>
            <CardTitle className="text-base">Progesterone Level Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No progesterone data available for the selected matings
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    label={{ value: 'Days from Mating', position: 'insideBottom', offset: -5 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    label={{ value: 'Progesterone (ng/mL)', angle: -90, position: 'insideLeft' }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--surface))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  {selectedMatingsForComparison.map((mating, index) => {
                    const matingLabel = `${mating.damName} × ${mating.sireName} (${format(new Date(mating.matingDate), 'MMM yyyy')})`;
                    return (
                      <Line
                        key={mating.id}
                        type="monotone"
                        dataKey={matingLabel}
                        stroke={colors[index]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comparison Summary */}
      {comparisonMatings.length > 0 && (
        <Card className="shadow-card bg-surface border-0">
          <CardHeader>
            <CardTitle className="text-base">Outcome Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/10">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-muted-foreground">Mating</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-muted-foreground">Date</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-muted-foreground">Success</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-muted-foreground">Litter Size</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-muted-foreground">Progesterone Readings</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMatingsForComparison.map((mating) => (
                    <tr key={mating.id} className="border-b border-primary/5">
                      <td className="py-3 px-4 text-sm font-medium text-foreground">
                        {mating.damName} × {mating.sireName}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-foreground">
                        {format(new Date(mating.matingDate), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={mating.success ? "default" : "destructive"} className="text-xs">
                          {mating.success ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-foreground">
                        {mating.litterSize || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-foreground">
                        {mating.progesteroneReadings?.length || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}