"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

function VerifyEmailNoticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [email, setEmail] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email address not found. Please try signing up again.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    setResendSuccess(false);

    try {
      // Use our custom resend verification endpoint
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Resend failed:", data);
        throw new Error(data.error || data.message || "Failed to resend verification email");
      }

      setResendSuccess(true);
      toast({
        title: "Email Sent!",
        description: "A new verification email has been sent to your inbox.",
      });
    } catch (error: any) {
      console.error("Resend email error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Content */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center mb-6">
              <div className="w-40 h-auto flex items-center justify-center">
                <img
                  src="/animalytics.png"
                  alt="Animalytics Logo"
                  className="w-full h-auto object-contain"
                />
              </div>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Check Your Email</h1>
            <p className="text-muted-foreground mt-2">
              We've sent you a verification link
            </p>
          </div>

          <Card className="shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Verify Your Email Address
              </CardTitle>
              <CardDescription>
                Please check your inbox and click the verification link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  {email ? (
                    <>
                      We sent a verification email to <strong>{email}</strong>
                    </>
                  ) : (
                    "A verification email has been sent to your email address"
                  )}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Check your inbox</p>
                    <p className="text-muted-foreground">Look for an email from Animalytics</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Click the verification link</p>
                    <p className="text-muted-foreground">The link will activate your account</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Start using Animalytics</p>
                    <p className="text-muted-foreground">You'll be redirected to login</p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Didn't receive the email?</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Check your spam or junk folder</li>
                    <li>• Make sure you entered the correct email</li>
                    <li>• Wait a few minutes for the email to arrive</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {resendSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Verification email sent successfully! Check your inbox.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending || !email}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => router.push("/auth/signin")}
                  variant="ghost"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <a href="mailto:support@animalytics.com" className="text-primary hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-brand items-center justify-center p-12">
        <div className="max-w-md text-white space-y-6">
          <h2 className="text-4xl font-bold">Almost There!</h2>
          <p className="text-lg opacity-90">
            Just one more step to unlock the full power of Animalytics breeding management.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Secure Verification</h3>
                <p className="opacity-80">Email verification keeps your account safe</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Quick Process</h3>
                <p className="opacity-80">Just click the link in your email</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Full Access</h3>
                <p className="opacity-80">Access all breeding management features</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailNotice() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailNoticeContent />
    </Suspense>
  );
}
