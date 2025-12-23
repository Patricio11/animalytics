import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animals } from '@/lib/db/schema/animals';
import { tasks } from '@/lib/db/schema/tasks';
import { requireAuth } from '@/lib/auth/server';
import { eq, and, desc, gte } from 'drizzle-orm';
import { createNotification } from '@/lib/services/notification-creator';
import { addDays, addWeeks, addMonths, addYears, subMinutes, format as formatDate, parse } from 'date-fns';

/**
 * GET /api/animals/[id]/appointments
 * Get all appointments for an animal
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Get appointments (tasks with event type)
    const appointments = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.animalId, id),
          eq(tasks.type, 'event'),
          eq(tasks.userId, session.user.id)
        )
      )
      .orderBy(desc(tasks.dueDate));

    return NextResponse.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/animals/[id]/appointments
 * Create a new appointment (and recurring instances if specified)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    console.log('Creating appointment for animal:', id);
    console.log('Appointment data:', body);

    // Get animal info
    const animal = await db.query.animals.findFirst({
      where: eq(animals.id, id),
      columns: { name: true },
    });

    if (!animal) {
      return NextResponse.json(
        { success: false, error: 'Animal not found' },
        { status: 404 }
      );
    }

    let tasksCreated = 0;
    const appointmentDateTime = new Date(`${body.appointmentDate}T${body.appointmentTime}`);

    // Helper function to create appointment task
    const createAppointmentTask = async (date: Date) => {
      const appointmentTitle = `${getAppointmentTypeLabel(body.appointmentType)} - ${animal.name}`;
      const appointmentDescription = body.reason 
        ? `${body.reason}\n\nVet: ${body.veterinarianName || 'Not specified'}\nClinic: ${body.clinicName || 'Not specified'}`
        : `Vet: ${body.veterinarianName || 'Not specified'}\nClinic: ${body.clinicName || 'Not specified'}`;

      // Create appointment task
      const [task] = await db
        .insert(tasks)
        .values({
          userId: session.user.id,
          animalId: id,
          type: 'event',
          title: appointmentTitle,
          description: appointmentDescription,
          dueDate: formatDate(date, 'yyyy-MM-dd'),
          dueTime: body.appointmentTime,
          priority: body.appointmentType === 'emergency' ? 'high' : 'medium',
          status: 'pending',
          taskData: {
            eventType: body.appointmentType,
            veterinarianName: body.veterinarianName,
            veterinarianEmail: body.veterinarianEmail,
            veterinarianPhone: body.veterinarianPhone,
            clinicName: body.clinicName,
            clinicAddress: body.clinicAddress,
            reason: body.reason,
            notes: body.notes,
            isRecurring: body.isRecurring || false,
          } as any,
        })
        .returning();

      // Create reminder notification if requested
      if (body.createReminder && body.reminderMinutesBefore) {
        const reminderTime = subMinutes(date, body.reminderMinutesBefore);
        
        await createNotification({
          userId: session.user.id,
          type: 'vet_appointment',
          title: `Upcoming Appointment: ${animal.name}`,
          message: `${getAppointmentTypeLabel(body.appointmentType)} appointment at ${body.appointmentTime}${body.clinicName ? ` at ${body.clinicName}` : ''}`,
          actionUrl: `/tasks`,
          metadata: {
            taskId: task.id,
            animalId: id,
            animalName: animal.name,
            appointmentType: body.appointmentType,
            appointmentDate: formatDate(date, 'yyyy-MM-dd'),
            appointmentTime: body.appointmentTime,
          },
        });
      }

      tasksCreated++;
      return task;
    };

    // Create first appointment
    await createAppointmentTask(appointmentDateTime);

    // Create recurring appointments if specified
    if (body.isRecurring && body.recurrenceEndDate) {
      const endDate = new Date(body.recurrenceEndDate);
      let currentDate = new Date(appointmentDateTime);
      const interval = body.recurrenceInterval || 1;

      // Determine how to increment based on pattern
      const incrementDate = (date: Date): Date => {
        switch (body.recurrencePattern) {
          case 'daily':
            return addDays(date, interval);
          case 'weekly':
            return addWeeks(date, interval);
          case 'monthly':
            return addMonths(date, interval);
          case 'yearly':
            return addYears(date, interval);
          default:
            return addWeeks(date, interval);
        }
      };

      // Create recurring instances (limit to 52 to prevent abuse)
      let iterations = 0;
      const maxIterations = 52;

      while (iterations < maxIterations) {
        currentDate = incrementDate(currentDate);
        
        if (currentDate > endDate) {
          break;
        }

        await createAppointmentTask(currentDate);
        iterations++;
      }

      console.log(`Created ${tasksCreated} appointment instances`);
    }

    return NextResponse.json({
      success: true,
      tasksCreated,
      message: `Appointment${tasksCreated > 1 ? 's' : ''} scheduled successfully`,
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

// Helper function to get readable appointment type label
function getAppointmentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    checkup: 'General Checkup',
    vaccination: 'Vaccination',
    surgery: 'Surgery',
    dental: 'Dental Cleaning',
    consultation: 'Consultation',
    emergency: 'Emergency Visit',
    follow_up: 'Follow-up',
    grooming: 'Grooming',
    xray: 'X-Ray/Imaging',
    blood_work: 'Blood Work',
    other: 'Appointment',
  };
  return labels[type] || 'Appointment';
}
