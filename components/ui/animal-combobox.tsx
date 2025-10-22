"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface AnimalOption {
  id: string;
  name: string;
  breed?: string;
  profileImageUrl?: string | null;
  sex?: string;
}

interface AnimalComboboxProps {
  animals: AnimalOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
}

export function AnimalCombobox({
  animals,
  value,
  onValueChange,
  placeholder = "Select animal...",
  emptyText = "No animals found.",
  disabled = false,
  className,
  allowClear = false,
}: AnimalComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedAnimal = React.useMemo(
    () => animals.find((animal) => animal.id === value),
    [animals, value]
  );

  const getAnimalInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSelect = (currentValue: string) => {
    if (currentValue === value && allowClear) {
      onValueChange("");
    } else {
      onValueChange(currentValue);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          {selectedAnimal ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage 
                  src={selectedAnimal.profileImageUrl || undefined} 
                  alt={selectedAnimal.name}
                />
                <AvatarFallback className="text-xs bg-gradient-brand text-white">
                  {getAnimalInitials(selectedAnimal.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="font-medium truncate">{selectedAnimal.name}</span>
                {selectedAnimal.breed && (
                  <span className="text-xs text-muted-foreground truncate">
                    {selectedAnimal.breed}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search animals..." 
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {animals.map((animal) => (
                <CommandItem
                  key={animal.id}
                  value={animal.name}
                  onSelect={() => handleSelect(animal.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage 
                        src={animal.profileImageUrl || undefined} 
                        alt={animal.name}
                      />
                      <AvatarFallback className="text-xs bg-gradient-brand text-white">
                        {getAnimalInitials(animal.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="font-medium truncate">{animal.name}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {animal.breed && (
                          <span className="truncate">{animal.breed}</span>
                        )}
                        {animal.sex && (
                          <>
                            {animal.breed && <span>•</span>}
                            <span className="capitalize">{animal.sex}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 flex-shrink-0",
                        value === animal.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
