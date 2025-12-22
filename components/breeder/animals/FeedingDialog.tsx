"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Clock, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

interface MealTime {
  time: string;
  amount: string;
  unit: string;
}

interface Supplement {
  name: string;
  dosage: string;
  frequency: string;
}

interface FeedingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
  existingPlan?: any;
  animalName: string;
}

export function FeedingDialog({
  open,
  onOpenChange,
  onSave,
  existingPlan,
  animalName,
}: FeedingDialogProps) {
  const [foodType, setFoodType] = useState("");
  const [mealTimes, setMealTimes] = useState<MealTime[]>([
    { time: "08:00", amount: "", unit: "cups" },
  ]);
  const [specialDiet, setSpecialDiet] = useState("");
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [calorieTarget, setCalorieTarget] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [createTasks, setCreateTasks] = useState(true);

  // Load existing plan data
  useEffect(() => {
    if (existingPlan) {
      setFoodType(existingPlan.foodType || "");
      setMealTimes(existingPlan.mealTimes || [{ time: "08:00", amount: "", unit: "cups" }]);
      setSpecialDiet(existingPlan.specialDiet || "");
      setSupplements(existingPlan.supplements || []);
      setCalorieTarget(existingPlan.calorieTarget?.toString() || "");
      setSpecialNotes(existingPlan.specialNotes || "");
      setIsActive(existingPlan.isActive ?? true);
      setCreateTasks(false); // Don't create tasks when editing
    } else {
      resetForm();
    }
  }, [existingPlan, open]);

  const resetForm = () => {
    setFoodType("");
    setMealTimes([{ time: "08:00", amount: "", unit: "cups" }]);
    setSpecialDiet("");
    setSupplements([]);
    setCalorieTarget("");
    setSpecialNotes("");
    setIsActive(true);
    setCreateTasks(true);
  };

  const addMealTime = () => {
    setMealTimes([...mealTimes, { time: "12:00", amount: "", unit: "cups" }]);
  };

  const removeMealTime = (index: number) => {
    if (mealTimes.length > 1) {
      setMealTimes(mealTimes.filter((_, i) => i !== index));
    }
  };

  const updateMealTime = (index: number, field: keyof MealTime, value: string) => {
    const updated = [...mealTimes];
    updated[index] = { ...updated[index], [field]: value };
    setMealTimes(updated);
  };

  const addSupplement = () => {
    setSupplements([...supplements, { name: "", dosage: "", frequency: "daily" }]);
  };

  const removeSupplement = (index: number) => {
    setSupplements(supplements.filter((_, i) => i !== index));
  };

  const updateSupplement = (index: number, field: keyof Supplement, value: string) => {
    const updated = [...supplements];
    updated[index] = { ...updated[index], [field]: value };
    setSupplements(updated);
  };

  const handleSave = () => {
    // Validation
    if (!foodType.trim()) {
      alert("Please enter the food type");
      return;
    }

    const validMealTimes = mealTimes.filter(m => m.time && m.amount);
    if (validMealTimes.length === 0) {
      alert("Please add at least one meal time with amount");
      return;
    }

    const data = {
      foodType: foodType.trim(),
      mealTimes: validMealTimes,
      specialDiet: specialDiet.trim() || undefined,
      supplements: supplements.filter(s => s.name && s.dosage),
      calorieTarget: calorieTarget ? parseInt(calorieTarget) : undefined,
      specialNotes: specialNotes.trim() || undefined,
      isActive,
      createTasks: !existingPlan && createTasks, // Only for new plans
    };

    onSave(data);
    onOpenChange(false);
    if (!existingPlan) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            {existingPlan ? "Edit Feeding Plan" : "Create Feeding Plan"}
          </DialogTitle>
          <DialogDescription>
            {existingPlan
              ? `Update feeding schedule for ${animalName}`
              : `Set up a feeding schedule for ${animalName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Food Type */}
          <div className="space-y-2">
            <Label htmlFor="foodType">
              Food Type / Brand <span className="text-destructive">*</span>
            </Label>
            <Input
              id="foodType"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              placeholder="e.g., Royal Canin Adult, Hill's Science Diet"
              className="bg-background border-primary/20"
            />
          </div>

          {/* Meal Times */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Meal Times <span className="text-destructive">*</span></Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMealTime}
                className="h-8"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Meal
              </Button>
            </div>

            <div className="space-y-2">
              {mealTimes.map((meal, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div>
                      <Input
                        type="time"
                        value={meal.time}
                        onChange={(e) => updateMealTime(index, "time", e.target.value)}
                        className="bg-background border-primary/20"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        step="0.1"
                        value={meal.amount}
                        onChange={(e) => updateMealTime(index, "amount", e.target.value)}
                        placeholder="Amount"
                        className="bg-background border-primary/20"
                      />
                    </div>
                    <div>
                      <Select
                        value={meal.unit}
                        onValueChange={(value) => updateMealTime(index, "unit", value)}
                      >
                        <SelectTrigger className="bg-background border-primary/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cups">Cups</SelectItem>
                          <SelectItem value="grams">Grams</SelectItem>
                          <SelectItem value="kg">Kilograms</SelectItem>
                          <SelectItem value="oz">Ounces</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {mealTimes.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMealTime(index)}
                      className="h-10 w-10 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Special Diet */}
          <div className="space-y-2">
            <Label htmlFor="specialDiet">Special Diet</Label>
            <Input
              id="specialDiet"
              value={specialDiet}
              onChange={(e) => setSpecialDiet(e.target.value)}
              placeholder="e.g., Grain-free, Low-fat, Hypoallergenic"
              className="bg-background border-primary/20"
            />
          </div>

          {/* Supplements */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Supplements</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSupplement}
                className="h-8"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Supplement
              </Button>
            </div>

            {supplements.length > 0 && (
              <div className="space-y-2">
                {supplements.map((supplement, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <Input
                        value={supplement.name}
                        onChange={(e) => updateSupplement(index, "name", e.target.value)}
                        placeholder="Supplement name"
                        className="bg-background border-primary/20"
                      />
                      <Input
                        value={supplement.dosage}
                        onChange={(e) => updateSupplement(index, "dosage", e.target.value)}
                        placeholder="Dosage"
                        className="bg-background border-primary/20"
                      />
                      <Select
                        value={supplement.frequency}
                        onValueChange={(value) => updateSupplement(index, "frequency", value)}
                      >
                        <SelectTrigger className="bg-background border-primary/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="twice_daily">Twice Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="as_needed">As Needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSupplement(index)}
                      className="h-10 w-10 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calorie Target */}
          <div className="space-y-2">
            <Label htmlFor="calorieTarget">Daily Calorie Target</Label>
            <Input
              id="calorieTarget"
              type="number"
              value={calorieTarget}
              onChange={(e) => setCalorieTarget(e.target.value)}
              placeholder="e.g., 1200"
              className="bg-background border-primary/20"
            />
            <p className="text-xs text-muted-foreground">
              Optional: Set a daily calorie goal
            </p>
          </div>

          {/* Special Notes */}
          <div className="space-y-2">
            <Label htmlFor="specialNotes">Special Notes</Label>
            <Textarea
              id="specialNotes"
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="Any special feeding instructions, allergies, or preferences..."
              rows={3}
              className="bg-background border-primary/20"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="isActive" className="text-base">Active Plan</Label>
              <p className="text-sm text-muted-foreground">
                Set this as the current feeding plan
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          {/* Create Tasks Option (only for new plans) */}
          {!existingPlan && (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="space-y-0.5">
                <Label htmlFor="createTasks" className="text-base">Create Daily Tasks</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically create feeding tasks for today
                </p>
              </div>
              <Switch
                id="createTasks"
                checked={createTasks}
                onCheckedChange={setCreateTasks}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-gradient-brand hover:opacity-90">
            {existingPlan ? "Update Plan" : "Create Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
