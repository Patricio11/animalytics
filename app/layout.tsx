import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "./providers";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://animalytics.co';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Animalytics - Professional Breeding & Animal Management Platform',
    template: '%s | Animalytics',
  },
  description: 'Animalytics is the leading platform for professional breeders and pet owners. Manage breeding records, health tracking, pedigree trees, mating calculators, and connect with verified breeders worldwide.',
  keywords: [
    'dog breeding', 'animal management', 'breeder platform', 'pedigree',
    'breeding records', 'health tracking', 'mating calculator', 'stud dogs',
    'puppies for sale', 'verified breeders', 'breeding analytics',
    'conception rating', 'progesterone tracking', 'frozen semen',
  ],
  authors: [{ name: 'Animalytics' }],
  creator: 'Animalytics',
  publisher: 'Animalytics',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'Animalytics',
    title: 'Animalytics - Professional Breeding & Animal Management Platform',
    description: 'The leading platform for professional breeders. Manage breeding records, health tracking, pedigrees, and connect with verified breeders worldwide.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Animalytics - Professional Breeding Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Animalytics - Professional Breeding & Animal Management',
    description: 'The leading platform for professional breeders. Manage breeding records, health tracking, pedigrees, and connect with verified breeders worldwide.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground" suppressHydrationWarning>
        <Providers>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}