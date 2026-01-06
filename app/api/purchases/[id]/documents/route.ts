import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { purchases, purchaseDocuments, purchaseTimeline } from '@/lib/db/schema/purchases';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

/**
 * GET /api/purchases/[id]/documents
 * Get documents for a purchase
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: purchaseId } = await params;

    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get purchase
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.id, purchaseId))
      .limit(1);

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // Check if user is part of the purchase
    if (purchase.petOwnerId !== userId && purchase.sellerId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const userRole = purchase.petOwnerId === userId ? 'pet_owner' : 'seller';

    // Get documents accessible to this user
    const documents = await db
      .select()
      .from(purchaseDocuments)
      .where(
        and(
          eq(purchaseDocuments.purchaseId, purchaseId),
          userRole === 'pet_owner'
            ? eq(purchaseDocuments.accessibleToPetOwner, true)
            : eq(purchaseDocuments.accessibleToSeller, true)
        )
      )
      .orderBy(desc(purchaseDocuments.createdAt));

    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/purchases/[id]/documents
 * Upload a document for a purchase
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: purchaseId } = await params;

    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();

    // Get purchase
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.id, purchaseId))
      .limit(1);

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // Check if user is part of the purchase
    if (purchase.petOwnerId !== userId && purchase.sellerId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const userRole = purchase.petOwnerId === userId ? 'pet_owner' : 'seller';

    const {
      documentType,
      documentName,
      fileUrl,
      fileSize,
      mimeType,
      description,
      accessibleToOther = true,
    } = body;

    if (!documentName || !fileUrl) {
      return NextResponse.json(
        { error: 'Document name and file URL are required' },
        { status: 400 }
      );
    }

    // Create document
    const [newDocument] = await db
      .insert(purchaseDocuments)
      .values({
        purchaseId,
        documentType: documentType || 'other',
        documentName,
        fileUrl,
        fileSize,
        mimeType,
        description,
        uploadedBy: userId,
        accessibleToPetOwner: userRole === 'pet_owner' || accessibleToOther,
        accessibleToSeller: userRole === 'seller' || accessibleToOther,
      })
      .returning();

    // Create timeline event
    await db.insert(purchaseTimeline).values({
      purchaseId,
      eventType: 'document',
      eventTitle: 'Document Uploaded',
      eventDescription: `${userRole === 'pet_owner' ? 'Pet Owner' : 'Seller'} uploaded: ${documentName}`,
      actorId: userId,
      actorRole: userRole,
      visibleToPetOwner: userRole === 'pet_owner' || accessibleToOther,
      visibleToSeller: userRole === 'seller' || accessibleToOther,
    });

    return NextResponse.json({
      success: true,
      document: newDocument,
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/purchases/[id]/documents
 * Delete a document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: purchaseId } = await params;

    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { documentId } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get the document
    const [document] = await db
      .select()
      .from(purchaseDocuments)
      .where(eq(purchaseDocuments.id, documentId))
      .limit(1);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if document belongs to this purchase
    if (document.purchaseId !== purchaseId) {
      return NextResponse.json(
        { error: 'Document not found in this purchase' },
        { status: 404 }
      );
    }

    // Check if user uploaded the document
    if (document.uploadedBy !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own documents' },
        { status: 403 }
      );
    }

    // Delete the document
    await db
      .delete(purchaseDocuments)
      .where(eq(purchaseDocuments.id, documentId));

    return NextResponse.json({
      success: true,
      message: 'Document deleted',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
