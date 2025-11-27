import { BuyerLayout } from "@/components/buyer/BuyerLayout";
import { requireRole } from "@/lib/auth/server";

/**
 * Buyer Layout - Server Component with Authentication
 *
 * This layout protects all buyer routes by requiring:
 * 1. User must be authenticated (or redirected to /auth/signin)
 * 2. User must have 'buyer' or 'breeder' role (breeders can buy from other breeders)
 */
export default async function BuyerRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication and role
  // This will automatically redirect if:
  // - Not authenticated → /auth/signin
  // - Not a buyer or breeder → /unauthorized
  // Note: Breeders can access buyer routes when purchasing from other breeders
  await requireRole(["buyer", "breeder"]);

  return <BuyerLayout>{children}</BuyerLayout>;
}
