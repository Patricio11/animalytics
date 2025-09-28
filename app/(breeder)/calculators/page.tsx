"use client";

import { CalculatorCard } from "@/components/breeder/CalculatorCard";
import { AnimalCard } from "@/components/breeder/AnimalCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, Heart, Calendar } from "lucide-react";
import { useState } from "react";

export default function CalculatorPage() {
  const [selectedMale, setSelectedMale] = useState<string>("");
  const [selectedFemale, setSelectedFemale] = useState<string>("");
  const [showResults, setShowResults] = useState(false);

  // todo: remove mock functionality
  const mockAnimals = [
    {
      id: "1",
      name: "Max",
      breed: "German Shepherd",
      gender: 'male' as const,
      dateOfBirth: new Date('2019-08-22'),
      imageUrl: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=400&fit=crop&crop=face",
      status: 'available' as const,
    },
    {
      id: "2",
      name: "Bella",
      breed: "Golden Retriever",
      gender: 'female' as const,
      dateOfBirth: new Date('2020-03-15'),
      imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop&crop=face",
      status: 'available' as const,
    },
  ];

  const mockResult = {
    progesteroneRating: 95.0,
    conceptionRating: 42.7,
    overallRating: 67.5,
    accuracyStars: 4
  };

  const handleCalculate = () => {
    if (selectedMale && selectedFemale) {
      setShowResults(true);
      console.log(`Calculating mating: ${selectedMale} x ${selectedFemale}`);
    }
  };

  const handleReset = () => {
    setSelectedMale("");
    setSelectedFemale("");
    setShowResults(false);
    console.log("Calculator reset");
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mating Calculator</h1>
        <p className="text-muted-foreground mt-2">
          Calculate progesterone cycle ratings and conception probabilities for your breeding program
        </p>
      </div>

      {/* Main Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Animal Selection */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Select Breeding Pair
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Male Selection */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Select Male (Dog)</h3>
                <Select value={selectedMale} onValueChange={setSelectedMale}>
                  <SelectTrigger data-testid="select-male-animal" className="w-full">
                    <SelectValue placeholder="Choose a male animal" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAnimals
                      .filter(animal => animal.gender === 'male')
                      .map(animal => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.name} - {animal.breed}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {selectedMale && (
                  <div className="mt-4">
                    {mockAnimals
                      .filter(animal => animal.id === selectedMale)
                      .map(animal => (
                        <div key={animal.id} className="max-w-xs">
                          <AnimalCard {...animal} />
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Female Selection */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Select Female (Bitch)</h3>
                <Select value={selectedFemale} onValueChange={setSelectedFemale}>
                  <SelectTrigger data-testid="select-female-animal" className="w-full">
                    <SelectValue placeholder="Choose a female animal" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAnimals
                      .filter(animal => animal.gender === 'female')
                      .map(animal => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.name} - {animal.breed}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {selectedFemale && (
                  <div className="mt-4">
                    {mockAnimals
                      .filter(animal => animal.id === selectedFemale)
                      .map(animal => (
                        <div key={animal.id} className="max-w-xs">
                          <AnimalCard {...animal} />
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  onClick={handleCalculate}
                  disabled={!selectedMale || !selectedFemale}
                  data-testid="button-calculate-mating"
                  className="flex-1 sm:flex-none"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Mating
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  data-testid="button-reset-calculator"
                  className="flex-1 sm:flex-none"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {showResults && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Calculation Results
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Max x Bella</Badge>
                  <Badge variant="outline">{new Date().toLocaleDateString()}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CalculatorCard
                  title="Mating Analysis"
                  description="Comprehensive breeding calculation results"
                  result={mockResult}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Individual Calculators */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Individual Calculators</CardTitle>
              <p className="text-sm text-muted-foreground">
                Calculate conception ratings for individual animals
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <CalculatorCard
                title="Brood Bitch Calculator"
                description="Female conception rating analysis"
              />
              <CalculatorCard
                title="Stud Dog Calculator"
                description="Male breeding performance analysis"
              />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Breeding Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">This Month:</span>
                  <div className="font-semibold text-foreground">8 matings</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Success Rate:</span>
                  <div className="font-semibold text-chart-3">87.5%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg. Rating:</span>
                  <div className="font-semibold text-foreground">72.3%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Best Match:</span>
                  <div className="font-semibold text-primary">95.2%</div>
                </div>
              </div>

              <div className="pt-3 border-t">
                <Button variant="outline" size="sm" className="w-full" data-testid="button-view-history">
                  <Calendar className="w-3 h-3 mr-2" />
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}