"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { XCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface CancelledCycleCardProps {
  cycle: {
    id: string;
    bitch?: {
      name: string;
    };
    startDate: string;
    endDate?: string;
    currentDay?: number;
    notes?: string;
    readings?: Array<{
      progesteroneLevel: string | number;
      testDate: string;
    }>;
  };
  onClick: () => void;
}

export function CancelledCycleCard({ cycle, onClick }: CancelledCycleCardProps) {
  const duration = cycle.endDate 
    ? differenceInDays(new Date(cycle.endDate), new Date(cycle.startDate))
    : cycle.currentDay || 1;

  const lastReading = cycle.readings && cycle.readings.length > 0
    ? parseFloat(String(cycle.readings[0].progesteroneLevel)).toFixed(1)
    : 'N/A';

  return (
    <Card 
      className="shadow-card bg-surface border-0 hover:shadow-lg transition-all cursor-pointer overflow-hidden opacity-90 hover:opacity-100"
      onClick={onClick}
    >
      {/* Amber gradient top bar */}
      <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
      
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-lg">{cycle.bitch?.name || 'Unknown'}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Started: {format(new Date(cycle.startDate), 'MMM dd, yyyy')}
            </p>
            {cycle.endDate && (
              <p className="text-sm text-muted-foreground">
                Cancelled: {format(new Date(cycle.endDate), 'MMM dd, yyyy')}
              </p>
            )}
          </div>
          <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
            Cancelled
          </Badge>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
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

        {/* Cancellation Note */}
        {cycle.notes && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium mb-1">Cancellation Note</p>
            <p className="text-sm text-amber-900 dark:text-amber-100">{cycle.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
