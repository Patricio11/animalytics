"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  Award,
  Mail,
  Phone,
  Globe,
  TrendingUp,
  DollarSign,
  Package,
  MessageCircle,
  Edit,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ProfileBanner } from "@/components/breeder/profile/ProfileBanner";
import { ProfileHeader } from "@/components/breeder/profile/ProfileHeader";
import { ProfileStats } from "@/components/breeder/profile/ProfileStats";
import { EditProfileDialog } from "@/components/breeder/profile/EditProfileDialog";

// Fetch breeder profile from API
function useBreederProfile() {
  return useQuery({
    queryKey: ['breeder-profile'],
    queryFn: async () => {
      const response = await fetch('/api/breeder/profile');
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Profile doesn't exist yet
        }
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      return data.profile;
    },
  });
}

export default function BreederProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profile, isLoading, error, refetch } = useBreederProfile();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Initialize profile mutation
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <Skeleton className="h-80 w-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32">
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Profile doesn't exist - show initialization
  if (!profile && !error) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-elevated">
          <CardHeader>
            <CardTitle>Create Your Breeder Profile</CardTitle>
            <CardDescription>
              You don't have a breeder profile yet. Let's create one to get you started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your profile will be initialized with sample data that you can customize later.
            </p>
            <Button
              onClick={() => initializeMutation.mutate()}
              disabled={initializeMutation.isPending}
              className="w-full bg-gradient-brand hover:opacity-90"
            >
              {initializeMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                'Create My Profile'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-elevated">
          <CardHeader>
            <CardTitle>Error Loading Profile</CardTitle>
            <CardDescription>
              There was an error loading your breeder profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                {(error as Error).message}
              </AlertDescription>
            </Alert>
            <Button onClick={() => refetch()} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Banner */}
      <ProfileBanner
        bannerUrl={profile.bannerUrl}
        isEditing={false}
      />

      {/* Profile Header */}
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

      {/* Edit Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex justify-end">
          <Button
            onClick={() => setIsEditDialogOpen(true)}
            variant="outline"
            className="hover-elevate"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <ProfileStats
        profileViews={profile.profileViews}
        totalSales={profile.totalSales}
        averageRating={profile.averageRating}
        responseRate={profile.responseRate}
      />

      {/* Profile Completeness */}
      {profile.profileCompleteness < 100 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <Alert className="bg-chart-2-light border-chart-2">
            <TrendingUp className="h-4 w-4 text-chart-2" />
            <AlertDescription className="text-chart-2">
              <div className="flex items-center justify-between mb-2">
                <strong>Your profile is {profile.profileCompleteness}% complete</strong>
                <span className="text-sm">{100 - profile.profileCompleteness}% to go!</span>
              </div>
              <Progress value={profile.profileCompleteness} className="h-2 mb-2" />
              <p className="text-sm">Complete your profile to increase visibility and build trust with buyers.</p>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12">
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="bg-surface shadow-card">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({profile.totalReviews})</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>About Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {profile.bio || 'No bio provided yet.'}
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Breeds */}
              {profile.primaryBreeds && profile.primaryBreeds.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-base">Breeds We Specialize In</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.primaryBreeds.map((breed: string) => (
                        <Badge key={breed} variant="outline">
                          {breed}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Specializations */}
              {profile.specializations && profile.specializations.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-base">Specializations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.specializations.map((spec: string) => (
                        <Badge key={spec} variant="secondary">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Info */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.publicEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${profile.publicEmail}`} className="text-primary hover:underline">
                        {profile.publicEmail}
                      </a>
                    </div>
                  )}
                  {profile.publicPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${profile.publicPhone}`} className="text-primary hover:underline">
                        {profile.publicPhone}
                      </a>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  {!profile.publicEmail && !profile.publicPhone && !profile.website && (
                    <p className="text-sm text-muted-foreground">No contact information provided yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Business Info */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {profile.businessName && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Business Name</span>
                      <span className="font-medium">{profile.businessName}</span>
                    </div>
                  )}
                  {profile.yearsInBusiness && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Years Active</span>
                      <span className="font-medium">{profile.yearsInBusiness}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">International Orders</span>
                    <Badge variant={profile.acceptsInternationalOrders ? "default" : "secondary"}>
                      {profile.acceptsInternationalOrders ? 'Accepted' : 'Not Accepted'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Policies */}
            {(profile.healthGuarantee || profile.returnPolicy || profile.shippingPolicy) && (
              <div className="grid gap-6 md:grid-cols-3">
                {profile.healthGuarantee && (
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-base">Health Guarantee</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{profile.healthGuarantee}</p>
                    </CardContent>
                  </Card>
                )}
                {profile.returnPolicy && (
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-base">Return Policy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{profile.returnPolicy}</p>
                    </CardContent>
                  </Card>
                )}
                {profile.shippingPolicy && (
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-base">Shipping Policy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{profile.shippingPolicy}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-chart-3" />
                    Sales Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Sales</span>
                    <span className="font-bold">{profile.totalSales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Successful Transactions</span>
                    <span className="font-bold">{profile.successfulTransactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">On-Time Delivery</span>
                    <span className="font-bold text-chart-3">{profile.onTimeDeliveryRate}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Star className="w-4 h-4 mr-2 text-chart-2" />
                    Rating Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const reviewKey = `${['five', 'four', 'three', 'two', 'one'][5 - stars]}StarReviews` as keyof typeof profile;
                    const count = (profile[reviewKey] as number) || 0;
                    const percentage = profile.totalReviews > 0 ? (count / profile.totalReviews) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="text-sm w-12">{stars} star</span>
                        <Progress value={percentage} className="h-2 flex-1" />
                        <span className="text-sm text-muted-foreground w-8">{count}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2 text-chart-4" />
                    Response Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Response Rate</span>
                    <span className="font-bold text-chart-4">{profile.responseRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Response Time</span>
                    <span className="font-bold">{profile.responseTimeHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Reviews</span>
                    <span className="font-bold">{profile.totalReviews}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Package className="w-4 h-4 mr-2 text-primary" />
                    Inventory Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Animals</span>
                    <span className="font-bold">{profile.totalAnimals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Litters</span>
                    <span className="font-bold">{profile.totalLitters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active Listings</span>
                    <span className="font-bold">{profile.activeListings || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-chart-3" />
                    Profile Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Views</span>
                    <span className="font-bold">{profile.profileViews?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Views This Month</span>
                    <span className="font-bold">{profile.profileViewsThisMonth || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Profile Completeness</span>
                    <span className="font-bold text-chart-3">{profile.profileCompleteness}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="space-y-6">
            {profile.certifications && profile.certifications.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {profile.certifications.map((cert: any, index: number) => (
                  <Card key={index} className="shadow-card hover-elevate">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full bg-chart-3/10">
                          <Award className="w-6 h-6 text-chart-3" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{cert.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{cert.issuingOrganization}</p>
                          <Badge variant="outline">
                            Issued: {new Date(cert.issueDate).toLocaleDateString()}
                          </Badge>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-chart-3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-card">
                <CardContent className="p-12 text-center">
                  <Award className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No certifications added yet.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    Add Certifications
                  </Button>
                </CardContent>
              </Card>
            )}

            {profile.awards && profile.awards.length > 0 && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Awards & Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.awards.map((award: any, index: number) => (
                      <Badge key={index} className="bg-chart-2-light text-chart-2 border-chart-2/20">
                        <Award className="w-3 h-3 mr-1" />
                        {award.title || award}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>What our customers are saying</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="mb-2">Reviews feature coming soon</p>
                  <p className="text-sm">Customer reviews will be displayed here once available</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        profile={profile}
      />
    </div>
  );
}
