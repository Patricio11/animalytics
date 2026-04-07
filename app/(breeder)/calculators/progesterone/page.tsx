'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  StartCycleModal,
  ProgesteroneListSkeleton,
  CompletedCycleCard,
  CancelledCycleCard,
} from '@/components/breeder/calculators';
import { useHeatCycles, useCreateHeatCycle, useCancelHeatCycle, useDeleteHeatCycle, useCompleteHeatCycle } from '@/lib/hooks/useHeatCycles';
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
  Plus,
  ArrowRight,
  Edit,
  XCircle,
  Trash2,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ConfirmDeleteModal } from '@/components/ui/confirm-delete-modal';
import { ConfirmCancelModal } from '@/components/ui/confirm-cancel-modal';
import { ConfirmCompleteModal } from '@/components/ui/confirm-complete-modal';
import { format, differenceInDays } from 'date-fns';

export default function ProgesteronePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('active');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [startCycleModalOpen, setStartCycleModalOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<any>(null);
  
  const { data: heatCyclesData, isLoading } = useHeatCycles();
  const { data: animalsData } = useAnimals();
  const createCycle = useCreateHeatCycle();
  const cancelCycle = useCancelHeatCycle();
  const deleteCycle = useDeleteHeatCycle();
  const completeCycle = useCompleteHeatCycle();

  // Helper function to calculate expected day based on readings or date
  const getDisplayDay = (cycle: any) => {
    // If there are readings, use the latest reading's day
    if (cycle.readings && cycle.readings.length > 0) {
      const sortedReadings = [...cycle.readings].sort((a, b) => b.day - a.day);
      return sortedReadings[0].day;
    }
    // Otherwise, calculate expected day for next test (Day 5 if no readings)
    return 5; // First test is always Day 5
  };

  // Separate cycles by status
  const activeCycles = heatCyclesData?.filter((c: any) => c.status === 'active') || [];
  const completedCycles = heatCyclesData?.filter((c: any) => c.status === 'completed') || [];
  const cancelledCycles = heatCyclesData?.filter((c: any) => c.status === 'cancelled') || [];

  // Get IDs of bitches with active cycles
  const activeBitchIds = new Set(activeCycles.map((c: any) => c.bitchId));

  // Filter and map female animals for heat cycle tracking
  // Exclude bitches that already have an active cycle
  const femaleAnimals = animalsData
    ?.filter((a: any) => a.sex === 'female' && !activeBitchIds.has(a.id))
    .map((a: any) => ({
      id: a.id,
      name: a.name,
      breed: a.breed?.name || 'Unknown Breed', // Flatten breed object to string
      profileImageUrl: a.profilePhotoUrl || a.profileImageUrl,
      registeredName: a.registeredName,
      sex: a.sex,
    })) || [];

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
              onClick={() => setStartCycleModalOpen(true)}
              className="bg-gradient-brand"
            >
              <Activity className="w-4 h-4 mr-2" />
              Start New Cycle
            </Button>
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
          <ProgesteroneListSkeleton />
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
                        className="shadow-card bg-surface border-0 hover:shadow-lg transition-shadow"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => handleViewCycle(cycle.id)}
                            >
                              <CardTitle className="text-xl flex items-center gap-2">
                                {cycle.bitch?.name || 'Unknown Bitch'}
                                <Badge className="bg-green-500 text-white">Active</Badge>
                              </CardTitle>
                              <CardDescription className="mt-2">
                                Started {format(new Date(cycle.startDate), 'MMMM dd, yyyy')} • Day {cycle.currentDay}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewCycle(cycle.id)}
                              >
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => router.push(`/calculators/progesterone/${cycle.id}`)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-green-600"
                                    onClick={() => {
                                      setSelectedCycle(cycle);
                                      setCompleteModalOpen(true);
                                    }}
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Complete Cycle
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-amber-600"
                                    onClick={() => {
                                      setSelectedCycle(cycle);
                                      setCancelModalOpen(true);
                                    }}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel Cycle
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => {
                                      setSelectedCycle(cycle);
                                      setDeleteModalOpen(true);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Cycle
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                {cycle.readings?.length > 0 ? 'Latest Test' : 'Next Test Due'}
                              </p>
                              <p className="text-2xl font-bold text-foreground">Day {getDisplayDay(cycle)}</p>
                              {cycle.readings?.length === 0 && differenceInDays(new Date(), new Date(cycle.startDate)) >= 5 && (
                                <p className="text-xs text-amber-600 mt-1">Overdue</p>
                              )}
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
                                  ? `${parseFloat(cycle.readings[0].progesteroneLevel).toFixed(1)} ng/mL`
                                  : 'N/A'}
                              </p>
                              {cycle.readings && cycle.readings.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(cycle.readings[0].testDate), 'MMM dd, yyyy')}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              {(() => {
                                const lastMating = cycle.breedingRecords?.find((br: any) => br.isLastMating);
                                const anyMating = cycle.breedingRecords?.[0];
                                if (lastMating) {
                                  return (
                                    <>
                                      <p className="text-lg font-semibold text-green-600">
                                        ✅ Last Mating Done
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {format(new Date(lastMating.breedingDate), 'MMM dd, yyyy')} · {(lastMating.breedingMethod || 'natural').replace('_', ' ')}
                                      </p>
                                    </>
                                  );
                                } else if (anyMating) {
                                  return (
                                    <>
                                      <p className="text-lg font-semibold text-blue-600">
                                        🔵 Mating Recorded
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {format(new Date(anyMating.breedingDate), 'MMM dd, yyyy')} · {(anyMating.breedingMethod || 'natural').replace('_', ' ')}
                                      </p>
                                    </>
                                  );
                                } else {
                                  return (
                                    <p className="text-lg font-semibold text-purple-600">
                                      {cycle.readings && cycle.readings.length > 0
                                        ? cycle.readings[0].phase
                                        : 'No readings'}
                                    </p>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                          
                          {(cycle.estimatedOvulationDay || cycle.estimatedWhelpingDate || cycle.breedingRecords?.some((br: any) => br.isLastMating)) && (
                            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex flex-wrap gap-x-6 gap-y-1">
                              {cycle.estimatedOvulationDay && (
                                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                  🎯 Estimated Ovulation: Day {cycle.estimatedOvulationDay}
                                </p>
                              )}
                              {cycle.estimatedWhelpingDate && (
                                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                  👶 Expected Whelping: {format(new Date(cycle.estimatedWhelpingDate), 'MMM dd, yyyy')}
                                </p>
                              )}
                              {(() => {
                                const lastMating = cycle.breedingRecords?.find((br: any) => br.isLastMating);
                                if (lastMating) {
                                  const scanDate = new Date(lastMating.breedingDate);
                                  scanDate.setDate(scanDate.getDate() + 28);
                                  return (
                                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                      🔬 Scan Due: {format(scanDate, 'MMM dd, yyyy')}
                                    </p>
                                  );
                                }
                                return null;
                              })()}
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
                      <CompletedCycleCard
                        key={cycle.id}
                        cycle={cycle}
                        onClick={() => handleViewCycle(cycle.id)}
                      />
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
                      <CancelledCycleCard
                        key={cycle.id}
                        cycle={cycle}
                        onClick={() => handleViewCycle(cycle.id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Complete Cycle Confirmation Modal */}
      <ConfirmCompleteModal
        open={completeModalOpen}
        onOpenChange={setCompleteModalOpen}
        onConfirm={async () => {
          if (selectedCycle) {
            await completeCycle.mutateAsync(selectedCycle.id);
            setCompleteModalOpen(false);
            setSelectedCycle(null);
          }
        }}
        itemName={selectedCycle?.bitch?.name}
        isLoading={completeCycle.isPending}
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmCancelModal
        open={cancelModalOpen}
        onOpenChange={setCancelModalOpen}
        onConfirm={async () => {
          if (selectedCycle) {
            await cancelCycle.mutateAsync(selectedCycle.id);
            setCancelModalOpen(false);
            setSelectedCycle(null);
          }
        }}
        itemName={selectedCycle?.bitch?.name}
        isLoading={cancelCycle.isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={async () => {
          if (selectedCycle) {
            await deleteCycle.mutateAsync(selectedCycle.id);
            setDeleteModalOpen(false);
            setSelectedCycle(null);
          }
        }}
        title="Delete Heat Cycle"
        description={`Are you sure you want to permanently delete the heat cycle for "${selectedCycle?.bitch?.name}"? This will delete all progesterone readings, breeding records, and reminders associated with this cycle. This action cannot be undone.`}
        itemName={selectedCycle?.bitch?.name}
        isLoading={deleteCycle.isPending}
      />

      {/* Start Cycle Modal */}
      <StartCycleModal
        open={startCycleModalOpen}
        onOpenChange={setStartCycleModalOpen}
        animals={femaleAnimals}
        onStartCycle={(data) => {
          createCycle.mutate(data as any, {
            onSuccess: (response) => {
              setStartCycleModalOpen(false);
              router.push(`/calculators/progesterone/${response.heatCycle.id}`);
            }
          });
        }}
        isLoading={createCycle.isPending}
      />
    </div>
  );
}
