"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Calendar } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface CompletedCycleCardProps {
  cycle: {
    id: string;
    bitch?: {
      name: string;
    };
    startDate: string;
    endDate?: string;
    currentDay?: number;
    nextExpectedCycleDate?: string;
    readings?: Array<{
      progesteroneLevel: string | number;
      testDate: string;
    }>;
  };
  onClick: () => void;
}

export function CompletedCycleCard({ cycle, onClick }: CompletedCycleCardProps) {
  const duration = cycle.endDate 
    ? differenceInDays(new Date(cycle.endDate), new Date(cycle.startDate))
    : 0;

  const lastReading = cycle.readings && cycle.readings.length > 0
    ? parseFloat(String(cycle.readings[0].progesteroneLevel)).toFixed(1)
    : 'N/A';

  const daysUntilNext = cycle.nextExpectedCycleDate
    ? differenceInDays(new Date(cycle.nextExpectedCycleDate), new Date())
    : 0;

  return (
    <Card 
      className="shadow-card bg-surface border-0 hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
      onClick={onClick}
    >
      {/* Green gradient top bar */}
      <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
      
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-lg">{cycle.bitch?.name || 'Unknown'}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(cycle.startDate), 'MMM dd, yyyy')} - 
              {cycle.endDate ? format(new Date(cycle.endDate), 'MMM dd, yyyy') : 'Ongoing'}
            </p>
          </div>
          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
            Completed
          </Badge>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Duration</p>
            <p className="text-lg font-bold text-foreground">{duration}</p>
            <p className="text-xs text-muted-foreground">days</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Readings</p>
            <p className="text-lg font-bold text-purple-600">{cycle.readings?.length || 0}</p>
            <p className="text-xs text-muted-foreground">tests</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Last Level</p>
            <p className="text-lg font-bold text-foreground">{lastReading}</p>
            <p className="text-xs text-muted-foreground">ng/mL</p>
          </div>
        </div>

        {/* Next Expected Cycle Alert */}
        {cycle.nextExpectedCycleDate && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Next Expected Heat</p>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  {format(new Date(cycle.nextExpectedCycleDate), 'MMM dd, yyyy')}
                  <span className="text-xs font-normal text-blue-600 dark:text-blue-400 ml-2">
                    (in {daysUntilNext} days)
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
