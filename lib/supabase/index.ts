export { supabase, STORAGE_BUCKET, STORAGE_PATHS, type StoragePath } from './client';
export {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  deleteMultipleFiles,
  getFileUrl,
  extractFilePathFromUrl,
  validateFile,
  generateUniqueFileName,
  generateSeoFileName,
  FILE_VALIDATION,
  type UploadResult,
  type FileValidationOptions,
  type SeoFileContext,
} from './upload';
