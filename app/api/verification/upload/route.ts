import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verificationRequests, verificationDocuments, verificationAuditLog } from '@/lib/db/schema/verification-requests';
import { auth } from '@/lib/auth/config';
import { eq, and } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/verification/upload
 * Upload verification document to Supabase storage
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    const verificationId = formData.get('verificationId') as string;
    const documentType = formData.get('documentType') as string;
    const category = formData.get('category') as string;

    if (!file || !verificationId || !documentType || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify verification request belongs to user
    const verificationRequest = await db.query.verificationRequests.findFirst({
      where: and(
        eq(verificationRequests.id, verificationId),
        eq(verificationRequests.userId, userId)
      ),
    });

    if (!verificationRequest) {
      return NextResponse.json(
        { error: 'Verification request not found' },
        { status: 404 }
      );
    }

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and PDF are allowed' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${verificationId}/${documentType}_${timestamp}.${fileExt}`;

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(fileName);

    // Save document record
    const [document] = await db.insert(verificationDocuments).values({
      verificationRequestId: verificationId,
      userId,
      documentType,
      category,
      fileName: file.name,
      fileUrl: publicUrl,
      fileSize: file.size.toString(),
      mimeType: file.type,
      capturedWithCamera: false, // Could be detected from EXIF data
      encrypted: false,
      status: 'pending',
      uploadedFromIp: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      uploadedFromDevice: request.headers.get('user-agent') || undefined,
    }).returning();

    // Update verification request with document URL
    const updateField: Record<string, string> = {};
    updateField[`${documentType}Url`] = publicUrl;

    await db.update(verificationRequests)
      .set({
        ...updateField,
        updatedAt: new Date(),
      })
      .where(eq(verificationRequests.id, verificationId));

    // Create audit log entry
    await db.insert(verificationAuditLog).values({
      verificationRequestId: verificationId,
      userId,
      action: 'document_uploaded',
      documentType,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    console.log(`✅ Document uploaded: ${documentType} for verification ${verificationId}`);

    return NextResponse.json({
      success: true,
      document,
      fileUrl: publicUrl,
      message: 'Document uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
