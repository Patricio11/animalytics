"use client";

import { useState } from "react";
import {
  User,
  Star,
  Award,
  MapPin,
  Globe,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  MessageCircle,
  Edit,
  Camera,
  Save,
  X,
  CheckCircle2,
  Shield,
  Heart,
  Eye,
  BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

// Mock profile data - TODO: Replace with real data from API
const mockProfile = {
  id: 'profile_123',
  userId: 'user_123',
  displayName: 'Golden Paws Kennels',
  slug: 'golden-paws-kennels',
  tagline: 'Raising Champion Golden Retrievers Since 2010',
  bio: 'We are a family-owned kennel dedicated to breeding healthy, well-tempered Golden Retrievers with champion bloodlines. Our dogs are health tested, socialized from birth, and come with comprehensive health guarantees.',
  logoUrl: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=200&h=200&fit=crop',
  bannerUrl: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=1200&h=400&fit=crop',

  // Business info
  businessName: 'Golden Paws Kennels LLC',
  yearsInBusiness: 14,
  location: 'Colorado, USA',
  website: 'https://goldenpawskennels.com',
  email: 'info@goldenpawskennels.com',
  phone: '+1 (555) 123-4567',

  // Verification
  kycVerified: true,
  backgroundCheckVerified: true,
  healthCertified: true,
  premiumMember: true,

  // Statistics
  totalSales: 156,
  totalEarnings: '425000.00',
  successfulTransactions: 156,
  totalAnimals: 12,
  totalLitters: 34,
  averageRating: '4.9',
  totalReviews: 89,
  fiveStarReviews: 82,
  fourStarReviews: 5,
  threeStarReviews: 2,
  twoStarReviews: 0,
  oneStarReviews: 0,
  responseRate: 98,
  responseTimeHours: 2,
  onTimeDeliveryRate: 100,
  profileViews: 1247,
  profileViewsThisMonth: 89,

  // Breeds
  primaryBreeds: ['Golden Retriever', 'Labrador Retriever'],
  specializations: ['Show Dogs', 'Family Companions', 'Service Dog Training'],

  // Certifications
  certifications: [
    {
      name: 'AKC Breeder of Merit',
      issuingOrganization: 'American Kennel Club',
      issueDate: '2018-03-15',
    },
    {
      name: 'Canine Good Citizen Evaluator',
      issuingOrganization: 'AKC',
      issueDate: '2015-06-20',
    },
  ],

  awards: ['Best of Breed 2023', 'National Specialty Winner 2022'],

  profileCompleteness: 95,
  isPublic: true,
  acceptsInternationalOrders: true,
};

export default function BreederProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(mockProfile);

  const handleSave = () => {
    // TODO: Save to API
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(mockProfile);
    setIsEditing(false);
  };

  const stats = [
    { label: 'Profile Views', value: mockProfile.profileViews.toLocaleString(), icon: Eye, color: 'text-primary' },
    { label: 'Total Sales', value: mockProfile.totalSales, icon: Package, color: 'text-chart-3' },
    { label: 'Avg. Rating', value: mockProfile.averageRating, icon: Star, color: 'text-chart-2' },
    { label: 'Response Rate', value: `${mockProfile.responseRate}%`, icon: MessageCircle, color: 'text-chart-4' },
  ];

  const verificationBadges = [
    { label: 'KYC Verified', icon: BadgeCheck, active: mockProfile.kycVerified, color: 'text-chart-3' },
    { label: 'Background Check', icon: Shield, active: mockProfile.backgroundCheckVerified, color: 'text-primary-blue' },
    { label: 'Health Certified', icon: Heart, active: mockProfile.healthCertified, color: 'text-chart-1' },
    { label: 'Premium Member', icon: Award, active: mockProfile.premiumMember, color: 'text-chart-2' },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Banner */}
      <div className="relative h-64 bg-gradient-brand">
        <img
          src={mockProfile.bannerUrl}
          alt="Banner"
          className="w-full h-full object-cover opacity-30"
        />
        {isEditing && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute bottom-4 right-4 shadow-elevated"
          >
            <Camera className="w-4 h-4 mr-2" />
            Change Banner
          </Button>
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        <Card className="shadow-elevated border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-surface shadow-card">
                  <AvatarImage src={mockProfile.logoUrl} alt={mockProfile.displayName} />
                  <AvatarFallback className="bg-gradient-brand text-white text-3xl font-bold">
                    {mockProfile.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 shadow-card"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                  <div className="flex-1 w-full">
                    {isEditing ? (
                      <Input
                        value={editedProfile.displayName}
                        onChange={(e) => setEditedProfile({...editedProfile, displayName: e.target.value})}
                        className="text-2xl sm:text-3xl font-bold mb-2"
                      />
                    ) : (
                      <h1 className="text-2xl sm:text-3xl font-bold mb-2">{mockProfile.displayName}</h1>
                    )}
                    {isEditing ? (
                      <Input
                        value={editedProfile.tagline}
                        onChange={(e) => setEditedProfile({...editedProfile, tagline: e.target.value})}
                        className="text-sm sm:text-base text-muted-foreground"
                      />
                    ) : (
                      <p className="text-sm sm:text-base text-muted-foreground">{mockProfile.tagline}</p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {isEditing ? (
                      <>
                        <Button onClick={handleSave} className="bg-gradient-brand hover:opacity-90 w-full sm:w-auto">
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={handleCancel} variant="outline" className="w-full sm:w-auto">
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)} variant="outline" className="hover-elevate w-full sm:w-auto">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>

                {/* Verification Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {verificationBadges.map((badge) => {
                    const Icon = badge.icon;
                    return badge.active ? (
                      <Badge key={badge.label} className="bg-surface border-primary/20 shadow-card">
                        <Icon className={`w-3 h-3 mr-1 ${badge.color}`} />
                        {badge.label}
                      </Badge>
                    ) : null;
                  })}
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {mockProfile.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {mockProfile.yearsInBusiness} years in business
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    <a href={mockProfile.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                      Website
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="shadow-card hover-elevate">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-full bg-surface ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Profile Completeness */}
      {mockProfile.profileCompleteness < 100 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <Alert className="bg-chart-2-light border-chart-2">
            <TrendingUp className="h-4 w-4 text-chart-2" />
            <AlertDescription className="text-chart-2">
              <div className="flex items-center justify-between mb-2">
                <strong>Your profile is {mockProfile.profileCompleteness}% complete</strong>
                <span className="text-sm">{100 - mockProfile.profileCompleteness}% to go!</span>
              </div>
              <Progress value={mockProfile.profileCompleteness} className="h-2 mb-2" />
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
            <TabsTrigger value="reviews">Reviews ({mockProfile.totalReviews})</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>About Us</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                    rows={6}
                  />
                ) : (
                  <p className="text-muted-foreground leading-relaxed">{mockProfile.bio}</p>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Breeds */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Breeds We Specialize In</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockProfile.primaryBreeds.map((breed) => (
                      <Badge key={breed} variant="outline" className="mr-2">
                        {breed}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Specializations */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Specializations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockProfile.specializations.map((spec) => (
                      <Badge key={spec} variant="secondary" className="mr-2">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${mockProfile.email}`} className="text-primary hover:underline">
                      {mockProfile.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${mockProfile.phone}`} className="text-primary hover:underline">
                      {mockProfile.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a href={mockProfile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {mockProfile.website}
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Business Info */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Business Name</span>
                    <span className="font-medium">{mockProfile.businessName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Years Active</span>
                    <span className="font-medium">{mockProfile.yearsInBusiness}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">International Orders</span>
                    <Badge variant={mockProfile.acceptsInternationalOrders ? "default" : "secondary"}>
                      {mockProfile.acceptsInternationalOrders ? 'Accepted' : 'Not Accepted'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                    <span className="font-bold">{mockProfile.totalSales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Successful Transactions</span>
                    <span className="font-bold">{mockProfile.successfulTransactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">On-Time Delivery</span>
                    <span className="font-bold text-chart-3">{mockProfile.onTimeDeliveryRate}%</span>
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
                    const count = mockProfile[`${['five', 'four', 'three', 'two', 'one'][5 - stars]}StarReviews` as keyof typeof mockProfile] as number;
                    const percentage = (count / mockProfile.totalReviews) * 100;
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
                    <span className="font-bold text-chart-4">{mockProfile.responseRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Response Time</span>
                    <span className="font-bold">{mockProfile.responseTimeHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Reviews</span>
                    <span className="font-bold">{mockProfile.totalReviews}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {mockProfile.certifications.map((cert) => (
                <Card key={cert.name} className="shadow-card hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-chart-3/10">
                        <Award className="w-6 h-6 text-chart-3" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{cert.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{cert.issuingOrganization}</p>
                        <Badge variant="outline">Issued: {new Date(cert.issueDate).toLocaleDateString()}</Badge>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-chart-3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {mockProfile.awards.length > 0 && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Awards & Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mockProfile.awards.map((award) => (
                      <Badge key={award} className="bg-chart-2-light text-chart-2 border-chart-2/20">
                        <Award className="w-3 h-3 mr-1" />
                        {award}
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
                  <p>Reviews will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
