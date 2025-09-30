"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Microscope, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface SemenAssessmentStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function SemenAssessmentStep({ data, onUpdate, onNext, onPrevious }: SemenAssessmentStepProps) {
  const [assessmentType, setAssessmentType] = useState(data.type || 'visual');
  const [quality, setQuality] = useState(data.quality || 'good');
  const [volume, setVolume] = useState(data.volume || '');
  const [concentration, setConcentration] = useState(data.concentration || '');
  const [motility, setMotility] = useState(data.motility || '');
  const [morphology, setMorphology] = useState(data.morphology || '');
  const [visualNotes, setVisualNotes] = useState(data.visualNotes || '');

  const handleContinue = () => {
    onUpdate({
      type: assessmentType,
      quality,
      volume: assessmentType === 'full' ? volume : '',
      concentration: assessmentType === 'full' ? concentration : '',
      motility: assessmentType === 'full' ? motility : '',
      morphology: assessmentType === 'full' ? morphology : '',
      visualNotes: assessmentType === 'visual' ? visualNotes : ''
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
      {/* Assessment Type */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">Assessment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>What type of semen assessment was performed?</Label>
            <RadioGroup value={assessmentType} onValueChange={setAssessmentType}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="full" id="assessment-full" />
                <Label htmlFor="assessment-full" className="flex-1 cursor-pointer">
                  <div className="font-medium">Full Laboratory Analysis</div>
                  <div className="text-xs text-muted-foreground">Complete analysis with volume, concentration, motility, and morphology</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="visual" id="assessment-visual" />
                <Label htmlFor="assessment-visual" className="flex-1 cursor-pointer">
                  <div className="font-medium">Visual Assessment</div>
                  <div className="text-xs text-muted-foreground">Basic visual evaluation without laboratory equipment</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="none" id="assessment-none" />
                <Label htmlFor="assessment-none" className="flex-1 cursor-pointer">
                  <div className="font-medium">No Assessment</div>
                  <div className="text-xs text-muted-foreground">No assessment performed (not recommended)</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

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
            {motility && motility < 50 && (
              <Alert className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="ml-2 text-sm">
                  <strong>Low Motility:</strong> Motility below 50% significantly reduces conception chances.
                </AlertDescription>
              </Alert>
            )}

            {concentration && concentration < 200 && (
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

      {/* Visual Assessment */}
      {assessmentType === 'visual' && (
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-base">Visual Evaluation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="visual-notes">Visual Assessment Notes</Label>
              <Textarea
                id="visual-notes"
                value={visualNotes}
                onChange={(e) => setVisualNotes(e.target.value)}
                placeholder="Describe the appearance, color, consistency, and any notable characteristics..."
                rows={4}
                className="bg-background border-primary/20"
              />
              <p className="text-xs text-muted-foreground">
                Note: Color (milky white = good), consistency (not watery), movement visible
              </p>
            </div>

            <Alert className="border-chart-2/50 bg-chart-2/10">
              <Info className="h-4 w-4 text-chart-2" />
              <AlertDescription className="ml-2 text-sm">
                <strong>Visual Assessment Limitation:</strong> While visual assessment provides some indication, laboratory analysis is recommended for accurate fertility evaluation.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* No Assessment Warning */}
      {assessmentType === 'none' && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="ml-2 text-sm">
            <strong>No Assessment:</strong> Proceeding without semen assessment significantly increases risk of breeding failure. A basic visual assessment is highly recommended.
          </AlertDescription>
        </Alert>
      )}

      {/* Overall Quality Rating */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">Overall Semen Quality</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Based on your assessment, how would you rate the overall semen quality?</Label>
            <RadioGroup value={quality} onValueChange={setQuality}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="excellent" id="quality-excellent" />
                <Label htmlFor="quality-excellent" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Excellent</div>
                      <div className="text-xs text-muted-foreground">All parameters well above normal ranges</div>
                    </div>
                    <Badge className={getQualityColor('excellent')}>Excellent</Badge>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="good" id="quality-good" />
                <Label htmlFor="quality-good" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Good</div>
                      <div className="text-xs text-muted-foreground">All parameters within normal ranges</div>
                    </div>
                    <Badge className={getQualityColor('good')}>Good</Badge>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="fair" id="quality-fair" />
                <Label htmlFor="quality-fair" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Fair</div>
                      <div className="text-xs text-muted-foreground">Some parameters below optimal</div>
                    </div>
                    <Badge className={getQualityColor('fair')}>Fair</Badge>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="poor" id="quality-poor" />
                <Label htmlFor="quality-poor" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Poor</div>
                      <div className="text-xs text-muted-foreground">Multiple parameters below normal</div>
                    </div>
                    <Badge className={getQualityColor('poor')}>Poor</Badge>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

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