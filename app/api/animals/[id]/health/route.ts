import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { healthRecords } from '@/lib/db/schema/animals';
import { requireAuth } from '@/lib/auth/server';
import { eq, and, desc } from 'drizzle-orm';

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

    const [newRecord] = await db
      .insert(healthRecords)
      .values({
        animalId: id,
        recordType: body.recordType,
        recordDate: body.recordDate,
        veterinarianName: body.veterinarianName,
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
        notes: body.notes,
        certificateUrl: body.certificateUrl,
      })
      .returning();

    return NextResponse.json({
      success: true,
      record: newRecord,
    });
  } catch (error) {
    console.error('Error creating health record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create health record' },
      { status: 500 }
    );
  }
}
