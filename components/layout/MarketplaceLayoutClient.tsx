"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { authClient } from "@/lib/auth/client";

/**
 * Marketplace Layout Client - Smart Layout with Auth Detection
 *
 * Conditionally renders:
 * - Authenticated users (breeders & pet owners): Full AppLayout (sidebar + header)
 * - Guests: Public layout (landing header only)
 */
export default function MarketplaceLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = authClient.useSession();
  const isAuthenticated = !!session;
  const userRole = (session?.user as any)?.role;
  const isBreederOrPetOwner = userRole === 'breeder' || userRole === 'pet_owner';

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated && isBreederOrPetOwner) {
    return <AppLayout>{children}</AppLayout>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
