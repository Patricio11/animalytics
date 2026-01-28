"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBreeds } from "@/lib/api/queries/breeds";
import type { AnimalFilters } from "@/lib/api/queries/admin-animals";

interface AnimalsFiltersProps {
  filters: AnimalFilters;
  onFiltersChange: (filters: AnimalFilters) => void;
  onReset: () => void;
}

export function AnimalsFilters({ filters, onFiltersChange, onReset }: AnimalsFiltersProps) {
  const { data: breedsData } = useBreeds();
  const [breedSearchOpen, setBreedSearchOpen] = useState(false);

  const allBreeds = breedsData || [];
  const selectedBreed = allBreeds.find((breed) => breed.id === filters.breedId);

  const updateFilter = (key: keyof AnimalFilters, value: any) => {
    // Convert 'all' to empty string for API
    const apiValue = value === 'all' ? '' : value;
    onFiltersChange({ ...filters, [key]: apiValue, page: 1 }); // Reset to page 1 on filter change
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'page' || key === 'limit' || key === 'sortBy' || key === 'sortOrder') return false;
    return value !== undefined && value !== null && value !== '';
  }).length;

  return (
    <Card className="shadow-card bg-surface border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Name, registration, microchip..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Breed */}
        <div className="space-y-2">
          <Label>Breed</Label>
          <Popover open={breedSearchOpen} onOpenChange={setBreedSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={breedSearchOpen}
                className="w-full justify-between"
              >
                {selectedBreed ? selectedBreed.name : "All breeds"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search breeds..." />
                <CommandList>
                  <CommandEmpty>No breed found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value=""
                      onSelect={() => {
                        updateFilter('breedId', '');
                        setBreedSearchOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !filters.breedId ? "opacity-100" : "opacity-0"
                        )}
                      />
                      All breeds
                    </CommandItem>
                    {allBreeds.map((breed) => (
                      <CommandItem
                        key={breed.id}
                        value={breed.name}
                        onSelect={() => {
                          updateFilter('breedId', breed.id);
                          setBreedSearchOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters.breedId === breed.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {breed.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Sex */}
        <div className="space-y-2">
          <Label htmlFor="sex">Sex</Label>
          <Select
            value={filters.sex || 'all'}
            onValueChange={(value) => updateFilter('sex', value)}
          >
            <SelectTrigger id="sex">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City, region, country..."
            value={filters.location || ''}
            onChange={(e) => updateFilter('location', e.target.value)}
          />
        </div>

        {/* Breeder Name */}
        <div className="space-y-2">
          <Label htmlFor="breederName">Breeder Name</Label>
          <Input
            id="breederName"
            placeholder="Search by breeder..."
            value={filters.breederName || ''}
            onChange={(e) => updateFilter('breederName', e.target.value)}
          />
        </div>

        {/* Owner Name */}
        <div className="space-y-2">
          <Label htmlFor="ownerName">Owner Name</Label>
          <Input
            id="ownerName"
            placeholder="Search by owner..."
            value={filters.ownerName || ''}
            onChange={(e) => updateFilter('ownerName', e.target.value)}
          />
        </div>

        {/* Age Range */}
        <div className="space-y-2">
          <Label>Age Range (years)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.ageMin || ''}
              onChange={(e) => updateFilter('ageMin', e.target.value)}
              min="0"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.ageMax || ''}
              onChange={(e) => updateFilter('ageMax', e.target.value)}
              min="0"
            />
          </div>
        </div>

        {/* Has Pedigree */}
        <div className="space-y-2">
          <Label htmlFor="hasPedigree">Pedigree</Label>
          <Select
            value={filters.hasPedigree || 'all'}
            onValueChange={(value) => updateFilter('hasPedigree', value)}
          >
            <SelectTrigger id="hasPedigree">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">With Pedigree</SelectItem>
              <SelectItem value="no">Without Pedigree</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={filters.status || 'active'}
            onValueChange={(value) => updateFilter('status', value === 'all' ? 'all' : value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Active" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
