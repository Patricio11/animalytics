import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animalReminders, animals } from '@/lib/db/schema/animals';
import { auth } from '@/lib/auth/config';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createReminderSchema = z.object({
  reminderType: z.enum(['vaccination', 'deworming', 'vet_checkup', 'grooming', 'medication', 'heat_cycle', 'breeding', 'custom']),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  dueDate: z.string(), // ISO date string
  reminderDate: z.string().optional(), // ISO date string
  isRecurring: z.boolean().optional().default(false),
  recurrencePattern: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  recurrenceInterval: z.number().int().positive().optional(),
  recurrenceEndDate: z.string().optional(),
  sendEmail: z.boolean().optional().default(true),
  sendPush: z.boolean().optional().default(true),
  sendSms: z.boolean().optional().default(false),
  notes: z.string().optional(),
});

const updateReminderSchema = createReminderSchema.partial();

// ============================================================================
// GET /api/animals/[id]/reminders
// ============================================================================
// Get all reminders for an animal

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: animalId } = await params;

    // Verify animal ownership
    const [animal] = await db
      .select()
      .from(animals)
      .where(and(eq(animals.id, animalId), eq(animals.userId, session.user.id)))
      .limit(1);

    if (!animal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
    }

    // Get reminders
    const reminders = await db
      .select()
      .from(animalReminders)
      .where(eq(animalReminders.animalId, animalId))
      .orderBy(desc(animalReminders.dueDate));

    return NextResponse.json({
      success: true,
      data: reminders,
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/animals/[id]/reminders
// ============================================================================
// Create a new reminder

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: animalId } = await params;
    const body = await request.json();

    // Validate request body
    const validation = createReminderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Verify animal ownership
    const [animal] = await db
      .select()
      .from(animals)
      .where(and(eq(animals.id, animalId), eq(animals.userId, session.user.id)))
      .limit(1);

    if (!animal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
    }

    const validatedData = validation.data;

    // Create reminder
    const [reminder] = await db
      .insert(animalReminders)
      .values({
        id: createId(),
        animalId,
        userId: session.user.id,
        reminderType: validatedData.reminderType,
        title: validatedData.title,
        description: validatedData.description || null,
        dueDate: validatedData.dueDate,
        reminderDate: validatedData.reminderDate || null,
        isRecurring: validatedData.isRecurring || false,
        recurrencePattern: validatedData.recurrencePattern || null,
        recurrenceInterval: validatedData.recurrenceInterval || null,
        recurrenceEndDate: validatedData.recurrenceEndDate || null,
        sendEmail: validatedData.sendEmail ?? true,
        sendPush: validatedData.sendPush ?? true,
        sendSms: validatedData.sendSms ?? false,
        notes: validatedData.notes || null,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: reminder,
      message: 'Reminder created successfully',
    });
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
}
