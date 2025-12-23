"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Loader2, Plus } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: string;
  animalName: string;
}

export function AppointmentDialog({
  open,
  onOpenChange,
  animalId,
  animalName,
}: AppointmentDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    appointmentType: "checkup",
    appointmentDate: undefined as Date | undefined,
    appointmentTime: "",
    veterinarianName: "",
    veterinarianEmail: "",
    veterinarianPhone: "",
    clinicName: "",
    clinicAddress: "",
    reason: "",
    notes: "",
    createReminder: true,
    reminderMinutesBefore: "60",
    isRecurring: false,
    recurrencePattern: "weekly",
    recurrenceInterval: "1",
    recurrenceEndDate: undefined as Date | undefined,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/animals/${animalId}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create appointment");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appointments", animalId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      
      let description = `Appointment for ${animalName} has been scheduled`;
      if (data.tasksCreated && data.tasksCreated > 0) {
        description += `. ${data.tasksCreated} reminder(s) created.`;
      }
      
      toast({
        title: "Appointment Scheduled",
        description,
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      appointmentType: "checkup",
      appointmentDate: undefined,
      appointmentTime: "",
      veterinarianName: "",
      veterinarianEmail: "",
      veterinarianPhone: "",
      clinicName: "",
      clinicAddress: "",
      reason: "",
      notes: "",
      createReminder: true,
      reminderMinutesBefore: "60",
      isRecurring: false,
      recurrencePattern: "weekly",
      recurrenceInterval: "1",
      recurrenceEndDate: undefined,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.appointmentDate) {
        toast({
          title: "Missing Date",
          description: "Please select an appointment date",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (!formData.appointmentTime) {
        toast({
          title: "Missing Time",
          description: "Please enter an appointment time",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (!formData.veterinarianEmail) {
        toast({
          title: "Missing Email",
          description: "Veterinarian email is required",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare data for submission
      const submitData: any = {
        animalId,
        appointmentType: formData.appointmentType,
        appointmentDate: format(formData.appointmentDate, 'yyyy-MM-dd'),
        appointmentTime: formData.appointmentTime,
        veterinarianName: formData.veterinarianName || null,
        veterinarianEmail: formData.veterinarianEmail,
        veterinarianPhone: formData.veterinarianPhone || null,
        clinicName: formData.clinicName || null,
        clinicAddress: formData.clinicAddress || null,
        reason: formData.reason || null,
        notes: formData.notes || null,
        createReminder: formData.createReminder,
        reminderMinutesBefore: formData.createReminder ? parseInt(formData.reminderMinutesBefore) : null,
        isRecurring: formData.isRecurring,
      };

      // Add recurrence data if recurring
      if (formData.isRecurring && formData.recurrenceEndDate) {
        submitData.recurrencePattern = formData.recurrencePattern;
        submitData.recurrenceInterval = parseInt(formData.recurrenceInterval);
        submitData.recurrenceEndDate = format(formData.recurrenceEndDate, 'yyyy-MM-dd');
      }

      await createMutation.mutateAsync(submitData);
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>Schedule Appointment</DialogTitle>
              <DialogDescription>
                Schedule a veterinary appointment for {animalName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Appointment Type */}
          <div className="space-y-2">
            <Label htmlFor="appointmentType">Appointment Type *</Label>
            <Select
              value={formData.appointmentType}
              onValueChange={(value) => updateField("appointmentType", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checkup">General Checkup</SelectItem>
                <SelectItem value="vaccination">Vaccination</SelectItem>
                <SelectItem value="surgery">Surgery</SelectItem>
                <SelectItem value="dental">Dental Cleaning</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="follow_up">Follow-up</SelectItem>
                <SelectItem value="grooming">Grooming</SelectItem>
                <SelectItem value="xray">X-Ray/Imaging</SelectItem>
                <SelectItem value="blood_work">Blood Work</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointmentDate">Date *</Label>
              <DatePicker
                date={formData.appointmentDate}
                onDateChange={(date) => updateField("appointmentDate", date)}
                placeholder="Select date"
                minDate={new Date()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointmentTime">Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="appointmentTime"
                  type="time"
                  value={formData.appointmentTime}
                  onChange={(e) => updateField("appointmentTime", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit</Label>
            <Input
              id="reason"
              value={formData.reason}
              onChange={(e) => updateField("reason", e.target.value)}
              placeholder="e.g., Annual checkup, limping, skin issue"
            />
          </div>

          {/* Veterinarian & Clinic */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="veterinarianName">Veterinarian Name</Label>
              <Input
                id="veterinarianName"
                value={formData.veterinarianName}
                onChange={(e) => updateField("veterinarianName", e.target.value)}
                placeholder="Dr. Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinicName">Clinic Name</Label>
              <Input
                id="clinicName"
                value={formData.clinicName}
                onChange={(e) => updateField("clinicName", e.target.value)}
                placeholder="Animal Hospital"
              />
            </div>
          </div>

          {/* Veterinarian Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="veterinarianEmail">Veterinarian Email *</Label>
              <Input
                id="veterinarianEmail"
                type="email"
                value={formData.veterinarianEmail}
                onChange={(e) => updateField("veterinarianEmail", e.target.value)}
                placeholder="vet@clinic.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="veterinarianPhone">Phone Number</Label>
              <Input
                id="veterinarianPhone"
                type="tel"
                value={formData.veterinarianPhone}
                onChange={(e) => updateField("veterinarianPhone", e.target.value)}
                placeholder="+27 12 345 6789"
              />
            </div>
          </div>

          {/* Clinic Address */}
          <div className="space-y-2">
            <Label htmlFor="clinicAddress">Clinic Address</Label>
            <Input
              id="clinicAddress"
              value={formData.clinicAddress}
              onChange={(e) => updateField("clinicAddress", e.target.value)}
              placeholder="123 Main St, City"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Any special instructions or information..."
              rows={3}
            />
          </div>

          {/* Reminder Settings */}
          <div className="space-y-4 p-4 border border-primary/20 rounded-lg bg-primary/5">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="createReminder"
                checked={formData.createReminder}
                onCheckedChange={(checked) => updateField("createReminder", checked)}
              />
              <Label htmlFor="createReminder" className="text-sm font-medium cursor-pointer">
                Create reminder
              </Label>
            </div>
            
            {formData.createReminder && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="reminderMinutesBefore" className="text-sm">
                  Remind me before
                </Label>
                <Select
                  value={formData.reminderMinutesBefore}
                  onValueChange={(value) => updateField("reminderMinutesBefore", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="1440">1 day</SelectItem>
                    <SelectItem value="2880">2 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Recurring Appointments */}
          <div className="space-y-4 p-4 border border-primary/20 rounded-lg bg-primary/5">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => updateField("isRecurring", checked)}
              />
              <Label htmlFor="isRecurring" className="text-sm font-medium cursor-pointer">
                Recurring appointment
              </Label>
            </div>
            
            {formData.isRecurring && (
              <div className="space-y-4 pl-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recurrencePattern" className="text-sm">
                      Repeat
                    </Label>
                    <Select
                      value={formData.recurrencePattern}
                      onValueChange={(value) => updateField("recurrencePattern", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recurrenceInterval" className="text-sm">
                      Every
                    </Label>
                    <Input
                      id="recurrenceInterval"
                      type="number"
                      min="1"
                      value={formData.recurrenceInterval}
                      onChange={(e) => updateField("recurrenceInterval", e.target.value)}
                      placeholder="1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recurrenceEndDate" className="text-sm">
                    End Date
                  </Label>
                  <DatePicker
                    date={formData.recurrenceEndDate}
                    onDateChange={(date) => updateField("recurrenceEndDate", date)}
                    placeholder="Select end date"
                    minDate={formData.appointmentDate}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Appointment
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
