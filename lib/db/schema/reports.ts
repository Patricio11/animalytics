import { pgTable, text, timestamp, date, pgEnum, jsonb, integer } from 'drizzle-orm/pg-core';
import { users } from './users';
import { matings } from './matings';

// ============================================================================
// ENUMS
// ============================================================================

export const reportTypeEnum = pgEnum('report_type', [
  'events',
  'feeding',
  'exercise',
  'grooming',
  'cleaning',
  'puppies',
  'mating_history'
]);

export const exportFormatEnum = pgEnum('export_format', [
  'csv',
  'pdf',
  'excel',
  'json'
]);

export const exportStatusEnum = pgEnum('export_status', [
  'pending',
  'processing',
  'completed',
  'failed'
]);

// ============================================================================
// REPORT GENERATIONS TABLE
// ============================================================================

export const reportGenerations = pgTable('report_generations', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  reportType: reportTypeEnum('report_type').notNull(),
  reportName: text('report_name').notNull(), // User-friendly name

  // Report parameters
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),

  // Filters applied
  filters: jsonb('filters').$type<{
    animalId?: string;
    animalName?: string;
    taskType?: string;
    eventType?: string;
    status?: string;
    priority?: string;
  }>(),

  // Report data snapshot ⭐ COMPLETE REPORT STRUCTURE
  reportData: jsonb('report_data').$type<{
    // Events Report
    events?: Array<{
      date: string;
      animal: string;
      eventType: string;
      title: string;
      time?: string;
      status: string;
    }>;

    // Feeding Report
    feeding?: Array<{
      date: string;
      time?: string;
      animal: string;
      foodType: string;
      amount: string;
      status: string;
    }>;

    // Exercise Report
    exercise?: Array<{
      date: string;
      animal: string;
      type: string;
      duration: number;
      status: string;
    }>;

    // Grooming Report
    grooming?: Array<{
      date: string;
      animal: string;
      type: string;
      frequency?: string;
      status: string;
    }>;

    // Cleaning Report
    cleaning?: Array<{
      date: string;
      area: string;
      type: string;
      frequency?: string;
      status: string;
    }>;

    // Puppies Report
    puppies?: Array<{
      whelpingDate: string;
      sire: string;
      dam: string;
      litterSize: number;
      retained: number;
      sold: number;
      status: string;
    }>;

    // Mating History Comparison ⭐ UP TO 3 MATINGS
    matingHistory?: {
      comparisons: Array<{
        matingId: string;
        bitchName: string;
        sireName: string;
        matingDate: string;
        outcome: 'successful' | 'unsuccessful' | 'pending';
        litterSize?: number;
        progesteroneReadings: Array<{
          day: number;
          level: number;
          date: string;
        }>;
        conceptionRating?: number;
        progesteroneRating?: number;
      }>;
      chartData?: Array<{
        day: number;
        [matingId: string]: number; // Dynamic keys for up to 3 matings
      }>;
    };
  }>(),

  // Summary statistics
  summary: jsonb('summary').$type<{
    totalRecords?: number;
    completedCount?: number;
    pendingCount?: number;
    totalMinutes?: number; // For exercise
    totalFeedings?: number; // For feeding
    totalLitters?: number; // For puppies
    totalPuppies?: number; // For puppies
    retainedPuppies?: number;
    soldPuppies?: number;
  }>(),

  // Generation metadata
  generatedAt: timestamp('generated_at').defaultNow(),
  recordCount: integer('record_count'),

  notes: text('notes'),
});

// ============================================================================
// EXPORT HISTORY TRACKING ⭐ NEW
// ============================================================================

export const exportHistory = pgTable('export_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  reportGenerationId: text('report_generation_id').references(() => reportGenerations.id, { onDelete: 'set null' }),

  // Export details
  exportType: reportTypeEnum('export_type').notNull(),
  exportFormat: exportFormatEnum('export_format').notNull(),
  fileName: text('file_name').notNull(),

  // Date range exported
  startDate: date('start_date'),
  endDate: date('end_date'),

  // Export parameters
  filters: jsonb('filters').$type<{
    animalId?: string;
    taskType?: string;
    eventType?: string;
    status?: string;
  }>(),

  // File information
  fileSize: integer('file_size'), // bytes
  fileUrl: text('file_url'), // S3/storage URL
  downloadUrl: text('download_url'), // Signed URL for download
  downloadExpiry: timestamp('download_expiry'), // Signed URL expiration

  // Export status
  status: exportStatusEnum('status').default('pending'),
  error: text('error'), // If export failed

  // Processing details
  recordCount: integer('record_count'), // Number of records exported
  processingTime: integer('processing_time'), // milliseconds

  // Download tracking
  downloadCount: integer('download_count').default(0),
  lastDownloadedAt: timestamp('last_downloaded_at'),

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  expiresAt: timestamp('expires_at'), // File auto-deletion date
});

// ============================================================================
// MATING COMPARISON SESSIONS ⭐ NEW (UP TO 3 MATINGS)
// ============================================================================

export const matingComparisons = pgTable('mating_comparisons', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Comparison metadata
  comparisonName: text('comparison_name'), // User-provided name
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),

  // Up to 3 matings to compare
  mating1Id: text('mating1_id').references(() => matings.id, { onDelete: 'cascade' }).notNull(),
  mating2Id: text('mating2_id').references(() => matings.id, { onDelete: 'cascade' }),
  mating3Id: text('mating3_id').references(() => matings.id, { onDelete: 'cascade' }),

  // Filters applied
  filters: jsonb('filters').$type<{
    damId?: string;
    damName?: string;
    sireId?: string;
    sireName?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  }>(),

  // Comparison data (calculated once and cached)
  comparisonData: jsonb('comparison_data').$type<{
    matings: Array<{
      matingId: string;
      matingDate: string;
      bitchName: string;
      sireName: string;
      outcome: 'successful' | 'unsuccessful' | 'pending';
      litterSize?: number;
      survivingPuppies?: number;
      conceptionRating?: number;
      progesteroneRating?: number;
      readingCount: number;
      progesteroneReadings: Array<{
        day: number;
        level: number;
        unit: string;
        date: string;
      }>;
    }>;

    // Chart data aligned by days from mating
    chartData: Array<{
      day: number;
      mating1?: number;
      mating2?: number;
      mating3?: number;
    }>;

    // Summary comparison
    summary: {
      averageConceptionRating?: number;
      successRate?: number; // Percentage of successful matings
      averageLitterSize?: number;
    };
  }>(),

  // Last viewed/accessed
  lastAccessedAt: timestamp('last_accessed_at'),
  accessCount: integer('access_count').default(0),

  notes: text('notes'),
});

// ============================================================================
// TYPE EXPORTS FOR DRIZZLE INFERENCE
// ============================================================================

export type ReportGeneration = typeof reportGenerations.$inferSelect;
export type NewReportGeneration = typeof reportGenerations.$inferInsert;

export type ExportHistory = typeof exportHistory.$inferSelect;
export type NewExportHistory = typeof exportHistory.$inferInsert;

export type MatingComparison = typeof matingComparisons.$inferSelect;
export type NewMatingComparison = typeof matingComparisons.$inferInsert;

// ============================================================================
// TYPESCRIPT INTERFACES FOR REPORT DATA
// ============================================================================

export interface EventReportRecord {
  date: string;
  animal: string;
  eventType: string;
  title: string;
  time?: string;
  status: string;
}

export interface FeedingReportRecord {
  date: string;
  time?: string;
  animal: string;
  foodType: string;
  amount: string;
  status: string;
}

export interface ExerciseReportRecord {
  date: string;
  animal: string;
  type: string;
  duration: number;
  status: string;
}

export interface GroomingReportRecord {
  date: string;
  animal: string;
  type: string;
  frequency?: string;
  status: string;
}

export interface CleaningReportRecord {
  date: string;
  area: string;
  type: string;
  frequency?: string;
  status: string;
}

export interface PuppiesReportRecord {
  whelpingDate: string;
  sire: string;
  dam: string;
  litterSize: number;
  retained: number;
  sold: number;
  status: string;
}

export interface MatingHistoryReportData {
  comparisons: Array<{
    matingId: string;
    bitchName: string;
    sireName: string;
    matingDate: string;
    outcome: 'successful' | 'unsuccessful' | 'pending';
    litterSize?: number;
    progesteroneReadings: Array<{
      day: number;
      level: number;
      date: string;
    }>;
    conceptionRating?: number;
    progesteroneRating?: number;
  }>;
  chartData?: Array<{
    day: number;
    [matingId: string]: number;
  }>;
}

// All report data types union
export type ReportData = {
  events?: EventReportRecord[];
  feeding?: FeedingReportRecord[];
  exercise?: ExerciseReportRecord[];
  grooming?: GroomingReportRecord[];
  cleaning?: CleaningReportRecord[];
  puppies?: PuppiesReportRecord[];
  matingHistory?: MatingHistoryReportData;
};

export interface ReportSummary {
  totalRecords?: number;
  completedCount?: number;
  pendingCount?: number;
  totalMinutes?: number;
  totalFeedings?: number;
  totalLitters?: number;
  totalPuppies?: number;
  retainedPuppies?: number;
  soldPuppies?: number;
}
