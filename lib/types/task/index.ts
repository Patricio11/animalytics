/**
 * Task types barrel export
 * Single import point for all task-related types
 * 
 * Usage:
 * import { Task, FeedingTask, TaskStatus } from '@/lib/types/task'
 */

// Core types and utilities
export * from './types';

// Specific task types
export * from './feeding';
export * from './exercise';
export * from './grooming';
export * from './weight';
export * from './cleaning';
export * from './event';

// ============================================================================
// UNION TYPE
// ============================================================================

import type { FeedingTask } from './feeding';
import type { ExerciseTask } from './exercise';
import type { GroomingTask } from './grooming';
import type { WeightTask } from './weight';
import type { CleaningTask } from './cleaning';
import type { EventTask } from './event';

/**
 * Union type of all task types
 */
export type Task =
  | FeedingTask
  | ExerciseTask
  | GroomingTask
  | WeightTask
  | CleaningTask
  | EventTask;
