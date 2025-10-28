"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Heart,
  Calendar,
  TrendingUp,
  Eye,
  ArrowRight,
  CheckCircle2,
  Clock,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { MatingRecord, Animal } from "@/types";

interface MatingCardProps {
  mating: MatingRecord;
  bitch: Animal;
  dog: Animal;
  onDelete?: (matingId: string) => void;
}

export function MatingCard({ mating, bitch, dog, onDelete }: MatingCardProps) {
  // Convert string/number ratings to numbers
  const progesteroneRating = typeof mating.progesteroneCycleRating === 'number' 
    ? mating.progesteroneCycleRating 
    : parseFloat(mating.progesteroneCycleRating || '0');
  const conceptionRating = typeof mating.conceptionRating === 'number'
    ? mating.conceptionRating
    : parseFloat(mating.conceptionRating || '0');
  const overallRating = typeof mating.overallRating === 'number'
    ? mating.overallRating
    : parseFloat(mating.overallRating || '0');

  // Rating color logic
  const getRatingColor = (rating: number) => {
    if (rating >= 80) return 'text-chart-3';
    if (rating >= 60) return 'text-chart-4';
    if (rating >= 40) return 'text-chart-2';
    return 'text-destructive';
  };

  const getRatingBgColor = (rating: number) => {
    if (rating >= 80) return 'bg-chart-3';
    if (rating >= 60) return 'bg-chart-4';
    if (rating >= 40) return 'bg-chart-2';
    return 'bg-destructive';
  };

  const getStatusStyle = () => {
    switch (mating.status) {
      case 'completed':
      case 'successful':
        return {
          bg: 'bg-chart-3/10',
          border: 'border-chart-3/30',
          text: 'text-chart-3',
          icon: <CheckCircle2 className="w-3 h-3" />
        };
      case 'planned':
        return {
          bg: 'bg-chart-4/10',
          border: 'border-chart-4/30',
          text: 'text-chart-4',
          icon: <Clock className="w-3 h-3" />
        };
      case 'unsuccessful':
        return {
          bg: 'bg-destructive/10',
          border: 'border-destructive/30',
          text: 'text-destructive',
          icon: <Clock className="w-3 h-3" />
        };
      default:
        return {
          bg: 'bg-muted/50',
          border: 'border-muted',
          text: 'text-muted-foreground',
          icon: <Clock className="w-3 h-3" />
        };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <Card className="group shadow-card border-primary/10 hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-subtle border-b border-primary/10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 rounded-lg bg-gradient-brand shadow-md">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                  {bitch.name} × {dog.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(mating.matingDate), "MMM dd, yyyy")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "capitalize font-medium",
                statusStyle.bg,
                statusStyle.border,
                statusStyle.text
              )}
            >
              <span className="flex items-center gap-1.5">
                {statusStyle.icon}
                {mating.status}
              </span>
            </Badge>
            
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(mating.id);
                }}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Animal Preview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-background rounded-lg border border-primary/10">
            <Avatar className="w-10 h-10 border-2 border-primary/20">
              <AvatarImage src={bitch.photos[0]} alt={bitch.name} />
              <AvatarFallback>{bitch.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground truncate">
                {bitch.name}
              </div>
              <div className="text-xs text-muted-foreground">Bitch</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-background rounded-lg border border-primary/10">
            <Avatar className="w-10 h-10 border-2 border-primary/20">
              <AvatarImage src={dog.photos[0]} alt={dog.name} />
              <AvatarFallback>{dog.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground truncate">
                {dog.name}
              </div>
              <div className="text-xs text-muted-foreground">Dog</div>
            </div>
          </div>
        </div>

        {/* Ratings */}
        <div className="space-y-3">
          {/* Progesterone Rating */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Progesterone Cycle</span>
              <span className={cn("font-semibold", getRatingColor(progesteroneRating))}>
                {progesteroneRating.toFixed(1)}%
              </span>
            </div>
            <Progress value={progesteroneRating} className="h-2" />
          </div>

          {/* Conception Rating */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Conception Rating</span>
              <span className={cn("font-semibold", getRatingColor(conceptionRating))}>
                {conceptionRating.toFixed(1)}%
              </span>
            </div>
            <Progress value={conceptionRating} className="h-2" />
          </div>

          {/* Overall Rating */}
          <div className="pt-2 border-t border-primary/10">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">Overall Rating</span>
              <Badge
                className={cn(
                  "font-semibold text-white",
                  getRatingBgColor(overallRating)
                )}
              >
                {overallRating.toFixed(1)}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Expected Whelping */}
        {mating.expectedWhelping && (
          <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs font-medium text-foreground">
                Expected Whelping
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(mating.expectedWhelping), "MMMM dd, yyyy")}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2">
          <Link href={`/calculators/mating/${mating.id}`}>
            <Button
              variant="outline"
              className="w-full hover:bg-primary/10 hover:border-primary group/btn"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}