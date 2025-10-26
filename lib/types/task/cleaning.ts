/**
 * Cleaning task type definitions
 */

import { BaseTask, TaskFrequency } from './types';

// ============================================================================
// CLEANING TASK
// ============================================================================

export interface CleaningTask extends BaseTask {
  type: 'cleaning';
  area: 'kennel' | 'whelping-box' | 'yard' | 'shelter' | 'all';
  cleaningType: 'daily' | 'deep-clean' | 'disinfect';
  frequency: TaskFrequency;
}

/**
 * Cleaning task data structure for API
 */
export interface CleaningTaskData {
  area?: string;
  cleaningType?: string;
  frequency?: string;
}
