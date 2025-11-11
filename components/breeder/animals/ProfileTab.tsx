"use client";

import { useState } from "react";
import { Animal } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Calendar, Award, Heart, Syringe, Stethoscope, Pill, AlertTriangle, Activity, ChevronRight, AlertCircle, Users, Baby, ArrowRight } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { HealthRecordDetailDialog } from "./HealthRecordDetailDialog";
import { PedigreeTab } from "./PedigreeTab";

interface ProfileTabProps {
  animal: Animal;
  animalId: string;
  onEdit?: () => void;
}

export function ProfileTab({ animal, animalId, onEdit }: ProfileTabProps) {
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const getRecordIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'vaccination':
        return <Syringe className="w-4 h-4" />;
      case 'checkup':
        return <Stethoscope className="w-4 h-4" />;
      case 'medication':
        return <Pill className="w-4 h-4" />;
      case 'illness':
        return <AlertTriangle className="w-4 h-4" />;
      case 'injury':
        return <Heart className="w-4 h-4" />;
      case 'surgery':
        return <Activity className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  const getRecordColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'vaccination':
        return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-300';
      case 'checkup':
        return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/50 text-green-700 dark:text-green-300';
      case 'medication':
        return 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-950/50 text-purple-700 dark:text-purple-300';
      case 'illness':
        return 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-950/50 text-orange-700 dark:text-orange-300';
      case 'injury':
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-700 dark:text-red-300';
      case 'surgery':
        return 'bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800 hover:bg-pink-100 dark:hover:bg-pink-950/50 text-pink-700 dark:text-pink-300';
      default:
        return 'bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-950/50 text-gray-700 dark:text-gray-300';
    }
  };

  const handleRecordClick = (record: any) => {
    setSelectedRecord(record);
    setIsDialogOpen(true);
  };

  const age = animal.dateOfBirth ? calculateAge(animal.dateOfBirth) : 'Unknown';

  // Extract breed name from API structure
  const breedName = typeof animal.breed === 'string' ? animal.breed : (animal.breed as any)?.name || 'Unknown Breed';

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
          <Button 
            variant="outline" 
            size="sm" 
            className="hover:bg-primary/10 hover:border-primary"
            onClick={onEdit}
          >
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

      {/* Full Pedigree Section */}
      <div className="border-t border-primary/10 pt-6">
        <PedigreeTab animalId={animalId} animalName={animal.name} />
      </div>

      {/* Litters Information - Only for females */}
      {((animal as any).sex === 'female' || (animal as any).sex === 'bitch') && (animal as any).litters && (animal as any).litters.length > 0 && (
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Baby className="w-5 h-5 text-chart-2" />
              Litters & Breeding History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-3 border-b border-primary/10">
              <div className="text-center p-3 rounded-lg bg-background border border-primary/10">
                <div className="text-2xl font-bold text-foreground">
                  {(animal as any).litters.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Total Litters</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-background border border-primary/10">
                <div className="text-2xl font-bold text-foreground">
                  {(animal as any).litters.reduce((sum: number, litter: any) =>
                    sum + (litter.puppyCount || 0), 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Total Puppies</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-background border border-primary/10">
                <div className="text-2xl font-bold text-foreground">
                  {Math.round((animal as any).litters.reduce((sum: number, litter: any) =>
                    sum + (litter.puppyCount || 0), 0) / (animal as any).litters.length) || 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Avg Litter Size</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-background border border-primary/10">
                <div className="text-2xl font-bold text-foreground">
                  {(animal as any).litters.filter((l: any) => l.status === 'whelped').length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Whelped</div>
              </div>
            </div>

            {/* Recent Litters */}
            <div className="space-y-3">
              {(animal as any).litters.slice(0, 3).map((litter: any) => {
                const isExpected = litter.status === 'expected';
                const whelpingDate = litter.actualWhelpingDate || litter.expectedWhelpingDate;
                const daysUntilWhelping = whelpingDate ? differenceInDays(new Date(whelpingDate), new Date()) : null;

                return (
                  <div
                    key={litter.id}
                    className="p-4 rounded-lg border border-primary/10 bg-background hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={isExpected ? "default" : "secondary"}>
                            {litter.status}
                          </Badge>
                          {litter.hasComplications && (
                            <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200">
                              Complications
                            </Badge>
                          )}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Sire: <span className="font-medium text-foreground">{litter.sireName || 'Unknown'}</span>
                        </div>

                        <div className="text-sm text-muted-foreground mt-1">
                          Mating: {format(new Date(litter.matingDate), 'MMM dd, yyyy')}
                        </div>

                        {whelpingDate && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {isExpected ? 'Expected' : 'Whelped'}: {format(new Date(whelpingDate), 'MMM dd, yyyy')}
                            {daysUntilWhelping !== null && isExpected && (
                              <span className="ml-1 font-medium">
                                ({daysUntilWhelping > 0 ? `${daysUntilWhelping} days` : 'Due now'})
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {litter.puppyCount > 0 && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">
                            {litter.puppyCount}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {litter.maleCount || 0}M / {litter.femaleCount || 0}F
                          </div>
                          {litter.survivingPuppies !== undefined && litter.survivingPuppies !== litter.puppyCount && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {litter.survivingPuppies} surviving
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {litter.notes && (
                      <div className="text-sm text-muted-foreground italic mt-2 pt-2 border-t border-primary/10">
                        {litter.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {(animal as any).litters.length > 3 && (
              <div className="text-center pt-2">
                <div className="text-sm text-muted-foreground">
                  + {(animal as any).litters.length - 3} more litter{(animal as any).litters.length - 3 !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
            {(animal as any).healthRecords.slice(0, 3).map((record: any) => {
              const recordType = record.recordType || record.type;
              const recordDate = record.recordDate || record.date;
              const isVaccination = recordType?.toLowerCase() === 'vaccination';
              const nextDueDate = record.nextDueDate ? new Date(record.nextDueDate) : null;
              const isOverdue = nextDueDate && nextDueDate < new Date();
              const daysUntilDue = nextDueDate ? differenceInDays(nextDueDate, new Date()) : null;

              return (
                <div
                  key={record.id}
                  onClick={() => handleRecordClick(record)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${getRecordColor(recordType)} group`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5">
                        {getRecordIcon(recordType)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold capitalize">{recordType}</div>
                          <div className="text-sm opacity-70">
                            {format(new Date(recordDate), 'MMM dd, yyyy')}
                          </div>
                        </div>

                        {/* Vaccination specific info */}
                        {isVaccination && record.vaccinationType && (
                          <div className="text-sm">
                            <span className="opacity-70">Type:</span> <span className="font-medium capitalize">{record.vaccinationType}</span>
                          </div>
                        )}

                        {isVaccination && nextDueDate && (
                          <div className="flex items-center gap-2">
                            {isOverdue ? (
                              <div className="flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Overdue: {format(nextDueDate, 'MMM dd, yyyy')}</span>
                              </div>
                            ) : (
                              <div className="text-sm opacity-70">
                                Next due: {format(nextDueDate, 'MMM dd, yyyy')}
                                {daysUntilDue !== null && daysUntilDue <= 30 && (
                                  <span className="ml-1 font-medium">({daysUntilDue} days)</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {record.description && (
                          <div className="text-sm opacity-80">{record.description}</div>
                        )}

                        {(record.veterinarianName || record.veterinarian) && (
                          <div className="text-sm opacity-70">
                            By {record.veterinarianName || record.veterinarian}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Health Record Detail Dialog */}
      <HealthRecordDetailDialog
        record={selectedRecord}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

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