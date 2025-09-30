"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, Printer, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type ExportFormat = 'csv' | 'pdf' | 'print';

interface ReportExportButtonProps {
  data: any[];
  reportName: string;
  columns: { key: string; label: string }[];
  onExport?: (format: ExportFormat) => void;
}

export function ReportExportButton({
  data,
  reportName,
  columns,
  onExport,
}: ReportExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: ExportFormat) => {
    if (data.length === 0) {
      toast({
        title: "No Data",
        description: "There is no data to export",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);

    try {
      if (onExport) {
        onExport(format);
      } else {
        // Default export behavior
        switch (format) {
          case 'csv':
            exportToCSV();
            break;
          case 'pdf':
            exportToPDF();
            break;
          case 'print':
            handlePrint();
            break;
        }
      }

      toast({
        title: "Export Successful",
        description: `Report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the report",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = () => {
    // Create CSV header
    const header = columns.map(col => col.label).join(',');

    // Create CSV rows
    const rows = data.map(row => {
      return columns.map(col => {
        const value = row[col.key];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });

    // Combine header and rows
    const csv = [header, ...rows].join('\n');

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    // For now, trigger print dialog which can save as PDF
    // In a production app, you'd use a library like jsPDF
    window.print();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="hover:bg-primary/10 hover:border-primary shadow-card"
          disabled={exporting || data.length === 0}
        >
          {exporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="w-4 h-4 mr-2 text-chart-3" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="w-4 h-4 mr-2 text-destructive" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('print')}>
          <Printer className="w-4 h-4 mr-2 text-chart-4" />
          Print Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}