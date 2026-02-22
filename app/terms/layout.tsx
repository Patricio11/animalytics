import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the Animalytics terms of service. Understand the rules and guidelines for using our professional breeding and animal management platform.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
