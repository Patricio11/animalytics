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
  FILE_VALIDATION,
  type UploadResult,
  type FileValidationOptions,
} from './upload';
