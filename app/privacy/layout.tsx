import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the Animalytics privacy policy. Learn how we collect, use, and protect your personal data on our breeding and animal management platform.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
