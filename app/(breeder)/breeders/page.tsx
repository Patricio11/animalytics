"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, MapPin, Phone, Mail, Star, Search, Filter, Plus, MessageCircle } from "lucide-react";

export default function Breeders() {
  // todo: remove mock functionality
  const mockBreeders = [
    {
      id: "1",
      name: "Sarah Johnson",
      kennel: "Golden Dreams Kennels",
      location: "Melbourne, VIC",
      specialties: ["Golden Retriever", "Labrador"],
      rating: 4.8,
      reviews: 24,
      phone: "+61 3 9123 4567",
      email: "sarah@goldendreams.com.au",
      yearsExperience: 15,
      totalLitters: 45,
      avatar: "",
      verified: true,
      description: "Specializing in premium Golden Retrievers with champion bloodlines. Health testing and genetic screening for all breeding stock."
    },
    {
      id: "2",
      name: "Michael Chen",
      kennel: "Elite Guard Dogs",
      location: "Sydney, NSW",
      specialties: ["German Shepherd", "Belgian Malinois"],
      rating: 4.9,
      reviews: 31,
      phone: "+61 2 8234 5678",
      email: "mike@eliteguard.com.au",
      yearsExperience: 12,
      totalLitters: 28,
      avatar: "",
      verified: true,
      description: "Professional breeding of working dogs with emphasis on temperament, health, and working ability. Military and police dog bloodlines."
    },
    {
      id: "3",
      name: "Emma Thompson",
      kennel: "Agility Stars",
      location: "Brisbane, QLD",
      specialties: ["Border Collie", "Australian Shepherd"],
      rating: 4.7,
      reviews: 18,
      phone: "+61 7 3456 7890",
      email: "emma@agilitystars.com.au",
      yearsExperience: 8,
      totalLitters: 22,
      avatar: "",
      verified: false,
      description: "Focused on breeding high-performance working dogs for agility and herding competitions. All dogs health tested and titled."
    },
    {
      id: "4",
      name: "Robert Wilson",
      kennel: "Premier Kennels",
      location: "Perth, WA",
      specialties: ["Labrador", "Retriever Mix"],
      rating: 4.6,
      reviews: 12,
      phone: "+61 8 9567 8901",
      email: "rob@premierkennels.com.au",
      yearsExperience: 20,
      totalLitters: 67,
      avatar: "",
      verified: true,
      description: "Over 20 years of experience breeding quality Labradors for both show and companion homes. Focus on health, temperament, and conformation."
    }
  ];

  const handleContact = (breeder: typeof mockBreeders[0]) => {
    console.log(`Contact breeder: ${breeder.name}`);
  };

  const handleMessage = (breeder: typeof mockBreeders[0]) => {
    console.log(`Send message to: ${breeder.name}`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Breeder Network</h1>
          <p className="text-muted-foreground">Connect with professional breeders and expand your network</p>
        </div>
        <Button data-testid="button-join-network">
          <Plus className="w-4 h-4 mr-2" />
          Join Network
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search breeders, kennels, or breeds..."
                className="pl-10"
                data-testid="input-search-breeders"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Location"
                className="pl-10 w-full sm:w-[160px]"
                data-testid="input-location"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-[140px]" data-testid="select-breed">
                <SelectValue placeholder="Breed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Breeds</SelectItem>
                <SelectItem value="golden-retriever">Golden Retriever</SelectItem>
                <SelectItem value="german-shepherd">German Shepherd</SelectItem>
                <SelectItem value="labrador">Labrador</SelectItem>
                <SelectItem value="border-collie">Border Collie</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full sm:w-[120px]" data-testid="select-rating">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="4.5+">4.5+ Stars</SelectItem>
                <SelectItem value="4.0+">4.0+ Stars</SelectItem>
                <SelectItem value="3.5+">3.5+ Stars</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="button-advanced-filter">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Breeders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockBreeders.map((breeder) => (
          <Card key={breeder.id} className="hover-elevate" data-testid={`card-breeder-${breeder.id}`}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={breeder.avatar} alt={breeder.name} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {breeder.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {breeder.name}
                        {breeder.verified && (
                          <Badge variant="outline" className="text-xs bg-chart-3/10 text-chart-3 border-chart-3">
                            Verified
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground font-medium">{breeder.kennel}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-chart-4 fill-current" />
                      <span className="text-sm font-medium">{breeder.rating}</span>
                      <span className="text-xs text-muted-foreground">({breeder.reviews})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{breeder.location}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {breeder.description}
              </p>

              <div className="flex flex-wrap gap-1">
                {breeder.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Experience:</span>
                  <div className="font-medium text-foreground">{breeder.yearsExperience} years</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Litters:</span>
                  <div className="font-medium text-foreground">{breeder.totalLitters}</div>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{breeder.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{breeder.email}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  onClick={() => handleContact(breeder)}
                  data-testid={`button-contact-${breeder.id}`}
                  className="flex-1"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Contact
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMessage(breeder)}
                  data-testid={`button-message-${breeder.id}`}
                  className="flex-1"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State for No Results */}
      {mockBreeders.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No breeders found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {/* Pagination would go here in a real app */}
      <div className="flex justify-center pt-6">
        <Button variant="outline" data-testid="button-load-more">
          Load More Breeders
        </Button>
      </div>
    </div>
  );
}