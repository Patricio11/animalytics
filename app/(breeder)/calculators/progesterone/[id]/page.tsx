'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { 
  ActiveCycleCard,
  ProgesteroneChart,
  BreedingWindowAlert,
  CycleDetailSkeleton,
  AddReadingModal,
  EditReadingModal,
  AddBreedingRecordModal,
  BreedingRecordsList,
} from '@/components/breeder/calculators';
import { useHeatCycle, useUpdateProgesteroneReading, useDeleteProgesteroneReading } from '@/lib/hooks/useHeatCycles';
import { useBreedingRecords, useCreateBreedingRecord, useDeleteBreedingRecord } from '@/lib/hooks/useBreedingRecords';
import { useAnimals } from '@/lib/api/queries/animals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  ArrowLeft,
  Calendar,
  TrendingUp,
  FileText,
  Loader2,
  Download,
  Settings,
  Trash2,
  Edit,
  MoreVertical,
  Heart,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, differenceInDays, addDays } from 'date-fns';
import { exportProgesteronePDF } from '@/lib/utils/pdf-export';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CycleDetailPage({ params }: PageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = use(params);
  const { data: cycle, isLoading, error, refetch } = useHeatCycle(id);
  const { data: breedingRecords } = useBreedingRecords(id);
  const { data: animalsData } = useAnimals();
  const [showAddReadingForm, setShowAddReadingForm] = useState(false);
  const [showEditReadingForm, setShowEditReadingForm] = useState(false);
  const [showAddBreedingForm, setShowAddBreedingForm] = useState(false);
  const [selectedReading, setSelectedReading] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter for male animals (studs)
  const maleAnimals = animalsData?.filter((animal: any) => animal.sex === 'male') || [];
  
  const updateReading = useUpdateProgesteroneReading();
  const deleteReading = useDeleteProgesteroneReading();
  const createBreedingRecord = useCreateBreedingRecord();
  const deleteBreedingRecord = useDeleteBreedingRecord();

  // Helper function to get display day
  const getDisplayDay = (cycle: any) => {
    if (!cycle) return 1;
    // If there are readings, use the latest reading's day
    if (cycle.readings && cycle.readings.length > 0) {
      const sortedReadings = [...cycle.readings].sort((a: any, b: any) => b.day - a.day);
      return sortedReadings[0].day;
    }
    // Otherwise, show Day 5 (first test due)
    return 5;
  };

  // Check if test is overdue
  const isOverdue = (cycle: any) => {
    if (!cycle || cycle.readings?.length > 0) return false;
    const daysSinceStart = differenceInDays(new Date(), new Date(cycle.startDate)) + 1;
    return daysSinceStart >= 5;
  };

  // Get the date when Day 5 test was due
  const getDay5DueDate = (cycle: any) => {
    if (!cycle) return null;
    return addDays(new Date(cycle.startDate), 4); // Day 5 = start + 4 days
  };

  const handleExportPDF = async () => {
    if (!cycle) return;

    const reportData = {
      bitchName: cycle.bitch?.name || 'Unknown',
      bitchBreed: cycle.bitch?.breed,
      bitchRegistration: cycle.bitch?.registeredName,
      startDate: typeof cycle.startDate === 'string' ? cycle.startDate : cycle.startDate.toISOString(),
      currentDay: cycle.currentDay,
      status: cycle.status,
      readings: cycle.readings?.map((r: any) => ({
        day: r.day,
        date: r.testDate,
        level: parseFloat(r.progesteroneLevel),
        phase: r.phase || 'Unknown',
        laboratory: r.laboratory || 'VIDAS',
        notes: r.notes,
      })) || [],
      estimatedOvulationDay: cycle.estimatedOvulationDay,
      estimatedOvulationDate: cycle.estimatedOvulationDate ? (typeof cycle.estimatedOvulationDate === 'string' ? cycle.estimatedOvulationDate : cycle.estimatedOvulationDate.toISOString()) : undefined,
      estimatedWhelpingDate: cycle.estimatedWhelpingDate ? (typeof cycle.estimatedWhelpingDate === 'string' ? cycle.estimatedWhelpingDate : cycle.estimatedWhelpingDate.toISOString()) : undefined,
      breedingDates: cycle.breedingRecords?.map((b: any) => ({
        date: b.breedingDate,
        method: b.breedingMethod,
        studName: b.studName,
      })) || [],
      breederName: 'Breeder', // TODO: Get from user profile
      peakLevel: cycle.readings?.length > 0 
        ? Math.max(...cycle.readings.map((r: any) => parseFloat(r.progesteroneLevel)))
        : undefined,
      peakDay: cycle.readings?.length > 0
        ? cycle.readings.reduce((max: any, r: any) => 
            parseFloat(r.progesteroneLevel) > parseFloat(max.progesteroneLevel) ? r : max
          ).day
        : undefined,
      averageLevel: cycle.readings?.length > 0
        ? cycle.readings.reduce((sum: number, r: any) => sum + parseFloat(r.progesteroneLevel), 0) / cycle.readings.length
        : undefined,
    };

    try {
      await exportProgesteronePDF(reportData);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
          <CycleDetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !cycle) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
          <Card className="shadow-card bg-surface border-0">
            <CardContent className="p-12">
              <div className="text-center text-muted-foreground">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">Cycle Not Found</p>
                <p className="text-sm mb-6">The heat cycle you're looking for doesn't exist</p>
                <Button onClick={() => router.push('/calculators/progesterone')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Cycles
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/calculators/progesterone')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
                {cycle.bitch?.name || 'Unknown Bitch'}
                <Badge className={
                  cycle.status === 'active' ? 'bg-green-500 text-white' :
                  cycle.status === 'completed' ? 'bg-blue-500 text-white' :
                  'bg-gray-500 text-white'
                }>
                  {cycle.status}
                </Badge>
              </h1>
              <p className="text-muted-foreground mt-1">
                Started {format(new Date(cycle.startDate), 'MMMM dd, yyyy')} • 
                {cycle.readings?.length > 0 ? (
                  <span> Latest: Day {getDisplayDay(cycle)}</span>
                ) : (
                  <span> Next Test: Day {getDisplayDay(cycle)}</span>
                )}
                {isOverdue(cycle) && (
                  <span className="text-amber-600 font-semibold ml-2">
                    (Due {format(getDay5DueDate(cycle)!, 'MMM dd')} - Overdue)
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleExportPDF}
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Breeding Window Alert - Simplified for detail page */}
        {cycle.status === 'active' && cycle.readings && cycle.readings.length > 0 && (() => {
          const lastReading = cycle.readings[0];
          const lastLevel = parseFloat(String(lastReading.progesteroneLevel));
          return lastLevel >= 15 && (
            <Card className="shadow-card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-green-500">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-1">
                      🎯 Breeding Window Detected!
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Progesterone level: {lastLevel.toFixed(1)} ng/mL
                      {lastLevel >= 15 && lastLevel < 25 && ' - Optimal for natural breeding or AI'}
                      {lastLevel >= 25 && ' - Optimal for frozen semen AI'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Cycle Summary Card */}
        <Card className="shadow-card bg-surface border-0">
          <CardHeader>
            <CardTitle>Cycle Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {cycle.readings?.length > 0 ? 'Latest Test' : 'Next Test Due'}
                </p>
                <p className="text-2xl font-bold text-foreground">Day {getDisplayDay(cycle)}</p>
                {isOverdue(cycle) && (
                  <p className="text-xs text-amber-600 mt-1">Overdue since {format(getDay5DueDate(cycle)!, 'MMM dd')}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Readings</p>
                <p className="text-2xl font-bold text-foreground">{cycle.readings?.length || 0}</p>
              </div>
              {cycle.readings && cycle.readings.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Last Reading</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {parseFloat(String(cycle.readings[0].progesteroneLevel)).toFixed(1)} ng/mL
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(cycle.readings[0].testDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
              {cycle.estimatedOvulationDay && (
                <div>
                  <p className="text-sm text-muted-foreground">Est. Ovulation</p>
                  <p className="text-2xl font-bold text-red-600">Day {cycle.estimatedOvulationDay}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="readings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-surface shadow-card">
            <TabsTrigger value="readings">
              <Activity className="w-4 h-4 mr-2" />
              Readings
            </TabsTrigger>
            <TabsTrigger value="chart">
              <TrendingUp className="w-4 h-4 mr-2" />
              Chart
            </TabsTrigger>
            <TabsTrigger value="details">
              <FileText className="w-4 h-4 mr-2" />
              Details
            </TabsTrigger>
          </TabsList>

          {/* Readings Tab */}
          <TabsContent value="readings" className="space-y-6">
            {/* Add Reading Button */}
            {cycle.status === 'active' && (
              <Card className="shadow-card bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                      Ready to add a new progesterone reading?
                    </p>
                    <Button 
                      className="bg-gradient-brand"
                      onClick={() => setShowAddReadingForm(true)}
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Add New Reading
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Readings List */}
            <Card className="shadow-card bg-surface border-0">
              <CardHeader>
                <CardTitle>All Progesterone Readings</CardTitle>
                <CardDescription>
                  {cycle.readings?.length || 0} readings recorded
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!cycle.readings || cycle.readings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No readings yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cycle.readings
                      .sort((a: any, b: any) => b.day - a.day)
                      .map((reading: any) => (
                        <Card key={reading.id} className="shadow-card bg-surface-secondary border-0">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge variant="outline" className="font-mono">
                                    Day {reading.day}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {format(new Date(reading.testDate), 'MMM dd, yyyy')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Level</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                      {parseFloat(reading.progesteroneLevel).toFixed(1)} ng/mL
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Phase</p>
                                    <Badge 
                                      style={{ backgroundColor: reading.phaseColor || '#9ca3af' }}
                                      className="text-white"
                                    >
                                      {reading.phase || 'Unknown'}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Laboratory</p>
                                    <p className="text-sm font-medium">{reading.laboratory || 'VIDAS'}</p>
                                  </div>
                                </div>
                                {reading.notes && (
                                  <p className="text-sm text-muted-foreground mt-2 italic">
                                    {reading.notes}
                                  </p>
                                )}
                              </div>
                              {cycle.status === 'active' && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedReading(reading);
                                        setShowEditReadingForm(true);
                                      }}
                                    >
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit Reading
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={async () => {
                                        if (confirm('Are you sure you want to delete this reading? This will recalculate ovulation estimates.')) {
                                          await deleteReading.mutateAsync(reading.id);
                                          await refetch();
                                          queryClient.invalidateQueries({ queryKey: ['heat-cycles'] });
                                        }
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Reading
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chart Tab */}
          <TabsContent value="chart" className="space-y-6">
            {cycle.readings && cycle.readings.length > 0 ? (
              <ProgesteroneChart
                readings={cycle.readings.map((r: any) => ({
                  day: r.day,
                  testDate: r.testDate,
                  progesteroneLevel: parseFloat(r.progesteroneLevel),
                  phase: r.phase,
                  phaseColor: r.phaseColor,
                  notes: r.notes,
                }))}
                bitchName={cycle.bitch?.name}
                startDate={cycle.startDate}
                estimatedOvulationDay={cycle.estimatedOvulationDay}
                breedingDates={cycle.breedingRecords?.map((b: any) => ({
                  date: b.breedingDate,
                  method: b.breedingMethod,
                })) || []}
                showPhaseColors={true}
                showBreedingWindow={true}
                height={500}
              />
            ) : (
              <Card className="shadow-card bg-surface border-0">
                <CardContent className="p-12">
                  <div className="text-center text-muted-foreground">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-2">No Chart Data</p>
                    <p className="text-sm">Add progesterone readings to see the chart</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cycle Information */}
              <Card className="shadow-card bg-surface border-0">
                <CardHeader>
                  <CardTitle>Cycle Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={
                      cycle.status === 'active' ? 'bg-green-500 text-white' :
                      cycle.status === 'completed' ? 'bg-blue-500 text-white' :
                      'bg-gray-500 text-white'
                    }>
                      {cycle.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-muted-foreground">Start Date</span>
                    <span className="font-medium">{format(new Date(cycle.startDate), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-muted-foreground">Current Day</span>
                    <span className="font-medium">
                      Day {getDisplayDay(cycle)}
                      {isOverdue(cycle) && (
                        <span className="text-amber-600 text-sm ml-2">(Overdue)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-muted-foreground">Breeding Method</span>
                    <span className="font-medium capitalize">{cycle.breedingMethod?.replace('_', ' ')}</span>
                  </div>
                  {cycle.estimatedOvulationDay && (
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-muted-foreground">Estimated Ovulation</span>
                      <span className="font-medium">Day {cycle.estimatedOvulationDay}</span>
                    </div>
                  )}
                  {cycle.estimatedWhelpingDate && (
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Expected Whelping</span>
                      <span className="font-medium">{format(new Date(cycle.estimatedWhelpingDate), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bitch Information */}
              <Card className="shadow-card bg-surface border-0">
                <CardHeader>
                  <CardTitle>Bitch Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{cycle.bitch?.name || 'Unknown'}</span>
                  </div>
                  {cycle.bitch?.breed && (
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-muted-foreground">Breed</span>
                      <span className="font-medium">{cycle.bitch.registeredName}</span>
                    </div>
                  )}
                  {cycle.bitch?.registeredName && (
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-muted-foreground">Registration</span>
                      <span className="font-medium">{cycle.bitch.registeredName}</span>
                    </div>
                  )}
                  {/* Date of birth not available in HeatCycleWithDetails type */}
                </CardContent>
              </Card>
            </div>

            {/* Breeding Records */}
            <Card className="shadow-card bg-surface border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Breeding Records</CardTitle>
                    <CardDescription>
                      {breedingRecords?.length || 0} breeding(s) recorded
                    </CardDescription>
                  </div>
                  {cycle.status === 'active' && (
                    <Button
                      onClick={() => setShowAddBreedingForm(true)}
                      className="bg-gradient-to-r from-pink-500 to-rose-500"
                      size="sm"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Add Breeding
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <BreedingRecordsList
                  records={breedingRecords || []}
                  canEdit={cycle.status === 'active'}
                  onDelete={async (recordId) => {
                    await deleteBreedingRecord.mutateAsync({ recordId, heatCycleId: id });
                  }}
                />
              </CardContent>
            </Card>

            {/* Danger Zone (for active cycles) */}
            {cycle.status === 'active' && (
              <Card className="shadow-card bg-surface border-0 border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions for this heat cycle
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-100">Cancel Heat Cycle</p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Mark this cycle as cancelled. This action cannot be undone.
                      </p>
                    </div>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Cancel Cycle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Add Reading Modal */}
        <AddReadingModal
          open={showAddReadingForm}
          onOpenChange={setShowAddReadingForm}
          cycleDay={getDisplayDay(cycle)}
          bitchName={cycle.bitch?.name || 'Unknown'}
          startDate={typeof cycle.startDate === 'string' ? cycle.startDate : cycle.startDate.toISOString().split('T')[0]}
          isSubmitting={isSubmitting}
          onSubmit={async (data) => {
            setIsSubmitting(true);
            try {
              // Call the API to add reading
              const response = await fetch('/api/progesterone-readings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  heatCycleId: cycle.id,
                  testDate: format(data.testDate, 'yyyy-MM-dd'),
                  progesteroneLevel: data.level,
                  unit: 'nanograms',
                  laboratory: data.laboratory || 'VIDAS',
                  markAsMating: data.markAsMating,
                  markAsLastMating: data.markAsLastMating,
                }),
              });
              
              if (response.ok) {
                const result = await response.json();
                
                // Show success message with mating info
                if (result.isLastMating) {
                  alert(`✅ Reading saved and marked as LAST MATING!\n\n${result.pregnancyTasksGenerated ? '🎯 Pregnancy screening tasks have been generated!' : ''}\n\nCheck the Breeding Records tab for details.`);
                } else if (result.breedingRecordCreated) {
                  alert('✅ Reading saved and marked as mating!\n\nCheck the Breeding Records tab for details.');
                }
                
                // Refetch the cycle data to show new reading
                await refetch();
                // Also invalidate the heat cycles list query
                queryClient.invalidateQueries({ queryKey: ['heat-cycles'] });
                queryClient.invalidateQueries({ queryKey: ['breeding-records'] });
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
                setShowAddReadingForm(false);
              } else {
                const errorData = await response.json();
                console.error('Failed to add reading:', response.status, errorData);
                alert(`Failed to add reading: ${errorData.message || 'Unknown error'}`);
              }
            } catch (error) {
              console.error('Error adding reading:', error);
              alert(`Error adding reading: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
              setIsSubmitting(false);
            }
          }}
        />

        {/* Edit Reading Modal */}
        <EditReadingModal
          open={showEditReadingForm}
          onOpenChange={setShowEditReadingForm}
          reading={selectedReading}
          startDate={typeof cycle.startDate === 'string' ? cycle.startDate : cycle.startDate.toISOString().split('T')[0]}
          isSubmitting={updateReading.isPending}
          onSubmit={async (data) => {
            if (selectedReading) {
              await updateReading.mutateAsync({
                readingId: selectedReading.id,
                data: {
                  testDate: data.testDate,
                  progesteroneLevel: data.progesteroneLevel,
                  laboratory: data.laboratory,
                  notes: data.notes,
                },
              });
              await refetch();
              queryClient.invalidateQueries({ queryKey: ['heat-cycles'] });
              setShowEditReadingForm(false);
              setSelectedReading(null);
            }
          }}
        />

        {/* Add Breeding Record Modal */}
        <AddBreedingRecordModal
          open={showAddBreedingForm}
          onOpenChange={setShowAddBreedingForm}
          heatCycleId={id}
          startDate={typeof cycle.startDate === 'string' ? cycle.startDate : cycle.startDate.toISOString().split('T')[0]}
          studs={maleAnimals.map((animal: any) => ({
            id: animal.id,
            name: animal.name,
            registeredName: animal.registeredName,
            breed: animal.breed,
            profileImageUrl: animal.profileImageUrl,
            sex: animal.sex
          }))}
          isSubmitting={createBreedingRecord.isPending}
          onSubmit={async (data) => {
            await createBreedingRecord.mutateAsync({
              heatCycleId: id,
              breedingDate: data.breedingDate,
              breedingMethod: data.breedingMethod as any,
              studId: data.studId,
              studName: data.studName,
              studRegistration: data.studRegistration,
              semenQuality: data.semenQuality,
              motility: data.motility,
              concentration: data.concentration,
              notes: data.notes,
            });
            setShowAddBreedingForm(false);
          }}
        />
      </div>
    </div>
  );
}
