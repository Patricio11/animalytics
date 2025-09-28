"use client";

import { AnimalCard } from "@/components/breeder/AnimalCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";

export default function Animals() {
  // todo: remove mock functionality
  const mockAnimals = [
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
      imageUrl: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=400&fit=crop&crop=face",
      status: 'breeding' as const,
      lastMating: new Date('2024-02-01'),
    },
    {
      id: "3",
      name: "Duke",
      breed: "Labrador Retriever",
      gender: 'male' as const,
      dateOfBirth: new Date('2021-06-10'),
      imageUrl: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&crop=face",
      status: 'available' as const,
    },
    {
      id: "4",
      name: "Luna",
      breed: "Border Collie",
      gender: 'female' as const,
      dateOfBirth: new Date('2022-01-20'),
      imageUrl: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=400&fit=crop&crop=face",
      status: 'pregnant' as const,
      lastMating: new Date('2024-01-20'),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Animals</h1>
          <p className="text-muted-foreground">Manage your animal portfolio</p>
        </div>
        <Button data-testid="button-add-animal">
          <Plus className="w-4 h-4 mr-2" />
          Add Animal
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search animals..."
            className="pl-10"
            data-testid="input-search-animals"
          />
        </div>
        <Select>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-filter-gender">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-filter-status">
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
        <Button variant="outline" data-testid="button-filter">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Animals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockAnimals.map((animal) => (
          <AnimalCard key={animal.id} {...animal} />
        ))}
      </div>
    </div>
  );
}