import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { breederProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import BreederProfileClient from './BreederProfileClient';

async function getBreederForSeo(slug: string) {
  const [profile] = await db
    .select({
      displayName: breederProfiles.displayName,
      slug: breederProfiles.slug,
      tagline: breederProfiles.tagline,
      bio: breederProfiles.bio,
      logoUrl: breederProfiles.logoUrl,
      bannerUrl: breederProfiles.bannerUrl,
      location: breederProfiles.location,
      primaryBreeds: breederProfiles.primaryBreeds,
      isPublic: breederProfiles.isPublic,
    })
    .from(breederProfiles)
    .where(eq(breederProfiles.slug, slug))
    .limit(1);

  return profile;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const profile = await getBreederForSeo(slug);

    if (!profile || !profile.isPublic) {
      return {
        title: 'Breeder Not Found',
        description: 'This breeder profile could not be found.',
      };
    }

    const title = profile.displayName || 'Breeder Profile';
    const breeds = profile.primaryBreeds ? (profile.primaryBreeds as string[]).join(', ') : '';
    const locationStr = profile.location
      ? [profile.location.city, profile.location.state, profile.location.country].filter(Boolean).join(', ')
      : '';
    const description = profile.tagline
      || profile.bio?.substring(0, 160)
      || `${title} - Professional breeder${breeds ? ` specializing in ${breeds}` : ''}${locationStr ? ` based in ${locationStr}` : ''}. View profile, animals, and reviews on Animalytics.`;

    const image = profile.bannerUrl || profile.logoUrl;

    return {
      title: `${title} - Breeder Profile`,
      description,
      keywords: [
        title,
        ...(breeds ? breeds.split(', ') : []),
        locationStr,
        'dog breeder', 'verified breeder', 'breeding kennel',
      ].filter(Boolean),
      openGraph: {
        title: `${title} | Animalytics Breeders`,
        description,
        type: 'profile',
        url: `/breeders/${slug}`,
        ...(image && {
          images: [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: `${title} - Breeder Profile`,
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
        canonical: `/breeders/${slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating breeder metadata:', error);
    return {
      title: 'Breeder Profile',
      description: 'View this breeder profile on Animalytics.',
    };
  }
}

export default function BreederProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <BreederProfileClient params={params} />;
}
