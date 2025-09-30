"use client";

import { use } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft, Heart, Share2, Flag, Eye, MapPin, Phone, Mail, Calendar,
  Star, Award, Shield, Building2
} from "lucide-react";
import { mockMarketplaceListings, getClinicById, getCategoryLabel } from "@/lib/mock-data/marketplace-listings";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ListingDetailPage({ params }: ListingDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const listing = mockMarketplaceListings.find(l => l.id === id);

  if (!listing) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
        <Card className="shadow-card bg-surface border-0 max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-6xl">🔍</div>
            <h2 className="text-xl font-bold text-foreground">Listing Not Found</h2>
            <p className="text-muted-foreground">The listing you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Button
              onClick={() => router.push('/marketplace')}
              className="bg-gradient-brand hover:opacity-90 shadow-card"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categoryConfig = {
    'dog-for-sale': { color: 'bg-chart-1 text-white', icon: '🐕' },
    'pups-for-sale': { color: 'bg-chart-3 text-white', icon: '🐶' },
    'reproductive-services': { color: 'bg-chart-4 text-white', icon: '💉' },
    'frozen-semen': { color: 'bg-chart-2 text-white', icon: '❄️' },
    'stud-dog': { color: 'bg-primary text-white', icon: '👑' },
  };

  const config = categoryConfig[listing.category];
  const clinic = listing.clinicId ? getClinicById(listing.clinicId) : undefined;

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push('/marketplace')}
          className="hover:bg-primary/10 hover:border-primary shadow-card"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-0">
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  {listing.featured && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-brand text-white shadow-card">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>
                {listing.images.length > 1 && (
                  <div className="p-4 grid grid-cols-4 gap-2">
                    {listing.images.slice(1).map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img src={image} alt={`Additional ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Listing Details */}
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Badge className={cn(config.color, "shadow-card")}>
                      {config.icon} {getCategoryLabel(listing.category)}
                    </Badge>
                  </div>

                  <h1 className="text-3xl font-bold text-foreground">{listing.title}</h1>

                  {listing.price && (
                    <div className="text-4xl font-bold text-primary">
                      ${listing.price.toLocaleString()} {listing.currency}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Animal Details */}
                {listing.breed && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Animal Details</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Breed</div>
                        <div className="font-medium text-foreground">{listing.breed}</div>
                      </div>
                      {listing.sex && (
                        <div>
                          <div className="text-sm text-muted-foreground">Sex</div>
                          <div className="font-medium text-foreground capitalize">{listing.sex}</div>
                        </div>
                      )}
                      {listing.age && (
                        <div>
                          <div className="text-sm text-muted-foreground">Age</div>
                          <div className="font-medium text-foreground">{listing.age}</div>
                        </div>
                      )}
                      {listing.color && (
                        <div>
                          <div className="text-sm text-muted-foreground">Color</div>
                          <div className="font-medium text-foreground">{listing.color}</div>
                        </div>
                      )}
                      {listing.registrationNumber && (
                        <div className="col-span-2">
                          <div className="text-sm text-muted-foreground">Registration</div>
                          <div className="font-medium text-foreground">{listing.registrationNumber}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Health Badges */}
                {(listing.healthCertified || listing.championLines) && (
                  <>
                    <Separator />
                    <div className="flex gap-2">
                      {listing.healthCertified && (
                        <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/20">
                          <Shield className="w-4 h-4 mr-2" />
                          Health Certified
                        </Badge>
                      )}
                      {listing.championLines && (
                        <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                          <Award className="w-4 h-4 mr-2" />
                          Champion Lines
                        </Badge>
                      )}
                    </div>
                  </>
                )}

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{listing.description}</p>
                </div>

                {/* Clinic Information */}
                {clinic && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">Clinic Information</h3>
                      <Card className="shadow-card bg-surface-secondary border-0">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-brand flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-foreground">{clinic.name}</div>
                              <div className="text-sm text-muted-foreground">{clinic.location}</div>
                              <div className="text-sm text-muted-foreground">{clinic.phone}</div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {clinic.services.map((service) => (
                              <Badge key={service} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Contact Seller</h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div className="font-medium text-foreground">{listing.contact.location}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium text-foreground">{listing.contact.phone}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium text-foreground">{listing.contact.email}</div>
                    </div>
                  </div>
                </div>

                {listing.contact.availabilityNotes && (
                  <Alert className="border-primary/20 bg-surface-secondary">
                    <AlertDescription className="text-sm">
                      <strong>Availability:</strong> {listing.contact.availabilityNotes}
                    </AlertDescription>
                  </Alert>
                )}

                <Button className="w-full bg-gradient-brand hover:opacity-90 shadow-card">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 hover:bg-primary/10 hover:border-primary shadow-card">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="flex-1 hover:bg-primary/10 hover:border-primary shadow-card">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="flex-1 hover:bg-primary/10 hover:border-primary shadow-card">
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Breeder Info */}
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">About the Breeder</h3>

                <div className="flex items-center gap-3">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={listing.breederAvatar} alt={listing.breederName} />
                    <AvatarFallback>{listing.breederName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{listing.breederName}</div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-chart-2 fill-current" />
                      <span className="font-medium text-foreground">{listing.breederReputation}</span>
                      <span className="text-muted-foreground">rating</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full hover:bg-primary/10 hover:border-primary shadow-card"
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="shadow-card bg-surface border-0">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span>Views</span>
                  </div>
                  <span className="font-medium text-foreground">{listing.views}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    <span>Interested</span>
                  </div>
                  <span className="font-medium text-foreground">{listing.interested}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Posted</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {format(new Date(listing.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}