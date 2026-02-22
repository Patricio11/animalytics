import type { Metadata } from 'next';
import BreedersLayoutClient from '@/components/layout/BreedersLayoutClient';

export const metadata: Metadata = {
  title: 'Find Trusted Breeders - Verified Breeders Directory',
  description: 'Connect with verified, professional breeders in your area. Browse breeder profiles, read reviews, and find the perfect match for your breeding program on Animalytics.',
  keywords: [
    'dog breeders', 'verified breeders', 'professional breeders',
    'breeder directory', 'find breeders', 'breeder reviews',
    'reputable breeders', 'registered breeders', 'breeding kennel',
  ],
  openGraph: {
    title: 'Find Trusted Breeders | Animalytics',
    description: 'Connect with verified, professional breeders worldwide. Browse profiles, read reviews, and find the perfect breeder.',
    type: 'website',
    url: '/breeders',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Trusted Breeders | Animalytics',
    description: 'Connect with verified, professional breeders worldwide.',
  },
  alternates: {
    canonical: '/breeders',
  },
};

export default function BreedersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BreedersLayoutClient>{children}</BreedersLayoutClient>;
}
