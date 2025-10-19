import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { checkPermission } from '@/lib/permissions/server';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { fetchPedigree, flattenPedigree } from '@/lib/utils/pedigree';

// ============================================================================
// GET /api/animals/[id]/pedigree/export
// ============================================================================
// Export pedigree as CSV or PDF

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
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const gens = Number(searchParams.get('gens') || '4');

    // Validate format
    if (!['csv', 'pdf'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use csv or pdf' },
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

    // Fetch pedigree tree
    const pedigree = await fetchPedigree(id, 0, gens);

    if (!pedigree) {
      return NextResponse.json(
        { error: 'No pedigree data available' },
        { status: 404 }
      );
    }

    if (format === 'csv') {
      return exportAsCSV(pedigree, animal.name);
    } else {
      // For PDF, return the pedigree data and let the client handle rendering
      // This is simpler than server-side PDF generation with Puppeteer
      return NextResponse.json({
        pedigree,
        animal: {
          name: animal.name,
          registrationNumber: animal.registrationNumber,
          breed: animal.breedId,
          dateOfBirth: animal.dateOfBirth,
        },
        generations: gens,
      });
    }
  } catch (error) {
    console.error('Error exporting pedigree:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// CSV EXPORT HELPER
// ============================================================================

function exportAsCSV(pedigree: any, animalName: string): NextResponse {
  // Flatten pedigree into rows
  const rows = flattenPedigree(pedigree);

  // Create CSV header
  const headers = [
    'Generation',
    'Name',
    'Registration Number',
    'Sex',
    'Breed',
    'Relationship',
    'Date of Birth',
  ];

  // Create CSV rows
  const csvRows = [
    headers.join(','),
    ...rows.map((row) =>
      [
        row.generation,
        escapeCsvValue(row.name),
        escapeCsvValue(row.registrationNumber || ''),
        escapeCsvValue(row.sex || ''),
        escapeCsvValue(row.breed || ''),
        escapeCsvValue(row.relationship),
        escapeCsvValue(row.dateOfBirth || ''),
      ].join(',')
    ),
  ];

  const csvContent = csvRows.join('\n');

  // Return CSV response
  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="pedigree-${animalName.replace(/\s+/g, '-')}.csv"`,
    },
  });
}

// ============================================================================
// CSV VALUE ESCAPING
// ============================================================================

function escapeCsvValue(value: string | null): string {
  if (!value) return '';
  
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  
  return value;
}
