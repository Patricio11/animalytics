import { AppLayout } from "@/components/layout/AppLayout";
import { requireRole } from "@/lib/auth/server";

/**
 * Shared Layout - Server Component with Authentication
 *
 * This layout protects routes that are accessible to both breeders and pet owners:
 * - /animals - Manage animals
 * - /tasks - Manage tasks
 *
 * Requirements:
 * 1. User must be authenticated (or redirected to /auth/signin)
 * 2. User must have 'breeder' OR 'pet_owner' role (or redirected to /unauthorized)
 */
export default async function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication and role
  // This will automatically redirect if:
  // - Not authenticated → /auth/signin
  // - Not a breeder or pet owner → /unauthorized
  await requireRole(["breeder", "pet_owner"]);

  return <AppLayout>{children}</AppLayout>;
}
