/**
 * Core task type definitions
 * Centralized type system for task management
 */

// ============================================================================
// ENUMS & BASIC TYPES
// ============================================================================

export type TaskType =
  | 'feeding'
  | 'exercise'
  | 'grooming'
  | 'weight'
  | 'cleaning'
  | 'event'
  | 'puppy_feeding'
  | 'misc';

export type TaskStatus = 'pending' | 'completed' | 'overdue' | 'skipped';

export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskFrequency = 'once' | 'daily' | 'weekly' | 'monthly';

// ============================================================================
// BASE TASK INTERFACE
// ============================================================================

/**
 * Base task interface with common fields
 * All specific task types should extend this
 */
export interface BaseTask {
  id: string;
  type: TaskType;
  animalId?: string;
  animalName?: string;
  completed: boolean;
  date: string;
  notes?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get task status based on completion and date
 */
export function getTaskStatus(task: BaseTask): TaskStatus {
  if (task.completed) return 'completed';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(task.date);
  taskDate.setHours(0, 0, 0, 0);
  if (taskDate < today) return 'overdue';
  return 'pending';
}

/**
 * Get task priority based on type and date
 */
export function getTaskPriority(task: BaseTask): TaskPriority {
  const today = new Date();
  const taskDate = new Date(task.date);
  const daysDiff = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Overdue tasks are high priority
  if (daysDiff < 0) return 'high';

  // Feeding tasks are high priority on the day
  if (task.type === 'feeding') {
    return daysDiff === 0 ? 'high' : 'medium';
  }

  // Weight and grooming are medium priority
  if (task.type === 'weight' || task.type === 'grooming') {
    return 'medium';
  }

  return 'low';
}
