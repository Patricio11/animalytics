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
  const calculateAge = (dateOfBirth: string) => {
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
              <div className="text-sm text-muted-foreground mb-1">Type</div>
              <Badge className="capitalize">{animal.type === 'bitch' ? 'Female' : 'Male'}</Badge>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Breed</div>
              <div className="font-semibold text-foreground">{animal.breed}</div>
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

            {animal.location && (
              <div className="md:col-span-2">
                <div className="text-sm text-muted-foreground mb-1">Location</div>
                <div className="font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  {animal.location}
                </div>
              </div>
            )}
          </div>

          {animal.description && (
            <div className="pt-4 border-t border-primary/10">
              <div className="text-sm text-muted-foreground mb-2">Description</div>
              <p className="text-foreground">{animal.description}</p>
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
            {animal.microchipId && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Microchip ID</div>
                <div className="font-semibold text-foreground font-mono">{animal.microchipId}</div>
              </div>
            )}

            {animal.registrationNumber && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Registration Number</div>
                <div className="font-semibold text-foreground font-mono">{animal.registrationNumber}</div>
              </div>
            )}

            {animal.bloodline && (
              <div className="md:col-span-2">
                <div className="text-sm text-muted-foreground mb-1">Bloodline</div>
                <div className="font-semibold text-foreground">{animal.bloodline}</div>
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

      {/* Achievements */}
      {animal.achievements && animal.achievements.length > 0 && (
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-chart-4" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {animal.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="p-4 rounded-lg border border-primary/10 bg-background hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-foreground mb-1">{achievement.title}</div>
                    <div className="text-sm text-muted-foreground mb-2">{achievement.organization}</div>
                    {achievement.description && (
                      <p className="text-sm text-foreground">{achievement.description}</p>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(achievement.date), 'MMM yyyy')}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Health Records */}
      {animal.healthRecords && animal.healthRecords.length > 0 && (
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-chart-3" />
              Recent Health Records
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {animal.healthRecords.slice(0, 3).map((record) => (
              <div
                key={record.id}
                className="p-4 rounded-lg border border-primary/10 bg-background"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="font-semibold text-foreground capitalize">{record.type}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(record.date), 'MMM dd, yyyy')}
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

      {/* Owner Information */}
      {animal.owner && (
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg">Owner Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {animal.owner.avatar && (
                <img
                  src={animal.owner.avatar}
                  alt={animal.owner.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div>
                <div className="font-semibold text-foreground">{animal.owner.name}</div>
                {animal.owner.email && (
                  <div className="text-sm text-muted-foreground">{animal.owner.email}</div>
                )}
                {animal.owner.phone && (
                  <div className="text-sm text-muted-foreground">{animal.owner.phone}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}