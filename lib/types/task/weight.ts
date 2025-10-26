/**
 * Weight task type definitions
 */

import { BaseTask } from './types';

// ============================================================================
// WEIGHT TASK
// ============================================================================

export interface WeightTask extends BaseTask {
  type: 'weight';
  weight?: number;
  weightUnit?: 'kg' | 'lbs';
}

/**
 * Weight task data structure for API
 */
export interface WeightTaskData {
  weight?: number;
  unit?: string;
}
