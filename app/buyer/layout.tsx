import { BuyerLayout } from "@/components/buyer/BuyerLayout";
import { requireRole } from "@/lib/auth/server";

/**
 * Buyer Layout - Server Component with Authentication
 *
 * This layout protects all buyer routes by requiring:
 * 1. User must be authenticated (or redirected to /auth/signin)
 * 2. User must have 'buyer' role (or redirected to /unauthorized)
 */
export default async function BuyerRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication and role
  // This will automatically redirect if:
  // - Not authenticated → /auth/signin
  // - Not a buyer → /unauthorized
  await requireRole(["buyer"]);

  return <BuyerLayout>{children}</BuyerLayout>;
}
