import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { reportGenerations, exportHistory } from '@/lib/db/schema/reports';
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

const exportReportSchema = z.object({
  reportId: z.string().min(1, 'Report ID is required'),
  format: z.enum(['csv', 'pdf'], { required_error: 'Export format is required' }),
});

// ============================================================================
// POST /api/reports/export - Export report to CSV or PDF
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // Validate request body
    const validation = exportReportSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(
        validation.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
      );
    }

    const { reportId, format } = validation.data;

    // Verify report exists and belongs to user
    const report = await db.query.reportGenerations.findFirst({
      where: and(
        eq(reportGenerations.id, reportId),
        eq(reportGenerations.userId, session.user.id)
      ),
    });

    if (!report) {
      return notFoundResponse('Report not found');
    }

    // Generate file path (this would be handled by file storage in production)
    const fileName = `${report.reportType}_${new Date().toISOString().split('T')[0]}.${format}`;
    const filePath = `/exports/${session.user.id}/${fileName}`;

    // Log export history
    const exportRecord = await db
      .insert(exportHistory)
      .values({
        userId: session.user.id,
        reportId: report.id,
        format,
        fileName,
        filePath,
        fileSize: 0, // Would be calculated after actual file generation
      })
      .returning();

    // In production, this would:
    // 1. Generate the actual CSV/PDF file
    // 2. Upload to cloud storage (S3, etc.)
    // 3. Return download URL
    // For now, return the report data for client-side generation

    return successResponse(
      {
        export: exportRecord[0],
        reportData: report.reportData,
        downloadUrl: filePath, // In production, this would be a signed S3 URL
      },
      'Export initiated successfully'
    );
  } catch (error) {
    console.error('Error exporting report:', error);
    return serverErrorResponse('Failed to export report');
  }
}
