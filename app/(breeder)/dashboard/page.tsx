"use client";

import { useState } from "react";
import { StatsCard } from "@/components/breeder/StatsCard";
import { AnimalCard } from "@/components/breeder/AnimalCard";
import { CalculatorCard } from "@/components/breeder/CalculatorCard";
import { ActivityCard } from "@/components/breeder/ActivityCard";
import { TaskCard } from "@/components/breeder/TaskCard";
import { AddAnimalDialog } from "@/components/breeder/animals/AddAnimalDialog";
import { TaskDialog } from "@/components/breeder/tasks/TaskDialog";
import { TaskViewModal } from "@/components/breeder/tasks/TaskViewModal";
import { ProgesteroneTasksWidget } from "@/components/breeder/dashboard/ProgesteroneTasksWidget";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Calendar, Trophy, DollarSign, Plus, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useDashboardStats } from "@/lib/api/queries/dashboard";
import { useCreateTask, useUpdateTask } from "@/lib/api/queries/tasks";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APIAnimal, APITask } from "@/lib/api/types";

export default function Dashboard() {
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskView, setShowTaskView] = useState(false);
  const [showTaskEdit, setShowTaskEdit] = useState(false);

  // Fetch dashboard stats from API
  const { data: stats, isLoading, isError, refetch } = useDashboardStats();
  
  // Task mutations
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();

  // Transform stats for display
  const dashboardStats = stats ? [
    {
      title: "Total Animals",
      value: stats.totalAnimals.total,
      description: `${stats.totalAnimals.female} female, ${stats.totalAnimals.male} male`,
      icon: <Heart className="w-4 h-4" />,
    },
    {
      title: "Active Matings",
      value: stats.activeMatingsCount,
      description: "Currently monitored",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasksCount,
      description: "Require attention",
      icon: <Trophy className="w-4 h-4" />,
    },
    {
      title: "Recent Updates",
      value: stats.recentAnimals.length,
      description: "Last 30 days",
      icon: <DollarSign className="w-4 h-4" />,
    }
  ] : [];

  // Transform recent animals - limit to 6
  const recentAnimals = stats?.recentAnimals.slice(0, 6).map((animal: APIAnimal) => {
    // Get profile photo from animal_photos table (category='profile') or fallback
    const profilePhoto = animal.photos?.find((p: any) => p.category === 'profile');
    const imageUrl = profilePhoto?.fileUrl || 
                     animal.photos?.[0]?.fileUrl || 
                     undefined; // No placeholder image
    
    // Show "You" if the owner/breeder is the current user
    const currentUserId = stats?.currentUserId;
    const ownerName = animal.owner?.id === currentUserId ? "You" : animal.owner?.name;
    const breederName = animal.breeder?.id === currentUserId ? "You" : animal.breeder?.name;
    
    return {
      id: animal.id,
      name: animal.name,
      breed: animal.breed?.name || "Unknown",
      gender: animal.sex as "male" | "female",
      dateOfBirth: animal.dateOfBirth ? new Date(animal.dateOfBirth) : new Date(),
      imageUrl,
      status: animal.isBreedingActive ? ("breeding" as const) : ("available" as const),
      ownerName,
      breederName,
    };
  }) || [];

  // Helper to check if task is progesterone test
  const isProgesteroneTask = (task: any) => {
    try {
      const taskData = typeof task.taskData === 'string' 
        ? JSON.parse(task.taskData) 
        : task.taskData;
      return taskData?.eventType === 'progesterone_test';
    } catch {
      return false;
    }
  };

  // Transform upcoming tasks - exclude progesterone tasks (they have their own widget), limit to 4
  const upcomingTasks = stats?.upcomingTasks
    .filter((task: APITask) => !isProgesteroneTask(task))
    .slice(0, 4)
    .map((task: APITask) => ({
      ...task, // Keep all original task data
      id: task.id,
      title: task.title || `${task.type} task`,
      description: task.notes || "",
      dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
      date: task.dueDate || new Date().toISOString(),
      priority: task.priority as "high" | "medium" | "low",
      category: task.type as "health" | "breeding" | "feeding",
      animalName: task.animal?.name || "N/A",
      animalId: task.animalId,
      completed: !!task.completedAt,
      notes: task.notes || "",
      type: task.type, // Ensure type is included
    })) || [];

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your animals.</p>
          </div>
          <Button
            className="bg-gradient-brand hover:opacity-90 shadow-card w-full sm:w-auto"
            data-testid="button-add-animal"
            onClick={() => setShowAddAnimal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Animal
          </Button>
        </div>

      {/* Loading State */}
      {isLoading && (
        <>
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Recent Animals Skeleton */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <Skeleton className="h-7 w-40" />
                  <Skeleton className="h-9 w-24" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="shadow-card">
                      <CardContent className="p-0">
                        <Skeleton className="aspect-square w-full rounded-t-lg" />
                        <div className="p-4 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Actions Skeleton */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-9 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <Card key={i} className="shadow-card">
                      <CardContent className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Tasks Skeleton */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-7 w-36" />
                <Skeleton className="h-9 w-24" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="shadow-card">
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* Dashboard Content */}
      {!isLoading && !isError && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardStats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Recent Animals */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Recent Animals</h2>
                  <Link href="/animals">
                    <Button variant="ghost" size="sm" data-testid="link-view-all-animals">
                      View all
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
                {recentAnimals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentAnimals.map((animal: any) => (
                      <AnimalCard key={animal.id} {...animal} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-surface shadow-card rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">No animals yet. Add your first animal to get started!</p>
                  </div>
                )}
              </section>

              {/* Recent Mating */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
                  <Link href="/calculators">
                    <Button variant="ghost" size="sm" data-testid="link-view-calculators">
                      View calculators
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Link href="/calculators/mating">
                    <CalculatorCard
                      title="Mating Calculator"
                      description="Calculate progesterone-based breeding recommendations"
                    />
                  </Link>
                  <Link href="/calculators/conception-rating">
                    <CalculatorCard
                      title="Conception Rating"
                      description="Comprehensive 9-step conception assessment"
                    />
                  </Link>
                </div>
              </section>
            </div>

            {/* Right Column - Tasks & Progesterone */}
            <div className="space-y-6">
              {/* Progesterone Tasks Widget */}
              <ProgesteroneTasksWidget />

              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Upcoming Tasks</h2>
                  <Link href="/tasks">
                    <Button variant="ghost" size="sm" data-testid="link-view-tasks">
                      View all
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
                {upcomingTasks.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingTasks.map((task: any) => (
                      <TaskCard 
                        key={task.id} 
                        {...task}
                        onView={() => {
                          setSelectedTask(task);
                          setShowTaskView(true);
                        }}
                        onEdit={() => {
                          setSelectedTask(task);
                          setShowTaskEdit(true);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-surface shadow-card rounded-lg p-8 text-center space-y-4">
                    <p className="text-muted-foreground mb-4">No upcoming tasks</p>
                    <Button
                      onClick={() => setShowCreateTask(true)}
                      className="bg-gradient-brand hover:opacity-90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Task
                    </Button>
                  </div>
                )}
              </section>
            </div>
          </div>
        </>
      )}

      {/* Add Animal Dialog */}
      <AddAnimalDialog open={showAddAnimal} onOpenChange={setShowAddAnimal} />
      
      {/* Create Task Dialog */}
      <TaskDialog 
        open={showCreateTask} 
        onOpenChange={setShowCreateTask}
        onSave={async (newTask: any) => {
          try {
            // Transform task data to match API schema (same as tasks page)
            const taskData: any = {};
            let title = '';
            
            // Build title and taskData based on task type
            switch (newTask.type) {
              case 'feeding':
                title = `Feeding - ${newTask.foodType}`;
                taskData.foodType = newTask.foodType;
                taskData.amount = newTask.amount;
                taskData.unit = newTask.unit;
                taskData.time = newTask.time;
                break;
              case 'exercise':
                title = `Exercise - ${newTask.exerciseType}`;
                taskData.exerciseType = newTask.exerciseType;
                taskData.duration = newTask.duration;
                break;
              case 'grooming':
                title = `Grooming - ${newTask.groomingType}`;
                taskData.groomingType = newTask.groomingType;
                taskData.frequency = newTask.frequency;
                break;
              case 'weight':
                title = 'Weight Check';
                taskData.weight = newTask.weight;
                taskData.weightUnit = 'kg';
                break;
              case 'cleaning':
                title = `Cleaning - ${newTask.area}`;
                taskData.area = newTask.area;
                taskData.cleaningType = newTask.cleaningType;
                taskData.frequency = newTask.frequency;
                break;
              case 'event':
                title = newTask.title || 'Event';
                taskData.eventType = newTask.eventType;
                taskData.time = newTask.time;
                break;
            }
            
            const apiTask = {
              type: newTask.type,
              title,
              description: newTask.notes,
              dueDate: newTask.date,
              dueTime: newTask.time,
              animalId: newTask.animalId,
              notes: newTask.notes,
              taskData,
              isRecurring: newTask.recurring,
            };
            
            await createTaskMutation.mutateAsync(apiTask);
            setShowCreateTask(false);
            refetch(); // Refresh dashboard data
          } catch (error) {
            console.error('Failed to create task:', error);
          }
        }}
        isLoading={createTaskMutation.isPending}
      />
      
      {/* Edit Task Dialog */}
      <TaskDialog 
        open={showTaskEdit} 
        onOpenChange={setShowTaskEdit}
        existingTask={selectedTask}
        mode="edit"
        onSave={async (newTask: any) => {
          try {
            // Transform task data to match API schema (same as tasks page)
            const taskData: any = {};
            let title = '';
            
            // Build title and taskData based on task type
            switch (newTask.type) {
              case 'feeding':
                title = `Feeding - ${newTask.foodType}`;
                taskData.foodType = newTask.foodType;
                taskData.amount = newTask.amount;
                taskData.unit = newTask.unit;
                taskData.time = newTask.time;
                break;
              case 'exercise':
                title = `Exercise - ${newTask.exerciseType}`;
                taskData.exerciseType = newTask.exerciseType;
                taskData.duration = newTask.duration;
                break;
              case 'grooming':
                title = `Grooming - ${newTask.groomingType}`;
                taskData.groomingType = newTask.groomingType;
                taskData.frequency = newTask.frequency;
                break;
              case 'weight':
                title = 'Weight Check';
                taskData.weight = newTask.weight;
                taskData.weightUnit = 'kg';
                break;
              case 'cleaning':
                title = `Cleaning - ${newTask.area}`;
                taskData.area = newTask.area;
                taskData.cleaningType = newTask.cleaningType;
                taskData.frequency = newTask.frequency;
                break;
              case 'event':
                title = newTask.title || 'Event';
                taskData.eventType = newTask.eventType;
                taskData.time = newTask.time;
                break;
            }
            
            const apiTask = {
              type: newTask.type,
              title,
              description: newTask.notes,
              dueDate: newTask.date,
              dueTime: newTask.time,
              animalId: newTask.animalId,
              notes: newTask.notes,
              taskData,
              isRecurring: newTask.recurring,
            };
            
            await updateTaskMutation.mutateAsync({
              id: selectedTask.id,
              data: apiTask,
            });
            setShowTaskEdit(false);
            refetch(); // Refresh dashboard data
          } catch (error) {
            console.error('Failed to update task:', error);
          }
        }}
        isLoading={updateTaskMutation.isPending}
      />
      
      {/* View Task Modal */}
      <TaskViewModal
        open={showTaskView}
        onOpenChange={setShowTaskView}
        task={selectedTask}
        onEdit={(task) => {
          setShowTaskView(false);
          setSelectedTask(task);
          setShowTaskEdit(true);
        }}
      />
    </div>
    </div>
  );
}