"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreedComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showAllOption?: boolean;
}

// Fetch breeds from API
function useBreeds() {
  return useQuery({
    queryKey: ['breeds'],
    queryFn: async () => {
      const response = await fetch('/api/breeds');
      if (!response.ok) throw new Error('Failed to fetch breeds');
      return response.json();
    },
  });
}

export function BreedCombobox({ 
  value, 
  onChange, 
  placeholder = "Select breed...",
  className,
  showAllOption = false
}: BreedComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  // Fetch breeds from API
  const { data: breedsData, isLoading: breedsLoading } = useBreeds();
  const breeds = breedsData?.breeds || [];
  
  // Filter breeds based on search
  const filteredBreeds = useMemo(() => {
    if (!search) return breeds;
    return breeds.filter((breed: any) => 
      breed.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [breeds, search]);

  // Find selected breed
  const selectedBreed = breeds.find((breed: any) => breed.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-background border-primary/20 hover:bg-surface-secondary",
            className
          )}
          disabled={breedsLoading}
        >
          {breedsLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading breeds...
            </span>
          ) : value ? (
            <span className="truncate">{value}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search breed..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {filteredBreeds.length === 0 ? (
              <CommandEmpty>No breed found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {showAllOption && (
                  <CommandItem
                    value=""
                    onSelect={() => {
                      onChange("");
                      setOpen(false);
                      setSearch("");
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium">All Breeds</div>
                      <div className="text-xs text-muted-foreground">
                        Show all breeds
                      </div>
                    </div>
                  </CommandItem>
                )}
                {filteredBreeds.map((breed: any) => (
                  <CommandItem
                    key={breed.id}
                    value={breed.name}
                    onSelect={() => {
                      onChange(breed.name);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === breed.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{breed.name}</div>
                      {breed.sizeCategory && (
                        <div className="text-xs text-muted-foreground capitalize">
                          {breed.sizeCategory} breed
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
