import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator, Star } from "lucide-react";

interface CalculatorResult {
  progesteroneRating: number;
  conceptionRating: number;
  overallRating: number;
  accuracyStars: number;
}

interface CalculatorCardProps {
  title: string;
  description: string;
  result?: CalculatorResult;
  onCalculate?: () => void;
  onViewDetails?: () => void;
}

export function CalculatorCard({
  title,
  description,
  result,
  onCalculate,
  onViewDetails
}: CalculatorCardProps) {

  const getRatingColor = (rating: number) => {
    if (rating >= 80) return 'text-chart-3';
    if (rating >= 60) return 'text-chart-4';
    return 'text-destructive';
  };

  const getRatingBg = (rating: number) => {
    if (rating >= 80) return 'bg-chart-3';
    if (rating >= 60) return 'bg-chart-4';
    return 'bg-destructive';
  };

  const handleCalculate = () => {
    console.log(`Calculate: ${title}`);
    onCalculate?.();
  };

  const handleViewDetails = () => {
    console.log(`View details: ${title}`);
    onViewDetails?.();
  };

  return (
    <Card className="group overflow-hidden bg-surface border border-primary/10 shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30" data-testid={`card-calculator-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 rounded-lg bg-gradient-brand shadow-md">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <span className="group-hover:text-primary transition-colors duration-300">{title}</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">{description}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {result ? (
          <>
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Progesterone Cycle</span>
                  <span className={`text-sm font-bold ${getRatingColor(result.progesteroneRating)}`}>
                    {result.progesteroneRating.toFixed(1)}%
                  </span>
                </div>
                <Progress value={result.progesteroneRating} className="h-3 shadow-sm" />
              </div>

              <div className="bg-muted/30 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Conception Rating</span>
                  <span className={`text-sm font-bold ${getRatingColor(result.conceptionRating)}`}>
                    {result.conceptionRating.toFixed(1)}%
                  </span>
                </div>
                <Progress value={result.conceptionRating} className="h-3 shadow-sm" />
              </div>

              <div className="pt-3 border-t border-primary/10 bg-gradient-subtle/30 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-base font-semibold">Overall Rating</span>
                  <Badge className={`${getRatingBg(result.overallRating)} text-white shadow-md border border-white/20`}>
                    {result.overallRating.toFixed(1)}%
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Accuracy:</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 transition-colors duration-200 ${
                          i < result.accuracyStars
                            ? 'text-chart-4 fill-current'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              data-testid="button-view-details"
              className="w-full shadow-sm hover:bg-primary/10 hover:border-primary transition-all duration-300"
            >
              View Details
            </Button>
          </>
        ) : (
          <Button
            onClick={handleCalculate}
            data-testid="button-calculate"
            className="w-full bg-gradient-brand hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculate
          </Button>
        )}
      </CardContent>
    </Card>
  );
}