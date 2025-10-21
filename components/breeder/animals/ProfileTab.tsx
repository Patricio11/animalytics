"use client";

import { Animal } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Calendar, MapPin, Award, Heart, FileText } from "lucide-react";
import { format } from "date-fns";

interface ProfileTabProps {
  animal: Animal;
}

export function ProfileTab({ animal }: ProfileTabProps) {
  const calculateAge = (dateOfBirth: string | Date) => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const age = animal.dateOfBirth ? calculateAge(animal.dateOfBirth) : 'Unknown';

  // Extract breed name from API structure
  const breedName = typeof animal.breed === 'string' ? animal.breed : animal.breed?.name || 'Unknown Breed';

  // Map sex to type for display
  const animalType = (animal as any).sex || (animal as any).type;

  // Map microchipNumber to microchipId for compatibility
  const microchipId = (animal as any).microchipNumber || (animal as any).microchipId;

  // Map bio to description for compatibility
  const description = (animal as any).bio || (animal as any).description;

  return (
    <div className="space-y-6">
      {/* Main Photos */}
      {/* {animal.photos && animal.photos.length > 0 && (
        <Card className="shadow-card border-primary/10">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
              {animal.photos.slice(0, 3).map((photo, idx) => (
                <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden group">
                  <img
                    src={photo}
                    alt={`${animal.name} - Photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )} */}

      {/* Basic Information */}
      <Card className="shadow-card border-primary/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Basic Information</CardTitle>
          <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:border-primary">
            <Edit className="w-3 h-3 mr-2" />
            Edit Profile
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Name</div>
              <div className="font-semibold text-foreground">{animal.name}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Sex</div>
              <Badge className="capitalize">{animalType === 'female' || animalType === 'bitch' ? 'Female' : 'Male'}</Badge>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Breed</div>
              <div className="font-semibold text-foreground">{breedName}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Date of Birth</div>
              <div className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {animal.dateOfBirth ? format(new Date(animal.dateOfBirth), 'MMM dd, yyyy') : 'Not specified'}
                {animal.dateOfBirth && <span className="text-sm text-muted-foreground">({age} years old)</span>}
              </div>
            </div>

            {animal.weight && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Weight</div>
                <div className="font-semibold text-foreground">{animal.weight} kg</div>
              </div>
            )}

            {animal.color && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Color</div>
                <div className="font-semibold text-foreground">{animal.color}</div>
              </div>
            )}

            {(animal as any).temperament && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Temperament</div>
                <div className="font-semibold text-foreground">{(animal as any).temperament}</div>
              </div>
            )}

            {(animal as any).healthStatus && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Health Status</div>
                <Badge variant="outline" className="capitalize">{(animal as any).healthStatus}</Badge>
              </div>
            )}
          </div>

          {description && (
            <div className="pt-4 border-t border-primary/10">
              <div className="text-sm text-muted-foreground mb-2">Bio</div>
              <p className="text-foreground">{description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registration & Identification */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-lg">Registration & Identification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {microchipId && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Microchip ID</div>
                <div className="font-semibold text-foreground font-mono">{microchipId}</div>
              </div>
            )}

            {animal.registrationNumber && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Registration Number</div>
                <div className="font-semibold text-foreground font-mono">{animal.registrationNumber}</div>
              </div>
            )}

            {(animal as any).height && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Height</div>
                <div className="font-semibold text-foreground">{(animal as any).height} cm</div>
              </div>
            )}

            {animal.markings && (
              <div className="md:col-span-2">
                <div className="text-sm text-muted-foreground mb-1">Markings</div>
                <div className="font-semibold text-foreground">{animal.markings}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Titles & Champion Status */}
      {((animal as any).titles && (animal as any).titles.length > 0) || (animal as any).isChampion ? (
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-chart-4" />
              Titles & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(animal as any).isChampion && (
              <div className="p-4 rounded-lg border border-primary/10 bg-chart-4/5">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-chart-4" />
                  <span className="font-semibold text-foreground">Champion</span>
                </div>
              </div>
            )}
            {(animal as any).titles && (animal as any).titles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(animal as any).titles.map((title: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-sm">
                    {title}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Health Records */}
      {(animal as any).healthRecords && (animal as any).healthRecords.length > 0 && (
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-chart-3" />
              Recent Health Records
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(animal as any).healthRecords.slice(0, 3).map((record: any) => (
              <div
                key={record.id}
                className="p-4 rounded-lg border border-primary/10 bg-background"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="font-semibold text-foreground capitalize">{record.recordType || record.type}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(record.recordDate || record.date), 'MMM dd, yyyy')}
                  </div>
                </div>
                <div className="text-sm text-foreground mb-1">{record.description}</div>
                {record.veterinarian && (
                  <div className="text-sm text-muted-foreground">By {record.veterinarian}</div>
                )}
                {record.notes && (
                  <div className="text-sm text-muted-foreground mt-2 italic">{record.notes}</div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Breeding Status */}
      {(animal as any).isBreedingActive !== undefined && (
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg">Breeding Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Breeding Active</span>
                <Badge variant={(animal as any).isBreedingActive ? "default" : "secondary"}>
                  {(animal as any).isBreedingActive ? 'Yes' : 'No'}
                </Badge>
              </div>
              {(animal as any).notes && (
                <div className="pt-3 border-t border-primary/10">
                  <div className="text-sm text-muted-foreground mb-2">Notes</div>
                  <p className="text-sm text-foreground">{(animal as any).notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}