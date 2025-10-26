"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ReportFilterBar, ReportFilters } from "@/components/breeder/reports/ReportFilterBar";
import { ReportTable, ReportColumn, formatTableDate, renderStatusBadge } from "@/components/breeder/reports/ReportTable";
import { ReportExportButton } from "@/components/breeder/reports/ReportExportButton";
import { MatingHistoryComparison } from "@/components/breeder/reports/MatingHistoryComparison";
import { FileBarChart, Utensils, Dumbbell, Scissors, Sparkles, Baby, Heart, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { format, isWithinInterval, parseISO } from "date-fns";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("events");
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  // Fetch tasks data
  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        fromDate: filters.startDate,
        toDate: filters.endDate,
      });
      if (filters.animalId) params.append('animalId', filters.animalId);
      if (filters.taskType) params.append('taskType', filters.taskType);
      if (filters.eventType) params.append('eventType', filters.eventType);
      
      const response = await fetch(`/api/tasks?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const json = await response.json();
      return json.data || [];
    },
  });

  // Fetch animals for filtering
  const { data: animalsData } = useQuery({
    queryKey: ['animals'],
    queryFn: async () => {
      const response = await fetch('/api/animals');
      if (!response.ok) throw new Error('Failed to fetch animals');
      const json = await response.json();
      return json.data || [];
    },
  });

  // Fetch litters data
  const { data: littersData, isLoading: littersLoading } = useQuery({
    queryKey: ['litters', filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        fromDate: filters.startDate,
        toDate: filters.endDate,
      });
      if (filters.animalId) params.append('bitchId', filters.animalId);
      
      const response = await fetch(`/api/litters?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch litters');
      const json = await response.json();
      return json.data || [];
    },
  });

  // Fetch matings data
  const { data: matingsData, isLoading: matingsLoading } = useQuery({
    queryKey: ['matings', filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        fromDate: filters.startDate,
        toDate: filters.endDate,
      });
      if (filters.animalId) params.append('bitchId', filters.animalId);
      
      const response = await fetch(`/api/matings?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch matings');
      const json = await response.json();
      return json.data || [];
    },
  });

  const availableAnimals = animalsData?.map((a: any) => ({ id: a.id, name: a.name })) || [];

  // Process tasks data by type
  const eventsData = useMemo(() => {
    if (!tasksData) return [];
    return tasksData
      .filter((task: any) => task.type === 'event')
      .map((task: any) => ({
        id: task.id,
        date: task.dueDate,
        time: task.dueTime || task.taskData?.time,
        animalName: task.animal?.name || 'N/A',
        eventType: task.taskData?.eventType || 'other',
        title: task.title,
        status: task.status,
        completed: task.status === 'completed',
      }));
  }, [tasksData]);

  const feedingData = useMemo(() => {
    if (!tasksData) return [];
    return tasksData
      .filter((task: any) => task.type === 'feeding')
      .map((task: any) => ({
        id: task.id,
        date: task.dueDate,
        time: task.dueTime,
        animalName: task.animal?.name || 'N/A',
        foodType: task.taskData?.foodType || 'N/A',
        amount: task.taskData?.amount || 0,
        unit: task.taskData?.unit || 'g',
        status: task.status,
        completed: task.status === 'completed',
      }));
  }, [tasksData]);

  const exerciseData = useMemo(() => {
    if (!tasksData) return [];
    return tasksData
      .filter((task: any) => task.type === 'exercise')
      .map((task: any) => ({
        id: task.id,
        date: task.dueDate,
        animalName: task.animal?.name || 'N/A',
        exerciseType: task.taskData?.exerciseType || 'walk',
        duration: task.taskData?.duration || 0,
        status: task.status,
        completed: task.status === 'completed',
      }));
  }, [tasksData]);

  const groomingData = useMemo(() => {
    if (!tasksData) return [];
    return tasksData
      .filter((task: any) => task.type === 'grooming')
      .map((task: any) => ({
        id: task.id,
        date: task.dueDate,
        animalName: task.animal?.name || 'N/A',
        groomingType: task.taskData?.groomingType || 'bath',
        frequency: task.recurringPattern || 'once',
        status: task.status,
        completed: task.status === 'completed',
      }));
  }, [tasksData]);

  const cleaningData = useMemo(() => {
    if (!tasksData) return [];
    return tasksData
      .filter((task: any) => task.type === 'cleaning')
      .map((task: any) => ({
        id: task.id,
        date: task.dueDate,
        area: task.taskData?.area || 'general',
        cleaningType: task.taskData?.cleaningType || 'general',
        frequency: task.recurringPattern || 'once',
        status: task.status,
        completed: task.status === 'completed',
      }));
  }, [tasksData]);

  const puppiesData = useMemo(() => {
    if (!littersData) return [];
    return littersData
      .filter((litter: any) => litter.actualWhelpingDate) // Only filter out litters without whelping date
      .map((litter: any) => ({
        id: litter.id,
        whelpingDate: litter.actualWhelpingDate,
        sireName: litter.sire?.name || 'Unknown',
        damName: litter.bitch?.name || 'Unknown',
        damId: litter.bitchId,
        puppies: litter.puppies || [],
        status: litter.status || 'active',
      }));
  }, [littersData]);

  const matingHistoryData = useMemo(() => {
    if (!matingsData) return [];
    return matingsData.map((mating: any) => ({
      id: mating.id,
      matingDate: mating.matingDate,
      damId: mating.bitchId,
      damName: mating.bitch?.name || 'Unknown',
      sireId: mating.dogId,
      sireName: mating.dog?.name || 'Unknown',
      progesteroneReadings: mating.progesteroneReadings || [],
      whelpingDate: mating.whelpingDate,
      litterSize: mating.litterSize,
      success: mating.status === 'resulted_in_litter',
    }));
  }, [matingsData]);

  // Column definitions
  const eventsColumns: ReportColumn[] = [
    { key: 'date', label: 'Date', render: (val) => formatTableDate(val as string | Date) },
    { key: 'animalName', label: 'Animal' },
    { key: 'eventType', label: 'Event Type', render: (val) => <span className="capitalize">{(val as string).replace('_', ' ')}</span> },
    { key: 'title', label: 'Title' },
    { key: 'time', label: 'Time' },
    { key: 'status', label: 'Status', align: 'center', render: (val) => renderStatusBadge(val as string) },
  ];

  const feedingColumns: ReportColumn[] = [
    { key: 'date', label: 'Date', render: (val) => formatTableDate(val as string | Date) },
    { key: 'time', label: 'Time' },
    { key: 'animalName', label: 'Animal' },
    { key: 'foodType', label: 'Food Type' },
    { key: 'amount', label: 'Amount', render: (val, row) => `${val} ${(row as any).unit}` },
    { key: 'status', label: 'Status', align: 'center', render: (val) => renderStatusBadge(val as string) },
  ];

  const exerciseColumns: ReportColumn[] = [
    { key: 'date', label: 'Date', render: (val) => formatTableDate(val as string | Date) },
    { key: 'animalName', label: 'Animal' },
    { key: 'exerciseType', label: 'Type', render: (val) => <span className="capitalize">{val as string}</span> },
    { key: 'duration', label: 'Duration (min)', align: 'center' },
    { key: 'status', label: 'Status', align: 'center', render: (val) => renderStatusBadge(val as string) },
  ];

  const groomingColumns: ReportColumn[] = [
    { key: 'date', label: 'Date', render: (val) => formatTableDate(val as string | Date) },
    { key: 'animalName', label: 'Animal' },
    { key: 'groomingType', label: 'Type', render: (val) => <span className="capitalize">{val as string}</span> },
    { key: 'frequency', label: 'Frequency', render: (val) => <span className="capitalize">{val as string}</span> },
    { key: 'status', label: 'Status', align: 'center', render: (val) => renderStatusBadge(val as string) },
  ];

  const cleaningColumns: ReportColumn[] = [
    { key: 'date', label: 'Date', render: (val) => formatTableDate(val as string | Date) },
    { key: 'area', label: 'Area', render: (val) => <span className="capitalize">{(val as string).replace('_', ' ')}</span> },
    { key: 'cleaningType', label: 'Type', render: (val) => <span className="capitalize">{(val as string).replace('_', ' ')}</span> },
    { key: 'frequency', label: 'Frequency', render: (val) => <span className="capitalize">{val as string}</span> },
    { key: 'status', label: 'Status', align: 'center', render: (val) => renderStatusBadge(val as string) },
  ];

  const puppiesColumns: ReportColumn[] = [
    { key: 'whelpingDate', label: 'Whelping Date', render: (val) => val ? formatTableDate(val as string | Date) : 'N/A' },
    { key: 'sireName', label: 'Sire' },
    { key: 'damName', label: 'Dam' },
    { key: 'puppies', label: 'Litter Size', align: 'center', render: (val) => (val as Array<any>)?.length || 0 },
    { key: 'status', label: 'Status', align: 'center', render: (val, row) => {
      const puppies = (row as any).puppies as Array<{ status: string }> | undefined;
      const retained = puppies?.filter((p) => p.status === 'retained').length || 0;
      const sold = puppies?.filter((p) => p.status === 'sold').length || 0;
      return (
        <div className="flex gap-1 justify-center">
          {retained > 0 && <Badge variant="outline" className="text-xs">Retained: {retained}</Badge>}
          {sold > 0 && <Badge className="text-xs bg-chart-3 text-white">Sold: {sold}</Badge>}
        </div>
      );
    }},
  ];

  // Calculate summaries
  const feedingSummary = [
    { label: 'Total Feedings', value: feedingData.length },
    { label: 'Completed', value: feedingData.filter((f: any) => f.completed).length, color: 'text-chart-3' },
    { label: 'Pending', value: feedingData.filter((f: any) => !f.completed).length, color: 'text-chart-4' },
  ];

  const exerciseSummary = [
    { label: 'Total Sessions', value: exerciseData.length },
    { label: 'Total Minutes', value: exerciseData.reduce((sum: number, e: any) => sum + (e.duration || 0), 0) },
    { label: 'Completed', value: exerciseData.filter((e: any) => e.completed).length, color: 'text-chart-3' },
  ];

  const groomingSummary = [
    { label: 'Total Sessions', value: groomingData.length },
    { label: 'Completed', value: groomingData.filter((g: any) => g.completed).length, color: 'text-chart-3' },
    { label: 'Pending', value: groomingData.filter((g: any) => !g.completed).length, color: 'text-chart-4' },
  ];

  const cleaningSummary = [
    { label: 'Total Tasks', value: cleaningData.length },
    { label: 'Completed', value: cleaningData.filter((c: any) => c.completed).length, color: 'text-chart-3' },
    { label: 'Pending', value: cleaningData.filter((c: any) => !c.completed).length, color: 'text-chart-4' },
  ];

  const puppiesSummary = [
    { label: 'Total Litters', value: puppiesData.length },
    { label: 'Total Puppies', value: puppiesData.reduce((sum: number, l: any) => sum + (l.puppies?.length || 0), 0) },
    { label: 'Retained', value: puppiesData.reduce((sum: number, l: any) => sum + (l.puppies?.filter((p: any) => p.status === 'retained').length || 0), 0), color: 'text-chart-4' },
    { label: 'Sold', value: puppiesData.reduce((sum: number, l: any) => sum + (l.puppies?.filter((p: any) => p.status === 'sold').length || 0), 0), color: 'text-chart-3' },
  ];

  const tabConfig = [
    { value: 'events', label: 'Events', icon: CalendarIcon, count: eventsData.length },
    { value: 'feeding', label: 'Feeding', icon: Utensils, count: feedingData.length },
    { value: 'exercise', label: 'Exercise', icon: Dumbbell, count: exerciseData.length },
    { value: 'grooming', label: 'Grooming', icon: Scissors, count: groomingData.length },
    { value: 'cleaning', label: 'Cleaning', icon: Sparkles, count: cleaningData.length },
    { value: 'puppies', label: 'Puppies', icon: Baby, count: puppiesData.length },
    { value: 'mating', label: 'Mating History', icon: Heart, count: matingHistoryData.length },
  ];

  // Loading state
  if (tasksLoading || littersLoading || matingsLoading) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (tasksError) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load reports data. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Comprehensive reports and analytics for your breeding program</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <FileBarChart className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Filter Bar */}
        <ReportFilterBar
          onFilterChange={setFilters}
          availableAnimals={availableAnimals}
          showAnimalFilter={activeTab !== 'cleaning' && activeTab !== 'mating'}
          showEventTypeFilter={activeTab === 'events'}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <Card className="shadow-card bg-surface border-0">
            <CardContent className="p-2">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 bg-transparent gap-1">
                {tabConfig.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="data-[state=active]:bg-gradient-brand data-[state=active]:text-white data-[state=active]:shadow-card text-xs sm:text-sm"
                    >
                      <IconComponent className="w-4 h-4 mr-1" />
                      {tab.label}
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {tab.count}
                      </Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </CardContent>
          </Card>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex justify-end">
              <ReportExportButton
                data={eventsData as any[]}
                reportName="events-report"
                columns={eventsColumns}
              />
            </div>
            <ReportTable
              title="Events Report"
              columns={eventsColumns}
              data={eventsData as any[]}
              emptyMessage="No events found for the selected period"
            />
          </TabsContent>

          {/* Feeding Tab */}
          <TabsContent value="feeding" className="space-y-4">
            <div className="flex justify-end">
              <ReportExportButton
                data={feedingData as any[]}
                reportName="feeding-report"
                columns={feedingColumns}
              />
            </div>
            <ReportTable
              title="Feeding Report"
              columns={feedingColumns}
              data={feedingData as any[]}
              summary={feedingSummary}
              emptyMessage="No feeding records found for the selected period"
            />
          </TabsContent>

          {/* Exercise Tab */}
          <TabsContent value="exercise" className="space-y-4">
            <div className="flex justify-end">
              <ReportExportButton
                data={exerciseData as any[]}
                reportName="exercise-report"
                columns={exerciseColumns}
              />
            </div>
            <ReportTable
              title="Exercise Report"
              columns={exerciseColumns}
              data={exerciseData as any[]}
              summary={exerciseSummary}
              emptyMessage="No exercise records found for the selected period"
            />
          </TabsContent>

          {/* Grooming Tab */}
          <TabsContent value="grooming" className="space-y-4">
            <div className="flex justify-end">
              <ReportExportButton
                data={groomingData as any[]}
                reportName="grooming-report"
                columns={groomingColumns}
              />
            </div>
            <ReportTable
              title="Grooming Report"
              columns={groomingColumns}
              data={groomingData as any[]}
              summary={groomingSummary}
              emptyMessage="No grooming records found for the selected period"
            />
          </TabsContent>

          {/* Cleaning Tab */}
          <TabsContent value="cleaning" className="space-y-4">
            <div className="flex justify-end">
              <ReportExportButton
                data={cleaningData as any[]}
                reportName="cleaning-report"
                columns={cleaningColumns}
              />
            </div>
            <ReportTable
              title="Cleaning Report"
              columns={cleaningColumns}
              data={cleaningData as any[]}
              summary={cleaningSummary}
              emptyMessage="No cleaning records found for the selected period"
            />
          </TabsContent>

          {/* Puppies Tab */}
          <TabsContent value="puppies" className="space-y-4">
            <div className="flex justify-end">
              <ReportExportButton
                data={puppiesData as any[]}
                reportName="puppies-report"
                columns={puppiesColumns}
              />
            </div>
            <ReportTable
              title="Puppies Report"
              columns={puppiesColumns}
              data={puppiesData as any[]}
              summary={puppiesSummary}
              emptyMessage="No litters found for the selected period"
            />
          </TabsContent>

          {/* Mating History Tab */}
          <TabsContent value="mating" className="space-y-4">
            <MatingHistoryComparison
              matings={matingHistoryData}
              availableDams={availableAnimals.filter((a: any) => animalsData?.find((ma: any) => ma.id === a.id && ma.sex === 'female'))}
              availableSires={availableAnimals.filter((a: any) => animalsData?.find((ma: any) => ma.id === a.id && ma.sex === 'male'))}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
