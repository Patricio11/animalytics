"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentUpload } from "@/components/upload";
import { STORAGE_PATHS } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useRegionalSettings } from "@/lib/contexts/regional-settings-context";
import { Heart, Save, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface AddHealthRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: string;
  animalName: string;
}

export function AddHealthRecordDialog({
  open,
  onOpenChange,
  animalId,
  animalName,
}: AddHealthRecordDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings } = useRegionalSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    recordType: "vaccination",
    recordDate: format(new Date(), "yyyy-MM-dd"),
    veterinarianName: "",
    clinicName: "",
    vaccinationType: "",
    nextDueDate: "",
    medicationName: "",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
    diagnosis: "",
    treatment: "",
    cost: "",
    notes: "",
    certificateUrl: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/animals/${animalId}/health`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create health record");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-records", animalId] });
      toast({
        title: "Health Record Added",
        description: `Health record for ${animalName} has been added successfully`,
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      recordType: "vaccination",
      recordDate: format(new Date(), "yyyy-MM-dd"),
      veterinarianName: "",
      clinicName: "",
      vaccinationType: "",
      nextDueDate: "",
      medicationName: "",
      dosage: "",
      frequency: "",
      startDate: "",
      endDate: "",
      diagnosis: "",
      treatment: "",
      cost: "",
      notes: "",
      certificateUrl: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare data based on record type
      const submitData: any = {
        recordType: formData.recordType,
        recordDate: formData.recordDate,
        veterinarianName: formData.veterinarianName || undefined,
        clinicName: formData.clinicName || undefined,
        diagnosis: formData.diagnosis || undefined,
        treatment: formData.treatment || undefined,
        cost: formData.cost ? parseFloat(formData.cost) * 100 : undefined, // Convert to cents
        currency: settings.currency, // Use breeder's currency setting
        notes: formData.notes || undefined,
        certificateUrl: formData.certificateUrl || undefined,
      };

      // Add type-specific fields
      if (formData.recordType === "vaccination") {
        submitData.vaccinationType = formData.vaccinationType;
        submitData.nextDueDate = formData.nextDueDate || undefined;
      }

      if (formData.recordType === "medication") {
        submitData.medicationName = formData.medicationName;
        submitData.dosage = formData.dosage || undefined;
        submitData.frequency = formData.frequency || undefined;
        submitData.startDate = formData.startDate || undefined;
        submitData.endDate = formData.endDate || undefined;
      }

      await createMutation.mutateAsync(submitData);
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 shadow-md">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>Add Health Record</DialogTitle>
              <DialogDescription>
                Add a new health record for {animalName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Record Type */}
          <div className="space-y-2">
            <Label htmlFor="recordType">Record Type *</Label>
            <Select
              value={formData.recordType}
              onValueChange={(value) => updateField("recordType", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vaccination">Vaccination</SelectItem>
                <SelectItem value="checkup">Checkup</SelectItem>
                <SelectItem value="medication">Medication</SelectItem>
                <SelectItem value="illness">Illness</SelectItem>
                <SelectItem value="injury">Injury</SelectItem>
                <SelectItem value="surgery">Surgery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Record Date */}
          <div className="space-y-2">
            <Label htmlFor="recordDate">Date *</Label>
            <Input
              id="recordDate"
              type="date"
              value={formData.recordDate}
              onChange={(e) => updateField("recordDate", e.target.value)}
              required
            />
          </div>

          {/* Veterinarian & Clinic */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="veterinarianName">Veterinarian Name</Label>
              <Input
                id="veterinarianName"
                value={formData.veterinarianName}
                onChange={(e) => updateField("veterinarianName", e.target.value)}
                placeholder="Dr. Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinicName">Clinic Name</Label>
              <Input
                id="clinicName"
                value={formData.clinicName}
                onChange={(e) => updateField("clinicName", e.target.value)}
                placeholder="Animal Hospital"
              />
            </div>
          </div>

          {/* Vaccination-specific fields */}
          {formData.recordType === "vaccination" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="vaccinationType">Vaccination Type *</Label>
                <Input
                  id="vaccinationType"
                  value={formData.vaccinationType}
                  onChange={(e) => updateField("vaccinationType", e.target.value)}
                  placeholder="e.g., Rabies, DHPP, Bordetella"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextDueDate">Next Due Date</Label>
                <Input
                  id="nextDueDate"
                  type="date"
                  value={formData.nextDueDate}
                  onChange={(e) => updateField("nextDueDate", e.target.value)}
                />
              </div>
            </>
          )}

          {/* Medication-specific fields */}
          {formData.recordType === "medication" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="medicationName">Medication Name *</Label>
                <Input
                  id="medicationName"
                  value={formData.medicationName}
                  onChange={(e) => updateField("medicationName", e.target.value)}
                  placeholder="e.g., Antibiotics"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => updateField("dosage", e.target.value)}
                    placeholder="e.g., 10mg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => updateField("frequency", e.target.value)}
                    placeholder="e.g., Twice daily"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateField("startDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => updateField("endDate", e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Diagnosis & Treatment */}
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => updateField("diagnosis", e.target.value)}
              placeholder="Enter diagnosis details..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment">Treatment</Label>
            <Textarea
              id="treatment"
              value={formData.treatment}
              onChange={(e) => updateField("treatment", e.target.value)}
              placeholder="Enter treatment details..."
              rows={3}
            />
          </div>

          {/* Cost */}
          <div className="space-y-2">
            <Label htmlFor="cost">Cost ({settings.currency})</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {settings.currency === 'USD' ? '$' : settings.currency === 'EUR' ? '€' : settings.currency === 'GBP' ? '£' : settings.currency}
              </span>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => updateField("cost", e.target.value)}
                placeholder="0.00"
                className="pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground">Enter the cost in {settings.currency}</p>
          </div>

          {/* Certificate Upload */}
          <div className="space-y-2">
            <DocumentUpload
              storagePath={STORAGE_PATHS.HEALTH_RECORDS}
              onUploadSuccess={(result) => {
                updateField("certificateUrl", result.url!);
                toast({
                  title: "Certificate Uploaded",
                  description: "Health certificate uploaded successfully",
                });
              }}
              onUploadError={(error) => {
                toast({
                  title: "Upload Failed",
                  description: error,
                  variant: "destructive",
                });
              }}
              currentDocumentUrl={formData.certificateUrl || undefined}
              label="Health Certificate / Document"
              helperText="Upload vaccination certificate, lab results, or medical documents"
              maxSizeInMB={10}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Any additional notes or observations..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Record
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
