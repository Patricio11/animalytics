import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Generate typed hooks for client-side file uploads
export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();
