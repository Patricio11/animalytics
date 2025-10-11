import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { animals, litters, frozenSemen } from '@/lib/db/schema/animals';
import { matings } from '@/lib/db/schema/matings';
import { tasks } from '@/lib/db/schema/tasks';
import { listings } from '@/lib/db/schema/marketplace';
import { auth } from '@/lib/auth/config';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { eq, and, count, sql, gte, lte } from 'drizzle-orm';

// ============================================================================
// GET /api/dashboard/stats - Get dashboard statistics for current user
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // ========================================================================
    // 1. Animal Statistics
    // ========================================================================

    const animalStats = await db
      .select({
        total: count(),
        active: sql<number>`COUNT(CASE WHEN ${animals.isActive} = true THEN 1 END)`,
        breeding: sql<number>`COUNT(CASE WHEN ${animals.isBreedingActive} = true THEN 1 END)`,
        males: sql<number>`COUNT(CASE WHEN ${animals.sex} = 'male' THEN 1 END)`,
        females: sql<number>`COUNT(CASE WHEN ${animals.sex} = 'female' THEN 1 END)`,
      })
      .from(animals)
      .where(eq(animals.userId, session.user.id));

    // ========================================================================
    // 2. Mating Statistics
    // ========================================================================

    const matingStats = await db
      .select({
        total: count(),
        planned: sql<number>`COUNT(CASE WHEN ${matings.status} = 'planned' THEN 1 END)`,
        confirmed: sql<number>`COUNT(CASE WHEN ${matings.status} = 'confirmed' THEN 1 END)`,
        successful: sql<number>`COUNT(CASE WHEN ${matings.status} = 'resulted_in_litter' THEN 1 END)`,
        unsuccessful: sql<number>`COUNT(CASE WHEN ${matings.status} = 'unsuccessful' THEN 1 END)`,
        recentCount: sql<number>`COUNT(CASE WHEN ${matings.matingDate} >= ${thirtyDaysAgo.toISOString().split('T')[0]} THEN 1 END)`,
      })
      .from(matings)
      .where(eq(matings.userId, session.user.id));

    // ========================================================================
    // 3. Litter Statistics
    // ========================================================================

    const litterStats = await db
      .select({
        total: count(),
        expected: sql<number>`COUNT(CASE WHEN ${litters.status} = 'expected' THEN 1 END)`,
        whelped: sql<number>`COUNT(CASE WHEN ${litters.status} = 'whelped' THEN 1 END)`,
        archived: sql<number>`COUNT(CASE WHEN ${litters.status} = 'archived' THEN 1 END)`,
        totalPuppies: sql<number>`SUM(${litters.puppyCount})`,
        recentCount: sql<number>`COUNT(CASE WHEN ${litters.whelpingDate} >= ${thirtyDaysAgo.toISOString().split('T')[0]} THEN 1 END)`,
      })
      .from(litters)
      .where(eq(litters.userId, session.user.id));

    // ========================================================================
    // 4. Task Statistics
    // ========================================================================

    const todayStr = today.toISOString().split('T')[0];
    const taskStats = await db
      .select({
        total: count(),
        completed: sql<number>`COUNT(CASE WHEN ${tasks.isCompleted} = true THEN 1 END)`,
        pending: sql<number>`COUNT(CASE WHEN ${tasks.isCompleted} = false AND ${tasks.dueDate} >= ${todayStr} THEN 1 END)`,
        overdue: sql<number>`COUNT(CASE WHEN ${tasks.isCompleted} = false AND ${tasks.dueDate} < ${todayStr} THEN 1 END)`,
        highPriority: sql<number>`COUNT(CASE WHEN ${tasks.priority} = 'high' AND ${tasks.isCompleted} = false THEN 1 END)`,
      })
      .from(tasks)
      .where(eq(tasks.userId, session.user.id));

    // ========================================================================
    // 5. Frozen Semen Statistics
    // ========================================================================

    const frozenSemenStats = await db
      .select({
        total: count(),
        active: sql<number>`COUNT(CASE WHEN ${frozenSemen.isActive} = true THEN 1 END)`,
        totalStraws: sql<number>`SUM(${frozenSemen.numberOfStraws})`,
        strawsRemaining: sql<number>`SUM(${frozenSemen.strawsRemaining})`,
        lowStock: sql<number>`COUNT(CASE WHEN ${frozenSemen.strawsRemaining} > 0 AND ${frozenSemen.strawsRemaining} <= 5 THEN 1 END)`,
      })
      .from(frozenSemen)
      .where(eq(frozenSemen.userId, session.user.id));

    // ========================================================================
    // 6. Marketplace Statistics
    // ========================================================================

    const marketplaceStats = await db
      .select({
        total: count(),
        active: sql<number>`COUNT(CASE WHEN ${marketplaceListings.status} = 'active' THEN 1 END)`,
        sold: sql<number>`COUNT(CASE WHEN ${marketplaceListings.status} = 'sold' THEN 1 END)`,
        featured: sql<number>`COUNT(CASE WHEN ${marketplaceListings.featuredTier} IN ('basic', 'premium', 'spotlight') THEN 1 END)`,
        totalViews: sql<number>`SUM(${marketplaceListings.views})`,
      })
      .from(marketplaceListings)
      .where(eq(marketplaceListings.userId, session.user.id));

    // ========================================================================
    // 7. Recent Activity (Last 30 days)
    // ========================================================================

    const recentAnimals = await db.query.animals.findMany({
      where: and(
        eq(animals.userId, session.user.id),
        gte(animals.createdAt, thirtyDaysAgo)
      ),
      with: {
        breed: true,
      },
      orderBy: (animals, { desc }) => [desc(animals.createdAt)],
      limit: 5,
    });

    const recentMatings = await db.query.matings.findMany({
      where: and(
        eq(matings.userId, session.user.id),
        gte(matings.matingDate, thirtyDaysAgo.toISOString().split('T')[0])
      ),
      with: {
        bitch: {
          with: { breed: true },
        },
        dog: {
          with: { breed: true },
        },
      },
      orderBy: (matings, { desc }) => [desc(matings.matingDate)],
      limit: 5,
    });

    const upcomingTasks = await db.query.tasks.findMany({
      where: and(
        eq(tasks.userId, session.user.id),
        eq(tasks.isCompleted, false),
        gte(tasks.dueDate, todayStr)
      ),
      with: {
        animal: {
          with: { breed: true },
        },
      },
      orderBy: (tasks, { asc }) => [asc(tasks.dueDate)],
      limit: 5,
    });

    // ========================================================================
    // 8. Combine and Return
    // ========================================================================

    const stats = {
      animals: {
        total: animalStats[0]?.total || 0,
        active: animalStats[0]?.active || 0,
        breeding: animalStats[0]?.breeding || 0,
        males: animalStats[0]?.males || 0,
        females: animalStats[0]?.females || 0,
      },
      matings: {
        total: matingStats[0]?.total || 0,
        planned: matingStats[0]?.planned || 0,
        confirmed: matingStats[0]?.confirmed || 0,
        successful: matingStats[0]?.successful || 0,
        unsuccessful: matingStats[0]?.unsuccessful || 0,
        recentCount: matingStats[0]?.recentCount || 0,
        successRate:
          matingStats[0]?.total > 0
            ? Math.round(((matingStats[0]?.successful || 0) / matingStats[0].total) * 100)
            : 0,
      },
      litters: {
        total: litterStats[0]?.total || 0,
        expected: litterStats[0]?.expected || 0,
        whelped: litterStats[0]?.whelped || 0,
        archived: litterStats[0]?.archived || 0,
        totalPuppies: litterStats[0]?.totalPuppies || 0,
        recentCount: litterStats[0]?.recentCount || 0,
        averageLitterSize:
          litterStats[0]?.total > 0
            ? Math.round((litterStats[0]?.totalPuppies || 0) / litterStats[0].total)
            : 0,
      },
      tasks: {
        total: taskStats[0]?.total || 0,
        completed: taskStats[0]?.completed || 0,
        pending: taskStats[0]?.pending || 0,
        overdue: taskStats[0]?.overdue || 0,
        highPriority: taskStats[0]?.highPriority || 0,
        completionRate:
          taskStats[0]?.total > 0
            ? Math.round(((taskStats[0]?.completed || 0) / taskStats[0].total) * 100)
            : 0,
      },
      frozenSemen: {
        total: frozenSemenStats[0]?.total || 0,
        active: frozenSemenStats[0]?.active || 0,
        totalStraws: frozenSemenStats[0]?.totalStraws || 0,
        strawsRemaining: frozenSemenStats[0]?.strawsRemaining || 0,
        lowStock: frozenSemenStats[0]?.lowStock || 0,
        utilizationRate:
          frozenSemenStats[0]?.totalStraws > 0
            ? Math.round(
                (((frozenSemenStats[0]?.totalStraws || 0) -
                  (frozenSemenStats[0]?.strawsRemaining || 0)) /
                  frozenSemenStats[0].totalStraws) *
                  100
              )
            : 0,
      },
      marketplace: {
        total: marketplaceStats[0]?.total || 0,
        active: marketplaceStats[0]?.active || 0,
        sold: marketplaceStats[0]?.sold || 0,
        featured: marketplaceStats[0]?.featured || 0,
        totalViews: marketplaceStats[0]?.totalViews || 0,
        averageViews:
          marketplaceStats[0]?.total > 0
            ? Math.round((marketplaceStats[0]?.totalViews || 0) / marketplaceStats[0].total)
            : 0,
      },
      recentActivity: {
        animals: recentAnimals,
        matings: recentMatings,
        upcomingTasks: upcomingTasks,
      },
    };

    return successResponse(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return serverErrorResponse('Failed to fetch dashboard statistics');
  }
}
