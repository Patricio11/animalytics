/**
 * Exercise task type definitions
 */

import { BaseTask } from './types';

// ============================================================================
// EXERCISE TASK
// ============================================================================

export interface ExerciseTask extends BaseTask {
  type: 'exercise';
  exerciseType: 'walk' | 'play' | 'training' | 'other';
  duration: number; // minutes
}

/**
 * Exercise task data structure for API
 */
export interface ExerciseTaskData {
  exerciseType?: string;
  duration?: number;
}
