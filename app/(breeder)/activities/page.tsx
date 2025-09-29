"use client";

import { ActivityCard } from "@/components/breeder/ActivityCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, Plus, Download, Search, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function Activities() {
  const [selectedAnimal, setSelectedAnimal] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // todo: remove mock functionality
  const mockActivities = [
    {
      id: "1",
      type: 'feeding' as const,
      animalName: "Bella",
      title: "Morning Feeding",
      description: "Regular feeding schedule",
      date: new Date('2024-02-20'),
      data: { food: "Premium kibble", amount: "2 cups", cost: "$12" }
    },
    {
      id: "2",
      type: 'exercise' as const,
      animalName: "Max",
      title: "Daily Walk",
      description: "Regular exercise routine",
      date: new Date('2024-02-19'),
      data: { duration: "45 mins", distance: "2.5 km", calories: "180" }
    },
    {
      id: "3",
      type: 'grooming' as const,
      animalName: "Luna",
      title: "Full Grooming",
      description: "Professional grooming session",
      date: new Date('2024-02-18'),
      data: { services: "Bath, cut, nails", cost: "$85", duration: "2 hours" }
    },
    {
      id: "4",
      type: 'events' as const,
      animalName: "Duke",
      title: "Vet Checkup",
      description: "Annual health examination",
      date: new Date('2024-02-17'),
      data: { vet: "Dr. Smith", weight: "32 kg", status: "Healthy" }
    },
    {
      id: "5",
      type: 'puppies' as const,
      animalName: "Bella",
      title: "Litter Birth",
      description: "New litter of puppies born",
      date: new Date('2024-02-15'),
      data: { count: "6 puppies", "birth weight": "avg 350g", status: "All healthy" }
    },
    {
      id: "6",
      type: 'cleaning' as const,
      animalName: "Max",
      title: "Kennel Cleaning",
      description: "Deep cleaning of living area",
      date: new Date('2024-02-14'),
      data: { duration: "30 mins", products: "Disinfectant", condition: "Excellent" }
    }
  ];

  const mockMatingHistory = [
    {
      id: "1",
      male: "Max",
      female: "Bella",
      date: "2024-01-15",
      progesteroneLevel: 8.5,
      conceptionRating: 85.2,
      result: "Successful",
      puppies: 6
    },
    {
      id: "2",
      male: "Duke",
      female: "Luna",
      date: "2024-01-10",
      progesteroneLevel: 6.2,
      conceptionRating: 67.8,
      result: "Successful",
      puppies: 4
    },
    {
      id: "3",
      male: "Max",
      female: "Grace",
      date: "2023-12-20",
      progesteroneLevel: 5.1,
      conceptionRating: 45.3,
      result: "Unsuccessful",
      puppies: 0
    }
  ];

  const categoryTabs = [
    { value: "all", label: "All Activities", count: mockActivities.length },
    { value: "events", label: "Events", count: mockActivities.filter(a => a.type === 'events').length },
    { value: "feeding", label: "Feeding", count: mockActivities.filter(a => a.type === 'feeding').length },
    { value: "exercise", label: "Exercise", count: mockActivities.filter(a => a.type === 'exercise').length },
    { value: "grooming", label: "Grooming", count: mockActivities.filter(a => a.type === 'grooming').length },
    { value: "cleaning", label: "Cleaning", count: mockActivities.filter(a => a.type === 'cleaning').length },
    { value: "puppies", label: "Puppies", count: mockActivities.filter(a => a.type === 'puppies').length },
  ];

  const filteredActivities = mockActivities.filter(activity => {
    const matchesAnimal = selectedAnimal === "all" || activity.animalName.toLowerCase().includes(selectedAnimal.toLowerCase());
    const matchesCategory = selectedCategory === "all" || activity.type === selectedCategory;
    return matchesAnimal && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Activity Reports</h1>
            <p className="text-muted-foreground">Track and analyze your animal care activities</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="hover:bg-primary/10 hover:border-primary shadow-card" data-testid="button-export-reports">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-gradient-brand hover:opacity-90 shadow-card" data-testid="button-new-activity">
              <Plus className="w-4 h-4 mr-2" />
              Log Activity
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-card bg-surface border-0">
          <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                className="pl-10 bg-background border-primary/20 focus:border-primary"
                data-testid="input-search-activities"
              />
            </div>
            <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background border-primary/20 focus:border-primary" data-testid="select-filter-animal">
                <SelectValue placeholder="All Animals" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Animals</SelectItem>
                <SelectItem value="bella">Bella</SelectItem>
                <SelectItem value="max">Max</SelectItem>
                <SelectItem value="luna">Luna</SelectItem>
                <SelectItem value="duke">Duke</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full sm:w-[160px] bg-background border-primary/20 focus:border-primary" data-testid="select-date-range">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="hover:bg-primary/10 hover:border-primary shadow-card" data-testid="button-advanced-filter">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="activities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activities" data-testid="tab-activities">Activity Logs</TabsTrigger>
          <TabsTrigger value="mating" data-testid="tab-mating-history">Mating History</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-6">
          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-1">
              {categoryTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {tab.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredActivities.map((activity) => (
                  <ActivityCard key={activity.id} {...activity} />
                ))}
              </div>

              {filteredActivities.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No activities found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or add new activities.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="mating" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Mating History Report
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Historical progesterone readings and conception ratings
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Male</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Female</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Progesterone</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Rating</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Result</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Puppies</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockMatingHistory.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2 text-sm text-foreground">{record.date}</td>
                        <td className="py-3 px-2 text-sm text-foreground">{record.male}</td>
                        <td className="py-3 px-2 text-sm text-foreground">{record.female}</td>
                        <td className="py-3 px-2 text-sm text-foreground">{record.progesteroneLevel}</td>
                        <td className="py-3 px-2">
                          <Badge
                            variant="outline"
                            className={record.conceptionRating > 70 ? 'text-chart-3' : record.conceptionRating > 50 ? 'text-chart-4' : 'text-destructive'}
                          >
                            {record.conceptionRating}%
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <Badge
                            variant={record.result === 'Successful' ? 'default' : 'secondary'}
                            className={record.result === 'Successful' ? 'bg-chart-3 text-white' : ''}
                          >
                            {record.result}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-sm text-foreground">{record.puppies}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}