import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animals } from '@/lib/db/schema/animals';
import { requireAuth } from '@/lib/auth/server';
import { eq, and } from 'drizzle-orm';
import { scanPedigreeCertificate } from '@/lib/services/pedigree-scanner';

// ============================================================================
// POST /api/animals/[id]/pedigree/scan
// ============================================================================
// Scan pedigree certificate images/PDFs with AI vision and return extracted data

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Verify ownership
    const [animal] = await db
      .select({ id: animals.id, userId: animals.userId })
      .from(animals)
      .where(and(eq(animals.id, id), eq(animals.userId, session.user.id)))
      .limit(1);

    if (!animal) {
      return NextResponse.json(
        { success: false, error: 'Animal not found or access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { imageUrls = [], pdfUrls = [] } = body;

    const totalFiles = imageUrls.length + pdfUrls.length;

    if (totalFiles === 0) {
      return NextResponse.json(
        { success: false, error: 'Please provide at least one image or PDF' },
        { status: 400 }
      );
    }

    if (totalFiles > 4) {
      return NextResponse.json(
        { success: false, error: 'Maximum 4 files allowed per scan' },
        { status: 400 }
      );
    }

    // Scan with AI
    const result = await scanPedigreeCertificate(imageUrls, pdfUrls);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error scanning pedigree:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to scan pedigree certificate' },
      { status: 500 }
    );
  }
}
