"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export function DataSettings() {
  const { toast } = useToast();
  
  const [isExporting, setIsExporting] = useState(false);
  const [storageUsed] = useState(48); // Percentage

  const handleExportData = async () => {
    setIsExporting(true);
    
    try {
      // TODO: Implement API call to export data
      // const response = await fetch('/api/user/data/export', {
      //   method: 'POST',
      // });
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = 'animalytics-data-export.zip';
      // a.click();

      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Export Started",
        description: "Your data export has been initiated. You'll receive a download link via email shortly.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion with confirmation dialog
    toast({
      title: "Account Deletion",
      description: "This feature requires additional confirmation. Please contact support.",
      variant: "destructive",
    });
  };

  return (
    <Card className="shadow-card bg-surface border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">Export Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Download a copy of all your data including animals, reports, and documents.
            </p>
            <Button 
              variant="outline" 
              onClick={handleExportData}
              disabled={isExporting}
              className="hover:bg-primary/10 hover:border-primary shadow-card" 
              data-testid="button-export-data"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exporting..." : "Export All Data"}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium text-foreground mb-2">Storage Usage</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Documents & Photos</span>
                <span>2.4 GB / 5 GB</span>
              </div>
              <Progress value={storageUsed} className="h-2" />
              <p className="text-xs text-muted-foreground">
                You're using {storageUsed}% of your available storage.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium text-destructive mb-2">Danger Zone</h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={handleDeleteAccount}
                className="text-destructive border-destructive hover:bg-destructive/10 shadow-card" 
                data-testid="button-delete-account"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
              <p className="text-xs text-muted-foreground">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
