"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Theme = "light" | "dark" | "system";

export function AppearanceSettings() {
  const { toast } = useToast();
  
  const [theme, setTheme] = useState<Theme>("system");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // TODO: Implement API call to save theme preference
      // await fetch('/api/user/settings/appearance', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ theme }),
      // });

      // Apply theme to document
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        document.documentElement.classList.toggle("dark", systemTheme === "dark");
      } else {
        document.documentElement.classList.toggle("dark", theme === "dark");
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "Theme Updated",
        description: `Theme has been set to ${theme}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save theme preference. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-card bg-surface border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Appearance & Theme
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select 
              value={theme} 
              onValueChange={(value: Theme) => setTheme(value)}
            >
              <SelectTrigger className="bg-background border-primary/20 focus:border-primary" data-testid="select-theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System Default</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose how Animalytics looks to you. Select a single theme, or sync with your system.
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-primary/10">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-gradient-brand hover:opacity-90 shadow-card" 
            data-testid="button-save-appearance"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
