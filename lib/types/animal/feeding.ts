/**
 * Animal feeding type definitions
 */

// ============================================================================
// FEEDING TYPES
// ============================================================================

export interface FeedingSchedule {
  id: string;
  time: string;
  foodType: string;
  amount: string;
  notes?: string;
}

export interface FeedingPlan {
  schedule: FeedingSchedule[];
  specialDietaryNotes?: string;
}
