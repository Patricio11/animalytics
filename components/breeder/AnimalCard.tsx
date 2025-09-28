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
    <Card className="hover-elevate" data-testid={`card-animal-${id}`}>
      <CardHeader className="p-0">
        <div className="relative">
          <div className="aspect-square w-full bg-muted rounded-t-lg overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Heart className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge className={statusColors[status]} variant="secondary">
              {status}
            </Badge>
          </div>
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
              {gender === 'male' ? 'Dog' : 'Bitch'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground" data-testid={`text-animal-name-${id}`}>
              {name}
            </h3>
            <p className="text-sm text-muted-foreground">{breed}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Age:</span>
              <span className="ml-1 text-foreground">{age} years</span>
            </div>
            <div>
              <span className="text-muted-foreground">DOB:</span>
              <span className="ml-1 text-foreground">{format(dateOfBirth, 'MMM yyyy')}</span>
            </div>
          </div>

          {lastMating && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Last mating: {format(lastMating, 'MMM dd, yyyy')}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleEdit}
              data-testid={`button-edit-${id}`}
              className="flex-1"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleShare}
              data-testid={`button-share-${id}`}
            >
              <Share2 className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleFavorite}
              data-testid={`button-favorite-${id}`}
            >
              <Heart className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}