"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { mockAnimals } from "@/data/mockData";
import { mockClinics } from "@/lib/mock-data/marketplace-listings";
import { FrozenSemenBatch } from "@/lib/mock-data/frozen-semen";
import { AlertCircle, Save } from "lucide-react";
import { format } from "date-fns";

interface FrozenSemenFormProps {
  existingBatch?: FrozenSemenBatch;
  onSave: (data: FrozenSemenFormData) => void;
  onCancel: () => void;
}

export interface FrozenSemenFormData {
  sourceAnimalId: string;
  batchIdentifier: string;
  collectionDate: string;
  clinicId: string;
  numberOfStraws: number;
  storageNotes?: string;
}

export function FrozenSemenForm({ existingBatch, onSave, onCancel }: FrozenSemenFormProps) {
  const [formData, setFormData] = useState<FrozenSemenFormData>({
    sourceAnimalId: existingBatch?.sourceAnimalId || '',
    batchIdentifier: existingBatch?.batchIdentifier || '',
    collectionDate: existingBatch?.collectionDate || format(new Date(), 'yyyy-MM-dd'),
    clinicId: existingBatch?.clinicId || '',
    numberOfStraws: existingBatch?.numberOfStraws || 0,
    storageNotes: existingBatch?.storageNotes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter to male dogs only
  const maleDogs = mockAnimals.filter(a => a.type === 'dog');

  const updateField = (field: keyof FrozenSemenFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.sourceAnimalId) {
      newErrors.sourceAnimalId = 'Source animal is required';
    }

    if (!formData.batchIdentifier) {
      newErrors.batchIdentifier = 'Batch identifier is required';
    }

    if (!formData.collectionDate) {
      newErrors.collectionDate = 'Collection date is required';
    }

    if (!formData.clinicId) {
      newErrors.clinicId = 'Clinic/storage location is required';
    }

    if (!formData.numberOfStraws || formData.numberOfStraws <= 0) {
      newErrors.numberOfStraws = 'Number of straws must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  const selectedAnimal = maleDogs.find(a => a.id === formData.sourceAnimalId);

  return (
    <Card className="shadow-card bg-surface border-0">
      <CardHeader>
        <CardTitle className="text-xl">
          {existingBatch ? 'Edit' : 'Add New'} Frozen Semen Batch
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Source Animal */}
        <div className="space-y-2">
          <Label htmlFor="source-animal">Source Animal (Stud Dog) *</Label>
          <Select
            value={formData.sourceAnimalId}
            onValueChange={(value) => updateField('sourceAnimalId', value)}
          >
            <SelectTrigger
              id="source-animal"
              className={`bg-background border-primary/20 focus:border-primary ${errors.sourceAnimalId ? 'border-destructive' : ''}`}
            >
              <SelectValue placeholder="Select a dog" />
            </SelectTrigger>
            <SelectContent>
              {maleDogs.map((dog) => (
                <SelectItem key={dog.id} value={dog.id}>
                  {dog.name} - {dog.breed} ({dog.age})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sourceAnimalId && (
            <p className="text-xs text-destructive">{errors.sourceAnimalId}</p>
          )}
        </div>

        {/* Selected Animal Preview */}
        {selectedAnimal && (
          <Alert className="border-chart-3/50 bg-chart-3/10">
            <AlertDescription>
              <strong>Selected:</strong> {selectedAnimal.name} - {selectedAnimal.breed}
              {selectedAnimal.registrationNumber && (
                <span className="block text-xs mt-1">
                  Registration: {selectedAnimal.registrationNumber}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Batch Identifier */}
        <div className="space-y-2">
          <Label htmlFor="batch-identifier">Batch Identifier *</Label>
          <Input
            id="batch-identifier"
            placeholder="e.g., MAX-2024-001"
            value={formData.batchIdentifier}
            onChange={(e) => updateField('batchIdentifier', e.target.value)}
            className={`bg-background border-primary/20 focus:border-primary ${errors.batchIdentifier ? 'border-destructive' : ''}`}
          />
          <p className="text-xs text-muted-foreground">
            Unique identifier for this collection batch
          </p>
          {errors.batchIdentifier && (
            <p className="text-xs text-destructive">{errors.batchIdentifier}</p>
          )}
        </div>

        {/* Collection Date */}
        <div className="space-y-2">
          <Label htmlFor="collection-date">Collection Date *</Label>
          <Input
            id="collection-date"
            type="date"
            value={formData.collectionDate}
            onChange={(e) => updateField('collectionDate', e.target.value)}
            className={`bg-background border-primary/20 focus:border-primary ${errors.collectionDate ? 'border-destructive' : ''}`}
          />
          {errors.collectionDate && (
            <p className="text-xs text-destructive">{errors.collectionDate}</p>
          )}
        </div>

        {/* Clinic/Storage Location */}
        <div className="space-y-2">
          <Label htmlFor="clinic">Clinic/Storage Location *</Label>
          <Select
            value={formData.clinicId}
            onValueChange={(value) => updateField('clinicId', value)}
          >
            <SelectTrigger
              id="clinic"
              className={`bg-background border-primary/20 focus:border-primary ${errors.clinicId ? 'border-destructive' : ''}`}
            >
              <SelectValue placeholder="Select clinic" />
            </SelectTrigger>
            <SelectContent>
              {mockClinics.map((clinic) => (
                <SelectItem key={clinic.id} value={clinic.id}>
                  {clinic.name} - {clinic.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.clinicId && (
            <p className="text-xs text-destructive">{errors.clinicId}</p>
          )}
        </div>

        {/* Number of Straws */}
        <div className="space-y-2">
          <Label htmlFor="number-of-straws">Number of Straws *</Label>
          <Input
            id="number-of-straws"
            type="number"
            min="1"
            placeholder="e.g., 20"
            value={formData.numberOfStraws || ''}
            onChange={(e) => updateField('numberOfStraws', parseInt(e.target.value) || 0)}
            className={`bg-background border-primary/20 focus:border-primary ${errors.numberOfStraws ? 'border-destructive' : ''}`}
          />
          <p className="text-xs text-muted-foreground">
            Total number of straws in this batch
          </p>
          {errors.numberOfStraws && (
            <p className="text-xs text-destructive">{errors.numberOfStraws}</p>
          )}
        </div>

        {/* Storage Notes */}
        <div className="space-y-2">
          <Label htmlFor="storage-notes">Storage Notes</Label>
          <Textarea
            id="storage-notes"
            placeholder="E.g., Stored in Tank 2, Cane 5. Post-thaw motility: 75%"
            rows={4}
            value={formData.storageNotes}
            onChange={(e) => updateField('storageNotes', e.target.value)}
            className="bg-background border-primary/20 focus:border-primary"
          />
          <p className="text-xs text-muted-foreground">
            Include storage location, post-thaw motility, and any special handling notes
          </p>
        </div>

        {/* Validation Error Summary */}
        {Object.keys(errors).length > 0 && (
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="ml-2 text-sm text-foreground">
              Please fix the errors above before saving
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-brand hover:opacity-90 shadow-card"
          >
            <Save className="w-4 h-4 mr-2" />
            {existingBatch ? 'Update' : 'Save'} Batch
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="hover:bg-primary/10 hover:border-primary shadow-card"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}