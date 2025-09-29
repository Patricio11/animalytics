"use client";

import { TaskCard } from "@/components/breeder/TaskCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, Search, Filter, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function Tasks() {
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // todo: remove mock functionality
  const mockTasks = [
    {
      id: "1",
      title: "Schedule vet checkup for Bella",
      description: "Annual health examination including vaccinations and blood work",
      dueDate: new Date('2024-03-02'),
      priority: 'high' as const,
      category: 'health' as const,
      animalName: "Bella",
      completed: false,
    },
    {
      id: "2",
      title: "Update breeding records",
      description: "Record recent mating details and progesterone levels in system",
      dueDate: new Date('2024-02-28'),
      priority: 'medium' as const,
      category: 'breeding' as const,
      animalName: "Luna",
      completed: false,
    },
    {
      id: "3",
      title: "Grooming appointment",
      description: "Full grooming session before upcoming show",
      dueDate: new Date('2024-03-07'),
      priority: 'low' as const,
      category: 'grooming' as const,
      animalName: "Max",
      completed: true,
    },
    {
      id: "4",
      title: "Order premium food",
      description: "Restock premium kibble - running low",
      dueDate: new Date('2024-03-03'),
      priority: 'medium' as const,
      category: 'feeding' as const,
      animalName: "Duke",
      completed: false,
    },
    {
      id: "5",
      title: "Exercise training session",
      description: "Agility training with professional trainer",
      dueDate: new Date('2024-03-05'),
      priority: 'low' as const,
      category: 'exercise' as const,
      animalName: "Luna",
      completed: false,
    },
    {
      id: "6",
      title: "Whelping box preparation",
      description: "Set up and sanitize whelping area for expected litter",
      dueDate: new Date('2024-03-01'),
      priority: 'high' as const,
      category: 'breeding' as const,
      animalName: "Bella",
      completed: false,
    },
    {
      id: "7",
      title: "Monthly weight check",
      description: "Weigh and record body condition scores",
      dueDate: new Date('2024-02-27'),
      priority: 'medium' as const,
      category: 'health' as const,
      animalName: "Max",
      completed: false,
    },
    {
      id: "8",
      title: "Insurance renewal",
      description: "Renew pet insurance policies",
      dueDate: new Date('2024-03-14'),
      priority: 'high' as const,
      category: 'general' as const,
      completed: true,
    }
  ];

  const pendingTasks = mockTasks.filter(task => !task.completed);
  const completedTasks = mockTasks.filter(task => task.completed);
  const currentDate = new Date('2024-03-01'); // Fixed date for consistent hydration
  const overdueTasks = pendingTasks.filter(task => task.dueDate < currentDate);
  const dueSoonTasks = pendingTasks.filter(task =>
    task.dueDate >= currentDate && task.dueDate <= new Date('2024-03-04') // 3 days from current
  );

  const getFilteredTasks = (tasks: typeof mockTasks) => {
    return tasks.filter(task => {
      const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
      const matchesCategory = filterCategory === "all" || task.category === filterCategory;
      return matchesPriority && matchesCategory;
    });
  };

  const taskStats = [
    {
      label: "Total Tasks",
      value: mockTasks.length,
      icon: CheckSquare,
      color: "text-foreground"
    },
    {
      label: "Pending",
      value: pendingTasks.length,
      icon: Clock,
      color: "text-chart-4"
    },
    {
      label: "Overdue",
      value: overdueTasks.length,
      icon: AlertTriangle,
      color: "text-destructive"
    },
    {
      label: "Completed",
      value: completedTasks.length,
      icon: CheckCircle,
      color: "text-chart-3"
    }
  ];

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground">Manage your breeding program tasks and reminders</p>
          </div>
          <Button className="bg-gradient-brand hover:opacity-90 shadow-card" data-testid="button-add-task">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {taskStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="hover-elevate shadow-card bg-surface border-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className={`${stat.color} p-2 rounded-lg bg-gradient-subtle`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="shadow-card bg-surface border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-10 bg-background border-primary/20 focus:border-primary"
                  data-testid="input-search-tasks"
                />
              </div>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-full sm:w-[140px] bg-background border-primary/20 focus:border-primary" data-testid="select-filter-priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-[140px] bg-background border-primary/20 focus:border-primary" data-testid="select-filter-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="breeding">Breeding</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="feeding">Feeding</SelectItem>
                  <SelectItem value="exercise">Exercise</SelectItem>
                  <SelectItem value="grooming">Grooming</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="hover:bg-primary/10 hover:border-primary shadow-card" data-testid="button-filter-tasks">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-surface shadow-card">
          <TabsTrigger value="pending" data-testid="tab-pending" className="text-xs sm:text-sm">
            Pending
            <Badge variant="secondary" className="ml-1 text-xs">
              {getFilteredTasks(pendingTasks).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="overdue" data-testid="tab-overdue" className="text-xs sm:text-sm">
            Overdue
            <Badge variant="destructive" className="ml-1 text-xs">
              {getFilteredTasks(overdueTasks).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="due-soon" data-testid="tab-due-soon" className="text-xs sm:text-sm">
            Due Soon
            <Badge className="ml-1 text-xs bg-chart-4 text-white">
              {getFilteredTasks(dueSoonTasks).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed" className="text-xs sm:text-sm">
            Completed
            <Badge className="ml-1 text-xs bg-chart-3 text-white">
              {getFilteredTasks(completedTasks).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {getFilteredTasks(pendingTasks).map((task) => (
            <TaskCard key={task.id} {...task} />
          ))}
          {getFilteredTasks(pendingTasks).length === 0 && (
            <div className="text-center py-12">
              <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No pending tasks</h3>
              <p className="text-muted-foreground">Great job! All tasks are completed.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {getFilteredTasks(overdueTasks).map((task) => (
            <TaskCard key={task.id} {...task} />
          ))}
          {getFilteredTasks(overdueTasks).length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-chart-3 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No overdue tasks</h3>
              <p className="text-muted-foreground">You're staying on top of your schedule!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="due-soon" className="space-y-4">
          {getFilteredTasks(dueSoonTasks).map((task) => (
            <TaskCard key={task.id} {...task} />
          ))}
          {getFilteredTasks(dueSoonTasks).length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No tasks due soon</h3>
              <p className="text-muted-foreground">You have some breathing room.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {getFilteredTasks(completedTasks).map((task) => (
            <TaskCard key={task.id} {...task} />
          ))}
          {getFilteredTasks(completedTasks).length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No completed tasks</h3>
              <p className="text-muted-foreground">Completed tasks will appear here.</p>
            </div>
          )}
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}