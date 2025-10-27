"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Loader2 } from "lucide-react";
import { CURRENCIES } from "@/lib/utils/currency";
import { useToast } from "@/hooks/use-toast";

interface RegionalSettings {
  currency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  measurementUnit: string;
  language: string;
  locale?: string;
  firstDayOfWeek?: 0 | 1;
}

const TIMEZONES = [
  { value: "Africa/Johannesburg", label: "South Africa Standard Time (SAST, UTC+02:00)", offset: "+02:00" },
  { value: "UTC", label: "UTC", offset: "+00:00" },
  { value: "America/New_York", label: "Eastern Time (ET, UTC-05:00)", offset: "-05:00" },
  { value: "America/Chicago", label: "Central Time (CT, UTC-06:00)", offset: "-06:00" },
  { value: "America/Denver", label: "Mountain Time (MT, UTC-07:00)", offset: "-07:00" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT, UTC-08:00)", offset: "-08:00" },
  { value: "Europe/London", label: "London (GMT, UTC+00:00)", offset: "+00:00" },
  { value: "Europe/Paris", label: "Paris (CET, UTC+01:00)", offset: "+01:00" },
  { value: "Asia/Tokyo", label: "Tokyo (JST, UTC+09:00)", offset: "+09:00" },
  { value: "Australia/Sydney", label: "Sydney (AEST, UTC+10:00)", offset: "+10:00" },
  { value: "Australia/Melbourne", label: "Melbourne (AEST, UTC+10:00)", offset: "+10:00" },
];

const DATE_FORMATS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (UK/EU/ZA)" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (US)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (ISO)" },
];

const TIME_FORMATS = [
  { value: "24h", label: "24-hour" },
  { value: "12h", label: "12-hour (AM/PM)" },
];

const MEASUREMENT_UNITS = [
  { value: "metric", label: "Metric (kg, cm, °C)" },
  { value: "imperial", label: "Imperial (lbs, inches, °F)" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "af", label: "Afrikaans" },
  { value: "es", label: "Español (Spanish)" },
  { value: "pt", label: "Português (Portuguese)" },
  { value: "fr", label: "Français (French)" },
  { value: "de", label: "Deutsch (German)" },
];

export function RegionalSettings() {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<RegionalSettings>({
    currency: "ZAR",
    timezone: "Africa/Johannesburg",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    measurementUnit: "metric",
    language: "en",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings/regional');
        
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setSettings({
            currency: result.data.currency || "ZAR",
            timezone: result.data.timezone || "Africa/Johannesburg",
            dateFormat: result.data.dateFormat || "DD/MM/YYYY",
            timeFormat: result.data.timeFormat || "24h",
            measurementUnit: result.data.measurementUnit || "metric",
            language: result.data.language || "en",
            locale: result.data.locale,
            firstDayOfWeek: result.data.firstDayOfWeek,
          });
        }
      } catch (error) {
        console.error('Error fetching regional settings:', error);
        toast({
          title: "Error",
          description: "Failed to load settings. Using defaults.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleChange = (field: keyof RegionalSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/settings/regional', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Settings Saved",
          description: "Your regional preferences have been updated successfully.",
        });
      } else {
        throw new Error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving regional settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-card bg-surface border-0">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card bg-surface border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Regional Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Currency & Timezone */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Currency & Timezone</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={settings.currency} 
                onValueChange={(value) => handleChange('currency', value)}
              >
                <SelectTrigger className="bg-background border-primary/20 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CURRENCIES).map(([code, info]) => (
                    <SelectItem key={code} value={code}>
                      {info.symbol} {code} - {info.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={settings.timezone} 
                onValueChange={(value) => handleChange('timezone', value)}
              >
                <SelectTrigger className="bg-background border-primary/20 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Date & Time Format */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-foreground">Date & Time Format</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select 
                value={settings.dateFormat} 
                onValueChange={(value) => handleChange('dateFormat', value)}
              >
                <SelectTrigger className="bg-background border-primary/20 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMATS.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select 
                value={settings.timeFormat} 
                onValueChange={(value) => handleChange('timeFormat', value)}
              >
                <SelectTrigger className="bg-background border-primary/20 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_FORMATS.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Measurement Units */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-foreground">Measurement Units</h3>
          <div className="space-y-2">
            <Label htmlFor="measurementUnit">Unit System</Label>
            <Select 
              value={settings.measurementUnit} 
              onValueChange={(value) => handleChange('measurementUnit', value)}
            >
              <SelectTrigger className="bg-background border-primary/20 focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEASUREMENT_UNITS.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Weight, height, and temperature will be displayed in your preferred units
            </p>
          </div>
        </div>

        {/* Language */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-foreground">Language</h3>
          <div className="space-y-2">
            <Label htmlFor="language">Display Language</Label>
            <Select 
              value={settings.language} 
              onValueChange={(value) => handleChange('language', value)}
            >
              <SelectTrigger className="bg-background border-primary/20 focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-primary/10">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-gradient-brand hover:opacity-90 shadow-card"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
