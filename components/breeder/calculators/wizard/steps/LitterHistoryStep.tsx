"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WizardStep } from "../WizardStep";
import { Baby, ExternalLink, Plus } from "lucide-react";
import { Animal } from "@/types";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LitterHistoryStepProps {
  bitch: Animal;
  data: any;
}

// Mock litter data - in production this would come from the animal profile
const mockLitters = [
  {
    id: '1',
    date: '2023-03-15',
    sireId: 'dog1',
    sireName: 'Champion Max',
    puppyCount: 7,
    complications: false
  },
  {
    id: '2',
    date: '2022-05-20',
    sireId: 'dog2',
    sireName: 'Duke',
    puppyCount: 5,
    complications: false
  }
];

export function LitterHistoryStep({ bitch, data }: LitterHistoryStepProps) {
  const litters = mockLitters; // TODO: Get from animal profile

  return (
    <WizardStep
      title="Litter History"
      description="Review previous litters from animal profile"
      icon={<Baby className="w-5 h-5 text-white" />}
    >
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
            <CardTitle className="text-base flex items-center justify-between">
              <span>Previous Litters</span>
              <Link href={`/animals/${bitch.id}?tab=litters`}>
                <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:border-primary">
                  <Plus className="w-3 h-3 mr-2" />
                  Add Litter
                </Button>
              </Link>
            </CardTitle>
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

                    <Link href={`/animals/${bitch.id}?tab=litters&litter=${litter.id}`}>
                      <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
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
              No previous litters recorded for {bitch.name}
            </p>
            <Link href={`/animals/${bitch.id}?tab=litters`}>
              <Button variant="outline" className="hover:bg-primary/10 hover:border-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add First Litter
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Alert className="border-primary/20 bg-primary/5">
        <AlertDescription className="text-sm">
          <strong>Note:</strong> Litter history is used to calculate conception probabilities. More successful litters improve the rating.
        </AlertDescription>
      </Alert>
    </WizardStep>
  );
}