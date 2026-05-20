"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Settings, Globe, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PreferencesTabProps {
  userId: string;
  user: any;
}

const TIMEZONES = [
  "UTC",
  "Africa/Johannesburg",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "pt", label: "Portuguese" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "af", label: "Afrikaans" },
];

const LOCALES = [
  "en-US",
  "en-GB",
  "en-ZA",
  "pt-BR",
  "pt-PT",
  "es-ES",
  "es-MX",
  "fr-FR",
  "de-DE",
  "af-ZA",
];

const CURRENCIES = ["USD", "EUR", "GBP", "ZAR", "AUD", "CAD", "BRL", "JPY"];

export function PreferencesTab({ userId, user }: PreferencesTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const prefs = user.preferences || {};

  const [notifications, setNotifications] = useState<boolean>(prefs.notifications ?? true);
  const [emailUpdates, setEmailUpdates] = useState<boolean>(prefs.emailUpdates ?? true);
  const [darkMode, setDarkMode] = useState<boolean>(prefs.darkMode ?? false);
  const [language, setLanguage] = useState(prefs.language || "en");
  const [timezone, setTimezone] = useState(prefs.timezone || "UTC");
  const [currency, setCurrency] = useState(prefs.currency || "USD");
  const [locale, setLocale] = useState(prefs.locale || "en-US");
  const [dateFormat, setDateFormat] = useState(prefs.dateFormat || "MM/DD/YYYY");
  const [timeFormat, setTimeFormat] = useState(prefs.timeFormat || "12h");
  const [measurementUnit, setMeasurementUnit] = useState(prefs.measurementUnit || "metric");
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<number>(prefs.firstDayOfWeek ?? 0);

  useEffect(() => {
    const p = user.preferences || {};
    setNotifications(p.notifications ?? true);
    setEmailUpdates(p.emailUpdates ?? true);
    setDarkMode(p.darkMode ?? false);
    setLanguage(p.language || "en");
    setTimezone(p.timezone || "UTC");
    setCurrency(p.currency || "USD");
    setLocale(p.locale || "en-US");
    setDateFormat(p.dateFormat || "MM/DD/YYYY");
    setTimeFormat(p.timeFormat || "12h");
    setMeasurementUnit(p.measurementUnit || "metric");
    setFirstDayOfWeek(p.firstDayOfWeek ?? 0);
  }, [user]);

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/users/${userId}/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notifications,
          emailUpdates,
          darkMode,
          language,
          timezone,
          currency,
          locale,
          dateFormat,
          timeFormat,
          measurementUnit,
          firstDayOfWeek,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      toast({ title: "Saved", description: "Preferences updated." });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  return (
    <div className="space-y-4">
      {/* Notifications */}
      <Card className="shadow-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <Toggle
            id="pref-notif"
            label="In-app notifications"
            description="Push and in-app notifications for breeding events, messages, etc."
            value={notifications}
            onChange={setNotifications}
          />
          <Toggle
            id="pref-email"
            label="Email updates"
            description="Periodic emails with reminders and summaries."
            value={emailUpdates}
            onChange={setEmailUpdates}
          />
          <Toggle
            id="pref-dark"
            label="Dark mode"
            description="Use the dark UI theme."
            value={darkMode}
            onChange={setDarkMode}
          />
        </CardContent>
      </Card>

      {/* Regional */}
      <Card className="shadow-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Regional Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Locale</Label>
              <Select value={locale} onValueChange={setLocale}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LOCALES.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date Format</Label>
              <Select value={dateFormat} onValueChange={(v) => setDateFormat(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Time Format</Label>
              <Select value={timeFormat} onValueChange={(v) => setTimeFormat(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour (e.g. 3:30 PM)</SelectItem>
                  <SelectItem value="24h">24-hour (e.g. 15:30)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Measurement Unit</Label>
              <Select value={measurementUnit} onValueChange={(v) => setMeasurementUnit(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                  <SelectItem value="imperial">Imperial (lb, in)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>First Day of Week</Label>
              <Select value={String(firstDayOfWeek)} onValueChange={(v) => setFirstDayOfWeek(parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => save.mutate()} disabled={save.isPending} className="bg-gradient-brand">
          <Save className="w-4 h-4 mr-2" />
          {save.isPending ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}

function Toggle({
  id,
  label,
  description,
  value,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
      <Switch id={id} checked={value} onCheckedChange={onChange} />
      <div className="flex-1">
        <Label htmlFor={id} className="cursor-pointer font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
