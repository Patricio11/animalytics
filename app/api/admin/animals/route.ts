import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animals, breeds, users, breederProfiles } from '@/lib/db/schema';
import { eq, and, or, like, sql, desc, asc, gte, lte, isNotNull, isNull } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const offset = (page - 1) * limit;

    // Filters
    const search = searchParams.get('search') || '';
    const breedId = searchParams.get('breedId') || '';
    const sex = searchParams.get('sex') || '';
    const location = searchParams.get('location') || '';
    const ownerId = searchParams.get('ownerId') || '';
    const breederName = searchParams.get('breederName') || '';
    const ownerName = searchParams.get('ownerName') || '';
    const hasPedigree = searchParams.get('hasPedigree') || '';
    const ageMin = searchParams.get('ageMin') || '';
    const ageMax = searchParams.get('ageMax') || '';
    const status = searchParams.get('status') || 'all'; // all, active, inactive

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where conditions
    const conditions: any[] = [];

    // Search by name, registration number, or microchip
    if (search) {
      conditions.push(
        or(
          like(animals.name, `%${search}%`),
          like(animals.registeredName, `%${search}%`),
          like(animals.registrationNumber, `%${search}%`),
          like(animals.microchipNumber, `%${search}%`)
        )
      );
    }

    // Filter by breed
    if (breedId) {
      conditions.push(eq(animals.breedId, breedId));
    }

    // Filter by sex
    if (sex) {
      conditions.push(eq(animals.sex, sex as 'male' | 'female'));
    }

    // Filter by location
    if (location) {
      conditions.push(like(animals.location, `%${location}%`));
    }

    // Filter by owner (user ID)
    if (ownerId) {
      conditions.push(eq(animals.userId, ownerId));
    }

    // Filter by breeder name (manual entry)
    if (breederName) {
      conditions.push(like(animals.breederName, `%${breederName}%`));
    }

    // Filter by owner name (manual entry)
    if (ownerName) {
      conditions.push(like(animals.ownerName, `%${ownerName}%`));
    }

    // Filter by pedigree status
    if (hasPedigree === 'yes') {
      conditions.push(
        or(
          isNotNull(animals.sireId),
          isNotNull(animals.damId)
        )
      );
    } else if (hasPedigree === 'no') {
      conditions.push(
        and(
          isNull(animals.sireId),
          isNull(animals.damId)
        )
      );
    }

    // Filter by age (calculate from dateOfBirth)
    if (ageMin || ageMax) {
      const now = new Date();
      
      if (ageMin) {
        const minDate = new Date(now.getFullYear() - parseInt(ageMax || ageMin), now.getMonth(), now.getDate());
        conditions.push(lte(animals.dateOfBirth, minDate.toISOString()));
      }
      
      if (ageMax) {
        const maxDate = new Date(now.getFullYear() - parseInt(ageMin || ageMax), now.getMonth(), now.getDate());
        conditions.push(gte(animals.dateOfBirth, maxDate.toISOString()));
      }
    }

    // Filter by status (active/inactive based on isActive)
    if (status === 'active') {
      conditions.push(eq(animals.isActive, true));
    } else if (status === 'inactive') {
      conditions.push(eq(animals.isActive, false));
    }
    // If status === 'all', don't add any status filter

    // Determine sort column
    let orderByColumn;
    switch (sortBy) {
      case 'name':
        orderByColumn = animals.name;
        break;
      case 'breed':
        // Note: Can't sort by breed name with db.query, will sort by breedId
        orderByColumn = animals.breedId;
        break;
      case 'dateOfBirth':
        orderByColumn = animals.dateOfBirth;
        break;
      case 'createdAt':
      default:
        orderByColumn = animals.createdAt;
        break;
    }

    const orderByFn = sortOrder === 'asc' ? asc : desc;

    // Fetch animals using db.query pattern (like breeder side)
    const animalsData = await db.query.animals.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        breed: true,
        owner: {
          columns: {
            id: true,
            name: true,
            email: true,
          }
        },
        breeder: {
          columns: {
            id: true,
            name: true,
          }
        },
      },
      orderBy: orderByFn(orderByColumn),
      limit,
      offset,
    });

    // Get total count for pagination
    const totalCountResult = await db.query.animals.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      columns: { id: true },
    });
    
    const totalCount = totalCountResult.length;
    const totalPages = Math.ceil(totalCount / limit);

    // Get stats for dashboard
    const stats = await getAnimalStats();

    return NextResponse.json({
      animals: animalsData,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
      stats,
    });
  } catch (error) {
    console.error('Error fetching animals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch animals' },
      { status: 500 }
    );
  }
}

async function getAnimalStats() {
  try {
    // Total animals
    const totalAnimals = await db
      .select({ count: sql<number>`count(*)` })
      .from(animals);

    // Active vs Inactive
    const activeCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(animals)
      .where(eq(animals.isActive, true));

    const inactiveCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(animals)
      .where(eq(animals.isActive, false));

    // Animals by sex
    const bySex = await db
      .select({
        sex: animals.sex,
        count: sql<number>`count(*)`,
      })
      .from(animals)
      .where(eq(animals.isActive, true))
      .groupBy(animals.sex);

    // Top 5 breeds
    const topBreeds = await db
      .select({
        breedName: breeds.name,
        count: sql<number>`count(*)`,
      })
      .from(animals)
      .leftJoin(breeds, eq(animals.breedId, breeds.id))
      .where(eq(animals.isActive, true))
      .groupBy(breeds.name)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(5);

    // Animals with pedigree
    const withPedigree = await db
      .select({ count: sql<number>`count(*)` })
      .from(animals)
      .where(
        and(
          eq(animals.isActive, true),
          or(
            isNotNull(animals.sireId),
            isNotNull(animals.damId)
          )
        )
      );

    // Recent additions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAdditions = await db
      .select({ count: sql<number>`count(*)` })
      .from(animals)
      .where(
        and(
          eq(animals.isActive, true),
          gte(animals.createdAt, thirtyDaysAgo)
        )
      );

    return {
      totalAnimals: Number(totalAnimals[0]?.count || 0),
      activeAnimals: Number(activeCount[0]?.count || 0),
      inactiveAnimals: Number(inactiveCount[0]?.count || 0),
      bySex: bySex.map(s => ({
        sex: s.sex,
        count: Number(s.count),
      })),
      topBreeds: topBreeds.map(b => ({
        breed: b.breedName || 'Unknown',
        count: Number(b.count),
      })),
      withPedigree: Number(withPedigree[0]?.count || 0),
      recentAdditions: Number(recentAdditions[0]?.count || 0),
    };
  } catch (error) {
    console.error('Error fetching animal stats:', error);
    return {
      totalAnimals: 0,
      activeAnimals: 0,
      inactiveAnimals: 0,
      bySex: [],
      topBreeds: [],
      withPedigree: 0,
      recentAdditions: 0,
    };
  }
}
