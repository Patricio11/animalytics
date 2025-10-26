# Types Module

Centralized type definitions for the Animalytics application.

## 📁 Structure

```
lib/types/
├── index.ts              # Root barrel export
├── task/                 # Task-related types
│   ├── index.ts         # Task barrel export
│   ├── types.ts         # Core task types & utilities
│   ├── feeding.ts       # Feeding task types
│   ├── exercise.ts      # Exercise task types
│   ├── grooming.ts      # Grooming task types
│   ├── weight.ts        # Weight task types
│   ├── cleaning.ts      # Cleaning task types
│   └── event.ts         # Event task types
└── wizard.ts            # Wizard-related types
```

## 🎯 Usage

### Import from root (recommended)
```typescript
import { Task, FeedingTask, TaskStatus, TaskType } from '@/lib/types';
```

### Import from specific module
```typescript
import { Task, FeedingTask } from '@/lib/types/task';
import { TaskStatus, getTaskStatus } from '@/lib/types/task/types';
```

## 📦 Available Types

### Task Module (`@/lib/types/task`)

**Core Types:**
- `TaskType` - Union of all task type strings
- `TaskStatus` - 'pending' | 'completed' | 'overdue' | 'skipped'
- `TaskPriority` - 'low' | 'medium' | 'high'
- `TaskFrequency` - 'once' | 'daily' | 'weekly' | 'monthly'
- `BaseTask` - Base interface for all tasks

**Specific Task Types:**
- `FeedingTask` - Feeding task with food type, amount, unit, time
- `ExerciseTask` - Exercise task with type and duration
- `GroomingTask` - Grooming task with type and frequency
- `WeightTask` - Weight tracking task
- `CleaningTask` - Cleaning task with area and type
- `EventTask` - Event task with event type and title

**Union Type:**
- `Task` - Union of all specific task types

**Helper Functions:**
- `getTaskStatus(task)` - Get task status based on completion and date
- `getTaskPriority(task)` - Get task priority based on type and date
- `getEventPriority(task, daysDiff)` - Get event-specific priority

## 🏗️ Architecture Principles

1. **Separation of Concerns**
   - Types are separate from data and logic
   - Mock data imports types (not the other way around)
   - Business logic imports types (not the other way around)

2. **Modular Structure**
   - Each domain has its own directory
   - Related types grouped together
   - Easy to add new types without affecting others

3. **Barrel Exports**
   - Single import point per module
   - Clean import statements
   - Easy to refactor

4. **Scalability**
   - Easy to add new task types
   - Easy to add new domains (animal, mating, litter, etc.)
   - Follows established patterns (like calculations module)

## 🚀 Adding New Types

### Adding a new task type:

1. Create `lib/types/task/new-type.ts`:
```typescript
import { BaseTask } from './types';

export interface NewTypeTask extends BaseTask {
  type: 'new-type';
  // Add specific fields
}

export interface NewTypeTaskData {
  // Add API data structure
}
```

2. Export from `lib/types/task/index.ts`:
```typescript
export * from './new-type';

// Update union type
export type Task =
  | FeedingTask
  | ExerciseTask
  | NewTypeTask  // Add here
  // ...
```

3. Update `TaskType` in `lib/types/task/types.ts`:
```typescript
export type TaskType =
  | 'feeding'
  | 'exercise'
  | 'new-type'  // Add here
  // ...
```

### Adding a new domain:

1. Create `lib/types/new-domain/` directory
2. Add `index.ts`, `types.ts`, and specific type files
3. Export from `lib/types/index.ts`:
```typescript
export * from './new-domain';
```

## 📝 Migration Notes

**Before:**
```typescript
import { Task, TaskType } from '@/lib/mock-data/tasks';
```

**After:**
```typescript
import { Task, TaskType } from '@/lib/types/task';
// or
import { Task, TaskType } from '@/lib/types';
```

**Mock data now imports types:**
```typescript
// lib/mock-data/tasks.ts
import type { Task } from '@/lib/types/task';

export const mockTasks: Task[] = [
  // Mock data here
];
```

## ✅ Benefits

1. **Single Source of Truth** - All types in one place
2. **Clean Separation** - Types separate from data/logic
3. **Easy Imports** - Simple, consistent import paths
4. **Better Maintainability** - Update types in one place
5. **Professional Structure** - Industry standard pattern
6. **Scalable** - Easy to grow as app grows
