"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get token from URL
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError("Invalid or missing verification token");
      setIsVerifying(false);
    } else {
      setToken(tokenParam);
      verifyEmail(tokenParam);
    }
  }, [searchParams]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setIsVerifying(true);
      setError("");

      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: verificationToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify email");
      }

      setVerificationSuccess(true);
      toast({
        title: "Email Verified!",
        description: "Your email has been successfully verified. You can now log in.",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to verify email. The link may have expired.");
      console.error("Email verification error:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  const resendVerification = async () => {
    // This would need to be implemented based on your auth flow
    toast({
      title: "Feature Coming Soon",
      description: "Please contact support if you need a new verification link.",
    });
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
            <h1 className="text-3xl font-bold tracking-tight">
              {isVerifying ? "Verifying Your Email..." : verificationSuccess ? "Email Verified!" : "Verification Failed"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isVerifying
                ? "Please wait while we verify your email address"
                : verificationSuccess
                ? "Your account is now active"
                : "There was a problem verifying your email"
              }
            </p>
          </div>

          <Card className="shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    Verifying...
                  </>
                ) : verificationSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Success!
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Verification Failed
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {isVerifying
                  ? "Confirming your email address..."
                  : verificationSuccess
                  ? "Your email has been verified successfully"
                  : "Unable to verify your email address"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isVerifying ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    This should only take a moment...
                  </p>
                </div>
              ) : verificationSuccess ? (
                <div className="space-y-4">
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Your email has been verified successfully! You can now access all features of Animalytics.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    <p className="text-sm text-center text-muted-foreground">
                      You will be redirected to the login page in a few seconds...
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push("/auth/signin")}
                    className="w-full bg-gradient-brand hover:opacity-90"
                  >
                    Go to Login
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>

                  {!token && (
                    <Alert>
                      <Mail className="h-4 w-4" />
                      <AlertDescription>
                        The verification link appears to be invalid or incomplete. Please check your email and try clicking the link again.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Common reasons for verification failure:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>The verification link has expired (24 hours)</li>
                      <li>The link has already been used</li>
                      <li>The link was copied incorrectly</li>
                    </ul>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => router.push("/auth/signin")}
                      variant="outline"
                      className="w-full"
                    >
                      Back to Login
                    </Button>
                    <Button
                      onClick={() => router.push("/auth/register")}
                      className="w-full bg-gradient-brand hover:opacity-90"
                    >
                      Create New Account
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {!isVerifying && !verificationSuccess && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Need help?{" "}
                <a href="mailto:support@animalytics.co" className="text-primary hover:underline">
                  Contact Support
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Image/Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-brand items-center justify-center p-12">
        <div className="max-w-md text-white space-y-6">
          <h2 className="text-4xl font-bold">Welcome to Animalytics</h2>
          <p className="text-lg opacity-90">
            Verify your email to unlock the full power of our breeding management platform.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Secure Account</h3>
                <p className="opacity-80">Email verification keeps your account safe</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Full Access</h3>
                <p className="opacity-80">Access all breeding management features</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Stay Updated</h3>
                <p className="opacity-80">Receive important notifications and updates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
