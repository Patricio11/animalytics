"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Shield, 
  User, 
  MapPin, 
  FileText, 
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { DocumentUploadCard } from "@/components/verification/DocumentUploadCard";
import { FourCornerPhotoUpload } from "@/components/verification/FourCornerPhotoUpload";

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
}

export default function VerificationWizardPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const verificationId = params.id as string;

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: '',
  });

  // Fetch verification request
  const { data: verificationRequest, isLoading } = useQuery({
    queryKey: ['verification-request', verificationId],
    queryFn: async () => {
      const res = await fetch(`/api/verification/${verificationId}`);
      if (!res.ok) throw new Error('Failed to fetch verification request');
      return res.json();
    },
  });

  // Update verification mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/verification/${verificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update verification');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-request', verificationId] });
    },
  });

  // Submit verification mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/verification/${verificationId}/submit`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to submit verification');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification Submitted",
        description: "Your verification request has been submitted for review.",
      });
      router.push('/verification');
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit verification",
        variant: "destructive",
      });
    },
  });

  const steps: VerificationStep[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Basic personal details',
      isComplete: !!(formData.firstName && formData.lastName && formData.dateOfBirth),
    },
    {
      id: 'address',
      title: 'Address Information',
      description: 'Your residential address',
      isComplete: !!(formData.addressLine1 && formData.city && formData.country),
    },
    {
      id: 'identity',
      title: 'Identity Documents',
      description: 'ID and 4-corner photos',
      isComplete: false,
    },
    {
      id: 'proof_address',
      title: 'Proof of Address',
      description: 'Bank statement or utility bill',
      isComplete: false,
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Review and submit',
      isComplete: false,
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    // Save current step data
    if (currentStep === 0 || currentStep === 1) {
      await updateMutation.mutateAsync(formData);
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    await submitMutation.mutateAsync();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          Verification Wizard
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Complete all steps to submit your verification request
        </p>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      index === currentStep
                        ? 'border-primary bg-primary text-white'
                        : index < currentStep
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-xs text-center max-w-[80px] hidden sm:block">
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 0: Personal Information */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    placeholder="e.g., South African"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+27 12 345 6789"
                />
              </div>
            </div>
          )}

          {/* Step 1: Address Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="addressLine1">Address Line 1 *</Label>
                <Input
                  id="addressLine1"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  placeholder="Apt 4B"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Cape Town"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stateProvince">State/Province</Label>
                  <Input
                    id="stateProvince"
                    value={formData.stateProvince}
                    onChange={(e) => setFormData({ ...formData, stateProvince: e.target.value })}
                    placeholder="Western Cape"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="8001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="South Africa"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Identity Documents */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Alert>
                <Camera className="h-4 w-4" />
                <AlertDescription>
                  Please upload clear photos of your government-issued ID and take 4-corner photos to verify authenticity.
                </AlertDescription>
              </Alert>

              <DocumentUploadCard
                title="ID Front"
                description="Front side of your government-issued ID"
                documentType="id_front"
                required
                onUpload={async (file, docType) => {
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('verificationId', verificationId);
                  formData.append('documentType', docType);
                  formData.append('category', 'identity');
                  
                  const res = await fetch('/api/verification/upload', {
                    method: 'POST',
                    body: formData,
                  });
                  
                  if (!res.ok) throw new Error('Upload failed');
                  queryClient.invalidateQueries({ queryKey: ['verification-request', verificationId] });
                }}
              />

              <DocumentUploadCard
                title="ID Back"
                description="Back side of your government-issued ID"
                documentType="id_back"
                required
                onUpload={async (file, docType) => {
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('verificationId', verificationId);
                  formData.append('documentType', docType);
                  formData.append('category', 'identity');
                  
                  const res = await fetch('/api/verification/upload', {
                    method: 'POST',
                    body: formData,
                  });
                  
                  if (!res.ok) throw new Error('Upload failed');
                  queryClient.invalidateQueries({ queryKey: ['verification-request', verificationId] });
                }}
              />

              <FourCornerPhotoUpload
                onUpload={async (file, docType) => {
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('verificationId', verificationId);
                  formData.append('documentType', docType);
                  formData.append('category', 'identity');
                  
                  const res = await fetch('/api/verification/upload', {
                    method: 'POST',
                    body: formData,
                  });
                  
                  if (!res.ok) throw new Error('Upload failed');
                  queryClient.invalidateQueries({ queryKey: ['verification-request', verificationId] });
                }}
              />

              <DocumentUploadCard
                title="Selfie with ID"
                description="Hold your ID next to your face"
                documentType="selfie_with_id"
                required
                onUpload={async (file, docType) => {
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('verificationId', verificationId);
                  formData.append('documentType', docType);
                  formData.append('category', 'identity');
                  
                  const res = await fetch('/api/verification/upload', {
                    method: 'POST',
                    body: formData,
                  });
                  
                  if (!res.ok) throw new Error('Upload failed');
                  queryClient.invalidateQueries({ queryKey: ['verification-request', verificationId] });
                }}
              />
            </div>
          )}

          {/* Step 3: Proof of Address */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Upload a recent bank statement or utility bill (dated within the last 30 days) showing your name and address.
                </AlertDescription>
              </Alert>

              <DocumentUploadCard
                title="Proof of Address"
                description="Bank statement or utility bill (last 30 days)"
                documentType="proof_of_address"
                required
                onUpload={async (file, docType) => {
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('verificationId', verificationId);
                  formData.append('documentType', docType);
                  formData.append('category', 'proof_of_address');
                  
                  const res = await fetch('/api/verification/upload', {
                    method: 'POST',
                    body: formData,
                  });
                  
                  if (!res.ok) throw new Error('Upload failed');
                  queryClient.invalidateQueries({ queryKey: ['verification-request', verificationId] });
                }}
              />
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  <strong>Ready to Submit!</strong> Please review your information before submitting for verification.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-muted/50">
                  <h3 className="font-semibold mb-3">Personal Information</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date of Birth:</span>
                      <span className="font-medium">{formData.dateOfBirth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{formData.phoneNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-muted/50">
                  <h3 className="font-semibold mb-3">Address</h3>
                  <div className="text-sm">
                    <p>{formData.addressLine1}</p>
                    {formData.addressLine2 && <p>{formData.addressLine2}</p>}
                    <p>{formData.city}, {formData.stateProvince} {formData.postalCode}</p>
                    <p>{formData.country}</p>
                  </div>
                </div>

                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                    By submitting, you confirm that all information provided is accurate and you have uploaded genuine documents.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit for Review
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
