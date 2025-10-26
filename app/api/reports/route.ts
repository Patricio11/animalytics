import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { reportGenerations, exportHistory } from '@/lib/db/schema/reports';
import { tasks } from '@/lib/db/schema/tasks';
import { animals, litters, puppies } from '@/lib/db/schema/animals';
import { matings } from '@/lib/db/schema/matings';
import { auth } from '@/lib/auth/config';
import {
  successResponse,
  createdResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const generateReportSchema = z.object({
  reportType: z.enum([
    'feeding',
    'exercise',
    'grooming',
    'cleaning',
    'puppies',
    'events',
    'mating_history',
  ]),
  dateRange: z.object({
    from: z.string().min(1, 'From date is required'),
    to: z.string().min(1, 'To date is required'),
  }),
  filters: z
    .object({
      animalId: z.string().optional(),
      taskType: z.string().optional(),
      eventType: z.string().optional(),
      damId: z.string().optional(),
      sireId: z.string().optional(),
    })
    .optional(),
});

const exportReportSchema = z.object({
  reportId: z.string().min(1, 'Report ID is required'),
  format: z.enum(['csv', 'pdf']),
});

// ============================================================================
// POST /api/reports/generate - Generate report
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // Validate request body
    const validation = generateReportSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(
        validation.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
      );
    }

    const { reportType, dateRange, filters } = validation.data;

    let reportData: any = {};
    let recordCount = 0;

    // Build where conditions for date range
    const dateConditions = [
      eq(tasks.userId, session.user.id),
      gte(tasks.dueDate, dateRange.from),
      lte(tasks.dueDate, dateRange.to),
    ];

    // ========================================================================
    // Generate report based on type
    // ========================================================================

    switch (reportType) {
      case 'feeding': {
        const feedingTasks = await db.query.tasks.findMany({
          where: and(
            ...dateConditions,
            eq(tasks.type, 'feeding'),
            filters?.animalId ? eq(tasks.animalId, filters.animalId) : undefined
          ),
          with: {
            animal: {
              with: { breed: true },
            },
          },
          orderBy: desc(tasks.dueDate),
        });

        const completed = feedingTasks.filter((t) => t.status === 'completed').length;
        const pending = feedingTasks.filter((t) => t.status === 'pending').length;

        reportData = {
          tasks: feedingTasks,
          summary: {
            total: feedingTasks.length,
            completed,
            pending,
          },
        };
        recordCount = feedingTasks.length;
        break;
      }

      case 'exercise': {
        const exerciseTasks = await db.query.tasks.findMany({
          where: and(
            ...dateConditions,
            eq(tasks.type, 'exercise'),
            filters?.animalId ? eq(tasks.animalId, filters.animalId) : undefined
          ),
          with: {
            animal: {
              with: { breed: true },
            },
          },
          orderBy: desc(tasks.dueDate),
        });

        const completed = exerciseTasks.filter((t) => t.status === 'completed').length;
        const totalMinutes = exerciseTasks.reduce((sum, t) => {
          const duration = (t.taskData as any)?.duration || 0;
          return sum + duration;
        }, 0);

        reportData = {
          tasks: exerciseTasks,
          summary: {
            total: exerciseTasks.length,
            completed,
            totalMinutes,
          },
        };
        recordCount = exerciseTasks.length;
        break;
      }

      case 'grooming': {
        const groomingTasks = await db.query.tasks.findMany({
          where: and(
            ...dateConditions,
            eq(tasks.type, 'grooming'),
            filters?.animalId ? eq(tasks.animalId, filters.animalId) : undefined
          ),
          with: {
            animal: {
              with: { breed: true },
            },
          },
          orderBy: desc(tasks.dueDate),
        });

        const completed = groomingTasks.filter((t) => t.status === 'completed').length;
        const pending = groomingTasks.filter((t) => t.status === 'pending').length;

        reportData = {
          tasks: groomingTasks,
          summary: {
            total: groomingTasks.length,
            completed,
            pending,
          },
        };
        recordCount = groomingTasks.length;
        break;
      }

      case 'cleaning': {
        const cleaningTasks = await db.query.tasks.findMany({
          where: and(
            ...dateConditions,
            eq(tasks.type, 'cleaning')
          ),
          orderBy: desc(tasks.dueDate),
        });

        const completed = cleaningTasks.filter((t) => t.status === 'completed').length;
        const pending = cleaningTasks.filter((t) => t.status === 'pending').length;

        reportData = {
          tasks: cleaningTasks,
          summary: {
            total: cleaningTasks.length,
            completed,
            pending,
          },
        };
        recordCount = cleaningTasks.length;
        break;
      }

      case 'puppies': {
        // First get user's animals to filter litters
        const userAnimals = await db.query.animals.findMany({
          where: eq(animals.userId, session.user.id),
        });
        const animalIds = userAnimals.map(a => a.id);

        const litterRecords = await db.query.litters.findMany({
          where: and(
            gte(litters.actualWhelpingDate, dateRange.from),
            lte(litters.actualWhelpingDate, dateRange.to)
          ) as any,
          with: {
            bitch: {
              with: { breed: true },
            },
            sire: {
              with: { breed: true },
            },
            puppies: true, // ✅ Use the relation to fetch puppies
          },
          orderBy: desc(litters.actualWhelpingDate),
        }).then(litters => 
          // Filter to only include litters where bitch belongs to user
          litters.filter(l => animalIds.includes(l.bitchId))
        );

        const totalPuppies = litterRecords.reduce((sum, l) => sum + (l.puppyCount || 0), 0);
        
        // Count puppies by status using the relation
        const retainedPuppies = litterRecords.reduce((sum, l) => 
          sum + (l.puppies?.filter(p => p.status === 'retained').length || 0), 0
        );
        const soldPuppies = litterRecords.reduce((sum, l) => 
          sum + (l.puppies?.filter(p => p.status === 'sold').length || 0), 0
        );

        reportData = {
          litters: litterRecords,
          summary: {
            totalLitters: litterRecords.length,
            totalPuppies,
            retained: retainedPuppies,
            sold: soldPuppies,
          },
        };
        recordCount = litterRecords.length;
        break;
      }

      case 'events': {
        const eventTasks = await db.query.tasks.findMany({
          where: and(
            ...dateConditions,
            eq(tasks.type, 'event'),
            filters?.animalId ? eq(tasks.animalId, filters.animalId) : undefined
          ),
          with: {
            animal: {
              with: { breed: true },
            },
          },
          orderBy: desc(tasks.dueDate),
        });

        reportData = {
          events: eventTasks,
          summary: {
            total: eventTasks.length,
          },
        };
        recordCount = eventTasks.length;
        break;
      }

      case 'mating_history': {
        const matingRecords = await db.query.matings.findMany({
          where: and(
            eq(matings.userId, session.user.id),
            gte(matings.matingDate, dateRange.from),
            lte(matings.matingDate, dateRange.to),
            filters?.damId ? eq(matings.bitchId, filters.damId) : undefined,
            filters?.sireId ? eq(matings.dogId, filters.sireId) : undefined
          ),
          with: {
            bitch: {
              with: { breed: true },
            },
            dog: {
              with: { breed: true },
            },
            frozenSemen: true,
          },
          orderBy: desc(matings.matingDate),
        });

        reportData = {
          matings: matingRecords,
          summary: {
            total: matingRecords.length,
            successful: matingRecords.filter((m) => m.status === 'resulted_in_litter').length,
            unsuccessful: matingRecords.filter((m) => m.status === 'unsuccessful').length,
          },
        };
        recordCount = matingRecords.length;
        break;
      }

      default:
        return validationErrorResponse([
          {
            field: 'reportType',
            message: 'Invalid report type',
          },
        ]);
    }

    // ========================================================================
    // Save report generation record
    // ========================================================================

    const report = await db
      .insert(reportGenerations)
      .values({
        userId: session.user.id,
        reportType,
        reportName: `${reportType.replace('_', ' ')} Report - ${dateRange.from} to ${dateRange.to}`,
        startDate: dateRange.from,
        endDate: dateRange.to,
        filters: filters || {},
        reportData,
        recordCount,
      })
      .returning();

    return createdResponse(report[0], 'Report generated successfully');
  } catch (error) {
    console.error('Error generating report:', error);
    return serverErrorResponse('Failed to generate report');
  }
}

// ============================================================================
// GET /api/reports - List report history
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('reportType');

    let whereClause = eq(reportGenerations.userId, session.user.id);

    if (reportType && reportType !== 'all') {
      whereClause = and(
        whereClause,
        eq(reportGenerations.reportType, reportType as any)
      ) as any;
    }

    const reports = await db.query.reportGenerations.findMany({
      where: whereClause,
      orderBy: desc(reportGenerations.generatedAt),
    });

    return successResponse(reports, undefined, {
      total: reports.length,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return serverErrorResponse('Failed to fetch reports');
  }
}
