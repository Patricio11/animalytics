"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calculator, Activity, Heart, Beaker, ArrowRight, Calendar, TrendingUp, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useMatings } from "@/lib/api/queries/matings";
import { format } from "date-fns";

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch real data from API
  const { data: matingsData, isLoading: matingsLoading } = useMatings();

  // Resolve photo URL from animal data (same pattern as conception-rating page)
  const resolvePhoto = (animal: any) => {
    if (!animal) return undefined;
    const profilePhoto = animal.photos?.find((p: any) => p.category === 'profile');
    return profilePhoto?.fileUrl || animal.photos?.[0]?.fileUrl || animal.profileImageUrl || undefined;
  };

  // Get recent matings (last 2)
  const recentMatingCalculations = matingsData?.slice(0, 2).map((mating: any) => {
    const ratingValue = parseFloat(mating.overallRating || '0');
    return {
      id: mating.id,
      dogName: mating.dog?.name || mating.frozenSemen?.dogName || 'Unknown',
      bitchName: mating.bitch?.name || 'Unknown',
      dogAvatarUrl: resolvePhoto(mating.dog),
      bitchAvatarUrl: resolvePhoto(mating.bitch),
      date: mating.matingDate,
      rating: ratingValue,
      status: (ratingValue >= 80 ? 'excellent' : 'good') as 'excellent' | 'good',
    };
  }) || [];

  // TODO: Fetch recent progesterone cycles for preview
  const recentProgesteroneTests: any[] = [];
  const cyclesLoading = false;

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Breeding Calculators</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive tools for progesterone analysis, mating calculations, and conception ratings
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Calculator Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-surface shadow-card">
            <TabsTrigger value="overview">
              <Calculator className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="progesterone">
              <Activity className="w-4 h-4 mr-2" />
              Progesterone
            </TabsTrigger>
            <TabsTrigger value="mating">
              <Heart className="w-4 h-4 mr-2" />
              Mating
            </TabsTrigger>
            <TabsTrigger value="conception">
              <Beaker className="w-4 h-4 mr-2" />
              Conception
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Calculator Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Progesterone Calculator Card */}
              <Card className="hover-elevate shadow-card bg-surface border-0">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-brand flex items-center justify-center mb-3">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Progesterone Calculator</CardTitle>
                  <CardDescription>
                    Track daily progesterone levels to determine optimal breeding timing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Features:</div>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-chart-3" />
                        6-day progesterone tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-chart-3" />
                        Multiple lab support
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-chart-3" />
                        Breeding window calculation
                      </li>
                    </ul>
                  </div>
                  <Button
                    onClick={() => setActiveTab("progesterone")}
                    className="w-full bg-gradient-brand hover:opacity-90 shadow-card"
                  >
                    Open Calculator
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Mating Calculator Card */}
              <Card className="hover-elevate shadow-card bg-surface border-0">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-brand flex items-center justify-center mb-3">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Mating Calculator</CardTitle>
                  <CardDescription>
                    Calculate compatibility and success probability for breeding pairs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Features:</div>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-chart-4" />
                        Breeding pair analysis
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-chart-4" />
                        Success probability
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-chart-4" />
                        Mating records tracking
                      </li>
                    </ul>
                  </div>
                  <Button
                    onClick={() => setActiveTab("mating")}
                    className="w-full bg-gradient-brand hover:opacity-90 shadow-card"
                  >
                    Open Calculator
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Conception Rating Wizard Card */}
              <Card className="hover-elevate shadow-card bg-surface border-0">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-brand flex items-center justify-center mb-3">
                    <Beaker className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Conception Rating Wizard</CardTitle>
                  <CardDescription>
                    Comprehensive multi-step assessment for breeding potential
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Features:</div>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-chart-2" />
                        8-step guided wizard
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-chart-2" />
                        Breed-specific analysis
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-chart-2" />
                        Complete fertility assessment
                      </li>
                    </ul>
                  </div>
                  <Button
                    onClick={() => setActiveTab("conception")}
                    className="w-full bg-gradient-brand hover:opacity-90 shadow-card"
                  >
                    Open Wizard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Mating Calculations */}
              <Card className="shadow-card bg-surface border-0">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Recent Mating Calculations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {matingsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : recentMatingCalculations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No mating records yet</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        asChild
                      >
                        <Link href="/calculators/mating">
                          Create First Record
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <>
                      {recentMatingCalculations.map((calc: any) => (
                        <Link key={calc.id} href={`/calculators/mating/${calc.id}`}>
                          <Card className="shadow-card bg-surface-secondary border-0 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex -space-x-2">
                                    {calc.bitchAvatarUrl ? (
                                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-pink-200 z-10">
                                        <img src={calc.bitchAvatarUrl} alt={calc.bitchName} className="w-full h-full object-cover" />
                                      </div>
                                    ) : (
                                      <Avatar className="w-8 h-8 border-2 border-pink-200 z-10">
                                        <AvatarFallback className="bg-pink-100 text-pink-700 text-xs font-semibold">
                                          {calc.bitchName.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                    {calc.dogAvatarUrl ? (
                                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-200">
                                        <img src={calc.dogAvatarUrl} alt={calc.dogName} className="w-full h-full object-cover" />
                                      </div>
                                    ) : (
                                      <Avatar className="w-8 h-8 border-2 border-blue-200">
                                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                                          {calc.dogName.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium text-foreground">
                                      {calc.dogName} × {calc.bitchName}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                      <Calendar className="w-3 h-3" />
                                      {calc.date}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-foreground">{calc.rating.toFixed(1)}%</div>
                                  <Badge
                                    className={calc.status === 'excellent' ? 'bg-chart-3 text-white' : 'bg-chart-4 text-white'}
                                  >
                                    {calc.status}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full hover:bg-primary/10 hover:border-primary shadow-card"
                        asChild
                      >
                        <Link href="/calculators/mating">
                          <FileText className="w-4 h-4 mr-2" />
                          View All Records
                        </Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Recent Progesterone Tests */}
              <Card className="shadow-card bg-surface border-0">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Recent Progesterone Tests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cyclesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : recentProgesteroneTests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm mb-2">No progesterone tests yet</p>
                      <p className="text-xs mb-4">Track progesterone levels to determine optimal breeding timing</p>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("progesterone")}
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Start First Test
                      </Button>
                    </div>
                  ) : (
                    <>
                      {recentProgesteroneTests.map((cycle: any) => (
                        <Card key={cycle.id} className="shadow-card bg-surface-secondary border-0">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-foreground">{cycle.bitch?.name || 'Unknown'}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(cycle.startDate), 'MMM dd, yyyy')}
                                  <Badge variant="outline" className="text-xs">
                                    Day {cycle.currentDay}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className={cycle.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                                  {cycle.status}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full hover:bg-primary/10 hover:border-primary shadow-card"
                        onClick={() => setActiveTab("progesterone")}
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        New Test
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Progesterone Calculator Tab */}
          <TabsContent value="progesterone" className="space-y-6">
            <Card className="shadow-card bg-surface border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-brand shadow-md">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl">Progesterone Tracking</div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">
                      Track heat cycles and progesterone levels for optimal breeding timing
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    The Progesterone Tracking system helps you monitor heat cycles, track progesterone levels, detect ovulation, and identify the optimal breeding window with precision.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">📊 Smart Testing Schedule</h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Automatic recommendations based on progesterone levels
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">🎯 Breeding Window Detection</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Real-time alerts when optimal breeding time is detected
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📈 Beautiful Charts</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Visualize progesterone levels with interactive charts
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">📄 PDF Reports</h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Export professional reports for your records
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      className="bg-gradient-brand hover:opacity-90 shadow-card"
                      asChild
                    >
                      <Link href="/calculators/progesterone">
                        <Activity className="w-4 h-4 mr-2" />
                        Open Progesterone Tracker
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="hover:bg-primary/10 hover:border-primary shadow-card"
                      asChild
                    >
                      <Link href="/calculators/progesterone">
                        <FileText className="w-4 h-4 mr-2" />
                        View All Cycles
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mating Calculator Tab */}
          <TabsContent value="mating" className="space-y-6">
            <Card className="shadow-card bg-surface border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-brand shadow-md">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl">Mating Calculator</div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">
                      Calculate breeding pair compatibility and success probability
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    The Mating Calculator analyzes breeding pairs and provides comprehensive success ratings based on multiple factors including health, genetics, and breeding history.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      className="bg-gradient-brand hover:opacity-90 shadow-card"
                      asChild
                    >
                      <Link href="/calculators/mating">
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculate New Mating
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="hover:bg-primary/10 hover:border-primary shadow-card"
                      asChild
                    >
                      <Link href="/calculators/mating">
                        <FileText className="w-4 h-4 mr-2" />
                        View Mating Records
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mating Records Preview */}
            <Card className="shadow-card bg-surface border-0">
              <CardHeader>
                <CardTitle className="text-lg">Recent Mating Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentMatingCalculations.map((calc: any) => (
                    <Card key={calc.id} className="shadow-card bg-surface-secondary border-0">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-semibold text-foreground mb-2">
                              {calc.dogName} × {calc.bitchName}
                            </div>
                            <div className="flex flex-wrap gap-2 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {calc.date}
                              </div>
                              <Badge
                                className={calc.status === 'excellent' ? 'bg-chart-3 text-white' : 'bg-chart-4 text-white'}
                              >
                                {calc.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-foreground">{calc.rating}%</div>
                            <div className="text-xs text-muted-foreground">success rating</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conception Rating Wizard Tab */}
          <TabsContent value="conception" className="space-y-6">
            <Card className="shadow-card bg-surface border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-brand shadow-md">
                    <Beaker className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl">Conception Rating Wizard</div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">
                      Comprehensive 8-step assessment for breeding potential
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p className="text-muted-foreground">
                    The Conception Rating Wizard guides you through a comprehensive assessment process, analyzing breed characteristics, animal history, semen quality, and breeding factors to provide an accurate conception rating.
                  </p>

                  {/* Wizard Steps Overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { step: 1, title: "Breed Selection", icon: "🐕" },
                      { step: 2, title: "Bitch Information", icon: "🐾" },
                      { step: 3, title: "Bitch History", icon: "📋" },
                      { step: 4, title: "Litter History", icon: "🐶" },
                      { step: 5, title: "Dog History", icon: "👑" },
                      { step: 6, title: "Breeder History", icon: "👤" },
                      { step: 7, title: "Semen Information", icon: "💉" },
                      { step: 8, title: "Semen Assessment", icon: "🔬" },
                    ].map((item) => (
                      <div
                        key={item.step}
                        className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary"
                      >
                        <div className="text-2xl">{item.icon}</div>
                        <div>
                          <div className="text-xs text-muted-foreground">Step {item.step}</div>
                          <div className="font-medium text-foreground">{item.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full bg-gradient-brand hover:opacity-90 shadow-card"
                    size="lg"
                    asChild
                  >
                    <Link href="/calculators/conception-rating">
                      <Beaker className="w-4 h-4 mr-2" />
                      Start Conception Rating Wizard
                    </Link>
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Complete all 8 steps to calculate your breeding conception rating
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}