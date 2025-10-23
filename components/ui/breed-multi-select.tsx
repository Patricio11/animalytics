"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface BreedOption {
  id: string;
  name: string;
  sizeCategory?: string | null;
  imageUrl?: string | null;
}

interface BreedMultiSelectProps {
  breeds: BreedOption[];
  selectedBreedIds: string[];
  onSelectionChange: (breedIds: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  maxHeight?: string;
  disabled?: boolean;
}

export function BreedMultiSelect({
  breeds,
  selectedBreedIds,
  onSelectionChange,
  placeholder = "Select breeds...",
  emptyText = "No breeds found.",
  maxHeight = "300px",
  disabled = false,
}: BreedMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedBreeds = breeds.filter((breed) =>
    selectedBreedIds.includes(breed.id)
  );

  const filteredBreeds = breeds.filter((breed) =>
    breed.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleBreed = (breedId: string) => {
    const newSelection = selectedBreedIds.includes(breedId)
      ? selectedBreedIds.filter((id) => id !== breedId)
      : [...selectedBreedIds, breedId];
    onSelectionChange(newSelection);
  };

  const removeBreed = (breedId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange(selectedBreedIds.filter((id) => id !== breedId));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between min-h-[2.5rem] h-auto",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedBreeds.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selectedBreeds.map((breed) => (
                <Badge
                  key={breed.id}
                  variant="secondary"
                  className="mr-1 mb-1 bg-primary/10 hover:bg-primary/20"
                >
                  {breed.name}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        removeBreed(breed.id, e as any);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => removeBreed(breed.id, e)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            {selectedBreeds.length > 0 && (
              <button
                onClick={clearAll}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Search breeds..."
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <CommandList>
            <ScrollArea className="h-[300px]">
              {filteredBreeds.length === 0 ? (
                <CommandEmpty>{emptyText}</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredBreeds.map((breed) => {
                    const isSelected = selectedBreedIds.includes(breed.id);
                    return (
                      <CommandItem
                        key={breed.id}
                        onSelect={() => toggleBreed(breed.id)}
                        className="cursor-pointer"
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible"
                          )}
                        >
                          <Check className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{breed.name}</div>
                          {breed.sizeCategory && (
                            <div className="text-xs text-muted-foreground capitalize">
                              {breed.sizeCategory}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
