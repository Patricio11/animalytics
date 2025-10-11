import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema/tasks';

export async function seedTasks(userId: string, animalIds: string[]) {
  console.log('Seeding tasks for user:', userId);

  if (animalIds.length === 0) {
    console.log('⚠️ No animals available to seed tasks');
    return [];
  }

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const sampleTasks = [
    {
      id: 'task1',
      userId,
      type: 'feeding' as const,
      title: 'Morning Feeding',
      animalId: animalIds[0],
      dueDate: today.toISOString().split('T')[0],
      priority: 'high' as const,
      taskData: {
        foodType: 'Premium Dry Food',
        amount: 250,
        unit: 'grams',
        time: '08:00',
      },
      notes: 'Morning feeding',
    },
    {
      id: 'task2',
      userId,
      type: 'exercise' as const,
      title: 'Morning Walk',
      animalId: animalIds[0],
      dueDate: today.toISOString().split('T')[0],
      priority: 'medium' as const,
      taskData: {
        exerciseType: 'walk',
        duration: 45,
      },
      notes: 'Daily morning walk',
    },
    {
      id: 'task3',
      userId,
      type: 'grooming' as const,
      title: 'Monthly Bath',
      animalId: animalIds[1],
      dueDate: tomorrow.toISOString().split('T')[0],
      priority: 'low' as const,
      taskData: {
        groomingType: 'bath',
        frequency: 'monthly',
      },
      notes: 'Monthly bath and brushing',
    },
    {
      id: 'task4',
      userId,
      type: 'weight' as const,
      title: 'Weight Check',
      animalId: animalIds[2],
      dueDate: nextWeek.toISOString().split('T')[0],
      priority: 'medium' as const,
      taskData: {
        weight: 35.2,
        weightUnit: 'kg',
      },
      notes: 'Weekly weight check',
    },
    {
      id: 'task5',
      userId,
      type: 'cleaning' as const,
      title: 'Kennel Cleaning',
      dueDate: today.toISOString().split('T')[0],
      priority: 'medium' as const,
      taskData: {
        area: 'Kennel Area',
        cleaningType: 'Deep Clean',
        frequency: 'weekly',
      },
      notes: 'Weekly deep clean of all kennel areas',
    },
    {
      id: 'task6',
      userId,
      type: 'event' as const,
      title: 'Annual Checkup',
      animalId: animalIds[0],
      dueDate: nextWeek.toISOString().split('T')[0],
      priority: 'high' as const,
      taskData: {
        eventType: 'Vet Visit',
        title: 'Annual Checkup',
        time: '14:00',
        isRecurring: false,
      },
      notes: 'Annual health checkup with Dr. Johnson',
    },
  ];

  const createdTasks = await db.insert(tasks).values(sampleTasks).returning();

  console.log(`✅ Created ${createdTasks.length} tasks`);
  return createdTasks;
}
