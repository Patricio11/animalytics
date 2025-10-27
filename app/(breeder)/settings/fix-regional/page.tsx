"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MapPin, CheckCircle } from "lucide-react";

export default function FixRegionalSettings() {
  const { toast } = useToast();
  const [isFixing, setIsFixing] = useState(false);
  const [isFixed, setIsFixed] = useState(false);

  const handleFix = async () => {
    setIsFixing(true);
    
    try {
      const response = await fetch('/api/settings/regional/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fix settings');
      }

      const result = await response.json();

      if (result.success) {
        setIsFixed(true);
        toast({
          title: "Settings Fixed! ✅",
          description: "Your regional settings have been set to South Africa defaults (ZAR, SAST, DD/MM/YYYY).",
        });
      } else {
        throw new Error(result.error || 'Failed to fix settings');
      }
    } catch (error) {
      console.error('Error fixing regional settings:', error);
      toast({
        title: "Error",
        description: "Failed to fix settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Fix Regional Settings</h1>
          <p className="text-muted-foreground">Set your regional preferences to South Africa defaults</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              South Africa Regional Settings
            </CardTitle>
            <CardDescription>
              This will update your account to use South African regional defaults
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">Settings that will be applied:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span><strong>Currency:</strong> ZAR (South African Rand - R)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span><strong>Timezone:</strong> Africa/Johannesburg (SAST, UTC+02:00)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span><strong>Date Format:</strong> DD/MM/YYYY</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span><strong>Time Format:</strong> 24-hour</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span><strong>Measurement:</strong> Metric (kg, cm, °C)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span><strong>Language:</strong> English</span>
                </li>
              </ul>
            </div>

            {isFixed ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <p className="font-semibold">Settings Updated Successfully!</p>
                </div>
                <p className="text-sm text-green-600 mt-2">
                  Go to <a href="/settings" className="underline font-medium">Settings → Regional</a> to verify your changes.
                </p>
              </div>
            ) : (
              <Button
                onClick={handleFix}
                disabled={isFixing}
                className="w-full bg-gradient-brand hover:opacity-90 shadow-card"
                size="lg"
              >
                {isFixing ? "Fixing Settings..." : "Fix My Regional Settings"}
              </Button>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Note: This is a one-time fix. New users will automatically get location-based settings.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
