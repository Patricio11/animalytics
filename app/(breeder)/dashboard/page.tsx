"use client";

import { StatsCard } from "@/components/breeder/StatsCard";
import { AnimalCard } from "@/components/breeder/AnimalCard";
import { CalculatorCard } from "@/components/breeder/CalculatorCard";
import { ActivityCard } from "@/components/breeder/ActivityCard";
import { TaskCard } from "@/components/breeder/TaskCard";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Trophy, DollarSign, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  // todo: remove mock functionality
  const mockStats = [
    {
      title: "Total Animals",
      value: 24,
      description: "Actively managed",
      icon: <Heart className="w-4 h-4" />,
      trend: { value: 12, isPositive: true }
    },
    {
      title: "Recent Matings",
      value: 8,
      description: "This month",
      icon: <Calendar className="w-4 h-4" />,
      trend: { value: 25, isPositive: true }
    },
    {
      title: "Success Rate",
      value: "87.5%",
      description: "Conception rate",
      icon: <Trophy className="w-4 h-4" />,
      trend: { value: 5, isPositive: true }
    },
    {
      title: "Portfolio Value",
      value: "$125,000",
      description: "Market value",
      icon: <DollarSign className="w-4 h-4" />,
      trend: { value: 8, isPositive: true }
    }
  ];

  const mockRecentAnimals = [
    {
      id: "1",
      name: "Bella",
      breed: "Golden Retriever",
      gender: 'female' as const,
      dateOfBirth: new Date('2020-03-15'),
      imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop&crop=face",
      status: 'available' as const,
      lastMating: new Date('2024-01-15'),
    },
    {
      id: "2",
      name: "Max",
      breed: "German Shepherd",
      gender: 'male' as const,
      dateOfBirth: new Date('2019-08-22'),
      imageUrl: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=400&fit=crop&crop=face",
      status: 'breeding' as const,
      lastMating: new Date('2024-02-01'),
    }
  ];

  const mockRecentActivities = [
    {
      id: "1",
      type: 'feeding' as const,
      animalName: "Bella",
      title: "Morning Feeding",
      description: "Regular feeding schedule",
      date: new Date('2024-02-20'),
      data: { food: "Premium kibble", amount: "2 cups" }
    },
    {
      id: "2",
      type: 'exercise' as const,
      animalName: "Max",
      title: "Daily Walk",
      description: "Regular exercise routine",
      date: new Date('2024-02-19'),
      data: { duration: "45 mins", distance: "2.5 km" }
    }
  ];

  const mockUpcomingTasks = [
    {
      id: "1",
      title: "Schedule vet checkup",
      description: "Annual health examination for Bella",
      dueDate: new Date('2024-03-02'),
      priority: 'high' as const,
      category: 'health' as const,
      animalName: "Bella",
      completed: false,
    },
    {
      id: "2",
      title: "Update breeding records",
      description: "Record recent mating details",
      dueDate: new Date('2024-02-28'),
      priority: 'medium' as const,
      category: 'breeding' as const,
      animalName: "Luna",
      completed: false,
    }
  ];

  const mockCalculatorResult = {
    progesteroneRating: 95.0,
    conceptionRating: 42.7,
    overallRating: 67.5,
    accuracyStars: 4
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your animals.</p>
          </div>
          <Button className="bg-gradient-brand hover:opacity-90 shadow-card" data-testid="button-add-animal">
            <Plus className="w-4 h-4 mr-2" />
            Add Animal
          </Button>
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat, index) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockRecentAnimals.map((animal) => (
                <AnimalCard key={animal.id} {...animal} />
              ))}
            </div>
          </section>

          {/* Recent Mating Calculator */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Recent Mating</h2>
              <Link href="/calculators">
                <Button variant="ghost" size="sm" data-testid="link-view-calculators">
                  View calculators
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CalculatorCard
                title="Bella x Max Mating"
                description="Recent calculation from Feb 15, 2024"
                result={mockCalculatorResult}
              />
              <CalculatorCard
                title="New Calculation"
                description="Calculate ratings for a new mating event"
              />
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
              <Link href="/activities">
                <Button variant="ghost" size="sm" data-testid="link-view-reports">
                  View reports
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockRecentActivities.map((activity) => (
                <ActivityCard key={activity.id} {...activity} />
              ))}
            </div>
          </section>
        </div>

        {/* Right Column - Tasks */}
        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Upcoming Tasks</h2>
              <Link href="/task">
                <Button variant="ghost" size="sm" data-testid="link-view-tasks">
                  View all
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {mockUpcomingTasks.map((task) => (
                <TaskCard key={task.id} {...task} />
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/animals/new">
                <Button variant="outline" className="w-full justify-start hover:bg-primary/10 hover:border-primary shadow-card" data-testid="button-add-new-animal">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Animal
                </Button>
              </Link>
              <Link href="/calculators">
                <Button variant="outline" className="w-full justify-start hover:bg-primary/10 hover:border-primary shadow-card" data-testid="button-new-calculation">
                  <Trophy className="w-4 h-4 mr-2" />
                  New Calculation
                </Button>
              </Link>
              <Link href="/activities/new">
                <Button variant="outline" className="w-full justify-start hover:bg-primary/10 hover:border-primary shadow-card" data-testid="button-log-activity">
                  <Calendar className="w-4 h-4 mr-2" />
                  Log Activity
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
    </div>
  );
}