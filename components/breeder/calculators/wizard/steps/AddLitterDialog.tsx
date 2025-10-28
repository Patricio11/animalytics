"use client";

import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddLitterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bitchId: string;
  onSuccess: () => void;
}

export function AddLitterDialog({
  open,
  onOpenChange,
  bitchId,
  onSuccess,
}: AddLitterDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    sireName: "",
    puppyCount: "",
    complications: false,
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.date || !formData.sireName || !formData.puppyCount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/animals/${bitchId}/litters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matingDate: formData.date,
          puppyCount: parseInt(formData.puppyCount),
          hasComplications: formData.complications,
          status: 'whelped', // Since this is historical data
          notes: formData.sireName ? `Sire: ${formData.sireName}` : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add litter");
      }

      toast({
        title: "Litter Added",
        description: "Litter history has been recorded successfully",
      });

      // Reset form
      setFormData({
        date: "",
        sireName: "",
        puppyCount: "",
        complications: false,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adding litter:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add litter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Litter Record</DialogTitle>
          <DialogDescription>
            Record a previous litter for this bitch
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">
              Litter Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => updateFormData("date", e.target.value)}
              className="border-primary/20 focus:border-primary"
            />
          </div>

          {/* Sire Name */}
          <div className="space-y-2">
            <Label htmlFor="sireName">
              Sire Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sireName"
              value={formData.sireName}
              onChange={(e) => updateFormData("sireName", e.target.value)}
              placeholder="Enter sire's name"
              className="border-primary/20 focus:border-primary"
            />
          </div>

          {/* Puppy Count */}
          <div className="space-y-2">
            <Label htmlFor="puppyCount">
              Number of Puppies <span className="text-destructive">*</span>
            </Label>
            <Input
              id="puppyCount"
              type="number"
              min="1"
              value={formData.puppyCount}
              onChange={(e) => updateFormData("puppyCount", e.target.value)}
              placeholder="Enter number of puppies"
              className="border-primary/20 focus:border-primary"
            />
          </div>

          {/* Complications */}
          <div className="flex items-center justify-between space-x-2 p-4 rounded-lg border border-primary/10 bg-background">
            <div className="space-y-0.5">
              <Label htmlFor="complications" className="text-base">
                Complications
              </Label>
              <div className="text-sm text-muted-foreground">
                Were there any complications during pregnancy or birth?
              </div>
            </div>
            <Switch
              id="complications"
              checked={formData.complications}
              onCheckedChange={(checked) =>
                updateFormData("complications", checked)
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-brand hover:opacity-90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Litter"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
