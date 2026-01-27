// Heat Cycle Types
export type HeatCycleStatus = 'active' | 'completed' | 'cancelled';
export type BreedingMethod = 'natural_ai' | 'frozen';
export type ProgesteroneUnit = 'nanograms' | 'nanomoles';
export type Laboratory = 'VIDAS' | 'IDEXX' | 'IDEXX_LAB' | 'IMMULITE' | 'CHEMILUMINESCENCE' | 'RIA' | 'OTHER';

export interface HeatCycle {
  id: string;
  breederId: string;
  bitchId: string;
  
  // Cycle Information
  startDate: Date;
  endDate?: Date;
  currentDay: number;
  status: HeatCycleStatus;
  
  // Breeding Information
  breedingMethod: BreedingMethod;
  estimatedOvulationDay?: number;
  estimatedOvulationDate?: Date;
  estimatedWhelpingDate?: Date;
  
  // Metadata
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgesteroneReading {
  id: string;
  heatCycleId: string;
  
  // Reading Information
  day: number;
  testDate: Date;
  progesteroneLevel: number; // Raw value from machine
  normalizedProgesteroneLevel?: number; // Normalized to VIDAS standard
  unit: ProgesteroneUnit;
  machine?: Laboratory; // New field for machine type
  laboratory: Laboratory; // Deprecated, use machine instead
  
  // Analysis Results
  phase?: string;
  phaseColor?: string;
  nextTestDays?: number;
  nextTestDate?: Date;
  nextTestReason?: string;
  
  // Metadata
  notes?: string;
  createdAt: Date;
}

export type BreedingRecordMethod = 
  | 'natural' 
  | 'ai_fresh' 
  | 'ai_chilled' 
  | 'ai_frozen' 
  | 'tci' 
  | 'surgical';

export interface BreedingRecord {
  id: string;
  heatCycleId: string;
  
  // Breeding Information
  breedingDate: Date;
  breedingTime?: string;
  studId?: string;
  studName?: string;
  studRegistration?: string;
  
  // Method Details
  method: BreedingRecordMethod;
  frozenSemenBatchId?: string;
  
  // Success Tracking
  tieDurationMinutes?: number;
  successful?: boolean;
  
  // Metadata
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ReminderType = 
  | 'test_due' 
  | 'breeding_window' 
  | 'daily_test' 
  | 'whelping_approaching';

export type ReminderPriority = 'low' | 'normal' | 'high' | 'urgent';
export type ReminderChannel = 'email' | 'sms' | 'in_app';

export interface ProgesteroneReminder {
  id: string;
  heatCycleId: string;
  breederId: string;
  
  // Reminder Information
  reminderType: ReminderType;
  dueDate: Date;
  dueTime: string;
  
  // Delivery Status
  sent: boolean;
  sentAt?: Date;
  channels: ReminderChannel[];
  
  // Content
  title: string;
  message: string;
  priority: ReminderPriority;
  
  // Metadata
  createdAt: Date;
}

// Extended types with relations
export interface HeatCycleWithDetails extends HeatCycle {
  bitch: {
    id: string;
    name: string;
    breed: string;
    profilePhotoUrl?: string;
    registeredName?: string;
  };
  readings: ProgesteroneReading[];
  breedingRecords: BreedingRecord[];
  nextReminder?: ProgesteroneReminder;
}

export interface ProgesteroneReadingWithPhase extends ProgesteroneReading {
  phaseInfo: {
    phase: string;
    color: string;
    icon: string;
    description: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
  };
}

// API Request/Response Types
export interface CreateHeatCycleRequest {
  bitchId: string;
  startDate: Date;
  breedingMethod: BreedingMethod;
}

export interface CreateHeatCycleResponse {
  heatCycle: HeatCycle;
  firstReminderDate: Date;
}

export interface CreateProgesteroneReadingRequest {
  heatCycleId: string;
  day: number;
  testDate: Date;
  progesteroneLevel: number;
  unit?: ProgesteroneUnit;
  laboratory?: Laboratory;
  notes?: string;
}

export interface CreateProgesteroneReadingResponse {
  reading: ProgesteroneReading;
  nextTestRecommendation: {
    days: number;
    date: Date;
    reason: string;
  };
  breedingWindowOpen: boolean;
  breedingRecordCreated?: boolean;
  breedingRecordId?: string;
  isLastMating?: boolean;
  pregnancyTasksGenerated?: boolean;
  pregnancyTasksCount?: number;
  pregnancyTasks?: any[];
  updatedCycle: HeatCycle;
}

export interface CreateBreedingRecordRequest {
  heatCycleId: string;
  breedingDate: Date;
  breedingTime?: string;
  studId?: string;
  studName?: string;
  method: BreedingRecordMethod;
  frozenSemenBatchId?: string;
  tieDurationMinutes?: number;
  notes?: string;
}

export interface GetActiveCyclesResponse {
  cycles: HeatCycleWithDetails[];
  total: number;
}

export interface GetCycleHistoryResponse {
  cycles: HeatCycleWithDetails[];
  total: number;
  page: number;
  pageSize: number;
}

// Database row types (snake_case from Supabase)
export interface HeatCycleRow {
  id: string;
  breeder_id: string;
  bitch_id: string;
  start_date: string;
  end_date?: string;
  current_day: number;
  status: HeatCycleStatus;
  breeding_method: BreedingMethod;
  estimated_ovulation_day?: number;
  estimated_ovulation_date?: string;
  estimated_whelping_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProgesteroneReadingRow {
  id: string;
  heat_cycle_id: string;
  day: number;
  test_date: string;
  progesterone_level: number;
  unit: ProgesteroneUnit;
  laboratory: Laboratory;
  phase?: string;
  phase_color?: string;
  next_test_days?: number;
  next_test_date?: string;
  next_test_reason?: string;
  notes?: string;
  created_at: string;
}

export interface BreedingRecordRow {
  id: string;
  heat_cycle_id: string;
  breeding_date: string;
  breeding_time?: string;
  stud_id?: string;
  stud_name?: string;
  stud_registration?: string;
  method: BreedingRecordMethod;
  frozen_semen_batch_id?: string;
  tie_duration_minutes?: number;
  successful?: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProgesteroneReminderRow {
  id: string;
  heat_cycle_id: string;
  breeder_id: string;
  reminder_type: ReminderType;
  due_date: string;
  due_time: string;
  sent: boolean;
  sent_at?: string;
  channels: ReminderChannel[];
  title: string;
  message: string;
  priority: ReminderPriority;
  created_at: string;
}
