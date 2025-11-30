import { AppLayout } from "@/components/layout/AppLayout";
import { requireRole } from "@/lib/auth/server";

/**
 * Veterinarian Layout - Server Component with Authentication
 *
 * This layout protects all vet routes by requiring:
 * 1. User must be authenticated (or redirected to /auth/signin)
 * 2. User must have 'veterinarian' role
 */
export default async function VetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication and role
  await requireRole(["veterinarian"]);

  return <AppLayout>{children}</AppLayout>;
}