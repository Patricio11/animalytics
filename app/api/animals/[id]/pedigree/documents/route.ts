import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animals, pedigreeDocuments } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { checkPermission } from '@/lib/permissions/server';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { auth } from '@/lib/auth/config';

// ============================================================================
// GET /api/animals/[id]/pedigree/documents
// ============================================================================
// Fetch all pedigree documents for an animal

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check permission
    const { allowed } = await checkPermission(PERMISSIONS.ANIMALS_READ as any);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view animals' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if animal exists
    const [animal] = await db
      .select()
      .from(animals)
      .where(eq(animals.id, id))
      .limit(1);

    if (!animal) {
      return NextResponse.json(
        { error: 'Animal not found' },
        { status: 404 }
      );
    }

    // Fetch documents
    const documents = await db
      .select()
      .from(pedigreeDocuments)
      .where(eq(pedigreeDocuments.animalId, id))
      .orderBy(desc(pedigreeDocuments.uploadedAt));

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching pedigree documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/animals/[id]/pedigree/documents
// ============================================================================
// Upload a new pedigree document

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check permission
    const { allowed } = await checkPermission(PERMISSIONS.ANIMALS_UPDATE as any);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to update animals' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Get session for user attribution
    const session = await auth.api.getSession({ headers: request.headers });

    // Validate required fields
    if (!body.fileUrl) {
      return NextResponse.json(
        { error: 'File URL is required' },
        { status: 400 }
      );
    }

    // Check if animal exists
    const [animal] = await db
      .select()
      .from(animals)
      .where(eq(animals.id, id))
      .limit(1);

    if (!animal) {
      return NextResponse.json(
        { error: 'Animal not found' },
        { status: 404 }
      );
    }

    // Insert document
    const [document] = await db
      .insert(pedigreeDocuments)
      .values({
        animalId: id,
        title: body.title || null,
        fileUrl: body.fileUrl,
        fileName: body.fileName || null,
        fileSize: body.fileSize || null,
        mimeType: body.mimeType || null,
        uploadedBy: session?.user?.id ?? null,
        notes: body.notes || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      document,
    });
  } catch (error) {
    console.error('Error uploading pedigree document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/animals/[id]/pedigree/documents/[documentId]
// ============================================================================
// Delete a pedigree document

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check permission
    const { allowed } = await checkPermission(PERMISSIONS.ANIMALS_UPDATE as any);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to update animals' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Delete document
    const result = await db
      .delete(pedigreeDocuments)
      .where(
        and(
          eq(pedigreeDocuments.id, Number(documentId)),
          eq(pedigreeDocuments.animalId, id)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting pedigree document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
