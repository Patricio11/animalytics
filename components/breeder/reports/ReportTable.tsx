"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

export interface ReportColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface ReportTableProps {
  title: string;
  columns: ReportColumn[];
  data: Record<string, unknown>[];
  emptyMessage?: string;
  summary?: {
    label: string;
    value: string | number;
    color?: string;
  }[];
}

export function ReportTable({
  title,
  columns,
  data,
  emptyMessage = "No data available for the selected period",
  summary,
}: ReportTableProps) {
  const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  return (
    <Card className="shadow-card bg-surface border-0">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Section */}
        {summary && summary.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 rounded-lg bg-surface-secondary border border-primary/10">
            {summary.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className={cn(
                  "text-lg font-bold",
                  item.color || "text-foreground"
                )}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {data.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Data</h3>
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/10">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        "py-3 px-4 text-sm font-semibold text-muted-foreground",
                        getAlignmentClass(column.align)
                      )}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-primary/5 hover:bg-surface-secondary/50 transition-colors"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "py-3 px-4 text-sm text-foreground",
                          getAlignmentClass(column.align)
                        )}
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : (row[column.key] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Row Count */}
        {data.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Showing {data.length} {data.length === 1 ? 'record' : 'records'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to format date for table display
export function formatTableDate(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

// Helper function to format time for table display
export function formatTableTime(time: string): string {
  return time;
}

// Helper function to render status badge
export function renderStatusBadge(status: string, colorMap?: Record<string, string>) {
  const defaultColors: Record<string, string> = {
    completed: 'bg-chart-3 text-white',
    pending: 'bg-chart-4 text-white',
    overdue: 'bg-destructive text-white',
    active: 'bg-chart-3 text-white',
    inactive: 'bg-muted text-muted-foreground',
  };

  const colors = colorMap || defaultColors;
  const colorClass = colors[status.toLowerCase()] || 'bg-muted text-muted-foreground';

  return (
    <Badge className={cn(colorClass, "capitalize")}>
      {status}
    </Badge>
  );
}