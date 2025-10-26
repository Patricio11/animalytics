/**
 * Grooming task type definitions
 */

import { BaseTask, TaskFrequency } from './types';

// ============================================================================
// GROOMING TASK
// ============================================================================

export interface GroomingTask extends BaseTask {
  type: 'grooming';
  groomingType: 'bath' | 'brush' | 'nails' | 'ears' | 'teeth' | 'full';
  frequency: TaskFrequency;
}

/**
 * Grooming task data structure for API
 */
export interface GroomingTaskData {
  groomingType?: string;
  frequency?: string;
}
