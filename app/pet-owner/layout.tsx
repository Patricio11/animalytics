import { PetOwnerLayout } from "@/components/pet-owner/PetOwnerLayout";
import { requireRole } from "@/lib/auth/server";

/**
 * Pet Owner Layout - Server Component with Authentication
 *
 * This layout protects all pet owner routes by requiring:
 * 1. User must be authenticated (or redirected to /auth/signin)
 * 2. User must have 'pet_owner' or 'breeder' role (breeders can buy from other breeders)
 */
export default async function PetOwnerRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication and role
  // This will automatically redirect if:
  // - Not authenticated → /auth/signin
  // - Not a buyer or breeder → /unauthorized
  // Note: Breeders can access buyer routes when purchasing from other breeders
  await requireRole(["pet_owner", "breeder"]);

  return <PetOwnerLayout>{children}</PetOwnerLayout>;
}
