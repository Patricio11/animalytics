"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportFilterBar, ReportFilters } from "@/components/breeder/reports/ReportFilterBar";
import { ReportTable, ReportColumn, formatTableDate, renderStatusBadge } from "@/components/breeder/reports/ReportTable";
import { ReportExportButton } from "@/components/breeder/reports/ReportExportButton";
import { MatingHistoryComparison } from "@/components/breeder/reports/MatingHistoryComparison";
import { mockTasks } from "@/lib/mock-data/tasks";
import { mockAnimals } from "@/data/mockData";
import { mockAnimalProfileDetails } from "@/lib/mock-data/animal-profile-details";
import { FileBarChart, Utensils, Dumbbell, Scissors, Sparkles, Baby, Heart, Calendar as CalendarIcon } from "lucide-react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("events");
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  // Available animals for filtering
  const availableAnimals = mockAnimals.map(a => ({ id: a.id, name: a.name }));

  // Filter tasks by date range
  const filterByDateRange = <T,>(items: T[], dateField: string = 'date'): T[] => {
    return items.filter(item => {
      const itemDate = parseISO((item as Record<string, unknown>)[dateField] as string);
      return isWithinInterval(itemDate, {
        start: parseISO(filters.startDate),
        end: parseISO(filters.endDate),
      });
    });
  };

  // Events Report Data
  const eventsData = useMemo(() => {
    const filteredByType = mockTasks.filter(task => task.type === 'event');
    const filteredByDate = filterByDateRange(filteredByType);

    let events = filteredByDate;
    if (filters.animalId) {
      events = events.filter(task => 'animalId' in task && task.animalId === filters.animalId);
    }

    if (filters.eventType) {
      events = events.filter(task => task.type === 'event' && task.eventType === filters.eventType);
    }

    return events as unknown as Record<string, unknown>[];
  }, [filters, filterByDateRange]);

  // Feeding Report Data
  const feedingData = useMemo(() => {
    let feeding = mockTasks.filter(task => task.type === 'feeding');
    feeding = filterByDateRange(feeding);

    if (filters.animalId) {
      feeding = feeding.filter(task => 'animalId' in task && task.animalId === filters.animalId);
    }

    return feeding as unknown as Record<string, unknown>[];
  }, [filters, filterByDateRange]);

  // Exercise Report Data
  const exerciseData = useMemo(() => {
    let exercise = mockTasks.filter(task => task.type === 'exercise');
    exercise = filterByDateRange(exercise);

    if (filters.animalId) {
      exercise = exercise.filter(task => 'animalId' in task && task.animalId === filters.animalId);
    }

    return exercise as unknown as Record<string, unknown>[];
  }, [filters, filterByDateRange]);

  // Grooming Report Data
  const groomingData = useMemo(() => {
    let grooming = mockTasks.filter(task => task.type === 'grooming');
    grooming = filterByDateRange(grooming);

    if (filters.animalId) {
      grooming = grooming.filter(task => 'animalId' in task && task.animalId === filters.animalId);
    }

    return grooming as unknown as Record<string, unknown>[];
  }, [filters, filterByDateRange]);

  // Cleaning Report Data
  const cleaningData = useMemo(() => {
    let cleaning = mockTasks.filter(task => task.type === 'cleaning');
    cleaning = filterByDateRange(cleaning);

    return cleaning as unknown as Record<string, unknown>[];
  }, [filters, filterByDateRange]);

  // Puppies Report Data
  const puppiesData = useMemo(() => {
    const allLitters = Object.values(mockAnimalProfileDetails)
      .flatMap(details => details.litters || []);

    return allLitters.filter(litter => {
      if (!litter.whelpingDate) return false;

      const whelpingDate = parseISO(litter.whelpingDate);
      return isWithinInterval(whelpingDate, {
        start: parseISO(filters.startDate),
        end: parseISO(filters.endDate),
      });
    }) as unknown as Record<string, unknown>[];
  }, [filters]);

  // Mating History Data
  const matingHistoryData = useMemo(() => {
    const allMatings = Object.entries(mockAnimalProfileDetails)
      .flatMap(([animalId, details]) => {
        return (details.litters || []).map(litter => ({
          id: litter.id,
          matingDate: litter.matingDate,
          damId: animalId,
          damName: mockAnimals.find(a => a.id === animalId)?.name || 'Unknown',
          sireId: litter.sireId,
          sireName: litter.sireName,
          progesteroneReadings: details.seasons?.[0]?.progesteroneReadings,
          whelpingDate: litter.whelpingDate,
          litterSize: litter.puppies?.length,
          success: !!litter.whelpingDate,
        }));
      });

    return allMatings.filter(mating => {
      const matingDate = parseISO(mating.matingDate);
      return isWithinInterval(matingDate, {
        start: parseISO(filters.startDate),
        end: parseISO(filters.endDate),
      });
    });
  }, [filters]);

  // Column definitions for each report type
  const eventsColumns: ReportColumn[] = [
    { key: 'date', label: 'Date', render: (val) => formatTableDate(val as string | Date) },
    { key: 'animalName', label: 'Animal' },
    { key: 'eventType', label: 'Event Type', render: (val) => <span className="capitalize">{(val as string).replace('-', ' ')}</span> },
    { key: 'title', label: 'Title' },
    { key: 'time', label: 'Time' },
    { key: 'completed', label: 'Status', align: 'center', render: (val) => renderStatusBadge(val ? 'completed' : 'pending') },
  ];

  const feedingColumns: ReportColumn[] = [
    { key: 'date', label: 'Date', render: (val) => formatTableDate(val as string | Date) },
    { key: 'time', label: 'Time' },
    { key: 'animalName', label: 'Animal' },
    { key: 'foodType', label: 'Food Type' },
    { key: 'amount', label: 'Amount', render: (val, row) => `${val} ${(row as Record<string, unknown>).unit}` },
    { key: 'completed', label: 'Status', align: 'center', render: (val) => renderStatusBadge(val ? 'completed' : 'pending') },
  ];

  const exerciseColumns: ReportColumn[] = [
    { key: 'date', label: 'Date', render: (val) => formatTableDate(val as string | Date) },
    { key: 'animalName', label: 'Animal' },
    { key: 'exerciseType', label: 'Type', render: (val) => <span className="capitalize">{val as string}</span> },
    { key: 'duration', label: 'Duration (min)', align: 'center' },
    { key: 'completed', label: 'Status', align: 'center', render: (val) => renderStatusBadge(val ? 'completed' : 'pending') },
  ];

  const groomingColumns: ReportColumn[] = [
    { key: 'date', label: 'Date', render: (val) => formatTableDate(val as string | Date) },
    { key: 'animalName', label: 'Animal' },
    { key: 'groomingType', label: 'Type', render: (val) => <span className="capitalize">{val as string}</span> },
    { key: 'frequency', label: 'Frequency', render: (val) => <span className="capitalize">{val as string}</span> },
    { key: 'completed', label: 'Status', align: 'center', render: (val) => renderStatusBadge(val ? 'completed' : 'pending') },
  ];

  const cleaningColumns: ReportColumn[] = [
    { key: 'date', label: 'Date', render: (val) => formatTableDate(val as string | Date) },
    { key: 'area', label: 'Area', render: (val) => <span className="capitalize">{(val as string).replace('-', ' ')}</span> },
    { key: 'cleaningType', label: 'Type', render: (val) => <span className="capitalize">{(val as string).replace('-', ' ')}</span> },
    { key: 'frequency', label: 'Frequency', render: (val) => <span className="capitalize">{val as string}</span> },
    { key: 'completed', label: 'Status', align: 'center', render: (val) => renderStatusBadge(val ? 'completed' : 'pending') },
  ];

  const puppiesColumns: ReportColumn[] = [
    { key: 'whelpingDate', label: 'Whelping Date', render: (val) => val ? formatTableDate(val as string | Date) : 'N/A' },
    { key: 'sireName', label: 'Sire' },
    { key: 'damName', label: 'Dam', render: (val, row) => mockAnimals.find(a => a.id === (row as Record<string, unknown>).damId)?.name || 'Unknown' },
    { key: 'puppies', label: 'Litter Size', align: 'center', render: (val) => (val as Array<unknown>)?.length || 0 },
    { key: 'status', label: 'Status', align: 'center', render: (val, row) => {
      const puppies = (row as Record<string, unknown>).puppies as Array<{ status: string }> | undefined;
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
    { label: 'Completed', value: feedingData.filter(f => f.completed).length, color: 'text-chart-3' },
    { label: 'Pending', value: feedingData.filter(f => !f.completed).length, color: 'text-chart-4' },
  ];

  const exerciseSummary = [
    { label: 'Total Sessions', value: exerciseData.length },
    { label: 'Total Minutes', value: exerciseData.reduce((sum, e) => sum + ('duration' in e ? e.duration : 0), 0) },
    { label: 'Completed', value: exerciseData.filter(e => e.completed).length, color: 'text-chart-3' },
  ];

  const groomingSummary = [
    { label: 'Total Sessions', value: groomingData.length },
    { label: 'Completed', value: groomingData.filter(g => g.completed).length, color: 'text-chart-3' },
    { label: 'Pending', value: groomingData.filter(g => !g.completed).length, color: 'text-chart-4' },
  ];

  const cleaningSummary = [
    { label: 'Total Tasks', value: cleaningData.length },
    { label: 'Completed', value: cleaningData.filter(c => c.completed).length, color: 'text-chart-3' },
    { label: 'Pending', value: cleaningData.filter(c => !c.completed).length, color: 'text-chart-4' },
  ];

  const puppiesSummary = [
    { label: 'Total Litters', value: puppiesData.length },
    { label: 'Total Puppies', value: puppiesData.reduce((sum, l) => sum + (l.puppies?.length || 0), 0) },
    { label: 'Retained', value: puppiesData.reduce((sum, l) => sum + (l.puppies?.filter(p => p.status === 'retained').length || 0), 0), color: 'text-chart-4' },
    { label: 'Sold', value: puppiesData.reduce((sum, l) => sum + (l.puppies?.filter(p => p.status === 'sold').length || 0), 0), color: 'text-chart-3' },
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
                data={eventsData as Record<string, unknown>[]}
                reportName="events-report"
                columns={eventsColumns}
              />
            </div>
            <ReportTable
              title="Events Report"
              columns={eventsColumns}
              data={eventsData as Record<string, unknown>[]}
              emptyMessage="No events found for the selected period"
            />
          </TabsContent>

          {/* Feeding Tab */}
          <TabsContent value="feeding" className="space-y-4">
            <div className="flex justify-end">
              <ReportExportButton
                data={feedingData as Record<string, unknown>[]}
                reportName="feeding-report"
                columns={feedingColumns}
              />
            </div>
            <ReportTable
              title="Feeding Report"
              columns={feedingColumns}
              data={feedingData as Record<string, unknown>[]}
              summary={feedingSummary}
              emptyMessage="No feeding records found for the selected period"
            />
          </TabsContent>

          {/* Exercise Tab */}
          <TabsContent value="exercise" className="space-y-4">
            <div className="flex justify-end">
              <ReportExportButton
                data={exerciseData as Record<string, unknown>[]}
                reportName="exercise-report"
                columns={exerciseColumns}
              />
            </div>
            <ReportTable
              title="Exercise Report"
              columns={exerciseColumns}
              data={exerciseData as Record<string, unknown>[]}
              summary={exerciseSummary}
              emptyMessage="No exercise records found for the selected period"
            />
          </TabsContent>

          {/* Grooming Tab */}
          <TabsContent value="grooming" className="space-y-4">
            <div className="flex justify-end">
              <ReportExportButton
                data={groomingData as Record<string, unknown>[]}
                reportName="grooming-report"
                columns={groomingColumns}
              />
            </div>
            <ReportTable
              title="Grooming Report"
              columns={groomingColumns}
              data={groomingData as Record<string, unknown>[]}
              summary={groomingSummary}
              emptyMessage="No grooming records found for the selected period"
            />
          </TabsContent>

          {/* Cleaning Tab */}
          <TabsContent value="cleaning" className="space-y-4">
            <div className="flex justify-end">
              <ReportExportButton
                data={cleaningData as Record<string, unknown>[]}
                reportName="cleaning-report"
                columns={cleaningColumns}
              />
            </div>
            <ReportTable
              title="Cleaning Report"
              columns={cleaningColumns}
              data={cleaningData as Record<string, unknown>[]}
              summary={cleaningSummary}
              emptyMessage="No cleaning records found for the selected period"
            />
          </TabsContent>

          {/* Puppies Tab */}
          <TabsContent value="puppies" className="space-y-4">
            <div className="flex justify-end">
              <ReportExportButton
                data={puppiesData as Record<string, unknown>[]}
                reportName="puppies-report"
                columns={puppiesColumns}
              />
            </div>
            <ReportTable
              title="Puppies Report"
              columns={puppiesColumns}
              data={puppiesData as Record<string, unknown>[]}
              summary={puppiesSummary}
              emptyMessage="No litters found for the selected period"
            />
          </TabsContent>

          {/* Mating History Tab */}
          <TabsContent value="mating" className="space-y-4">
            <MatingHistoryComparison
              matings={matingHistoryData}
              availableDams={availableAnimals.filter(a => mockAnimals.find(ma => ma.id === a.id)?.sex === 'female')}
              availableSires={availableAnimals.filter(a => mockAnimals.find(ma => ma.id === a.id)?.sex === 'male')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}