import { LandingHeader } from "@/components/layout/LandingHeader";

/**
 * Public Layout - No Authentication Required
 *
 * This layout is for public pages that don't require authentication:
 * - Breeders directory
 * - Public breeder profiles
 * - Global marketplace
 * - Any other public-facing pages
 * 
 * Uses the same header as the landing page - no sidebar
 */
export default function PublicLayout({
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
