import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { frozenSemen, frozenSemenUsage } from '@/lib/db/schema/animals';
import { auth } from '@/lib/auth/config';
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const recordUsageSchema = z.object({
  bitchId: z.string().min(1, 'Bitch ID is required'),
  usageDate: z.string().min(1, 'Usage date is required'),
  strawsUsed: z.number().int().positive('Straws used must be positive'),
  breedingMethod: z.enum(['natural_ai', 'tci', 'surgical_ai', 'frozen']),
  veterinarian: z.string().optional(),
  clinic: z.string().optional(),
  notes: z.string().optional(),
});

// ============================================================================
// POST /api/frozen-semen/[id]/use - Record usage of frozen semen
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    // Verify batch exists and belongs to user
    const batch = await db.query.frozenSemen.findFirst({
      where: and(eq(frozenSemen.id, params.id), eq(frozenSemen.userId, session.user.id)),
    });

    if (!batch) {
      return notFoundResponse('Frozen semen batch not found');
    }

    const body = await request.json();

    // Validate request body
    const validation = recordUsageSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(
        validation.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
      );
    }

    const validatedData = validation.data;

    // Check if enough straws available
    if (validatedData.strawsUsed > batch.strawsRemaining) {
      return validationErrorResponse([
        {
          field: 'strawsUsed',
          message: `Only ${batch.strawsRemaining} straws remaining in this batch`,
        },
      ]);
    }

    // Record usage
    const usageRecord = await db
      .insert(frozenSemenUsage)
      .values({
        frozenSemenId: params.id,
        bitchId: validatedData.bitchId,
        userId: session.user.id,
        usageDate: validatedData.usageDate,
        strawsUsed: validatedData.strawsUsed,
        breedingMethod: validatedData.breedingMethod,
        veterinarian: validatedData.veterinarian,
        clinic: validatedData.clinic,
        notes: validatedData.notes,
      })
      .returning();

    // Update straws remaining
    const updatedBatch = await db
      .update(frozenSemen)
      .set({
        strawsRemaining: batch.strawsRemaining - validatedData.strawsUsed,
        updatedAt: new Date(),
      })
      .where(and(eq(frozenSemen.id, params.id), eq(frozenSemen.userId, session.user.id)))
      .returning();

    return successResponse(
      {
        usage: usageRecord[0],
        batch: updatedBatch[0],
      },
      'Usage recorded successfully'
    );
  } catch (error) {
    console.error('Error recording frozen semen usage:', error);
    return serverErrorResponse('Failed to record usage');
  }
}
