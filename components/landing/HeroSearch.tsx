"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, PawPrint, Users, ShoppingBag, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = "animals" | "breeders" | "marketplace";

const categories: { id: Category; label: string; icon: React.ElementType; path: string; placeholder: string }[] = [
  { id: "animals", label: "Animals", icon: PawPrint, path: "/explore", placeholder: "Breed, name or keyword..." },
  { id: "breeders", label: "Breeders", icon: Users, path: "/breeders", placeholder: "Breeder name or specialty..." },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag, path: "/marketplace", placeholder: "Puppies, stud dogs, services..." },
];

// Popular locations for suggestions
const popularLocations = [
  "Johannesburg, Gauteng",
  "Cape Town, Western Cape",
  "Durban, KwaZulu-Natal",
  "Pretoria, Gauteng",
  "Port Elizabeth, Eastern Cape",
  "Bloemfontein, Free State",
  "East London, Eastern Cape",
  "Nelspruit, Mpumalanga",
  "Polokwane, Limpopo",
  "Kimberley, Northern Cape",
  "Rustenburg, North West",
  "Pietermaritzburg, KwaZulu-Natal",
];

function useBreedSuggestions(search: string) {
  return useQuery({
    queryKey: ["breed-suggestions", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("limit", "8");
      const response = await fetch(`/api/breeds?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch breeds");
      return response.json();
    },
    enabled: search.length >= 1,
    staleTime: 30000,
  });
}

interface HeroSearchProps {
  className?: string;
  defaultCategory?: Category;
}

export function HeroSearch({ className, defaultCategory = "animals" }: HeroSearchProps) {
  const router = useRouter();
  const [category, setCategory] = useState<Category>(defaultCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  const activeCategory = categories.find((c) => c.id === category)!;

  // Breed suggestions for search field
  const { data: breedData, isLoading: breedsLoading } = useBreedSuggestions(
    category === "animals" ? searchQuery : ""
  );
  const breedSuggestions = breedData?.breeds || [];

  // Filter locations based on input
  const filteredLocations = location.trim()
    ? popularLocations.filter((loc) =>
        loc.toLowerCase().includes(location.toLowerCase())
      )
    : popularLocations;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setShowSearchDropdown(false);
    setShowLocationDropdown(false);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (location.trim()) params.set("location", location.trim());
    const queryString = params.toString();
    router.push(`${activeCategory.path}${queryString ? `?${queryString}` : ""}`);
  };

  const selectBreed = (name: string) => {
    setSearchQuery(name);
    setShowSearchDropdown(false);
  };

  const selectLocation = (loc: string) => {
    setLocation(loc);
    setShowLocationDropdown(false);
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -4, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -4, scale: 0.98 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={cn("w-full max-w-3xl mx-auto", className)}
    >
      {/* Category Tabs */}
      <div className="flex justify-center mb-5">
        <div className="inline-flex bg-white/70 dark:bg-surface/70 backdrop-blur-xl rounded-2xl p-1 shadow-lg border border-white/50 dark:border-border/30">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
                  isActive
                    ? "text-white shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="hero-search-tab"
                    className="absolute inset-0 bg-gradient-brand rounded-xl shadow-lg"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch}>
        {/* Desktop */}
        <motion.div
          animate={{
            boxShadow: isFocused
              ? "0 20px 60px -15px rgba(0, 130, 200, 0.25), 0 0 0 2px hsl(201 98% 45% / 0.2)"
              : "0 10px 40px -10px rgba(0, 0, 0, 0.1)",
          }}
          transition={{ duration: 0.3 }}
          className="hidden md:flex items-center gap-1 bg-white dark:bg-surface rounded-full pl-2 pr-2 py-2 border border-white/80 dark:border-border/50"
        >
          {/* Search Field */}
          <div ref={searchRef} className="relative flex items-center gap-3 flex-1 pl-3 py-2">
            <div className="w-11 h-11 rounded-full bg-gradient-brand/10 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <input
              type="text"
              placeholder={activeCategory.placeholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length >= 1 && category === "animals") {
                  setShowSearchDropdown(true);
                } else {
                  setShowSearchDropdown(false);
                }
              }}
              onFocus={() => {
                setIsFocused(true);
                if (searchQuery.length >= 1 && category === "animals") {
                  setShowSearchDropdown(true);
                }
              }}
              onBlur={() => setIsFocused(false)}
              className="w-full bg-transparent border-0 border-none outline-none ring-0 shadow-none text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 focus:border-0 text-base font-medium appearance-none"
              style={{ border: "none", outline: "none", boxShadow: "none" }}
            />

            {/* Search Suggestions Dropdown */}
            <AnimatePresence>
              {showSearchDropdown && category === "animals" && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-surface rounded-2xl shadow-elevated border border-border/30 overflow-hidden z-50"
                >
                  <div className="p-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                      {searchQuery ? "Matching Breeds" : "Popular Breeds"}
                    </p>
                    {breedsLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    ) : breedSuggestions.length > 0 ? (
                      breedSuggestions.slice(0, 6).map((breed: any) => (
                        <button
                          key={breed.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectBreed(breed.name)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-primary/5 transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-brand/10 flex items-center justify-center shrink-0 group-hover:bg-gradient-brand/20 transition-colors">
                            <PawPrint className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{breed.name}</p>
                            {breed.sizeCategory && (
                              <p className="text-xs text-muted-foreground capitalize">{breed.sizeCategory} breed</p>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No breeds found</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-border/30 shrink-0" />

          {/* Location Field */}
          <div ref={locationRef} className="relative flex items-center gap-3 flex-1 pl-3 py-2">
            <div className="w-11 h-11 rounded-full bg-primary-pink/10 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-primary-pink" />
            </div>
            <input
              type="text"
              placeholder="Anywhere"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowLocationDropdown(true);
              }}
              onFocus={() => {
                setIsFocused(true);
                setShowLocationDropdown(true);
              }}
              onBlur={() => setIsFocused(false)}
              className="w-full bg-transparent border-0 border-none outline-none ring-0 shadow-none text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 focus:border-0 text-base font-medium appearance-none"
              style={{ border: "none", outline: "none", boxShadow: "none" }}
            />

            {/* Location Suggestions Dropdown */}
            <AnimatePresence>
              {showLocationDropdown && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-surface rounded-2xl shadow-elevated border border-border/30 overflow-hidden z-50"
                >
                  <div className="p-2 max-h-[280px] overflow-y-auto">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                      {location ? "Matching Locations" : "Popular Locations"}
                    </p>
                    {filteredLocations.length > 0 ? (
                      filteredLocations.slice(0, 8).map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectLocation(loc)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-primary-pink/5 transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-full bg-primary-pink/10 flex items-center justify-center shrink-0 group-hover:bg-primary-pink/20 transition-colors">
                            <MapPin className="w-4 h-4 text-primary-pink" />
                          </div>
                          <p className="text-sm font-medium text-foreground">{loc}</p>
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No locations found</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-brand text-white font-semibold text-sm shadow-lg shrink-0"
          >
            <Search className="w-4 h-4" />
            Search
          </motion.button>
        </motion.div>

        {/* Mobile */}
        <div className="md:hidden bg-white dark:bg-surface rounded-2xl shadow-elevated border border-white/80 dark:border-border/50 p-4 space-y-3">
          {/* Mobile Search Field */}
          <div ref={searchRef} className="relative">
            <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-4">
              <Search className="w-5 h-5 text-primary shrink-0" />
              <input
                type="text"
                placeholder={activeCategory.placeholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length >= 1 && category === "animals") {
                    setShowSearchDropdown(true);
                  } else {
                    setShowSearchDropdown(false);
                  }
                }}
                onFocus={() => {
                  if (searchQuery.length >= 1 && category === "animals") {
                    setShowSearchDropdown(true);
                  }
                }}
                className="w-full bg-transparent border-0 border-none outline-none ring-0 shadow-none text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 focus:border-0 text-base font-medium appearance-none"
                style={{ border: "none", outline: "none", boxShadow: "none" }}
              />
            </div>

            {/* Mobile Search Suggestions */}
            <AnimatePresence>
              {showSearchDropdown && category === "animals" && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-surface rounded-xl shadow-elevated border border-border/30 overflow-hidden z-50"
                >
                  <div className="p-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                      {searchQuery ? "Matching Breeds" : "Popular Breeds"}
                    </p>
                    {breedsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    ) : breedSuggestions.length > 0 ? (
                      breedSuggestions.slice(0, 5).map((breed: any) => (
                        <button
                          key={breed.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectBreed(breed.name)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-primary/5 transition-colors"
                        >
                          <PawPrint className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-sm font-medium text-foreground">{breed.name}</span>
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-3">No breeds found</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Location Field */}
          <div ref={locationRef} className="relative">
            <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-4">
              <MapPin className="w-5 h-5 text-primary-pink shrink-0" />
              <input
                type="text"
                placeholder="Anywhere"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setShowLocationDropdown(true);
                }}
                onFocus={() => setShowLocationDropdown(true)}
                className="w-full bg-transparent border-0 border-none outline-none ring-0 shadow-none text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 focus:border-0 text-base font-medium appearance-none"
                style={{ border: "none", outline: "none", boxShadow: "none" }}
              />
            </div>

            {/* Mobile Location Suggestions */}
            <AnimatePresence>
              {showLocationDropdown && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-surface rounded-xl shadow-elevated border border-border/30 overflow-hidden z-50 max-h-[200px] overflow-y-auto"
                >
                  <div className="p-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                      {location ? "Matching Locations" : "Popular Locations"}
                    </p>
                    {filteredLocations.slice(0, 6).map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectLocation(loc)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-primary-pink/5 transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-primary-pink shrink-0" />
                        <span className="text-sm font-medium text-foreground">{loc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-brand text-white rounded-xl py-4 font-semibold shadow-lg"
          >
            <Search className="w-4 h-4" />
            Search
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
