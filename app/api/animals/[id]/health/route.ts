import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { healthRecords, animals } from '@/lib/db/schema/animals';
import { tasks } from '@/lib/db/schema/tasks';
import { requireAuth } from '@/lib/auth/server';
import { eq, and, desc } from 'drizzle-orm';
import { createNotification } from '@/lib/services/notification-creator';
import { addDays, parse, format as formatDate } from 'date-fns';

/**
 * GET /api/animals/[id]/health
 * Get all health records for an animal
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const records = await db
      .select()
      .from(healthRecords)
      .where(eq(healthRecords.animalId, id))
      .orderBy(desc(healthRecords.recordDate));

    return NextResponse.json({
      success: true,
      records,
    });
  } catch (error) {
    console.error('Error fetching health records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch health records' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/animals/[id]/health
 * Create a new health record
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const [animal] = await db
      .select({ id: animals.id })
      .from(animals)
      .where(and(eq(animals.id, id), eq(animals.userId, session.user.id)))
      .limit(1);

    if (!animal) {
      return NextResponse.json(
        { success: false, error: 'Animal not found or access denied' },
        { status: 403 }
      );
    }

    const [newRecord] = await db
      .insert(healthRecords)
      .values({
        animalId: id,
        recordType: body.recordType,
        recordDate: body.recordDate,
        veterinarianName: body.veterinarianName,
        veterinarianEmail: body.veterinarianEmail,
        veterinarianPhone: body.veterinarianPhone,
        clinicName: body.clinicName,
        vaccinationType: body.vaccinationType,
        nextDueDate: body.nextDueDate,
        medicationName: body.medicationName,
        dosage: body.dosage,
        frequency: body.frequency,
        startDate: body.startDate,
        endDate: body.endDate,
        diagnosis: body.diagnosis,
        treatment: body.treatment,
        cost: body.cost,
        currency: body.currency,
        notes: body.notes,
        certificateUrl: body.certificateUrl,
      })
      .returning();

    // Create medication reminders if requested
    let tasksCreated = 0;
    if (body.recordType === 'medication' && body.createReminders && body.reminderTimes && body.startDate && body.endDate) {
      try {
        // Get animal info for task creation
        const animal = await db.query.animals.findFirst({
          where: eq(animals.id, id),
          columns: { name: true },
        });

        if (animal) {
          // Parse reminder times
          const times = body.reminderTimes.split(',').map((t: string) => t.trim()).filter((t: string) => t);
          
          // Calculate number of days
          const start = new Date(body.startDate);
          const end = new Date(body.endDate);
          const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

          // Create tasks for each day and each time
          for (let day = 0; day < daysDiff; day++) {
            const taskDate = addDays(start, day);
            
            for (const time of times) {
              try {
                // Parse time (HH:MM format)
                const [hours, minutes] = time.split(':').map(Number);
                if (isNaN(hours) || isNaN(minutes)) continue;

                const dueDateTime = new Date(taskDate);
                dueDateTime.setHours(hours, minutes, 0, 0);

                // Create task
                const [task] = await db
                  .insert(tasks)
                  .values({
                    userId: session.user.id,
                    animalId: id,
                    type: 'misc',
                    title: `Give ${body.medicationName} to ${animal.name}`,
                    description: `Dosage: ${body.dosage || 'As prescribed'}`,
                    dueDate: formatDate(dueDateTime, 'yyyy-MM-dd'),
                    dueTime: time,
                    priority: 'medium',
                    status: 'pending',
                    taskData: {
                      medicationName: body.medicationName,
                      dosage: body.dosage,
                      time: time,
                      healthRecordId: newRecord.id,
                    } as any,
                  })
                  .returning();

                // Create notification
                await createNotification({
                  userId: session.user.id,
                  type: 'medication_reminder',
                  title: `Medication Reminder: ${body.medicationName}`,
                  message: `Time to give ${body.medicationName} (${body.dosage}) to ${animal.name}`,
                  actionUrl: `/tasks`,
                  metadata: {
                    taskId: task.id,
                    animalId: id,
                    animalName: animal.name,
                    medicationName: body.medicationName,
                  },
                });

                tasksCreated++;
              } catch (timeError) {
                console.error(`Error creating task for time ${time}:`, timeError);
              }
            }
          }
        }
      } catch (reminderError) {
        console.error('Error creating medication reminders:', reminderError);
        // Don't fail the whole request if reminders fail
      }
    }

    return NextResponse.json({
      success: true,
      record: newRecord,
      tasksCreated,
    });
  } catch (error) {
    console.error('Error creating health record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create health record' },
      { status: 500 }
    );
  }
}
