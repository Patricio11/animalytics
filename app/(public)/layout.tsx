import { PublicHeader } from "@/components/layout/PublicHeader";

/**
 * Public Layout - No Authentication Required
 *
 * This layout is for public pages that don't require authentication:
 * - Breeders directory
 * - Public breeder profiles
 * - Any other public-facing pages
 * 
 * Simple header with navigation and auth buttons - no sidebar
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>{children}</main>
    </div>
  );
}
