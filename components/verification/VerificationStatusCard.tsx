"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle, AlertCircle, Shield, Calendar, FileText } from "lucide-react";
import { VerificationRequest } from "@/lib/types/verification";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface VerificationStatusCardProps {
  verificationRequest: VerificationRequest | null;
  onStartVerification?: () => void;
}

export function VerificationStatusCard({
  verificationRequest,
  onStartVerification,
}: VerificationStatusCardProps) {
  // No verification request - show prompt to start
  if (!verificationRequest) {
    return (
      <Card className="shadow-card border-2 border-dashed">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Shield className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Account Not Verified</CardTitle>
              <CardDescription>Get verified to build trust and unlock features</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-900 font-medium mb-2">🌟 Benefits of Verification:</p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Verified badge on your profile</li>
              <li>Increased trust from buyers</li>
              <li>Higher visibility in search</li>
              <li>Access to premium features</li>
            </ul>
          </div>
          <Button onClick={onStartVerification} className="w-full bg-gradient-brand">
            Start Verification Process
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { status, submittedAt, reviewedAt, verifiedAt, expiresAt, rejectionReason, adminFeedback } = verificationRequest;

  // Draft - In progress
  if (status === 'draft') {
    return (
      <Card className="shadow-card border-yellow-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <CardTitle>Verification In Progress</CardTitle>
                <CardDescription>Complete all steps to submit for review</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-yellow-500 text-yellow-600">
              <FileText className="w-3 h-3 mr-1" />
              Draft
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Continue filling out your verification information. Your progress is automatically saved.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Submitted - Waiting for review
  if (status === 'submitted') {
    return (
      <Card className="shadow-card border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Verification Submitted</CardTitle>
                <CardDescription>Your request is waiting for admin review</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-blue-500 text-blue-600">
              <Clock className="w-3 h-3 mr-1" />
              Submitted
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-900 font-medium mb-2">📋 What's Next?</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Our team will review your documents within 2-3 business days</li>
              <li>• We'll verify your identity and credentials</li>
              <li>• You'll receive an email once the review is complete</li>
            </ul>
          </div>
          {submittedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Submitted {formatDistanceToNow(new Date(submittedAt), { addSuffix: true })}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Under Review
  if (status === 'under_review') {
    return (
      <Card className="shadow-card border-yellow-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 animate-pulse" />
              </div>
              <div>
                <CardTitle>Under Review</CardTitle>
                <CardDescription>Our team is reviewing your submission</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-yellow-500 text-yellow-600">
              <Clock className="w-3 h-3 mr-1" />
              Under Review
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-yellow-900 font-medium mb-2">⏳ Review in Progress</p>
            <p className="text-sm text-yellow-800">
              We're carefully reviewing your documents and information. This typically takes 1-2 business days.
            </p>
          </div>
          {submittedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Submitted {formatDistanceToNow(new Date(submittedAt), { addSuffix: true })}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Approved
  if (status === 'approved') {
    return (
      <Card className="shadow-card border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-green-900">🎉 Verified Account</CardTitle>
                <CardDescription>Your account has been successfully verified</CardDescription>
              </div>
            </div>
            <Badge className="bg-green-500 text-white">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-900 font-medium mb-2">✅ You're Now Verified!</p>
            <p className="text-sm text-green-800">
              Your verified badge is now displayed on your profile, listings, and throughout the platform.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {verifiedAt && (
              <div>
                <p className="text-muted-foreground">Verified On</p>
                <p className="font-medium">{new Date(verifiedAt).toLocaleDateString()}</p>
              </div>
            )}
            {expiresAt && (
              <div>
                <p className="text-muted-foreground">Expires On</p>
                <p className="font-medium">{new Date(expiresAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
          <Link href="/dashboard">
            <Button className="w-full bg-gradient-brand">
              Go to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Rejected
  if (status === 'rejected') {
    return (
      <Card className="shadow-card border-red-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-red-900">Verification Not Approved</CardTitle>
                <CardDescription>Your verification request was not approved</CardDescription>
              </div>
            </div>
            <Badge variant="destructive">
              <XCircle className="w-3 h-3 mr-1" />
              Rejected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {rejectionReason && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-900 font-medium mb-2">❌ Reason for Rejection:</p>
              <p className="text-sm text-red-800">{rejectionReason}</p>
            </div>
          )}
          {adminFeedback && (
            <div className="p-4 rounded-lg bg-muted border">
              <p className="text-sm font-medium mb-2">💬 Additional Feedback:</p>
              <p className="text-sm text-muted-foreground">{adminFeedback}</p>
            </div>
          )}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-900 font-medium mb-2">🔄 What You Can Do:</p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Review the rejection reason carefully</li>
              <li>Prepare the required documents</li>
              <li>Submit a new verification request</li>
            </ul>
          </div>
          {reviewedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Reviewed {formatDistanceToNow(new Date(reviewedAt), { addSuffix: true })}</span>
            </div>
          )}
          <Button onClick={onStartVerification} className="w-full" variant="outline">
            Submit New Verification Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Expired
  if (status === 'expired') {
    return (
      <Card className="shadow-card border-orange-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-orange-900">Verification Expired</CardTitle>
                <CardDescription>Your verification has expired</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-orange-500 text-orange-600">
              <AlertCircle className="w-3 h-3 mr-1" />
              Expired
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-sm text-orange-900 font-medium mb-2">⚠️ Verification Expired</p>
            <p className="text-sm text-orange-800">
              Your verified badge has been removed. Please submit a new verification request to regain your verified status.
            </p>
          </div>
          <Button onClick={onStartVerification} className="w-full bg-gradient-brand">
            Renew Verification
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
