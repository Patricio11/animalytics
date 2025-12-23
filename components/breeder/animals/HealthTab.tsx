"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart,
  Syringe,
  Calendar,
  FileText,
  Plus,
  Download,
  Trash2,
  AlertCircle,
  Pill,
  Activity,
  Stethoscope,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { format, formatDistanceToNow, isBefore, addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useRegionalSettings } from "@/lib/contexts/regional-settings-context";
import { AddHealthRecordDialog } from "@/components/breeder/animals/AddHealthRecordDialog";
import { ProgesteroneHealthCard } from "@/components/breeder/animals/ProgesteroneHealthCard";
import { cn } from "@/lib/utils";

interface HealthTabProps {
  animalId: string;
  animalName: string;
  animalSex?: 'male' | 'female';
  animalDateOfBirth?: string;
}

export function HealthTab({ animalId, animalName, animalSex, animalDateOfBirth }: HealthTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings } = useRegionalSettings();
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [defaultRecordType, setDefaultRecordType] = useState<string | undefined>(undefined);

  // Helper to open Add Record dialog with context-aware default type
  const handleAddRecord = () => {
    const typeMap: Record<string, string> = {
      vaccinations: "vaccination",
      medications: "medication",
      certificates: "vaccination", // Default to vaccination for certificates
      appointments: "checkup",
    };
    setDefaultRecordType(typeMap[activeTab]);
    setShowAddRecord(true);
  };

  // Fetch health records
  const { data: healthData, isLoading } = useQuery({
    queryKey: ["health-records", animalId],
    queryFn: async () => {
      const response = await fetch(`/api/animals/${animalId}/health`);
      if (!response.ok) throw new Error("Failed to fetch health records");
      return response.json();
    },
  });

  const records = healthData?.records || [];
  const vaccinations = records.filter((r: any) => r.recordType === "vaccination");
  const medications = records.filter((r: any) => r.recordType === "medication");
  const checkups = records.filter((r: any) => r.recordType === "checkup");
  const certificates = records.filter((r: any) => r.certificateUrl);

  // Calculate health stats
  const upcomingVaccinations = vaccinations.filter((v: any) => 
    v.nextDueDate && isBefore(new Date(), new Date(v.nextDueDate))
  );
  const overdueVaccinations = vaccinations.filter((v: any) => 
    v.nextDueDate && isBefore(new Date(v.nextDueDate), new Date())
  );

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (recordId: string) => {
      const response = await fetch(`/api/animals/${animalId}/health/${recordId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete record");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-records", animalId] });
      toast({
        title: "Record Deleted",
        description: "Health record has been deleted successfully",
      });
    },
  });

  const getRecordIcon = (type: string) => {
    switch (type) {
      case "vaccination": return Syringe;
      case "checkup": return Stethoscope;
      case "medication": return Pill;
      case "illness": return AlertTriangle;
      case "injury": return Heart;
      case "surgery": return Activity;
      default: return FileText;
    }
  };

  const getRecordColor = (type: string) => {
    switch (type) {
      case "vaccination": return "text-blue-500 bg-blue-500/10";
      case "checkup": return "text-green-500 bg-green-500/10";
      case "medication": return "text-purple-500 bg-purple-500/10";
      case "illness": return "text-orange-500 bg-orange-500/10";
      case "injury": return "text-red-500 bg-red-500/10";
      case "surgery": return "text-pink-500 bg-pink-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  const formatCurrency = (cents: number | null, currency: string) => {
    if (!cents) return '-';
    const amount = cents / 100;
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card border-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Records</p>
                <p className="text-3xl font-bold text-foreground">{records.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Vaccinations</p>
                <p className="text-3xl font-bold text-foreground">{vaccinations.length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <Syringe className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-foreground">{upcomingVaccinations.length}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Overdue</p>
                <p className="text-3xl font-bold text-red-500">{overdueVaccinations.length}</p>
              </div>
              <div className="p-3 rounded-full bg-red-500/10">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {overdueVaccinations.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {overdueVaccinations.length} vaccination{overdueVaccinations.length > 1 ? 's are' : ' is'} overdue. 
            Please schedule an appointment with your veterinarian.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid grid-cols-6 w-full max-w-3xl gap-2 bg-muted/50 p-2">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-gradient-brand data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="vaccinations"
              className="data-[state=active]:bg-gradient-brand data-[state=active]:text-white"
            >
              Vaccinations
            </TabsTrigger>
            <TabsTrigger 
              value="medications"
              className="data-[state=active]:bg-gradient-brand data-[state=active]:text-white"
            >
              Medications
            </TabsTrigger>
            <TabsTrigger 
              value="certificates"
              className="data-[state=active]:bg-gradient-brand data-[state=active]:text-white"
            >
              Certificates
            </TabsTrigger>
            <TabsTrigger 
              value="appointments"
              className="data-[state=active]:bg-gradient-brand data-[state=active]:text-white"
            >
              Appointments
            </TabsTrigger>
            <TabsTrigger 
              value="veterinary"
              className="data-[state=active]:bg-gradient-brand data-[state=active]:text-white"
            >
              Veterinary
            </TabsTrigger>
          </TabsList>
          
          <Button onClick={handleAddRecord} className="ml-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Record
          </Button>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Progesterone Tracking Card - Female Animals Only */}
          {animalSex === 'female' && (
            <ProgesteroneHealthCard 
              animalId={animalId}
              animalName={animalName}
            />
          )}

          <Card className="shadow-card border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent Health Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No health records yet</p>
                  <Button onClick={() => setShowAddRecord(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Record
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {records.slice(0, 10).map((record: any) => {
                    const Icon = getRecordIcon(record.recordType);
                    return (
                      <div
                        key={record.id}
                        className="flex items-start gap-4 p-4 rounded-lg border border-primary/10 hover:bg-primary/5 transition-colors"
                      >
                        <div className={cn("p-3 rounded-full", getRecordColor(record.recordType))}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <h4 className="font-semibold text-foreground capitalize">
                                {record.recordType}
                                {record.vaccinationType && ` - ${record.vaccinationType}`}
                                {record.medicationName && ` - ${record.medicationName}`}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(record.recordDate), "MMM dd, yyyy")}
                              </p>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {record.recordType}
                            </Badge>
                          </div>
                          
                          {record.veterinarianName && (
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>
                                Dr. {record.veterinarianName}
                                {record.clinicName && ` • ${record.clinicName}`}
                              </p>
                              {record.veterinarianEmail && (
                                <p className="text-xs">
                                  📧 {record.veterinarianEmail}
                                  {record.veterinarianPhone && ` • 📞 ${record.veterinarianPhone}`}
                                </p>
                              )}
                            </div>
                          )}
                          
                          {record.diagnosis && (
                            <p className="text-sm text-foreground mt-2">{record.diagnosis}</p>
                          )}
                          
                          {record.nextDueDate && (
                            <div className="flex items-center gap-2 mt-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Next due: {format(new Date(record.nextDueDate), "MMM dd, yyyy")}
                              </span>
                            </div>
                          )}
                          
                          {record.cost && (
                            <p className="text-sm font-medium text-foreground mt-2">
                              Cost: {formatCurrency(record.cost, record.currency || settings.currency)}
                            </p>
                          )}
                          
                          {record.certificateUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              onClick={() => window.open(record.certificateUrl, '_blank')}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              View Certificate
                            </Button>
                          )}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(record.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vaccinations Tab */}
        <TabsContent value="vaccinations" className="space-y-6">
          <Card className="shadow-card border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-green-500" />
                Vaccination History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vaccinations.length === 0 ? (
                <div className="text-center py-12">
                  <Syringe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No vaccination records</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vaccinations.map((vax: any) => (
                    <div
                      key={vax.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-primary/10"
                    >
                      <div className="p-3 rounded-full bg-green-500/10">
                        <Syringe className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{vax.vaccinationType}</h4>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(vax.recordDate), "MMM dd, yyyy")}
                            </p>
                          </div>
                          {vax.nextDueDate && (
                            <Badge
                              variant={isBefore(new Date(vax.nextDueDate), new Date()) ? "destructive" : "outline"}
                            >
                              {isBefore(new Date(vax.nextDueDate), new Date()) ? "Overdue" : "Upcoming"}
                            </Badge>
                          )}
                        </div>
                        
                        {vax.nextDueDate && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            Next due: {format(new Date(vax.nextDueDate), "MMM dd, yyyy")}
                            <span className="text-xs">
                              ({formatDistanceToNow(new Date(vax.nextDueDate), { addSuffix: true })})
                            </span>
                          </div>
                        )}
                        
                        {vax.certificateUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() => window.open(vax.certificateUrl, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Certificate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-6">
          <Card className="shadow-card border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-purple-500" />
                Medication History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {medications.length === 0 ? (
                <div className="text-center py-12">
                  <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No medication records</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {medications.map((med: any) => (
                    <div
                      key={med.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-primary/10"
                    >
                      <div className="p-3 rounded-full bg-purple-500/10">
                        <Pill className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{med.medicationName}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {med.dosage} • {med.frequency}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Start: {format(new Date(med.startDate), "MMM dd, yyyy")}</span>
                          {med.endDate && (
                            <span>End: {format(new Date(med.endDate), "MMM dd, yyyy")}</span>
                          )}
                        </div>
                        {med.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{med.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Certificates Tab */}
        <TabsContent value="certificates" className="space-y-6">
          <Card className="shadow-card border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Health Certificates & Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No health certificates uploaded</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload vaccination certificates, lab results, or medical documents
                  </p>
                  <Button onClick={() => setShowAddRecord(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Health Record with Certificate
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certificates.map((cert: any) => {
                    const Icon = getRecordIcon(cert.recordType);
                    return (
                      <Card key={cert.id} className="border-primary/10 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className={cn("p-2 rounded-lg", getRecordColor(cert.recordType))}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm capitalize mb-1">
                                {cert.recordType}
                                {cert.vaccinationType && ` - ${cert.vaccinationType}`}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(cert.recordDate), "MMM dd, yyyy")}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs capitalize">
                              {cert.recordType}
                            </Badge>
                          </div>

                          {cert.veterinarianName && (
                            <div className="text-xs text-muted-foreground mb-2 space-y-1">
                              <p>
                                Dr. {cert.veterinarianName}
                                {cert.clinicName && ` • ${cert.clinicName}`}
                              </p>
                              {cert.veterinarianEmail && (
                                <p className="text-xs">
                                  📧 {cert.veterinarianEmail}
                                  {cert.veterinarianPhone && ` • 📞 ${cert.veterinarianPhone}`}
                                </p>
                              )}
                            </div>
                          )}

                          {cert.cost && (
                            <p className="text-sm font-medium text-foreground mb-3">
                              Cost: {formatCurrency(cert.cost, cert.currency || settings.currency)}
                            </p>
                          )}

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => window.open(cert.certificateUrl, '_blank')}
                            >
                              <Download className="w-3 h-3 mr-2" />
                              View Certificate
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMutation.mutate(cert.id)}
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <Card className="shadow-card border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Appointment scheduling coming soon!</p>
                <p className="text-sm text-muted-foreground">
                  You'll be able to schedule and manage veterinary appointments here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Veterinary Tab */}
        <TabsContent value="veterinary" className="space-y-6">
          <Card className="shadow-card border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Veterinary Clinics & Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Veterinary management coming soon!</p>
                <p className="text-sm text-muted-foreground">
                  Save your preferred veterinary clinics and contacts for quick access.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Health Record Dialog */}
      <AddHealthRecordDialog
        open={showAddRecord}
        onOpenChange={setShowAddRecord}
        animalId={animalId}
        animalName={animalName}
        animalSex={animalSex}
        animalDateOfBirth={animalDateOfBirth}
        defaultRecordType={defaultRecordType}
      />
    </div>
  );
}
