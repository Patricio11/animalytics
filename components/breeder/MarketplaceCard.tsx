import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Phone, MessageCircle } from "lucide-react";

interface MarketplaceCardProps {
  id: string;
  name: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  price: number;
  location: string;
  imageUrl?: string;
  seller: string;
  description?: string;
  isFeatured?: boolean;
  onContact?: () => void;
  onFavorite?: () => void;
  onViewDetails?: () => void;
}

export function MarketplaceCard({
  id,
  name,
  breed,
  age,
  gender,
  price,
  location,
  imageUrl,
  seller,
  description,
  isFeatured = false,
  onContact,
  onFavorite,
  onViewDetails
}: MarketplaceCardProps) {

  const handleContact = () => {
    console.log(`Contact seller for: ${name}`);
    onContact?.();
  };

  const handleFavorite = () => {
    console.log(`Favorite listing: ${name}`);
    onFavorite?.();
  };

  const handleViewDetails = () => {
    console.log(`View details for: ${name}`);
    onViewDetails?.();
  };

  return (
    <Card className="hover-elevate" data-testid={`card-marketplace-${id}`}>
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
            {isFeatured && (
              <Badge className="bg-primary text-primary-foreground">
                Featured
              </Badge>
            )}
          </div>
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
              {gender === 'male' ? 'Male' : 'Female'}
            </Badge>
          </div>
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-background/90 text-foreground backdrop-blur-sm font-bold">
              ${price.toLocaleString()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground" data-testid={`text-listing-name-${id}`}>
              {name}
            </h3>
            <p className="text-sm text-muted-foreground">{breed} • {age} years old</p>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
          </div>

          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          )}

          <div className="text-xs text-muted-foreground">
            Seller: <span className="text-foreground">{seller}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={handleContact}
              data-testid={`button-contact-${id}`}
              className="flex-1"
            >
              <Phone className="w-3 h-3 mr-1" />
              Contact
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleViewDetails}
              data-testid={`button-view-details-${id}`}
            >
              <MessageCircle className="w-3 h-3" />
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