/**
 * Feeding task type definitions
 */

import { BaseTask } from './types';

// ============================================================================
// FEEDING TASK
// ============================================================================

export interface FeedingTask extends BaseTask {
  type: 'feeding';
  foodType: string;
  amount: number;
  unit: 'grams' | 'cups';
  time: string; // HH:mm format
}

/**
 * Feeding task data structure for API
 */
export interface FeedingTaskData {
  foodType?: string;
  amount?: number;
  unit?: string;
  time?: string;
}
