"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { authClient } from "@/lib/auth/client";

/**
 * Marketplace Layout - Smart Layout with Auth Detection
 *
 * This layout conditionally renders:
 * - For authenticated users (breeders & pet owners): Full AppLayout (sidebar + header)
 * - For guests: Public layout (landing header only)
 */
export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = authClient.useSession();
  const isAuthenticated = !!session;
  const userRole = (session?.user as any)?.role;
  const isBreederOrPetOwner = userRole === 'breeder' || userRole === 'pet_owner';

  // Show loading state while checking auth
  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Authenticated breeder or pet owner: Use full app layout with sidebar
  if (isAuthenticated && isBreederOrPetOwner) {
    return <AppLayout>{children}</AppLayout>;
  }

  // Guest or other roles: Use public layout with landing header
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main>{children}</main>
    </div>
  );
}
