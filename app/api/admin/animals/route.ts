import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animals, breeds, users, breederProfiles } from '@/lib/db/schema';
import { eq, and, or, like, sql, desc, asc, gte, lte, isNotNull, isNull } from 'drizzle-orm';
import { authClient } from '@/lib/auth/server';

export async function GET(request: NextRequest) {
  try {
    const session = await authClient.api.getSession({
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
          isNotNull(animals.sireRegisteredName),
          isNotNull(animals.damRegisteredName)
        )
      );
    } else if (hasPedigree === 'no') {
      conditions.push(
        and(
          isNull(animals.sireRegisteredName),
          isNull(animals.damRegisteredName)
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

    // Filter by status (active/inactive based on deletedAt)
    if (status === 'active') {
      conditions.push(isNull(animals.deletedAt));
    } else if (status === 'inactive') {
      conditions.push(isNotNull(animals.deletedAt));
    }

    // Default to active animals only if no status filter
    if (status === 'all') {
      // Show all
    } else if (!status || status === 'active') {
      conditions.push(isNull(animals.deletedAt));
    }

    // Determine sort column
    let orderByColumn;
    switch (sortBy) {
      case 'name':
        orderByColumn = animals.name;
        break;
      case 'breed':
        orderByColumn = breeds.name;
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

    // Fetch animals with joins
    const animalsData = await db
      .select({
        id: animals.id,
        name: animals.name,
        registeredName: animals.registeredName,
        sex: animals.sex,
        dateOfBirth: animals.dateOfBirth,
        profileImageUrl: animals.profileImageUrl,
        color: animals.color,
        markings: animals.markings,
        weight: animals.weight,
        height: animals.height,
        microchipNumber: animals.microchipNumber,
        registrationNumber: animals.registrationNumber,
        dndProfileNumber: animals.dndProfileNumber,
        breederName: animals.breederName,
        ownerName: animals.ownerName,
        location: animals.location,
        bio: animals.bio,
        userId: animals.userId,
        breedId: animals.breedId,
        createdAt: animals.createdAt,
        updatedAt: animals.updatedAt,
        deletedAt: animals.deletedAt,
        sireRegisteredName: animals.sireRegisteredName,
        damRegisteredName: animals.damRegisteredName,
        breed: {
          id: breeds.id,
          name: breeds.name,
        },
        owner: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(animals)
      .leftJoin(breeds, eq(animals.breedId, breeds.id))
      .leftJoin(users, eq(animals.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderByFn(orderByColumn))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(animals)
      .leftJoin(breeds, eq(animals.breedId, breeds.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalCount = Number(totalCountResult[0]?.count || 0);
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
      .from(animals)
      .where(isNull(animals.deletedAt));

    // Active vs Inactive
    const activeCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(animals)
      .where(isNull(animals.deletedAt));

    const inactiveCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(animals)
      .where(isNotNull(animals.deletedAt));

    // Animals by sex
    const bySex = await db
      .select({
        sex: animals.sex,
        count: sql<number>`count(*)`,
      })
      .from(animals)
      .where(isNull(animals.deletedAt))
      .groupBy(animals.sex);

    // Top 5 breeds
    const topBreeds = await db
      .select({
        breedName: breeds.name,
        count: sql<number>`count(*)`,
      })
      .from(animals)
      .leftJoin(breeds, eq(animals.breedId, breeds.id))
      .where(isNull(animals.deletedAt))
      .groupBy(breeds.name)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(5);

    // Animals with pedigree
    const withPedigree = await db
      .select({ count: sql<number>`count(*)` })
      .from(animals)
      .where(
        and(
          isNull(animals.deletedAt),
          or(
            isNotNull(animals.sireRegisteredName),
            isNotNull(animals.damRegisteredName)
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
          isNull(animals.deletedAt),
          gte(animals.createdAt, thirtyDaysAgo.toISOString())
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
