"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Shield,
  Upload,
  Check,
  Lock,
  Unlock,
  AlertCircle,
  FileText,
  User,
  MapPin,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Camera,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils/currency";
import { getKYCLevelName, getSellingLimit } from "@/lib/utils/wallet";

// Mock KYC data - TODO: Replace with real data from API
const mockKYC = {
  level: 0 as 0 | 1 | 2 | 3,
  status: 'not_started' as const,
  monthlyLimit: 0,
  currentMonthSales: 0,
  firstName: '',
  lastName: '',
  phoneVerified: false,
  emailVerified: true,
  idVerified: false,
  addressVerified: false,
  businessVerified: false,
};

const kycLevels = [
  {
    level: 0,
    name: 'Not Verified',
    icon: Lock,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    limit: 0,
    description: 'Complete verification to start selling',
    requirements: [],
  },
  {
    level: 1,
    name: 'Basic',
    icon: User,
    color: 'text-primary-blue',
    bgColor: 'bg-primary-blue-light',
    limit: 100000, // $1,000 in cents
    description: 'Start selling with basic verification',
    requirements: [
      'Email verification',
      'Phone verification',
      'Basic profile information',
    ],
  },
  {
    level: 2,
    name: 'Seller',
    icon: BadgeCheck,
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
    limit: 500000, // $5,000 in cents
    description: 'Increased selling limits for active breeders',
    requirements: [
      'All Basic requirements',
      'Government-issued ID',
      'Proof of address',
      'Selfie verification',
    ],
  },
  {
    level: 3,
    name: 'Professional',
    icon: Building2,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    limit: Infinity,
    description: 'Unlimited selling for professional operations',
    requirements: [
      'All Seller requirements',
      'Business registration',
      'Tax identification',
      'Business address',
    ],
  },
];

export default function VerificationPage() {
  const [currentLevel, setCurrentLevel] = useState(mockKYC.level);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const currentLevelInfo = kycLevels[currentLevel];
  const nextLevelInfo = kycLevels[Math.min(currentLevel + 1, 3)];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-chart-3 text-white"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-chart-2 text-chart-2"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'not_started':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Not Started</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDocumentUpload = (docType: string) => {
    setUploadingDoc(docType);
    // Simulate upload
    setTimeout(() => {
      setUploadingDoc(null);
    }, 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight flex items-center">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 mr-3 text-primary" />
            Account Verification
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Verify your identity to increase selling limits and build trust
          </p>
        </div>
        {getStatusBadge(mockKYC.status)}
      </div>

      {/* Current Status Alert */}
      {currentLevel === 0 && (
        <Alert className="bg-chart-2-light border-chart-2">
          <AlertCircle className="h-4 w-4 text-chart-2" />
          <AlertDescription className="text-chart-2">
            <strong>Verification Required:</strong> You need to complete verification to start selling on the marketplace.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Overview */}
      <Card className="shadow-card bg-gradient-subtle border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Verification Progress</span>
            <Badge variant="outline" className="text-base px-3 py-1">
              Level {currentLevel} of 3
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Level: {currentLevelInfo.name}</span>
              <span className="text-sm text-muted-foreground">
                {currentLevel === 3 ? '100%' : `${Math.round((currentLevel / 3) * 100)}%`}
              </span>
            </div>
            <Progress value={(currentLevel / 3) * 100} className="h-3" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-surface border">
              <div className="text-sm text-muted-foreground mb-1">Monthly Limit</div>
              <div className="text-2xl font-bold">
                {currentLevelInfo.limit === Infinity ? 'Unlimited' : formatCurrency(currentLevelInfo.limit, 'USD')}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-surface border">
              <div className="text-sm text-muted-foreground mb-1">Current Month Sales</div>
              <div className="text-2xl font-bold">{formatCurrency(mockKYC.currentMonthSales, 'USD')}</div>
            </div>
            <div className="p-4 rounded-lg bg-surface border">
              <div className="text-sm text-muted-foreground mb-1">Remaining Limit</div>
              <div className="text-2xl font-bold text-chart-3">
                {currentLevelInfo.limit === Infinity ? 'Unlimited' : formatCurrency(currentLevelInfo.limit - mockKYC.currentMonthSales, 'USD')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Levels */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kycLevels.map((level) => {
          const Icon = level.icon;
          const isUnlocked = currentLevel >= level.level;
          const isCurrent = currentLevel === level.level;

          return (
            <Card
              key={level.level}
              className={`relative shadow-card transition-all ${
                isCurrent
                  ? 'ring-2 ring-primary shadow-elevated'
                  : isUnlocked
                  ? 'hover-elevate'
                  : 'opacity-60'
              }`}
            >
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-full ${level.bgColor} flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${level.color}`} />
                </div>
                <CardTitle className="flex items-center justify-between">
                  <span>{level.name}</span>
                  {isUnlocked && (
                    <CheckCircle2 className="w-5 h-5 text-chart-3" />
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  Level {level.level}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Monthly Limit</div>
                  <div className="text-xl font-bold">
                    {level.limit === Infinity ? 'Unlimited' : formatCurrency(level.limit, 'USD')}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{level.description}</p>
                {isCurrent && level.level < 3 && (
                  <Button className="w-full bg-gradient-brand hover:opacity-90 shadow-card">
                    Upgrade to Level {level.level + 1}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Verification Steps */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Complete Your Verification</CardTitle>
          <CardDescription>
            Follow these steps to unlock higher selling limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="level1" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="level1">Level 1: Basic</TabsTrigger>
              <TabsTrigger value="level2">Level 2: Seller</TabsTrigger>
              <TabsTrigger value="level3">Level 3: Professional</TabsTrigger>
            </TabsList>

            {/* Level 1: Basic */}
            <TabsContent value="level1" className="space-y-6">
              <Alert className="bg-primary-blue-light border-primary-blue">
                <User className="h-4 w-4 text-primary-blue" />
                <AlertDescription className="text-primary-blue">
                  <strong>Basic Verification</strong> - Quick setup to start selling with a $1,000/month limit
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {/* Email Verification */}
                <div className="flex items-center justify-between p-4 rounded-lg border bg-surface">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${mockKYC.emailVerified ? 'bg-chart-3/10' : 'bg-muted'}`}>
                      <FileText className={`w-5 h-5 ${mockKYC.emailVerified ? 'text-chart-3' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="font-medium">Email Verification</p>
                      <p className="text-sm text-muted-foreground">Verify your email address</p>
                    </div>
                  </div>
                  {mockKYC.emailVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-chart-3" />
                  ) : (
                    <Button size="sm" variant="outline">Verify Email</Button>
                  )}
                </div>

                {/* Phone Verification */}
                <div className="flex items-center justify-between p-4 rounded-lg border bg-surface">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${mockKYC.phoneVerified ? 'bg-chart-3/10' : 'bg-muted'}`}>
                      <FileText className={`w-5 h-5 ${mockKYC.phoneVerified ? 'text-chart-3' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="font-medium">Phone Verification</p>
                      <p className="text-sm text-muted-foreground">Verify your phone number</p>
                    </div>
                  </div>
                  {mockKYC.phoneVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-chart-3" />
                  ) : (
                    <Button size="sm" variant="outline">Verify Phone</Button>
                  )}
                </div>

                {/* Basic Info */}
                <div className="flex items-center justify-between p-4 rounded-lg border bg-surface">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Basic Information</p>
                      <p className="text-sm text-muted-foreground">Complete your profile</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Complete</Button>
                </div>
              </div>
            </TabsContent>

            {/* Level 2: Seller */}
            <TabsContent value="level2" className="space-y-6">
              <Alert className="bg-chart-3/10 border-chart-3">
                <BadgeCheck className="h-4 w-4 text-chart-3" />
                <AlertDescription className="text-chart-3">
                  <strong>Seller Verification</strong> - Upload identity documents to unlock $5,000/month limit
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                {/* ID Front */}
                <Card className="shadow-card hover-elevate">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      ID Front
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">Upload front of ID</p>
                      <Button size="sm" variant="outline" onClick={() => handleDocumentUpload('id_front')}>
                        {uploadingDoc === 'id_front' ? 'Uploading...' : 'Choose File'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* ID Back */}
                <Card className="shadow-card hover-elevate">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      ID Back
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">Upload back of ID</p>
                      <Button size="sm" variant="outline" onClick={() => handleDocumentUpload('id_back')}>
                        {uploadingDoc === 'id_back' ? 'Uploading...' : 'Choose File'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Selfie */}
                <Card className="shadow-card hover-elevate">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <Camera className="w-4 h-4 mr-2" />
                      Selfie Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">Upload selfie</p>
                      <Button size="sm" variant="outline" onClick={() => handleDocumentUpload('selfie')}>
                        {uploadingDoc === 'selfie' ? 'Uploading...' : 'Choose File'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Proof */}
                <Card className="shadow-card hover-elevate">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Proof of Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">Utility bill or bank statement</p>
                      <Button size="sm" variant="outline" onClick={() => handleDocumentUpload('address')}>
                        {uploadingDoc === 'address' ? 'Uploading...' : 'Choose File'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button className="w-full bg-gradient-brand hover:opacity-90 shadow-card" size="lg">
                Submit for Review
              </Button>
            </TabsContent>

            {/* Level 3: Professional */}
            <TabsContent value="level3" className="space-y-6">
              <Alert className="bg-chart-4/10 border-chart-4">
                <Building2 className="h-4 w-4 text-chart-4" />
                <AlertDescription className="text-chart-4">
                  <strong>Professional Verification</strong> - Business verification for unlimited selling
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input id="businessName" placeholder="Your Kennel Name LLC" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID / EIN</Label>
                    <Input id="taxId" placeholder="12-3456789" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sole">Sole Proprietorship</SelectItem>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="corp">Corporation</SelectItem>
                      <SelectItem value="partner">Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Input id="businessAddress" placeholder="123 Main St, City, State, ZIP" />
                </div>

                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Business Registration Document</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">Upload business registration</p>
                      <Button size="sm" variant="outline" onClick={() => handleDocumentUpload('business')}>
                        {uploadingDoc === 'business' ? 'Uploading...' : 'Choose File'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button className="w-full bg-gradient-brand hover:opacity-90 shadow-card" size="lg">
                Submit for Review
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
