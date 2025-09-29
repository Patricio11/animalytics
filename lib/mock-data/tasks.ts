/**
 * Task management mock data
 * Comprehensive task system for animal care management
 */

export type TaskType =
  | 'feeding'
  | 'exercise'
  | 'grooming'
  | 'weight'
  | 'cleaning'
  | 'event';

export type TaskStatus = 'pending' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskFrequency = 'once' | 'daily' | 'weekly' | 'monthly';

// Feeding Task
export interface FeedingTask {
  id: string;
  type: 'feeding';
  animalId: string;
  animalName: string;
  foodType: string;
  amount: number;
  unit: 'grams' | 'cups';
  time: string; // HH:mm format
  completed: boolean;
  date: string;
  notes?: string;
}

// Exercise Task
export interface ExerciseTask {
  id: string;
  type: 'exercise';
  animalId: string;
  animalName: string;
  exerciseType: 'walk' | 'play' | 'training' | 'other';
  duration: number; // minutes
  completed: boolean;
  date: string;
  notes?: string;
}

// Grooming Task
export interface GroomingTask {
  id: string;
  type: 'grooming';
  animalId: string;
  animalName: string;
  groomingType: 'bath' | 'brush' | 'nails' | 'ears' | 'teeth' | 'full';
  frequency: TaskFrequency;
  completed: boolean;
  date: string;
  notes?: string;
}

// Weight Task
export interface WeightTask {
  id: string;
  type: 'weight';
  animalId: string;
  animalName: string;
  weight?: number; // kg
  completed: boolean;
  date: string;
  notes?: string;
}

// Cleaning Task
export interface CleaningTask {
  id: string;
  type: 'cleaning';
  area: 'kennel' | 'whelping-box' | 'yard' | 'shelter' | 'all';
  cleaningType: 'daily' | 'deep-clean' | 'disinfect';
  frequency: TaskFrequency;
  completed: boolean;
  date: string;
  notes?: string;
}

// Event Task
export interface EventTask {
  id: string;
  type: 'event';
  animalId?: string;
  animalName?: string;
  eventType:
    | 'vet-visit'
    | 'worming'
    | 'heartworm'
    | 'flea-tick'
    | 'vaccination'
    | 'health-check'
    | 'rugging'
    | 'pest-management'
    | 'other';
  title: string;
  time?: string; // HH:mm format
  completed: boolean;
  date: string;
  notes?: string;
  recurring?: boolean;
}

export type Task =
  | FeedingTask
  | ExerciseTask
  | GroomingTask
  | WeightTask
  | CleaningTask
  | EventTask;

// Helper function to get task status
export function getTaskStatus(task: Task): TaskStatus {
  if (task.completed) return 'completed';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(task.date);
  taskDate.setHours(0, 0, 0, 0);
  if (taskDate < today) return 'overdue';
  return 'pending';
}

// Helper function to get task priority based on type and date
export function getTaskPriority(task: Task): TaskPriority {
  const today = new Date();
  const taskDate = new Date(task.date);
  const daysDiff = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Overdue tasks are high priority
  if (daysDiff < 0) return 'high';

  // Event tasks based on event type
  if (task.type === 'event') {
    if (['vet-visit', 'vaccination', 'health-check'].includes(task.eventType)) {
      return daysDiff <= 1 ? 'high' : 'medium';
    }
  }

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

// Mock data
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