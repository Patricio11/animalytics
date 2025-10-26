/**
 * Animal profile details type definitions
 */

import type { PhotoCategory } from './photo';
import type { FeedingPlan } from './feeding';
import type { SemenAssessment } from './semen';
import type { Season } from './season';
import type { Litter } from './litter';
import type { ReminderSettings } from './reminder';

// ============================================================================
// PROFILE TYPES
// ============================================================================

export interface AnimalProfileDetails {
  animalId: string;
  photoCategories: PhotoCategory[];
  feedingPlan: FeedingPlan;
  semenAssessments: SemenAssessment[];
  seasons?: Season[]; // bitches only
  litters?: Litter[]; // bitches only
  reminders: ReminderSettings;
}
