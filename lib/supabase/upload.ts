import { supabase, STORAGE_BUCKET, StoragePath } from './client';

/**
 * File upload result type
 */
export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * File validation options
 */
export interface FileValidationOptions {
  maxSizeInMB?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

/**
 * Default validation options for different file types
 */
export const FILE_VALIDATION = {
  IMAGE: {
    maxSizeInMB: 5,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'] as string[],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'] as string[],
  },
  DOCUMENT: {
    maxSizeInMB: 10,
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ] as string[],
    allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'] as string[],
  },
  ANY: {
    maxSizeInMB: 20,
    allowedTypes: [] as string[],
    allowedExtensions: [] as string[],
  },
};

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  options: FileValidationOptions = FILE_VALIDATION.ANY
): { valid: boolean; error?: string } {
  const { maxSizeInMB = 20, allowedTypes = [], allowedExtensions = [] } = options;

  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeInMB}MB limit`,
    };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: `File extension ${fileExtension} is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Generate a unique file name to prevent collisions
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.slice(originalName.lastIndexOf('.'));
  const nameWithoutExt = originalName.slice(0, originalName.lastIndexOf('.'));
  
  // Sanitize filename - remove special characters
  const sanitizedName = nameWithoutExt
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
  
  return `${sanitizedName}-${timestamp}-${randomString}${extension}`;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  storagePath: StoragePath,
  options: FileValidationOptions = FILE_VALIDATION.ANY,
  customFileName?: string
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(file, options);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Generate unique file name
    const fileName = customFileName || generateUniqueFileName(file.name);
    const filePath = `${storagePath}/${fileName}`;

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload file',
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  storagePath: StoragePath,
  options: FileValidationOptions = FILE_VALIDATION.ANY
): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => uploadFile(file, storagePath, options));
  return Promise.all(uploadPromises);
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete file',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete multiple files
 */
export async function deleteMultipleFiles(filePaths: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(filePaths);

    if (error) {
      console.error('Supabase delete multiple error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete files',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete multiple error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get file URL from path
 */
export function getFileUrl(filePath: string): string {
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

/**
 * Extract file path from URL
 */
export function extractFilePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split(`/${STORAGE_BUCKET}/`);
    return pathParts.length > 1 ? pathParts[1] : null;
  } catch {
    return null;
  }
}
