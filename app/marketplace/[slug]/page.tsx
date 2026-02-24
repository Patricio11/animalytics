import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { listings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import ListingDetailClient from './ListingDetailClient';

// Fetch listing data for SEO metadata
async function getListingForSeo(slug: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  const listing = await db.query.listings.findFirst({
    where: isUuid
      ? eq(listings.id, slug)
      : eq(listings.slug, slug),
    with: {
      animal: {
        columns: {
          id: true,
          name: true,
          registeredName: true,
          profileImageUrl: true,
        },
        with: {
          photos: {
            columns: { fileUrl: true, category: true },
            limit: 1,
          },
        },
      },
    },
  });

  return listing;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const listing = await getListingForSeo(slug);

    if (!listing) {
      return {
        title: 'Listing Not Found',
        description: 'This listing could not be found or has been removed.',
      };
    }

    const categoryLabels: Record<string, string> = {
      'dog_for_sale': 'Dog for Sale',
      'pups_for_sale': 'Puppies for Sale',
      'reproductive_services': 'Reproductive Services',
      'frozen_semen': 'Frozen Semen',
      'stud_dog': 'Stud Dog',
    };

    const categoryLabel = categoryLabels[listing.category || ''] || 'Listing';
    const title = listing.title || `${categoryLabel} - ${listing.breed || 'Breeding Animal'}`;
    const description = listing.description
      ? listing.description.substring(0, 160)
      : `${categoryLabel}: ${listing.breed || 'Quality breeding animal'} available${listing.location ? ` in ${listing.location}` : ''}. Browse on the Animalytics marketplace.`;

    // Get image for Open Graph
    const profilePhoto = listing.animal?.photos?.[0]?.fileUrl;
    const image = listing.additionalImages?.[0] || profilePhoto || listing.animal?.profileImageUrl;
    const canonicalSlug = listing.slug || listing.id;

    return {
      title,
      description,
      keywords: [
        listing.breed || 'breeding animal',
        categoryLabel.toLowerCase(),
        listing.sex || '',
        listing.location || '',
        'animalytics marketplace',
      ].filter(Boolean),
      openGraph: {
        title: `${title} | Animalytics Marketplace`,
        description,
        type: 'website',
        url: `/marketplace/${canonicalSlug}`,
        ...(image && {
          images: [
            {
              url: image,
              width: 800,
              height: 600,
              alt: title,
            },
          ],
        }),
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | Animalytics`,
        description,
        ...(image && { images: [image] }),
      },
      alternates: {
        canonical: `/marketplace/${canonicalSlug}`,
      },
    };
  } catch (error) {
    console.error('Error generating listing metadata:', error);
    return {
      title: 'Marketplace Listing',
      description: 'View this listing on the Animalytics marketplace.',
    };
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // If accessed via UUID, redirect to the slug URL for SEO
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  if (isUuid) {
    const listing = await db.query.listings.findFirst({
      where: eq(listings.id, slug),
      columns: { slug: true },
    });

    if (listing?.slug) {
      redirect(`/marketplace/${listing.slug}`);
    }
  }

  return <ListingDetailClient slug={slug} />;
}
