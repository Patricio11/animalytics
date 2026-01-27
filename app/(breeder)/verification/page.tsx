"use client";

import { useState, useEffect } from "react";
import { useAuth, useRole } from "@/lib/auth/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { VerificationStatusCard } from "@/components/verification/VerificationStatusCard";

export default function VerificationPage() {
  const { user } = useAuth();
  const { role } = useRole();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch verification status
  const { data: verificationStatus, isLoading } = useQuery({
    queryKey: ['verification-status', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/verification/status');
      if (!res.ok) throw new Error('Failed to fetch verification status');
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Fetch verification request details if exists
  const { data: verificationRequest, isLoading: requestLoading } = useQuery({
    queryKey: ['verification-request', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/verification/request');
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch verification request');
      }
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Create verification request mutation
  const createRequestMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/verification/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to create verification request');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['verification-request'] });
      queryClient.invalidateQueries({ queryKey: ['verification-status'] });
      
      toast({
        title: "Verification Started",
        description: "Your verification request has been created. Complete all steps to submit.",
      });

      // Redirect to verification wizard
      router.push(`/verification/wizard/${data.verificationRequest.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start verification",
        variant: "destructive",
      });
    },
  });

  const handleStartVerification = () => {
    createRequestMutation.mutate();
  };

  if (isLoading || requestLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (verificationStatus?.verificationStatus) {
      case 'approved':
        return <CheckCircle2 className="w-10 h-10 text-blue-500" />;
      case 'pending':
      case 'submitted':
      case 'under_review':
        return <Clock className="w-10 h-10 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-10 h-10 text-red-500" />;
      default:
        return <Shield className="w-10 h-10 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (verificationStatus?.verificationStatus) {
      case 'approved':
        return <Badge className="bg-blue-500 text-white">Verified</Badge>;
      case 'pending':
      case 'submitted':
        return <Badge className="bg-yellow-500 text-white">Pending Review</Badge>;
      case 'under_review':
        return <Badge className="bg-yellow-600 text-white">Under Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
            {getStatusIcon()}
            Account Verification
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Verify your identity to build trust and unlock platform features
          </p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Verification Status Card */}
      {verificationRequest && (
        <VerificationStatusCard
          status={verificationRequest.status}
          submittedAt={verificationRequest.submittedAt}
          reviewedAt={verificationRequest.reviewedAt}
          verifiedAt={verificationRequest.verifiedAt}
          expiresAt={verificationRequest.expiresAt}
          rejectionReason={verificationRequest.rejectionReason}
          adminFeedback={verificationRequest.adminFeedback}
          verificationId={verificationRequest.id}
        />
      )}

      {/* Not Started State */}
      {!verificationRequest && verificationStatus?.verificationStatus === 'not_started' && (
        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Get Verified
            </CardTitle>
            <CardDescription>
              Complete the verification process to establish trust and credibility on the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Why verify your account?</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Build trust with potential buyers</li>
                  <li>• Display verified badge on your profile</li>
                  <li>• Access premium features</li>
                  <li>• Increase visibility in search results</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="font-semibold">What you'll need:</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="p-4 rounded-lg border bg-muted/50">
                  <h4 className="font-medium mb-2">Personal Information</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Full name and date of birth</li>
                    <li>• Contact information</li>
                    <li>• Physical address</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg border bg-muted/50">
                  <h4 className="font-medium mb-2">Identity Documents</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Government-issued ID</li>
                    <li>• 4-corner ID photos</li>
                    <li>• Selfie with ID</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg border bg-muted/50">
                  <h4 className="font-medium mb-2">Proof of Address</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Bank statement (last month)</li>
                    <li>• Or utility bill (last month)</li>
                  </ul>
                </div>
                {role === 'breeder' && (
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <h4 className="font-medium mb-2">Breeder Certifications</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Breeder certification</li>
                      <li>• Kennel license (if applicable)</li>
                      <li>• Business registration (optional)</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={handleStartVerification}
              disabled={createRequestMutation.isPending}
              size="lg"
              className="w-full sm:w-auto"
            >
              {createRequestMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Start Verification
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Draft State - Continue Verification */}
      {verificationRequest?.status === 'draft' && (
        <Card>
          <CardHeader>
            <CardTitle>Continue Your Verification</CardTitle>
            <CardDescription>
              You have a verification request in progress. Continue where you left off.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push(`/verification/wizard/${verificationRequest.id}`)}
              size="lg"
            >
              Continue Verification
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Process</CardTitle>
          <CardDescription>
            How the verification process works
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <h4 className="font-semibold">Submit Documents</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload your identity documents and complete all required information
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <h4 className="font-semibold">Admin Review</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Our team will review your submission within 24-48 hours
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <h4 className="font-semibold">Get Verified</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Once approved, your verified badge will appear across the platform
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
