"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { authClient } from "@/lib/auth/client";

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = authClient.useSession();
  const isAuthenticated = !!session;

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <AppLayout>{children}</AppLayout>;
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main>{children}</main>
    </div>
  );
}
