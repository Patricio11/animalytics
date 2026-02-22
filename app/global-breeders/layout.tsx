import type { Metadata } from 'next';
import { LandingHeader } from "@/components/layout/LandingHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const metadata: Metadata = {
  title: 'Global Breeders Directory - Find Breeders Worldwide',
  description: 'Search and connect with verified breeders from around the world. Browse by breed, location, and specialization on the Animalytics global breeders directory.',
  keywords: [
    'global breeders', 'international breeders', 'find breeders worldwide',
    'breeder search', 'dog breeders directory', 'verified breeders',
  ],
  openGraph: {
    title: 'Global Breeders Directory | Animalytics',
    description: 'Search and connect with verified breeders from around the world.',
    type: 'website',
    url: '/global-breeders',
  },
  alternates: {
    canonical: '/global-breeders',
  },
};

export default function GlobalBreedersLayout({
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
