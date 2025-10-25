"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { authClient } from "@/lib/auth/client";

/**
 * Breeders Layout - Smart Layout with Auth Detection
 *
 * This layout conditionally renders:
 * - For authenticated breeders: Full AppLayout (sidebar + header)
 * - For guests: Public layout (landing header only)
 */
export default function BreedersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = authClient.useSession();
  const isAuthenticated = !!session;
  const isBreeder = (session?.user as any)?.role === 'breeder';

  // Show loading state while checking auth
  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Authenticated breeder: Use full app layout with sidebar
  if (isAuthenticated && isBreeder) {
    return <AppLayout>{children}</AppLayout>;
  }

  // Guest or non-breeder: Use public layout with landing header
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main>{children}</main>
    </div>
  );
}
