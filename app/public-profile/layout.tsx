import { LandingHeader } from "@/components/layout/LandingHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function PublicProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
