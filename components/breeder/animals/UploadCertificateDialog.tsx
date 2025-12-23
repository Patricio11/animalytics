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
import { DocumentUpload } from "@/components/upload/DocumentUpload";
import { STORAGE_PATHS } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRegionalSettings } from "@/lib/contexts/regional-settings-context";
import { FileText, Upload, Loader2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import type { UploadResult } from "@/lib/supabase/upload";

interface UploadCertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: string;
  animalName: string;
}

export function UploadCertificateDialog({
  open,
  onOpenChange,
  animalId,
  animalName,
}: UploadCertificateDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings } = useRegionalSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to get currency symbol
  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      ZAR: 'R',
    };
    return symbols[currency] || currency;
  };

  const [formData, setFormData] = useState({
    certificateType: "vaccination",
    recordType: "vaccination",
    recordDate: new Date(),
    veterinarianName: "",
    veterinarianEmail: "",
    veterinarianPhone: "",
    clinicName: "",
    vaccinationType: "",
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
        throw new Error(error.message || "Failed to upload certificate");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-records", animalId] });
      toast({
        title: "Certificate Uploaded",
        description: `Certificate for ${animalName} has been uploaded successfully`,
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
      certificateType: "vaccination",
      recordType: "vaccination",
      recordDate: new Date(),
      veterinarianName: "",
      veterinarianEmail: "",
      veterinarianPhone: "",
      clinicName: "",
      vaccinationType: "",
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
      // Validate required fields
      if (!formData.certificateUrl) {
        toast({
          title: "Missing Certificate",
          description: "Please upload a certificate file",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (!formData.veterinarianEmail) {
        toast({
          title: "Missing Email",
          description: "Veterinarian email is required",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare data for submission
      const submitData: any = {
        recordType: formData.recordType,
        recordDate: formData.recordDate.toISOString().split('T')[0],
        veterinarianName: formData.veterinarianName || null,
        veterinarianEmail: formData.veterinarianEmail,
        veterinarianPhone: formData.veterinarianPhone || null,
        clinicName: formData.clinicName || null,
        certificateUrl: formData.certificateUrl,
        notes: formData.notes || null,
      };

      // Add type-specific fields
      if (formData.certificateType === "vaccination" && formData.vaccinationType) {
        submitData.vaccinationType = formData.vaccinationType;
      }

      if (formData.certificateType === "health_check" || formData.certificateType === "test_results") {
        submitData.diagnosis = formData.diagnosis || null;
        submitData.treatment = formData.treatment || null;
      }

      // Add cost if provided
      if (formData.cost) {
        const costInCents = Math.round(parseFloat(formData.cost) * 100);
        submitData.cost = costInCents;
        submitData.currency = settings.currency;
      }

      await createMutation.mutateAsync(submitData);
    } catch (error) {
      console.error('Error uploading certificate:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCertificateTypeChange = (type: string) => {
    updateField('certificateType', type);
    
    // Map certificate type to record type
    const typeMap: Record<string, string> = {
      vaccination: "vaccination",
      dna_test: "checkup",
      health_check: "checkup",
      test_results: "checkup",
      hip_scoring: "checkup",
      eye_test: "checkup",
      other: "checkup",
    };
    
    updateField('recordType', typeMap[type] || "checkup");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>Upload Health Certificate</DialogTitle>
              <DialogDescription>
                Upload a health certificate or document for {animalName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Certificate Type & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="certificateType">Certificate Type *</Label>
              <Select
                value={formData.certificateType}
                onValueChange={handleCertificateTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vaccination">Vaccination Certificate</SelectItem>
                  <SelectItem value="dna_test">DNA Test Results</SelectItem>
                  <SelectItem value="health_check">Health Check Certificate</SelectItem>
                  <SelectItem value="test_results">Lab Test Results</SelectItem>
                  <SelectItem value="hip_scoring">Hip Scoring Certificate</SelectItem>
                  <SelectItem value="eye_test">Eye Test Certificate</SelectItem>
                  <SelectItem value="other">Other Certificate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recordDate">Date *</Label>
              <DatePicker
                date={formData.recordDate}
                onDateChange={(date) => updateField("recordDate", date)}
                placeholder="Select date"
                maxDate={new Date()}
              />
            </div>
          </div>

          {/* Certificate Upload */}
          <div className="space-y-2">
            <Label>Upload Certificate *</Label>
            <DocumentUpload
              storagePath={STORAGE_PATHS.HEALTH_RECORDS}
              onUploadSuccess={(result: UploadResult) => updateField("certificateUrl", result.url)}
              maxSizeInMB={10}
              label="Upload Certificate"
              helperText="PDF, images up to 10MB"
              allowedTypes={['application/pdf', 'image/*']}
            />
            {formData.certificateUrl && (
              <p className="text-sm text-green-600 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Certificate uploaded successfully
              </p>
            )}
          </div>

          {/* Vaccination Type - Only for vaccination certificates */}
          {formData.certificateType === "vaccination" && (
            <div className="space-y-2">
              <Label htmlFor="vaccinationType">Vaccination Type</Label>
              <Select
                value={formData.vaccinationType}
                onValueChange={(value) => updateField("vaccinationType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vaccination type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rabies">Rabies</SelectItem>
                  <SelectItem value="DHPP">DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)</SelectItem>
                  <SelectItem value="CPV">CPV (Canine Parvovirus)</SelectItem>
                  <SelectItem value="CDV">CDV (Canine Distemper)</SelectItem>
                  <SelectItem value="CAV-2">CAV-2 (Canine Adenovirus)</SelectItem>
                  <SelectItem value="Bordetella">Bordetella (Kennel Cough)</SelectItem>
                  <SelectItem value="Leptospirosis">Leptospirosis</SelectItem>
                  <SelectItem value="Parainfluenza">Parainfluenza</SelectItem>
                  <SelectItem value="Canine Herpes">Canine Herpes (Breeding)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Diagnosis & Treatment - For health checks and test results */}
          {(formData.certificateType === "health_check" || formData.certificateType === "test_results") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis / Test Results</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => updateField("diagnosis", e.target.value)}
                  placeholder="Enter diagnosis or test results"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="treatment">Treatment / Recommendations</Label>
                <Textarea
                  id="treatment"
                  value={formData.treatment}
                  onChange={(e) => updateField("treatment", e.target.value)}
                  placeholder="Enter treatment or recommendations"
                  rows={3}
                />
              </div>
            </>
          )}

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

          {/* Veterinarian Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="veterinarianEmail">Veterinarian Email *</Label>
              <Input
                id="veterinarianEmail"
                type="email"
                value={formData.veterinarianEmail}
                onChange={(e) => updateField("veterinarianEmail", e.target.value)}
                placeholder="vet@clinic.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="veterinarianPhone">Phone Number</Label>
              <Input
                id="veterinarianPhone"
                type="tel"
                value={formData.veterinarianPhone}
                onChange={(e) => updateField("veterinarianPhone", e.target.value)}
                placeholder="+27 12 345 6789"
              />
            </div>
          </div>

          {/* Cost */}
          <div className="space-y-2">
            <Label htmlFor="cost">Cost ({getCurrencySymbol(settings.currency)})</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => updateField("cost", e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Any additional information about this certificate..."
              rows={3}
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
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Certificate
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
