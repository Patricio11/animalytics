import type { Metadata } from 'next';
import MarketplaceLayoutClient from '@/components/layout/MarketplaceLayoutClient';

export const metadata: Metadata = {
  title: 'Marketplace - Buy & Sell Breeding Animals',
  description: 'Browse quality breeding animals from verified breeders worldwide. Find stud dogs, puppies for sale, frozen semen, and reproductive services on the Animalytics marketplace.',
  keywords: [
    'buy dogs', 'puppies for sale', 'stud dogs', 'breeding animals',
    'frozen semen', 'dog marketplace', 'verified breeders',
    'champion dogs', 'pedigree dogs', 'reproductive services',
  ],
  openGraph: {
    title: 'Animalytics Marketplace - Buy & Sell Breeding Animals',
    description: 'Browse quality breeding animals from verified breeders worldwide. Find stud dogs, puppies for sale, frozen semen, and reproductive services.',
    type: 'website',
    url: '/marketplace',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Animalytics Marketplace - Buy & Sell Breeding Animals',
    description: 'Browse quality breeding animals from verified breeders worldwide.',
  },
  alternates: {
    canonical: '/marketplace',
  },
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketplaceLayoutClient>{children}</MarketplaceLayoutClient>;
}
