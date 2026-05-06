import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://animalytics.co';

export const metadata: Metadata = {
  // metadataBase lets relative URLs in OG/Twitter resolve to the production domain
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Animalytics - Professional Breeding & Animal Management Platform',
    // title.template auto-suffixes every child page (`%s | Animalytics`)
    template: '%s | Animalytics',
  },
  description: 'Animalytics is the leading platform for professional breeders and pet owners. Manage breeding records, health tracking, pedigree trees, mating calculators, and connect with verified breeders worldwide.',
  applicationName: 'Animalytics',
  keywords: [
    'dog breeding', 'animal management', 'breeder platform', 'pedigree',
    'breeding records', 'health tracking', 'mating calculator', 'stud dogs',
    'puppies for sale', 'verified breeders', 'breeding analytics',
    'conception rating', 'progesterone tracking', 'frozen semen',
  ],
  authors: [{ name: 'Animalytics', url: baseUrl }],
  creator: 'Animalytics',
  publisher: 'Animalytics',
  category: 'pets',
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
    // googleBot directives unlock larger image/snippet sizes in search results
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
  // Favicon set — files in /public via realfavicongenerator.net
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
  // Env-driven verification — set the env vars in Vercel after GSC/Bing give you tokens
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
};

export const viewport: Viewport = {
  themeColor: '#0082c8',
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}