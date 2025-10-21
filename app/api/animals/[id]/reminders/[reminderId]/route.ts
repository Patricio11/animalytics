import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animalReminders, animals } from '@/lib/db/schema/animals';
import { auth } from '@/lib/auth/config';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateReminderSchema = z.object({
  reminderType: z.enum(['vaccination', 'deworming', 'vet_checkup', 'grooming', 'medication', 'heat_cycle', 'breeding', 'custom']).optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  reminderDate: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  recurrenceInterval: z.number().int().positive().optional(),
  recurrenceEndDate: z.string().optional(),
  isCompleted: z.boolean().optional(),
  sendEmail: z.boolean().optional(),
  sendPush: z.boolean().optional(),
  sendSms: z.boolean().optional(),
  notes: z.string().optional(),
});

// ============================================================================
// PATCH /api/animals/[id]/reminders/[reminderId]
// ============================================================================
// Update a reminder

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reminderId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: animalId, reminderId } = await params;
    const body = await request.json();

    // Validate request body
    const validation = updateReminderSchema.safeParse(body);
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

    // Prepare update data
    const updateData: any = {
      ...validatedData,
      updatedAt: new Date(),
    };

    // If marking as completed, set completedAt
    if (validatedData.isCompleted === true) {
      updateData.completedAt = new Date();
    } else if (validatedData.isCompleted === false) {
      updateData.completedAt = null;
    }

    // Update reminder
    const [updated] = await db
      .update(animalReminders)
      .set(updateData)
      .where(
        and(
          eq(animalReminders.id, reminderId),
          eq(animalReminders.animalId, animalId),
          eq(animalReminders.userId, session.user.id)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Reminder updated successfully',
    });
  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/animals/[id]/reminders/[reminderId]
// ============================================================================
// Delete a reminder

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reminderId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: animalId, reminderId } = await params;

    // Verify animal ownership
    const [animal] = await db
      .select()
      .from(animals)
      .where(and(eq(animals.id, animalId), eq(animals.userId, session.user.id)))
      .limit(1);

    if (!animal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
    }

    // Delete reminder
    const [deleted] = await db
      .delete(animalReminders)
      .where(
        and(
          eq(animalReminders.id, reminderId),
          eq(animalReminders.animalId, animalId),
          eq(animalReminders.userId, session.user.id)
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Reminder deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
}
