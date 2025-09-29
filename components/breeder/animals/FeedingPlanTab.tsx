"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Clock, Utensils } from "lucide-react";
import { FeedingSchedule } from "@/lib/mock-data/animal-profile-details";

interface FeedingPlanTabProps {
  animalId: string;
  schedule: FeedingSchedule[];
  specialDietaryNotes?: string;
}

export function FeedingPlanTab({ animalId, schedule, specialDietaryNotes }: FeedingPlanTabProps) {
  const sortedSchedule = [...schedule].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6">
      {/* Feeding Schedule */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Utensils className="w-5 h-5 text-chart-4" />
              Daily Feeding Schedule
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-primary/10 hover:border-primary"
            >
              <Plus className="w-3 h-3 mr-2" />
              Add Feeding
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sortedSchedule.length > 0 ? (
            <div className="space-y-3">
              {sortedSchedule.map((feeding, index) => (
                <div
                  key={feeding.id}
                  className="p-4 rounded-lg border border-primary/10 bg-background hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-gradient-brand text-white">
                          <Clock className="w-3 h-3 mr-1" />
                          {feeding.time}
                        </Badge>
                        <span className="text-sm text-muted-foreground">Feeding #{index + 1}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Food Type</div>
                          <div className="font-semibold text-foreground">{feeding.foodType}</div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Amount</div>
                          <div className="font-semibold text-foreground">{feeding.amount}</div>
                        </div>
                      </div>

                      {feeding.notes && (
                        <div className="pt-2 border-t border-primary/10">
                          <div className="text-xs text-muted-foreground mb-1">Notes</div>
                          <p className="text-sm text-foreground">{feeding.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-primary/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-primary/20 rounded-lg">
              <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No feeding schedule set up yet</p>
              <Button variant="outline" className="hover:bg-primary/10 hover:border-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Feeding Schedule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Special Dietary Notes */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Special Dietary Notes</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-primary/10 hover:border-primary"
            >
              <Edit className="w-3 h-3 mr-2" />
              Edit Notes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {specialDietaryNotes ? (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-foreground whitespace-pre-wrap">{specialDietaryNotes}</p>
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-primary/20 rounded-lg">
              <p className="text-muted-foreground mb-4">No special dietary notes</p>
              <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:border-primary">
                Add Notes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Feeding Form (placeholder) */}
      <Card className="shadow-card border-primary/10 bg-surface-secondary">
        <CardHeader>
          <CardTitle className="text-lg">Quick Add Feeding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                className="bg-background border-primary/20"
                placeholder="09:00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="food-type">Food Type</Label>
              <Input
                id="food-type"
                className="bg-background border-primary/20"
                placeholder="e.g., Royal Canin Adult"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                className="bg-background border-primary/20"
                placeholder="e.g., 2 cups"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              className="bg-background border-primary/20"
              placeholder="Any special instructions or notes..."
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button className="bg-gradient-brand hover:opacity-90 shadow-card">
              <Plus className="w-4 h-4 mr-2" />
              Add to Schedule
            </Button>
            <Button variant="outline">
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}