import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { listings } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';
import ListingDetailClient from './ListingDetailClient';

// Fetch listing data for SEO metadata
async function getListingForSeo(id: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const listing = await db.query.listings.findFirst({
    where: isUuid
      ? eq(listings.id, id)
      : eq(listings.slug, id),
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
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const listing = await getListingForSeo(id);

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

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ListingDetailClient params={params} />;
}
