"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Syringe,
  Stethoscope,
  Pill,
  AlertTriangle,
  Heart,
  Activity,
  Calendar,
  User,
  Building,
  FileText,
  DollarSign,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HealthRecordDetailDialogProps {
  record: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getRecordIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'vaccination':
      return <Syringe className="w-5 h-5" />;
    case 'checkup':
      return <Stethoscope className="w-5 h-5" />;
    case 'medication':
      return <Pill className="w-5 h-5" />;
    case 'illness':
      return <AlertTriangle className="w-5 h-5" />;
    case 'injury':
      return <Heart className="w-5 h-5" />;
    case 'surgery':
      return <Activity className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
};

const getRecordColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'vaccination':
      return 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
    case 'checkup':
      return 'text-green-500 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
    case 'medication':
      return 'text-purple-500 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800';
    case 'illness':
      return 'text-orange-500 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800';
    case 'injury':
      return 'text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
    case 'surgery':
      return 'text-pink-500 bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800';
    default:
      return 'text-gray-500 bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800';
  }
};

export function HealthRecordDetailDialog({ record, open, onOpenChange }: HealthRecordDetailDialogProps) {
  if (!record) return null;

  const recordType = record.recordType || record.type;
  const recordDate = record.recordDate || record.date;
  const veterinarian = record.veterinarianName || record.veterinarian;
  const iconColor = getRecordColor(recordType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${iconColor}`}>
              {getRecordIcon(recordType)}
            </div>
            <div>
              <div className="capitalize">{recordType} Record</div>
              <div className="text-sm font-normal text-muted-foreground">
                {format(new Date(recordDate), 'MMMM dd, yyyy')}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Vaccination Specific Info */}
          {recordType?.toLowerCase() === 'vaccination' && (
            <div className="space-y-4">
              {record.vaccinationType && (
                <div className="flex items-start gap-3">
                  <Syringe className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Vaccination Type</div>
                    <div className="text-base font-semibold capitalize">{record.vaccinationType}</div>
                  </div>
                </div>
              )}

              {record.nextDueDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Next Due Date</div>
                    <div className="text-base font-semibold">
                      {format(new Date(record.nextDueDate), 'MMMM dd, yyyy')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(record.nextDueDate) < new Date() ? (
                        <span className="text-red-500 font-medium">Overdue</span>
                      ) : (
                        `In ${Math.ceil((new Date(record.nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Medication Specific Info */}
          {recordType?.toLowerCase() === 'medication' && (
            <div className="space-y-4">
              {record.medicationName && (
                <div className="flex items-start gap-3">
                  <Pill className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Medication Name</div>
                    <div className="text-base font-semibold">{record.medicationName}</div>
                  </div>
                </div>
              )}

              {record.dosage && (
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Dosage</div>
                    <div className="text-base">{record.dosage}</div>
                  </div>
                </div>
              )}

              {record.frequency && (
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Frequency</div>
                    <div className="text-base">{record.frequency}</div>
                  </div>
                </div>
              )}

              {(record.startDate || record.endDate) && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Duration</div>
                    <div className="text-base">
                      {record.startDate && format(new Date(record.startDate), 'MMM dd, yyyy')}
                      {record.startDate && record.endDate && ' - '}
                      {record.endDate && format(new Date(record.endDate), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Veterinarian Info */}
          {(veterinarian || record.clinicName) && (
            <div className="space-y-4 pt-4 border-t">
              {veterinarian && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Veterinarian</div>
                    <div className="text-base font-semibold">{veterinarian}</div>
                  </div>
                </div>
              )}

              {record.clinicName && (
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Clinic</div>
                    <div className="text-base">{record.clinicName}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Diagnosis & Treatment */}
          {(record.diagnosis || record.treatment || record.description) && (
            <div className="space-y-4 pt-4 border-t">
              {record.diagnosis && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Diagnosis</div>
                  <div className="text-base">{record.diagnosis}</div>
                </div>
              )}

              {record.treatment && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Treatment</div>
                  <div className="text-base">{record.treatment}</div>
                </div>
              )}

              {record.description && !record.diagnosis && !record.treatment && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Description</div>
                  <div className="text-base">{record.description}</div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <div className="pt-4 border-t">
              <div className="text-sm font-medium text-muted-foreground mb-1">Notes</div>
              <div className="text-base italic text-muted-foreground">{record.notes}</div>
            </div>
          )}

          {/* Cost */}
          {record.cost && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Cost</div>
                  <div className="text-base font-semibold">
                    {record.currency || 'USD'} {(record.cost / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Certificate */}
          {record.certificateUrl && (
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(record.certificateUrl, '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
