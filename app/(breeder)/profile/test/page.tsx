"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ProfileBanner } from "@/components/breeder/profile/ProfileBanner";
import { ProfileHeader } from "@/components/breeder/profile/ProfileHeader";
import { ProfileStats } from "@/components/breeder/profile/ProfileStats";
import { EditProfileDialog } from "@/components/breeder/profile/EditProfileDialog";

export default function ProfileTestPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch profile
  const { data: profileData, isLoading, error, refetch } = useQuery({
    queryKey: ['breeder-profile'],
    queryFn: async () => {
      const response = await fetch('/api/breeder/profile');
      if (!response.ok) {
        if (response.status === 404) {
          return { exists: false, profile: null };
        }
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      return { exists: true, profile: data.profile };
    },
  });

  // Initialize profile
  const initializeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/breeder/profile/initialize', {
        method: 'POST',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initialize profile');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Profile Created',
        description: 'Your breeder profile has been initialized successfully',
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Initialization Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const profile = profileData?.profile;

  return (
    <div className="min-h-screen bg-surface-secondary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Test Header */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🧪 Breeder Profile - Component Test Page
            </CardTitle>
            <CardDescription>
              Testing API routes and new profile components
            </CardDescription>
          </CardHeader>
        </Card>

        {/* API Status */}
        <Card>
          <CardHeader>
            <CardTitle>API Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Profile Fetch Status:</span>
              {isLoading ? (
                <Badge variant="secondary">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Loading...
                </Badge>
              ) : error ? (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Error
                </Badge>
              ) : profileData?.exists ? (
                <Badge className="bg-chart-3 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Profile Found
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="w-3 h-3 mr-1" />
                  No Profile
                </Badge>
              )}
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                Error: {(error as Error).message}
              </div>
            )}

            {!profileData?.exists && !isLoading && !error && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  No profile found. Initialize one to test the components.
                </p>
                <Button
                  onClick={() => initializeMutation.mutate()}
                  disabled={initializeMutation.isPending}
                  className="bg-gradient-brand hover:opacity-90"
                >
                  {initializeMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    'Initialize Test Profile'
                  )}
                </Button>
              </div>
            )}

            {profile && (
              <div className="space-y-2">
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
                <Button
                  onClick={() => setIsEditDialogOpen(true)}
                  variant="outline"
                  size="sm"
                  className="ml-2"
                >
                  Test Edit Dialog
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Data Preview */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle>Profile Data (JSON)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-surface p-4 rounded-lg overflow-auto max-h-96">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Component Tests */}
        {profile && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Component Preview</CardTitle>
                <CardDescription>
                  Testing ProfileBanner, ProfileHeader, and ProfileStats components
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Banner Component */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold px-2">ProfileBanner Component:</h3>
              <ProfileBanner
                bannerUrl={profile.bannerUrl}
                isEditing={false}
              />
            </div>

            {/* Header Component */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold px-2">ProfileHeader Component:</h3>
              <ProfileHeader
                displayName={profile.displayName}
                tagline={profile.tagline}
                logoUrl={profile.logoUrl}
                location={profile.location}
                yearsInBusiness={profile.yearsInBusiness}
                website={profile.website}
                kycVerified={profile.kycVerified}
                backgroundCheckVerified={profile.backgroundCheckVerified}
                healthCertified={profile.healthCertified}
                premiumMember={profile.premiumMember}
                isEditing={false}
              />
            </div>

            {/* Stats Component */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold px-2">ProfileStats Component:</h3>
              <ProfileStats
                profileViews={profile.profileViews}
                totalSales={profile.totalSales}
                averageRating={profile.averageRating}
                responseRate={profile.responseRate}
              />
            </div>

            {/* Edit Dialog */}
            <EditProfileDialog
              open={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              profile={profile}
            />
          </>
        )}

        {/* Test Results */}
        <Card className="border-chart-3/20 bg-chart-3/5">
          <CardHeader>
            <CardTitle className="text-base">Test Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {profile ? (
                <CheckCircle className="w-4 h-4 text-chart-3" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground" />
              )}
              <span>API Route: GET /api/breeder/profile</span>
            </div>
            <div className="flex items-center gap-2">
              {profile ? (
                <CheckCircle className="w-4 h-4 text-chart-3" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground" />
              )}
              <span>API Route: POST /api/breeder/profile/initialize</span>
            </div>
            <div className="flex items-center gap-2">
              {profile ? (
                <CheckCircle className="w-4 h-4 text-chart-3" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground" />
              )}
              <span>Component: ProfileBanner</span>
            </div>
            <div className="flex items-center gap-2">
              {profile ? (
                <CheckCircle className="w-4 h-4 text-chart-3" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground" />
              )}
              <span>Component: ProfileHeader</span>
            </div>
            <div className="flex items-center gap-2">
              {profile ? (
                <CheckCircle className="w-4 h-4 text-chart-3" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground" />
              )}
              <span>Component: ProfileStats</span>
            </div>
            <div className="flex items-center gap-2">
              {profile ? (
                <CheckCircle className="w-4 h-4 text-chart-3" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground" />
              )}
              <span>Component: EditProfileDialog</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
