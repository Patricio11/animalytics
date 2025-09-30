"use client";

import { AnimalCard } from "@/components/breeder/AnimalCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import { mockAnimals } from "@/data/mockData";

export default function Animals() {
  // Transform mockAnimals to match AnimalCard props
  const displayAnimals = mockAnimals.map(animal => ({
    id: animal.id,
    name: animal.name,
    breed: animal.breed,
    gender: animal.type === 'dog' ? 'male' as const : 'female' as const,
    dateOfBirth: new Date(animal.dateOfBirth),
    imageUrl: animal.photos?.[0] || "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop&crop=face",
    status: 'available' as const, // You can add more logic here based on animal data
  }));

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Animals</h1>
            <p className="text-muted-foreground">Manage your animal portfolio</p>
          </div>
          <Button className="bg-gradient-brand hover:opacity-90 shadow-card" data-testid="button-add-animal">
            <Plus className="w-4 h-4 mr-2" />
            Add Animal
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-surface shadow-card rounded-lg p-6 border-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search animals..."
                className="pl-10 bg-background border-primary/20 focus:border-primary"
                data-testid="input-search-animals"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-[180px] bg-background border-primary/20 focus:border-primary" data-testid="select-filter-gender">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full sm:w-[180px] bg-background border-primary/20 focus:border-primary" data-testid="select-filter-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="breeding">Breeding</SelectItem>
                <SelectItem value="pregnant">Pregnant</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="hover:bg-primary/10 hover:border-primary shadow-card" data-testid="button-filter">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Animals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayAnimals.map((animal) => (
            <AnimalCard key={animal.id} {...animal} />
          ))}
        </div>
      </div>
    </div>
  );
}