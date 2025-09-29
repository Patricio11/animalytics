import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Share2, Edit } from "lucide-react";
import { format } from "date-fns";

interface AnimalCardProps {
  id: string;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  dateOfBirth: Date;
  imageUrl?: string;
  status?: 'available' | 'pregnant' | 'breeding' | 'retired';
  lastMating?: Date;
  onEdit?: () => void;
  onShare?: () => void;
  onFavorite?: () => void;
}

export function AnimalCard({
  id,
  name,
  breed,
  gender,
  dateOfBirth,
  imageUrl,
  status = 'available',
  lastMating,
  onEdit,
  onShare,
  onFavorite
}: AnimalCardProps) {
  const age = Math.floor((Date.now() - dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365));

  const statusColors = {
    available: 'bg-chart-3 text-white',
    pregnant: 'bg-chart-1 text-white',
    breeding: 'bg-chart-4 text-white',
    retired: 'bg-muted text-muted-foreground'
  };

  const handleEdit = () => {
    console.log(`Edit animal: ${name}`);
    onEdit?.();
  };

  const handleShare = () => {
    console.log(`Share animal: ${name}`);
    onShare?.();
  };

  const handleFavorite = () => {
    console.log(`Favorite animal: ${name}`);
    onFavorite?.();
  };

  return (
    <Card className="group overflow-hidden bg-surface border border-primary/10 shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 hover:border-primary/30" data-testid={`card-animal-${id}`}>
      <CardHeader className="p-0">
        <div className="relative overflow-hidden">
          <div className="aspect-square w-full bg-gradient-subtle rounded-t-lg overflow-hidden border-b border-primary/10">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-subtle">
                <Heart className="w-12 h-12 text-primary/60 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
              </div>
            )}
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Inner shadow for depth */}
            <div className="absolute inset-0 shadow-inner pointer-events-none" />
          </div>

          {/* Status and Gender badges with enhanced styling */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge className={`${statusColors[status]} shadow-lg border border-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl`} variant="secondary">
              {status}
            </Badge>
          </div>
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className="bg-background/95 backdrop-blur-md border-primary/20 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:bg-background group-hover:border-primary/30 group-hover:shadow-xl">
              {gender === 'male' ? 'Dog' : 'Bitch'}
            </Badge>
          </div>

          {/* Floating action buttons that appear on hover */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 flex gap-3">
            <Button
              size="sm"
              className="bg-background/95 backdrop-blur-md text-foreground hover:bg-background shadow-xl border border-primary/20 hover:border-primary/40 hover:shadow-2xl transition-all duration-300"
              onClick={handleEdit}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              className="bg-background/95 backdrop-blur-md text-foreground hover:bg-background shadow-xl border border-primary/20 hover:border-primary/40 hover:shadow-2xl transition-all duration-300"
              onClick={handleFavorite}
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-xl text-foreground group-hover:text-primary transition-colors duration-300" data-testid={`text-animal-name-${id}`}>
              {name}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">{breed}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col space-y-1">
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Age</span>
              <span className="text-foreground font-semibold">{age} years</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Born</span>
              <span className="text-foreground font-semibold">{format(dateOfBirth, 'MMM yyyy')}</span>
            </div>
          </div>

          {lastMating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-2 transition-colors duration-300 group-hover:bg-muted/50">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Last mating: {format(lastMating, 'MMM dd, yyyy')}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleEdit}
              data-testid={`button-edit-${id}`}
              className="flex-1 hover:bg-primary/10 hover:border-primary border-primary/20 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Edit className="w-3 h-3 mr-2" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleShare}
              data-testid={`button-share-${id}`}
              className="hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleFavorite}
              data-testid={`button-favorite-${id}`}
              className="hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}