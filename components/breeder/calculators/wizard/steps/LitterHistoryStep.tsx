"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Baby } from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WizardData } from "@/lib/types/wizard";

interface LitterHistoryStepProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface Litter {
  id: string;
  date: string;
  sireId: string;
  sireName: string;
  puppyCount: number;
  complications: boolean;
}

export function LitterHistoryStep({ data, onUpdate, onNext, onPrevious }: LitterHistoryStepProps) {
  const [litters, setLitters] = useState<Litter[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedBitch = data?.selectedBitch;
  const bitchId = data?.bitchId;

  // Fetch real litter data from API
  useEffect(() => {
    const fetchLitters = async () => {
      if (!bitchId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/animals/${bitchId}/litters`);
        if (!response.ok) throw new Error('Failed to fetch litters');
        const result = await response.json();
        setLitters(result.litters || []);
      } catch (error) {
        console.error('Error fetching litters:', error);
        setLitters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLitters();
  }, [bitchId]);

  const handleContinue = () => {
    onUpdate({
      litters: litters
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="shadow-card border-primary/10 bg-gradient-subtle">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">{litters.length}</div>
              <div className="text-sm text-muted-foreground">Total Litters</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {litters.reduce((sum, l) => sum + l.puppyCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Puppies</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-chart-3">
                {(litters.reduce((sum, l) => sum + l.puppyCount, 0) / litters.length).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Per Litter</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-chart-4">
                {litters.filter(l => !l.complications).length}
              </div>
              <div className="text-sm text-muted-foreground">No Complications</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Litters Table */}
      {litters.length > 0 ? (
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-base">Previous Litters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {litters.map((litter) => (
                <div
                  key={litter.id}
                  className="p-4 rounded-lg border border-primary/10 bg-background hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">
                          {format(new Date(litter.date), "MMM dd, yyyy")}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {litter.puppyCount} puppies
                        </Badge>
                        {!litter.complications && (
                          <Badge className="bg-chart-3 text-white text-xs">
                            No Complications
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Sire: <span className="font-medium text-foreground">{litter.sireName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card border-primary/10">
          <CardContent className="py-12 text-center">
            <Baby className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">
              No previous litters recorded
            </p>
          </CardContent>
        </Card>
      )}

      <Alert className="border-primary/20 bg-primary/5">
        <AlertDescription className="text-sm">
          <strong>Note:</strong> Litter history is used to calculate conception probabilities. More successful litters improve the rating.
        </AlertDescription>
      </Alert>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={handleContinue} className="bg-gradient-brand hover:opacity-90 shadow-card">
          Continue
        </Button>
      </div>
    </div>
  );
}