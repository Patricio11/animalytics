"use client";

import { useState } from "react";
import { StatsCard } from "@/components/breeder/StatsCard";
import { AnimalCard } from "@/components/breeder/AnimalCard";
import { CalculatorCard } from "@/components/breeder/CalculatorCard";
import { ActivityCard } from "@/components/breeder/ActivityCard";
import { TaskCard } from "@/components/breeder/TaskCard";
import { AddAnimalDialog } from "@/components/breeder/animals/AddAnimalDialog";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Trophy, DollarSign, Plus, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useDashboardStats } from "@/lib/api/queries/dashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APIAnimal, APITask } from "@/lib/api/types";

export default function Dashboard() {
  const [showAddAnimal, setShowAddAnimal] = useState(false);

  // Fetch dashboard stats from API
  const { data: stats, isLoading, isError } = useDashboardStats();

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

  // Transform recent animals
  const recentAnimals = stats?.recentAnimals.map((animal: APIAnimal) => ({
    id: animal.id,
    name: animal.name,
    breed: animal.breed?.name || "Unknown",
    gender: animal.sex as "male" | "female",
    dateOfBirth: animal.dateOfBirth ? new Date(animal.dateOfBirth) : new Date(),
    imageUrl: animal.profileImageUrl || "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop&crop=face",
    status: animal.isBreedingActive ? ("breeding" as const) : ("available" as const),
  })) || [];

  // Transform upcoming tasks
  const upcomingTasks = stats?.upcomingTasks.map((task: APITask) => ({
    id: task.id,
    title: task.title || `${task.type} task`,
    description: task.notes || "",
    dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
    priority: task.priority as "high" | "medium" | "low",
    category: task.type as "health" | "breeding" | "feeding",
    animalName: task.animal?.name || "N/A",
    completed: !!task.completedAt,
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
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
        </div>
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

            {/* Right Column - Tasks */}
            <div className="space-y-6">
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
                      <TaskCard key={task.id} {...task} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-surface shadow-card rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">No upcoming tasks</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </>
      )}

      {/* Add Animal Dialog */}
      <AddAnimalDialog open={showAddAnimal} onOpenChange={setShowAddAnimal} />
    </div>
    </div>
  );
}