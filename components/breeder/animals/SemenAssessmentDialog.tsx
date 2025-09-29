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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Microscope, AlertCircle } from "lucide-react";
import { SemenAssessment } from "@/lib/mock-data/animal-profile-details";
import { format } from "date-fns";

interface SemenAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (assessment: Omit<SemenAssessment, 'id'>) => void;
  existingAssessment?: SemenAssessment;
  mode?: 'create' | 'edit';
}

type AssessmentType = 'visual' | 'full';
type QualityRating = 'poor' | 'fair' | 'good' | 'excellent';

export function SemenAssessmentDialog({
  open,
  onOpenChange,
  onSave,
  existingAssessment,
  mode = 'create',
}: SemenAssessmentDialogProps) {
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('full');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [quality, setQuality] = useState<QualityRating>('good');
  const [volume, setVolume] = useState('');
  const [concentration, setConcentration] = useState('');
  const [motility, setMotility] = useState('');
  const [morphology, setMorphology] = useState('');
  const [notes, setNotes] = useState('');
  const [technician, setTechnician] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing assessment data when editing
  useEffect(() => {
    if (existingAssessment && mode === 'edit') {
      setDate(existingAssessment.date);
      setAssessmentType(existingAssessment.volume ? 'full' : 'visual');
      setQuality(existingAssessment.quality);
      setVolume(existingAssessment.volume?.toString() || '');
      setConcentration(existingAssessment.concentration?.toString() || '');
      setMotility(existingAssessment.motility?.toString() || '');
      setMorphology(existingAssessment.morphology?.toString() || '');
      setNotes(existingAssessment.notes || '');
      setTechnician(existingAssessment.technician || '');
    }
  }, [existingAssessment, mode]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        resetForm();
      }, 200);
    }
  }, [open]);

  const resetForm = () => {
    setAssessmentType('full');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setQuality('good');
    setVolume('');
    setConcentration('');
    setMotility('');
    setMorphology('');
    setNotes('');
    setTechnician('');
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!date) {
      newErrors.date = 'Assessment date is required';
    }

    if (assessmentType === 'full') {
      if (!volume || parseFloat(volume) <= 0) {
        newErrors.volume = 'Volume must be greater than 0';
      }
      if (!concentration || parseFloat(concentration) <= 0) {
        newErrors.concentration = 'Concentration must be greater than 0';
      }
      if (!motility || parseFloat(motility) < 0 || parseFloat(motility) > 100) {
        newErrors.motility = 'Motility must be between 0-100%';
      }
      if (!morphology || parseFloat(morphology) < 0 || parseFloat(morphology) > 100) {
        newErrors.morphology = 'Morphology must be between 0-100%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-calculate quality from lab parameters
  const calculateQualityFromLab = (): QualityRating => {
    if (!volume || !concentration || !motility || !morphology) return 'good';

    const motilityNum = parseFloat(motility);
    const concentrationNum = parseFloat(concentration);
    const morphologyNum = parseFloat(morphology);

    let score = 0;
    let count = 0;

    // Motility score
    if (motilityNum >= 80) score += 3;
    else if (motilityNum >= 70) score += 2;
    else if (motilityNum >= 50) score += 1;
    count++;

    // Concentration score
    if (concentrationNum >= 500) score += 3;
    else if (concentrationNum >= 300) score += 2;
    else if (concentrationNum >= 200) score += 1;
    count++;

    // Morphology score
    if (morphologyNum >= 85) score += 3;
    else if (morphologyNum >= 80) score += 2;
    else if (morphologyNum >= 60) score += 1;
    count++;

    const avgScore = score / count;
    if (avgScore >= 2.5) return 'excellent';
    if (avgScore >= 1.5) return 'good';
    if (avgScore >= 0.8) return 'fair';
    return 'poor';
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const calculatedQuality = assessmentType === 'full'
      ? calculateQualityFromLab()
      : quality;

    const assessment: Omit<SemenAssessment, 'id'> = {
      date,
      volume: assessmentType === 'full' ? parseFloat(volume) : 0,
      concentration: assessmentType === 'full' ? parseFloat(concentration) : 0,
      motility: assessmentType === 'full' ? parseFloat(motility) : 0,
      morphology: assessmentType === 'full' ? parseFloat(morphology) : 0,
      quality: calculatedQuality,
      notes,
      technician: technician || undefined,
    };

    onSave(assessment);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Microscope className="w-5 h-5 text-primary" />
            {mode === 'edit' ? 'Edit Semen Assessment' : 'New Semen Assessment'}
          </DialogTitle>
          <DialogDescription>
            {assessmentType === 'full'
              ? 'Record detailed laboratory analysis results'
              : 'Record basic visual assessment'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assessment Date */}
          <div className="space-y-2">
            <Label htmlFor="date">
              Assessment Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="bg-background border-primary/20"
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date}</p>
            )}
          </div>

          {/* Assessment Type */}
          <div className="space-y-3">
            <Label>
              Assessment Type <span className="text-destructive">*</span>
            </Label>
            <RadioGroup value={assessmentType} onValueChange={(value: AssessmentType) => setAssessmentType(value)}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="full" id="type-full" />
                <Label htmlFor="type-full" className="flex-1 cursor-pointer font-medium">
                  Full Laboratory Analysis
                  <span className="block text-xs text-muted-foreground font-normal">
                    Complete analysis with volume, concentration, motility, and morphology
                  </span>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="visual" id="type-visual" />
                <Label htmlFor="type-visual" className="flex-1 cursor-pointer font-medium">
                  Visual Assessment
                  <span className="block text-xs text-muted-foreground font-normal">
                    Basic visual evaluation without laboratory equipment
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Visual Assessment Fields */}
          {assessmentType === 'visual' && (
            <div className="space-y-2 p-4 rounded-lg bg-surface-secondary border border-primary/10">
              <Label htmlFor="quality">
                Semen Quality <span className="text-destructive">*</span>
              </Label>
              <Select value={quality} onValueChange={(value: QualityRating) => setQuality(value)}>
                <SelectTrigger id="quality" className="bg-background border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Full Assessment Fields */}
          {assessmentType === 'full' && (
            <div className="space-y-4 p-4 rounded-lg bg-surface-secondary border border-primary/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="volume">
                    Volume (mL) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="volume"
                    type="number"
                    min="0"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    placeholder="e.g., 8.5"
                    className="bg-background border-primary/20"
                  />
                  {errors.volume && (
                    <p className="text-sm text-destructive">{errors.volume}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Normal: 1-10 mL</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="concentration">
                    Concentration (million/mL) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="concentration"
                    type="number"
                    min="0"
                    step="1"
                    value={concentration}
                    onChange={(e) => setConcentration(e.target.value)}
                    placeholder="e.g., 650"
                    className="bg-background border-primary/20"
                  />
                  {errors.concentration && (
                    <p className="text-sm text-destructive">{errors.concentration}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Normal: 200-2000 million/mL</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motility">
                    Progressive Motility (%) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="motility"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={motility}
                    onChange={(e) => setMotility(e.target.value)}
                    placeholder="e.g., 85"
                    className="bg-background border-primary/20"
                  />
                  {errors.motility && (
                    <p className="text-sm text-destructive">{errors.motility}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Good: &gt;70%</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="morphology">
                    Normal Morphology (%) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="morphology"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={morphology}
                    onChange={(e) => setMorphology(e.target.value)}
                    placeholder="e.g., 90"
                    className="bg-background border-primary/20"
                  />
                  {errors.morphology && (
                    <p className="text-sm text-destructive">{errors.morphology}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Good: &gt;80%</p>
                </div>
              </div>

              {/* Auto-calculated quality preview */}
              {volume && concentration && motility && morphology && (
                <Alert className="border-chart-3/50 bg-chart-3/10">
                  <AlertCircle className="h-4 w-4 text-chart-3" />
                  <AlertDescription className="ml-2 text-sm">
                    <strong>Calculated Quality:</strong> {calculateQualityFromLab().charAt(0).toUpperCase() + calculateQualityFromLab().slice(1)}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Technician (optional) */}
          <div className="space-y-2">
            <Label htmlFor="technician">Technician/Veterinarian</Label>
            <Input
              id="technician"
              type="text"
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
              placeholder="e.g., Dr. Johnson"
              className="bg-background border-primary/20"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional observations or comments..."
              rows={3}
              className="bg-background border-primary/20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-brand hover:opacity-90 shadow-card"
          >
            {mode === 'edit' ? 'Save Changes' : 'Save Assessment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}