"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FrozenSemenBatch, getStatusLabel, getStatusColor } from "@/lib/mock-data/frozen-semen";
import { mockAnimals } from "@/data/mockData";
import { getClinicById } from "@/lib/mock-data/marketplace-listings";
import {
  User, Calendar, Building2, Package, FileText, Image,
  Beaker, Activity, TrendingUp, AlertCircle, Plus, Download
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FrozenSemenProfileTabsProps {
  batch: FrozenSemenBatch;
}

export function FrozenSemenProfileTabs({ batch }: FrozenSemenProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("profile");

  const sourceAnimal = mockAnimals.find(a => a.id === batch.sourceAnimalId);
  const clinic = getClinicById(batch.clinicId);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 bg-surface shadow-card">
        <TabsTrigger value="profile">
          <User className="w-4 h-4 mr-2" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="photos-docs">
          <Image className="w-4 h-4 mr-2" />
          Photos & Docs
        </TabsTrigger>
        <TabsTrigger value="semen-assessment">
          <Beaker className="w-4 h-4 mr-2" />
          Semen Assessment
        </TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile" className="space-y-6">
        {/* Batch Information */}
        <Card className="shadow-card bg-surface border-0">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">{batch.batchIdentifier}</h3>
                <p className="text-muted-foreground">Frozen Semen Batch</p>
              </div>
              <Badge className={cn(getStatusColor(batch.status), "shadow-card")}>
                {getStatusLabel(batch.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Source Animal</div>
                  <div className="font-semibold text-foreground">{batch.sourceAnimalName}</div>
                  <div className="text-sm text-muted-foreground">{batch.breed}</div>
                </div>

                {batch.registrationNumber && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Registration Number</div>
                    <div className="font-medium text-foreground">{batch.registrationNumber}</div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Collection Date</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                      {format(new Date(batch.collectionDate), 'MMMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Storage Location</div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-foreground">{batch.clinicName}</div>
                      {clinic && (
                        <div className="text-sm text-muted-foreground">{clinic.location}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Inventory</div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                      {batch.strawsRemaining} of {batch.numberOfStraws} straws remaining
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-surface-secondary rounded-full h-2 overflow-hidden mt-2">
                    <div
                      className={cn(
                        "h-full transition-all duration-300",
                        batch.strawsRemaining === 0
                          ? "bg-muted"
                          : batch.strawsRemaining <= 3
                          ? "bg-destructive"
                          : batch.strawsRemaining <= 5
                          ? "bg-chart-2"
                          : "bg-chart-3"
                      )}
                      style={{ width: `${(batch.strawsRemaining / batch.numberOfStraws) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {batch.storageNotes && (
              <div>
                <div className="text-sm text-muted-foreground mb-2">Storage Notes</div>
                <Alert className="border-primary/20 bg-surface-secondary">
                  <FileText className="h-4 w-4 text-primary" />
                  <AlertDescription className="ml-2 text-sm">
                    {batch.storageNotes}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage History */}
        {batch.usageHistory && batch.usageHistory.length > 0 && (
          <Card className="shadow-card bg-surface border-0">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Usage History</h3>
              <div className="space-y-3">
                {batch.usageHistory.map((usage) => (
                  <Card key={usage.id} className="shadow-card bg-surface-secondary border-0">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-medium text-foreground mb-1">{usage.bitchName}</div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(usage.date), 'MMM dd, yyyy')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {usage.strawsUsed} {usage.strawsUsed === 1 ? 'straw' : 'straws'}
                            </div>
                          </div>
                          {usage.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{usage.notes}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Photos & Docs Tab */}
      <TabsContent value="photos-docs" className="space-y-6">
        {/* Photos */}
        {batch.photos && batch.photos.length > 0 ? (
          batch.photos.map((category) => (
            <Card key={category.category} className="shadow-card bg-surface border-0">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">{category.category}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {category.photos.map((photo) => (
                    <div key={photo.id} className="space-y-2">
                      <div className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={photo.url}
                          alt={photo.caption || category.category}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      {photo.caption && (
                        <p className="text-xs text-muted-foreground">{photo.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="shadow-card bg-surface border-0">
            <CardContent className="p-12 text-center">
              <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Photos</h3>
              <p className="text-muted-foreground mb-4">No photos have been added yet</p>
              <Button className="bg-gradient-brand hover:opacity-90 shadow-card">
                <Plus className="w-4 h-4 mr-2" />
                Add Photos
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        <Card className="shadow-card bg-surface border-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Documents</h3>
            {batch.documents && batch.documents.length > 0 ? (
              <div className="space-y-2">
                {batch.documents.map((doc) => (
                  <Card key={doc.id} className="shadow-card bg-surface-secondary border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{doc.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {doc.type} • {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:border-primary shadow-card">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No documents have been added yet</p>
                <Button className="bg-gradient-brand hover:opacity-90 shadow-card">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Semen Assessment Tab */}
      <TabsContent value="semen-assessment" className="space-y-6">
        {batch.semenAssessment ? (
          <Card className="shadow-card bg-surface border-0">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Semen Quality Assessment</h3>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={cn(
                    "capitalize",
                    batch.semenAssessment.quality === 'excellent' ? 'bg-chart-3 text-white' :
                    batch.semenAssessment.quality === 'good' ? 'bg-chart-4 text-white' :
                    batch.semenAssessment.quality === 'fair' ? 'bg-chart-2 text-white' :
                    'bg-destructive text-white'
                  )}>
                    {batch.semenAssessment.quality} Quality
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Assessed on {format(new Date(batch.semenAssessment.date), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Volume</div>
                  <div className="text-3xl font-bold text-foreground">{batch.semenAssessment.volume}</div>
                  <div className="text-xs text-muted-foreground">mL</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">Concentration</div>
                  <div className="text-3xl font-bold text-foreground">{batch.semenAssessment.concentration}</div>
                  <div className="text-xs text-muted-foreground">million/mL</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">Motility</div>
                  <div className="flex items-baseline gap-1">
                    <div className="text-3xl font-bold text-foreground">{batch.semenAssessment.motility}</div>
                    <div className="text-xl font-semibold text-muted-foreground">%</div>
                  </div>
                  <div className="w-full bg-surface-secondary rounded-full h-2 overflow-hidden mt-2">
                    <div
                      className={cn(
                        "h-full transition-all duration-300",
                        batch.semenAssessment.motility >= 80 ? "bg-chart-3" :
                        batch.semenAssessment.motility >= 70 ? "bg-chart-4" :
                        batch.semenAssessment.motility >= 50 ? "bg-chart-2" :
                        "bg-destructive"
                      )}
                      style={{ width: `${batch.semenAssessment.motility}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">Morphology</div>
                  <div className="flex items-baseline gap-1">
                    <div className="text-3xl font-bold text-foreground">{batch.semenAssessment.morphology}</div>
                    <div className="text-xl font-semibold text-muted-foreground">%</div>
                  </div>
                  <div className="w-full bg-surface-secondary rounded-full h-2 overflow-hidden mt-2">
                    <div
                      className={cn(
                        "h-full transition-all duration-300",
                        batch.semenAssessment.morphology >= 85 ? "bg-chart-3" :
                        batch.semenAssessment.morphology >= 80 ? "bg-chart-4" :
                        batch.semenAssessment.morphology >= 60 ? "bg-chart-2" :
                        "bg-destructive"
                      )}
                      style={{ width: `${batch.semenAssessment.morphology}%` }}
                    />
                  </div>
                </div>
              </div>

              {batch.semenAssessment.notes && (
                <Alert className="border-primary/20 bg-surface-secondary">
                  <Activity className="h-4 w-4 text-primary" />
                  <AlertDescription className="ml-2">
                    <strong>Technician Notes:</strong>
                    <p className="mt-1 text-sm">{batch.semenAssessment.notes}</p>
                    {batch.semenAssessment.technician && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Assessed by: {batch.semenAssessment.technician}
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-card bg-surface border-0">
            <CardContent className="p-12 text-center">
              <Beaker className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Assessment</h3>
              <p className="text-muted-foreground mb-4">
                No semen quality assessment has been recorded for this batch
              </p>
              <Button className="bg-gradient-brand hover:opacity-90 shadow-card">
                <Plus className="w-4 h-4 mr-2" />
                Add Assessment
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}