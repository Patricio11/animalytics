/**
 * Task management mock data
 * Pure mock data for development and testing
 * 
 * NOTE: Type definitions have been moved to @/lib/types/task
 * Import types from there instead of this file
 */

import type { Task } from '@/lib/types/task';

// ============================================================================
// MOCK DATA
// ============================================================================

export const mockTasks: Task[] = [
  // Feeding tasks
  {
    id: 'task-1',
    type: 'feeding',
    animalId: 'animal1',
    animalName: 'Luna',
    foodType: 'Premium Adult Dog Food',
    amount: 350,
    unit: 'grams',
    time: '08:00',
    completed: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'task-2',
    type: 'feeding',
    animalId: 'animal1',
    animalName: 'Luna',
    foodType: 'Premium Adult Dog Food',
    amount: 350,
    unit: 'grams',
    time: '18:00',
    completed: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'task-3',
    type: 'feeding',
    animalId: 'animal2',
    animalName: 'Max',
    foodType: 'High-Performance Dog Food',
    amount: 400,
    unit: 'grams',
    time: '07:30',
    completed: true,
    date: new Date().toISOString().split('T')[0],
  },
  // Exercise tasks
  {
    id: 'task-4',
    type: 'exercise',
    animalId: 'animal2',
    animalName: 'Max',
    exerciseType: 'walk',
    duration: 45,
    completed: true,
    date: new Date().toISOString().split('T')[0],
    notes: 'Morning walk in the park',
  },
  {
    id: 'task-5',
    type: 'exercise',
    animalId: 'animal1',
    animalName: 'Luna',
    exerciseType: 'training',
    duration: 30,
    completed: false,
    date: new Date().toISOString().split('T')[0],
    notes: 'Obedience training session',
  },
  // Grooming tasks
  {
    id: 'task-6',
    type: 'grooming',
    animalId: 'animal1',
    animalName: 'Luna',
    groomingType: 'bath',
    frequency: 'weekly',
    completed: false,
    date: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    })(),
  },
  {
    id: 'task-7',
    type: 'grooming',
    animalId: 'animal2',
    animalName: 'Max',
    groomingType: 'nails',
    frequency: 'monthly',
    completed: false,
    date: (() => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek.toISOString().split('T')[0];
    })(),
  },
  // Weight tasks
  {
    id: 'task-8',
    type: 'weight',
    animalId: 'animal1',
    animalName: 'Luna',
    weight: 28.5,
    completed: true,
    date: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    })(),
  },
  // Cleaning tasks
  {
    id: 'task-9',
    type: 'cleaning',
    area: 'kennel',
    cleaningType: 'daily',
    frequency: 'daily',
    completed: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'task-10',
    type: 'cleaning',
    area: 'yard',
    cleaningType: 'deep-clean',
    frequency: 'weekly',
    completed: false,
    date: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    })(),
  },
  // Event tasks
  {
    id: 'task-11',
    type: 'event',
    animalId: 'animal1',
    animalName: 'Luna',
    eventType: 'vet-visit',
    title: 'Annual Health Check',
    time: '14:00',
    completed: false,
    date: (() => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 5);
      return nextWeek.toISOString().split('T')[0];
    })(),
    notes: 'Dr. Smith - Annual checkup and vaccinations',
  },
  {
    id: 'task-12',
    type: 'event',
    animalId: 'animal2',
    animalName: 'Max',
    eventType: 'worming',
    title: 'Monthly Worming Treatment',
    completed: false,
    date: new Date().toISOString().split('T')[0],
    recurring: true,
  },
];