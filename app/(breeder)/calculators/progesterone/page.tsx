'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HeatCycleStartCard, 
  ActiveCycleCard,
} from '@/components/breeder/calculators';
import { useHeatCycles, useCreateHeatCycle } from '@/lib/hooks/useHeatCycles';
import { useAnimals } from '@/lib/api/queries/animals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Calendar, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  BarChart3,
  FileText,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function ProgesteronePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('active');
  const { data: heatCyclesData, isLoading } = useHeatCycles();
  const { data: animalsData } = useAnimals();
  const createCycle = useCreateHeatCycle();

  // Filter and map female animals for heat cycle tracking
  const femaleAnimals = animalsData
    ?.filter((a: any) => a.sex === 'female')
    .map((a: any) => ({
      id: a.id,
      name: a.name,
      breed: a.breed?.name || 'Unknown Breed', // Flatten breed object to string
      profilePhotoUrl: a.profilePhotoUrl,
      registeredName: a.registeredName,
      sex: a.sex,
    })) || [];

  // Separate cycles by status
  const activeCycles = heatCyclesData?.filter((c: any) => c.status === 'active') || [];
  const completedCycles = heatCyclesData?.filter((c: any) => c.status === 'completed') || [];
  const cancelledCycles = heatCyclesData?.filter((c: any) => c.status === 'cancelled') || [];

  const handleViewCycle = (cycleId: string) => {
    router.push(`/calculators/progesterone/${cycleId}`);
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-brand shadow-md">
                <Activity className="w-6 h-6 text-white" />
              </div>
              Progesterone Tracking
            </h1>
            <p className="text-muted-foreground mt-2">
              Track heat cycles and progesterone levels to determine optimal breeding timing
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/calculators')}
            >
              Back to Calculators
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <Card className="shadow-card bg-surface border-0">
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading heat cycles...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="shadow-card bg-surface border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Cycles</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {activeCycles.length}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                      <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-surface border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cycles</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {heatCyclesData?.length || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                      <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-surface border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {completedCycles.length}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                      <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-surface border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {completedCycles.length > 0 
                          ? Math.round((completedCycles.filter((c: any) => c.successful).length / completedCycles.length) * 100)
                          : 0}%
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                      <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Start New Cycle Card */}
            <HeatCycleStartCard 
              animals={femaleAnimals}
              onStartCycle={(data) => {
                createCycle.mutate(data as any, {
                  onSuccess: (response) => {
                    router.push(`/calculators/progesterone/${response.heatCycle.id}`);
                  }
                });
              }}
              isLoading={createCycle.isPending}
            />

            {/* Cycles Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-surface shadow-card">
                <TabsTrigger value="active">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Active ({activeCycles.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Completed ({completedCycles.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Cancelled ({cancelledCycles.length})
                </TabsTrigger>
              </TabsList>

              {/* Active Cycles Tab */}
              <TabsContent value="active" className="space-y-6">
                {activeCycles.length === 0 ? (
                  <Card className="shadow-card bg-surface border-0">
                    <CardContent className="p-12">
                      <div className="text-center text-muted-foreground">
                        <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium mb-2">No Active Cycles</p>
                        <p className="text-sm mb-6">Start tracking a new heat cycle to begin</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {activeCycles.map((cycle: any) => (
                      <Card 
                        key={cycle.id} 
                        className="shadow-card bg-surface border-0 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleViewCycle(cycle.id)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl flex items-center gap-2">
                                {cycle.bitch?.name || 'Unknown Bitch'}
                                <Badge className="bg-green-500 text-white">Active</Badge>
                              </CardTitle>
                              <CardDescription className="mt-2">
                                Started {format(new Date(cycle.startDate), 'MMMM dd, yyyy')} • Day {cycle.currentDay}
                              </CardDescription>
                            </div>
                            <Button variant="ghost" size="sm">
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Current Day</p>
                              <p className="text-2xl font-bold text-foreground">Day {cycle.currentDay}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Readings</p>
                              <p className="text-2xl font-bold text-foreground">
                                {cycle.readings?.length || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Last Reading</p>
                              <p className="text-lg font-semibold text-foreground">
                                {cycle.readings && cycle.readings.length > 0
                                  ? `${parseFloat(cycle.readings[cycle.readings.length - 1].progesteroneLevel).toFixed(1)} ng/mL`
                                  : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <p className="text-lg font-semibold text-purple-600">
                                {cycle.readings && cycle.readings.length > 0
                                  ? cycle.readings[cycle.readings.length - 1].phase
                                  : 'No readings'}
                              </p>
                            </div>
                          </div>
                          
                          {cycle.estimatedOvulationDay && (
                            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                🎯 Estimated Ovulation: Day {cycle.estimatedOvulationDay}
                                {cycle.estimatedWhelpingDate && (
                                  <span className="ml-4">
                                    👶 Expected Whelping: {format(new Date(cycle.estimatedWhelpingDate), 'MMM dd, yyyy')}
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Completed Cycles Tab */}
              <TabsContent value="completed" className="space-y-4">
                {completedCycles.length === 0 ? (
                  <Card className="shadow-card bg-surface border-0">
                    <CardContent className="p-12">
                      <div className="text-center text-muted-foreground">
                        <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium mb-2">No Completed Cycles</p>
                        <p className="text-sm">Completed cycles will appear here</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {completedCycles.map((cycle: any) => (
                      <Card 
                        key={cycle.id} 
                        className="shadow-card bg-surface border-0 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleViewCycle(cycle.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{cycle.bitch?.name || 'Unknown'}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(cycle.startDate), 'MMM dd, yyyy')} - 
                                {cycle.endDate ? format(new Date(cycle.endDate), 'MMM dd, yyyy') : 'Ongoing'}
                              </p>
                            </div>
                            <Badge variant="outline">Completed</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Duration</p>
                              <p className="font-semibold">
                                {cycle.endDate 
                                  ? `${differenceInDays(new Date(cycle.endDate), new Date(cycle.startDate))} days`
                                  : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Readings</p>
                              <p className="font-semibold">{cycle.readings?.length || 0}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Cancelled Cycles Tab */}
              <TabsContent value="cancelled" className="space-y-4">
                {cancelledCycles.length === 0 ? (
                  <Card className="shadow-card bg-surface border-0">
                    <CardContent className="p-12">
                      <div className="text-center text-muted-foreground">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium mb-2">No Cancelled Cycles</p>
                        <p className="text-sm">Cancelled cycles will appear here</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cancelledCycles.map((cycle: any) => (
                      <Card 
                        key={cycle.id} 
                        className="shadow-card bg-surface border-0 opacity-75"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{cycle.bitch?.name || 'Unknown'}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(cycle.startDate), 'MMM dd, yyyy')}
                              </p>
                            </div>
                            <Badge variant="destructive">Cancelled</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
