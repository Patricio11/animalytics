/**
 * Event task type definitions
 */

import { BaseTask } from './types';

// ============================================================================
// EVENT TASK
// ============================================================================

export type EventType =
  | 'vet-visit'
  | 'worming'
  | 'heartworm'
  | 'flea-tick'
  | 'vaccination'
  | 'health-check'
  | 'rugging'
  | 'pest-management'
  | 'other';

export interface EventTask extends BaseTask {
  type: 'event';
  eventType: EventType;
  title: string;
  time?: string; // HH:mm format
  recurring?: boolean;
}

/**
 * Event task data structure for API
 */
export interface EventTaskData {
  eventType?: string;
  title?: string;
  time?: string;
  recurring?: boolean;
}

/**
 * Get event priority based on event type and date
 */
export function getEventPriority(task: EventTask, daysDiff: number): 'low' | 'medium' | 'high' {
  const criticalEvents: EventType[] = ['vet-visit', 'vaccination', 'health-check'];
  
  if (criticalEvents.includes(task.eventType)) {
    return daysDiff <= 1 ? 'high' : 'medium';
  }
  
  return 'medium';
}
