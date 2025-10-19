"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
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
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileBanner } from "@/components/breeder/profile/ProfileBanner";
import { ProfileHeader } from "@/components/breeder/profile/ProfileHeader";
import { ProfileStats } from "@/components/breeder/profile/ProfileStats";
import { ShareButton } from "@/components/shared/ShareButton";
import Link from "next/link";

// Fetch public breeder profile
function usePublicBreederProfile(slug: string) {
  return useQuery({
    queryKey: ['public-breeder-profile', slug],
    queryFn: async () => {
      const response = await fetch(`/api/breeders/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Breeder not found');
        }
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      return data.profile;
    },
  });
}

// Fetch breeder's animals
function useBreederAnimals(slug: string) {
  return useQuery({
    queryKey: ['breeder-animals', slug],
    queryFn: async () => {
      const response = await fetch(`/api/breeders/${slug}/animals`);
      if (!response.ok) {
        throw new Error('Failed to fetch animals');
      }
      const data = await response.json();
      return data.animals;
    },
  });
}

export default function PublicBreederProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: profile, isLoading, error } = usePublicBreederProfile(slug);
  const { data: animals, isLoading: animalsLoading } = useBreederAnimals(slug);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <Skeleton className="h-80 w-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32">
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-elevated">
          <CardHeader>
            <CardTitle>Breeder Not Found</CardTitle>
            <CardDescription>
              The breeder profile you're looking for doesn't exist or is not public.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                {(error as Error).message}
              </AlertDescription>
            </Alert>
            <Link href="/global-breeders">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Breeders Directory
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Banner */}
      <ProfileBanner bannerUrl={profile.bannerUrl} isEditing={false} />

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

      {/* Action Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-wrap gap-3 justify-end">
          <ShareButton
            url={`/global-breeders/${slug}`}
            title={profile.displayName}
            description={profile.tagline || `Check out ${profile.displayName} on Animalytics`}
          />
          <Button className="bg-gradient-brand hover:opacity-90">
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Breeder
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

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12">
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="bg-surface shadow-card">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="animals">
              Animals {animals && `(${animals.length})`}
            </TabsTrigger>
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

          {/* Animals Tab */}
          <TabsContent value="animals" className="space-y-6">
            {animalsLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            ) : animals && animals.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {animals.map((animal: any) => (
                  <Card key={animal.id} className="shadow-card hover-elevate">
                    <CardContent className="p-0">
                      {animal.imageUrl && (
                        <div className="aspect-square relative overflow-hidden rounded-t-lg">
                          <img
                            src={animal.imageUrl}
                            alt={animal.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold mb-1">{animal.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {animal.breed} • {animal.sex}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant={animal.status === 'available' ? 'default' : 'secondary'}>
                            {animal.status}
                          </Badge>
                          <Link href={`/animals/${animal.id}`}>
                            <Button size="sm" variant="ghost">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-card">
                <CardContent className="p-12 text-center">
                  <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No animals listed yet</p>
                </CardContent>
              </Card>
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
                <CardDescription>What customers are saying</CardDescription>
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
    </div>
  );
}
