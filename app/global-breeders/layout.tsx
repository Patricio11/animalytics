"use client";

import { LandingHeader } from "@/components/layout/LandingHeader";

/**
 * Global Breeders Layout - Public Layout
 * 
 * This is a public page accessible to everyone (no authentication required)
 * Uses the landing header for consistent public-facing navigation
 */
export default function GlobalBreedersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main>{children}</main>
    </div>
  );
}
