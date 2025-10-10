import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema/tasks';
import { auth } from '@/lib/auth/config';
import {
  successResponse,
  createdResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { eq, and, desc, lte, gte, or, sql } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const taskDataSchemas = {
  feeding: z.object({
    foodType: z.string().min(1, 'Food type is required'),
    amount: z.number().positive('Amount must be positive'),
    unit: z.enum(['grams', 'cups'], { required_error: 'Unit is required' }),
    time: z.string().optional(),
  }),
  exercise: z.object({
    exerciseType: z.enum(['walk', 'play', 'training'], {
      required_error: 'Exercise type is required',
    }),
    duration: z.number().positive('Duration must be positive'),
  }),
  grooming: z.object({
    groomingType: z.enum(['bath', 'brush', 'nails', 'ears', 'teeth'], {
      required_error: 'Grooming type is required',
    }),
    frequency: z.string().optional(),
  }),
  weight: z.object({
    weight: z.number().positive().optional(),
    weightUnit: z.enum(['kg', 'lbs']).optional(),
  }),
  cleaning: z.object({
    area: z.string().min(1, 'Area is required'),
    cleaningType: z.string().min(1, 'Cleaning type is required'),
    frequency: z.string().optional(),
  }),
  event: z.object({
    eventType: z.string().min(1, 'Event type is required'),
    title: z.string().min(1, 'Title is required'),
    time: z.string().optional(),
    isRecurring: z.boolean().optional(),
  }),
};

const createTaskSchema = z.object({
  taskType: z.enum(['feeding', 'exercise', 'grooming', 'weight', 'cleaning', 'event'], {
    required_error: 'Task type is required',
  }),
  animalId: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
  taskData: z.any(),
});

// ============================================================================
// GET /api/tasks - List all tasks for current user
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const taskType = searchParams.get('taskType');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const animalId = searchParams.get('animalId');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Build where clause
    let whereConditions: any[] = [eq(tasks.userId, session.user.id)];

    // Filter by task type
    if (taskType && taskType !== 'all') {
      whereConditions.push(eq(tasks.taskType, taskType as any));
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      whereConditions.push(eq(tasks.priority, priority as any));
    }

    // Filter by status
    if (status) {
      if (status === 'completed') {
        whereConditions.push(eq(tasks.isCompleted, true));
      } else if (status === 'pending') {
        whereConditions.push(
          and(
            eq(tasks.isCompleted, false),
            gte(tasks.dueDate, new Date().toISOString().split('T')[0])
          )
        );
      } else if (status === 'overdue') {
        whereConditions.push(
          and(
            eq(tasks.isCompleted, false),
            lte(tasks.dueDate, new Date().toISOString().split('T')[0])
          )
        );
      } else if (status === 'dueSoon') {
        const today = new Date();
        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(today.getDate() + 3);

        whereConditions.push(
          and(
            eq(tasks.isCompleted, false),
            gte(tasks.dueDate, today.toISOString().split('T')[0]),
            lte(tasks.dueDate, threeDaysLater.toISOString().split('T')[0])
          )
        );
      }
    }

    // Filter by animal
    if (animalId) {
      whereConditions.push(eq(tasks.animalId, animalId));
    }

    // Filter by date range
    if (fromDate) {
      whereConditions.push(gte(tasks.dueDate, fromDate));
    }
    if (toDate) {
      whereConditions.push(lte(tasks.dueDate, toDate));
    }

    const whereClause = whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0];

    const userTasks = await db.query.tasks.findMany({
      where: whereClause,
      with: {
        animal: {
          with: {
            breed: true,
          },
        },
      },
      orderBy: [desc(tasks.dueDate), desc(tasks.createdAt)],
    });

    return successResponse(userTasks, undefined, {
      total: userTasks.length,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return serverErrorResponse('Failed to fetch tasks');
  }
}

// ============================================================================
// POST /api/tasks - Create new task
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // Validate request body
    const validation = createTaskSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(
        validation.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
      );
    }

    const validatedData = validation.data;

    // Validate taskData based on taskType
    const taskDataSchema = taskDataSchemas[validatedData.taskType];
    if (taskDataSchema) {
      const taskDataValidation = taskDataSchema.safeParse(validatedData.taskData);
      if (!taskDataValidation.success) {
        return validationErrorResponse(
          taskDataValidation.error.errors.map((err) => ({
            field: `taskData.${err.path.join('.')}`,
            message: err.message,
          }))
        );
      }
    }

    // Calculate priority based on task type and due date
    const dueDate = new Date(validatedData.dueDate);
    const today = new Date();
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let priority: 'low' | 'medium' | 'high' = 'medium';

    if (['feeding', 'weight', 'event'].includes(validatedData.taskType)) {
      priority = 'high';
    } else if (daysDiff < 0) {
      priority = 'high'; // Overdue
    } else if (daysDiff <= 3) {
      priority = 'high'; // Due soon
    } else if (daysDiff <= 7) {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    // Create task
    const newTask = await db
      .insert(tasks)
      .values({
        ...validatedData,
        userId: session.user.id,
        priority,
      })
      .returning();

    return createdResponse(newTask[0], 'Task created successfully');
  } catch (error) {
    console.error('Error creating task:', error);
    return serverErrorResponse('Failed to create task');
  }
}
