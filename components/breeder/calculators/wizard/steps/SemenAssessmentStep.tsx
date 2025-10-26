"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Microscope, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { WizardData } from "@/lib/types/wizard";

interface SemenAssessmentStepProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function SemenAssessmentStep({ data, onUpdate, onNext, onPrevious }: SemenAssessmentStepProps) {
  // New Step 8 fields
  const [inseminatorName, setInseminatorName] = useState(data?.inseminatorName || '');
  const [semenAssessed, setSemenAssessed] = useState<'yes' | 'no' | 'dont_know' | ''>(data?.semenAssessed || '');
  const [assessmentType, setAssessmentType] = useState<'general' | 'full' | ''>(data?.assessmentType || '');
  
  // Original fields
  const [quality, setQuality] = useState<'excellent' | 'good' | 'poor' | ''>(data?.quality || '');
  const [volume, setVolume] = useState(data?.volume || '');
  const [concentration, setConcentration] = useState(data?.concentration || '');
  const [motility, setMotility] = useState(data?.motility || '');
  const [morphology, setMorphology] = useState(data?.morphology || '');
  const [visualNotes, setVisualNotes] = useState(data?.visualNotes || '');

  const handleContinue = () => {
    onUpdate({
      inseminatorName,
      semenAssessed,
      assessmentType,
      quality: assessmentType === 'general' ? quality : '',
      volume: assessmentType === 'full' ? volume : '',
      concentration: assessmentType === 'full' ? concentration : '',
      motility: assessmentType === 'full' ? motility : '',
      morphology: assessmentType === 'full' ? morphology : '',
      visualNotes: assessmentType === 'general' ? visualNotes : ''
    });
    onNext();
  };

  const getQualityColor = (qual: string) => {
    switch (qual) {
      case 'excellent': return 'bg-chart-3 text-white';
      case 'good': return 'bg-chart-4 text-white';
      case 'fair': return 'bg-chart-2 text-white';
      case 'poor': return 'bg-destructive text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Inseminator Information */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">Inseminator Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inseminator-name">Name of the Inseminator</Label>
            <Input
              id="inseminator-name"
              type="text"
              value={inseminatorName}
              onChange={(e) => setInseminatorName(e.target.value)}
              placeholder="Enter inseminator name"
              className="bg-background border-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="semen-assessed">Has the semen been assessed?</Label>
            <Select value={semenAssessed} onValueChange={(val) => setSemenAssessed(val as 'yes' | 'no' | 'dont_know')}>
              <SelectTrigger id="semen-assessed" className="bg-background border-primary/20">
                <SelectValue placeholder="Has the semen been assessed?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="dont_know">Don&apos;t know</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Type - Only show if semen was assessed */}
      {semenAssessed === 'yes' && (
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-base">Assessment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assessment-type">Type of semen assessment</Label>
              <Select value={assessmentType} onValueChange={(val) => setAssessmentType(val as 'general' | 'full')}>
                <SelectTrigger id="assessment-type" className="bg-background border-primary/20">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="full">Full assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Laboratory Assessment */}
      {assessmentType === 'full' && (
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-base">Laboratory Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="volume">Volume (mL)</Label>
                <Input
                  id="volume"
                  type="number"
                  min="0"
                  max="30"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value) || '')}
                  placeholder="Enter volume"
                  className="bg-background border-primary/20"
                />
                <p className="text-xs text-muted-foreground">Normal: 1-10 mL depending on breed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="concentration">Concentration (million/mL)</Label>
                <Input
                  id="concentration"
                  type="number"
                  min="0"
                  max="2000"
                  value={concentration}
                  onChange={(e) => setConcentration(parseInt(e.target.value) || '')}
                  placeholder="Enter concentration"
                  className="bg-background border-primary/20"
                />
                <p className="text-xs text-muted-foreground">Normal: 200-2000 million/mL</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motility">Progressive Motility (%)</Label>
                <Input
                  id="motility"
                  type="number"
                  min="0"
                  max="100"
                  value={motility}
                  onChange={(e) => setMotility(parseInt(e.target.value) || '')}
                  placeholder="Enter motility"
                  className="bg-background border-primary/20"
                />
                <p className="text-xs text-muted-foreground">Good: &gt;70%, Fair: 50-70%, Poor: &lt;50%</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="morphology">Normal Morphology (%)</Label>
                <Input
                  id="morphology"
                  type="number"
                  min="0"
                  max="100"
                  value={morphology}
                  onChange={(e) => setMorphology(parseInt(e.target.value) || '')}
                  placeholder="Enter morphology"
                  className="bg-background border-primary/20"
                />
                <p className="text-xs text-muted-foreground">Good: &gt;80%, Fair: 60-80%, Poor: &lt;60%</p>
              </div>
            </div>

            {/* Quality Warnings */}
            {motility && Number(motility) < 50 && (
              <Alert className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="ml-2 text-sm">
                  <strong>Low Motility:</strong> Motility below 50% significantly reduces conception chances.
                </AlertDescription>
              </Alert>
            )}

            {concentration && Number(concentration) < 200 && (
              <Alert className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="ml-2 text-sm">
                  <strong>Low Concentration:</strong> Concentration below 200 million/mL may indicate fertility issues.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* General Assessment */}
      {assessmentType === 'general' && (
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-base">General Semen Quality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="semen-quality">Semen quality</Label>
              <Select value={quality} onValueChange={(val) => setQuality(val as 'excellent' | 'good' | 'poor')}>                <SelectTrigger id="semen-quality" className="bg-background border-primary/20">
                  <SelectValue placeholder="Select Semen Quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert className="border-chart-2/50 bg-chart-2/10">
              <Info className="h-4 w-4 text-chart-2" />
              <AlertDescription className="ml-2 text-sm">
                <strong>General Assessment:</strong> This is a basic quality assessment. Laboratory analysis is recommended for accurate fertility evaluation.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* No Assessment Warning */}
      {semenAssessed === 'no' && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="ml-2 text-sm">
            <strong>No Assessment:</strong> Proceeding without semen assessment significantly increases risk of breeding failure. A basic assessment is highly recommended.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={handleContinue} className="bg-gradient-brand hover:opacity-90 shadow-card">
          Continue
        </Button>
      </div>
    </div>
  );
}