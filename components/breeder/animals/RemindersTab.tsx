"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Bell, BellOff, Calendar, Edit, Trash2, Syringe, Stethoscope, Activity, Utensils } from "lucide-react";
import { ReminderSettings } from "@/lib/mock-data/animal-profile-details";
import { format } from "date-fns";

interface RemindersTabProps {
  animalId: string;
  animalType: 'dog' | 'bitch';
  reminders: ReminderSettings;
}

export function RemindersTab({ animalId, animalType, reminders }: RemindersTabProps) {
  const isBitch = animalType === 'bitch';

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <Card className="shadow-card border-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {reminders.enabled ? (
                <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <BellOff className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <div className="font-semibold text-foreground">
                  {reminders.enabled ? 'Reminders Enabled' : 'Reminders Disabled'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {reminders.enabled
                    ? 'You will receive notifications for this animal'
                    : 'No notifications will be sent for this animal'}
                </div>
              </div>
            </div>
            <Switch checked={reminders.enabled} />
          </div>
        </CardContent>
      </Card>

      {/* Standard Reminders */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-lg">Standard Reminders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vaccinations */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-primary/10 bg-background hover:bg-accent transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-chart-3/10 flex items-center justify-center">
                <Syringe className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <div className="font-medium text-foreground">Vaccinations</div>
                <div className="text-sm text-muted-foreground">Annual vaccination reminders</div>
              </div>
            </div>
            <Switch checked={reminders.vaccinations} disabled={!reminders.enabled} />
          </div>

          {/* Vet Checkups */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-primary/10 bg-background hover:bg-accent transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-chart-4/10 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <div className="font-medium text-foreground">Vet Checkups</div>
                <div className="text-sm text-muted-foreground">Regular health examination reminders</div>
              </div>
            </div>
            <Switch checked={reminders.vetCheckups} disabled={!reminders.enabled} />
          </div>

          {/* Feeding Schedule */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-primary/10 bg-background hover:bg-accent transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Utensils className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">Feeding Schedule</div>
                <div className="text-sm text-muted-foreground">Daily feeding time reminders</div>
              </div>
            </div>
            <Switch checked={reminders.feedingSchedule} disabled={!reminders.enabled} />
          </div>

          {/* Bitch-specific reminders */}
          {isBitch && (
            <>
              <div className="flex items-center justify-between p-4 rounded-lg border border-primary/10 bg-background hover:bg-accent transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-chart-2/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-chart-2" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Heat Cycles</div>
                    <div className="text-sm text-muted-foreground">Expected season start reminders</div>
                  </div>
                </div>
                <Switch checked={reminders.heatCycles} disabled={!reminders.enabled} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-primary/10 bg-background hover:bg-accent transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Season Tracking</div>
                    <div className="text-sm text-muted-foreground">Progesterone testing reminders during season</div>
                  </div>
                </div>
                <Switch checked={reminders.seasonTracking} disabled={!reminders.enabled} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Custom Reminders */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Custom Reminders</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-primary/10 hover:border-primary"
              disabled={!reminders.enabled}
            >
              <Plus className="w-3 h-3 mr-2" />
              Add Custom
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {reminders.customReminders.length > 0 ? (
            <div className="space-y-3">
              {reminders.customReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="p-4 rounded-lg border border-primary/10 bg-background hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-foreground mb-2">{reminder.title}</div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="outline" className="capitalize text-xs">
                          {reminder.frequency}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Next: {format(new Date(reminder.nextDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-primary/10"
                        disabled={!reminders.enabled}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-destructive/10 hover:text-destructive"
                        disabled={!reminders.enabled}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-primary/20 rounded-lg">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No custom reminders set</p>
              <Button
                variant="outline"
                className="hover:bg-primary/10 hover:border-primary"
                disabled={!reminders.enabled}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Reminder
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Custom Reminder Form */}
      <Card className="shadow-card border-primary/10 bg-surface-secondary">
        <CardHeader>
          <CardTitle className="text-lg">Quick Add Custom Reminder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reminder-title">Reminder Title</Label>
            <Input
              id="reminder-title"
              className="bg-background border-primary/20"
              placeholder="e.g., Hip X-ray for breeding certification"
              disabled={!reminders.enabled}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select disabled={!reminders.enabled}>
                <SelectTrigger id="frequency" className="bg-background border-primary/20">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="next-date">Next Date</Label>
              <Input
                id="next-date"
                type="date"
                className="bg-background border-primary/20"
                disabled={!reminders.enabled}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              className="bg-gradient-brand hover:opacity-90 shadow-card"
              disabled={!reminders.enabled}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Reminder
            </Button>
            <Button variant="outline" disabled={!reminders.enabled}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}