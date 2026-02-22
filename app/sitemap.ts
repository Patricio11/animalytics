import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { listings, breederProfiles } from '@/lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://animalytics.co';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/breeders`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/global-breeders`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Dynamic marketplace listings with slugs
  let listingPages: MetadataRoute.Sitemap = [];
  try {
    const activeListings = await db
      .select({
        slug: listings.slug,
        id: listings.id,
        updatedAt: listings.updatedAt,
      })
      .from(listings)
      .where(eq(listings.status, 'active'));

    listingPages = activeListings.map((listing) => ({
      url: `${baseUrl}/marketplace/${listing.slug || listing.id}`,
      lastModified: listing.updatedAt ? new Date(listing.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Sitemap: Failed to fetch listings', error);
  }

  // Dynamic breeder profiles with slugs
  let breederPages: MetadataRoute.Sitemap = [];
  try {
    const publicBreeders = await db
      .select({
        slug: breederProfiles.slug,
        updatedAt: breederProfiles.updatedAt,
      })
      .from(breederProfiles)
      .where(
        and(
          eq(breederProfiles.isPublic, true),
          isNotNull(breederProfiles.slug)
        )
      );

    breederPages = publicBreeders.map((breeder) => ({
      url: `${baseUrl}/breeders/${breeder.slug}`,
      lastModified: breeder.updatedAt ? new Date(breeder.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap: Failed to fetch breeders', error);
  }

  return [...staticPages, ...listingPages, ...breederPages];
}
