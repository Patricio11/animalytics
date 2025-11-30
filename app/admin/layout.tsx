import { AdminLayout as AdminLayoutComponent } from "@/components/layout/AdminLayout";
import { requireRole } from "@/lib/auth/server";

/**
 * Admin Layout - Server Component with Authentication
 *
 * This layout protects all admin routes by requiring:
 * 1. User must be authenticated (or redirected to /auth/signin)
 * 2. User must have 'admin' role (or redirected to /unauthorized)
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication and role
  // This will automatically redirect if:
  // - Not authenticated → /auth/signin
  // - Not an admin → /unauthorized
  await requireRole(["admin"]);

  return <AdminLayoutComponent>{children}</AdminLayoutComponent>;
}
