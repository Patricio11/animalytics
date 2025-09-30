"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";

interface ReportFilterBarProps {
  onFilterChange: (filters: ReportFilters) => void;
  availableAnimals?: { id: string; name: string }[];
  showAnimalFilter?: boolean;
  showTaskTypeFilter?: boolean;
  showEventTypeFilter?: boolean;
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  animalId?: string;
  taskType?: string;
  eventType?: string;
}

export function ReportFilterBar({
  onFilterChange,
  availableAnimals = [],
  showAnimalFilter = true,
  showTaskTypeFilter = false,
  showEventTypeFilter = false,
}: ReportFilterBarProps) {
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return format(date, 'yyyy-MM-dd');
  });

  const [endDate, setEndDate] = useState<string>(() => {
    return format(new Date(), 'yyyy-MM-dd');
  });

  const [animalId, setAnimalId] = useState<string>("all");
  const [taskType, setTaskType] = useState<string>("all");
  const [eventType, setEventType] = useState<string>("all");

  const handleApplyFilters = () => {
    const filters: ReportFilters = {
      startDate,
      endDate,
    };

    if (showAnimalFilter && animalId !== "all") {
      filters.animalId = animalId;
    }

    if (showTaskTypeFilter && taskType !== "all") {
      filters.taskType = taskType;
    }

    if (showEventTypeFilter && eventType !== "all") {
      filters.eventType = eventType;
    }

    onFilterChange(filters);
  };

  const handleReset = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    setStartDate(format(date, 'yyyy-MM-dd'));
    setEndDate(format(new Date(), 'yyyy-MM-dd'));
    setAnimalId("all");
    setTaskType("all");
    setEventType("all");

    onFilterChange({
      startDate: format(date, 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  return (
    <Card className="shadow-card bg-surface border-0">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-sm font-medium">
                Start Date
              </Label>
              <div className="relative">
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-background border-primary/20 focus:border-primary"
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-sm font-medium">
                End Date
              </Label>
              <div className="relative">
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-background border-primary/20 focus:border-primary"
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Animal Filter */}
            {showAnimalFilter && availableAnimals.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="animal-filter" className="text-sm font-medium">
                  Animal
                </Label>
                <Select value={animalId} onValueChange={setAnimalId}>
                  <SelectTrigger id="animal-filter" className="bg-background border-primary/20 focus:border-primary">
                    <SelectValue placeholder="All Animals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Animals</SelectItem>
                    {availableAnimals.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id}>
                        {animal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Task Type Filter */}
            {showTaskTypeFilter && (
              <div className="space-y-2">
                <Label htmlFor="task-type-filter" className="text-sm font-medium">
                  Task Type
                </Label>
                <Select value={taskType} onValueChange={setTaskType}>
                  <SelectTrigger id="task-type-filter" className="bg-background border-primary/20 focus:border-primary">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="feeding">Feeding</SelectItem>
                    <SelectItem value="exercise">Exercise</SelectItem>
                    <SelectItem value="grooming">Grooming</SelectItem>
                    <SelectItem value="weight">Weight</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Event Type Filter */}
            {showEventTypeFilter && (
              <div className="space-y-2">
                <Label htmlFor="event-type-filter" className="text-sm font-medium">
                  Event Type
                </Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger id="event-type-filter" className="bg-background border-primary/20 focus:border-primary">
                    <SelectValue placeholder="All Events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="vet-visit">Vet Visit</SelectItem>
                    <SelectItem value="worming">Worming</SelectItem>
                    <SelectItem value="heartworm">Heartworm</SelectItem>
                    <SelectItem value="flea-tick">Flea & Tick</SelectItem>
                    <SelectItem value="vaccination">Vaccination</SelectItem>
                    <SelectItem value="health-check">Health Check</SelectItem>
                    <SelectItem value="rugging">Rugging</SelectItem>
                    <SelectItem value="pest-management">Pest Management</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleApplyFilters}
              className="bg-gradient-brand hover:opacity-90 shadow-card"
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="hover:bg-primary/10 hover:border-primary shadow-card"
            >
              <X className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}