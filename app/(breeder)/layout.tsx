import { AppLayout } from "@/components/layout/AppLayout";
import { requireRole } from "@/lib/auth/server";

/**
 * Breeder Layout - Server Component with Authentication
 *
 * This layout protects all breeder routes by requiring:
 * 1. User must be authenticated (or redirected to /auth/signin)
 * 2. User must have 'breeder' role (or redirected to /unauthorized)
 */
export default async function BreederLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication and role
  // This will automatically redirect if:
  // - Not authenticated → /auth/signin
  // - Not a breeder → /unauthorized
  await requireRole(["breeder"]);

  return <AppLayout>{children}</AppLayout>;
}