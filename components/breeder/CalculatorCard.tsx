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
    <Card className="hover-elevate" data-testid={`card-calculator-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {result ? (
          <>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Progesterone Cycle</span>
                  <span className={`text-sm font-semibold ${getRatingColor(result.progesteroneRating)}`}>
                    {result.progesteroneRating.toFixed(1)}%
                  </span>
                </div>
                <Progress value={result.progesteroneRating} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Conception Rating</span>
                  <span className={`text-sm font-semibold ${getRatingColor(result.conceptionRating)}`}>
                    {result.conceptionRating.toFixed(1)}%
                  </span>
                </div>
                <Progress value={result.conceptionRating} className="h-2" />
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base font-medium">Overall Rating</span>
                  <Badge className={`${getRatingBg(result.overallRating)} text-white`}>
                    {result.overallRating.toFixed(1)}%
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Accuracy:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < result.accuracyStars
                            ? 'text-chart-4 fill-current'
                            : 'text-muted'
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
              className="w-full"
            >
              View Details
            </Button>
          </>
        ) : (
          <Button
            onClick={handleCalculate}
            data-testid="button-calculate"
            className="w-full"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculate
          </Button>
        )}
      </CardContent>
    </Card>
  );
}