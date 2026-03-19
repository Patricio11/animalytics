import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { animals, breeds } from '@/lib/db/schema/animals';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { eq } from 'drizzle-orm';
import AnimalProfileClient from './AnimalProfileClient';

async function getAnimalForSeo(id: string) {
  const result = await db.query.animals.findFirst({
    where: eq(animals.id, id),
    columns: {
      id: true,
      name: true,
      registeredName: true,
      sex: true,
      dateOfBirth: true,
      color: true,
      bio: true,
      profileImageUrl: true,
      isChampion: true,
      isActive: true,
      userId: true,
    },
    with: {
      breed: { columns: { name: true } },
      photos: {
        columns: { fileUrl: true, category: true },
        orderBy: (p, { desc }) => [desc(p.isPrimary)],
        limit: 1,
      },
    },
  });

  if (!result) return null;

  const [profile] = await db
    .select({ displayName: breederProfiles.displayName, slug: breederProfiles.slug, location: breederProfiles.location })
    .from(breederProfiles)
    .where(eq(breederProfiles.userId, result.userId))
    .limit(1);

  return { ...result, breederProfile: profile ?? null };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const animal = await getAnimalForSeo(id);

    if (!animal) {
      return {
        title: 'Animal Not Found',
        description: 'This animal profile could not be found.',
      };
    }

    const displayName = animal.registeredName || animal.name;
    const breedName = animal.breed?.name;
    const sex = animal.sex === 'male' ? 'Male' : 'Female';
    const location = animal.breederProfile?.location
      ? [
          (animal.breederProfile.location as any).city,
          (animal.breederProfile.location as any).country,
        ]
          .filter(Boolean)
          .join(', ')
      : null;
    const breederName = animal.breederProfile?.displayName;

    const title = [
      displayName,
      breedName,
      animal.isChampion ? 'Champion' : null,
    ]
      .filter(Boolean)
      .join(' · ');

    const description =
      animal.bio?.substring(0, 160) ||
      [
        `${sex} ${breedName || 'dog'}`,
        animal.color ? `(${animal.color})` : null,
        breederName ? `bred by ${breederName}` : null,
        location ? `in ${location}` : null,
        'View full profile on Animalytics.',
      ]
        .filter(Boolean)
        .join(' · ');

    const image =
      animal.photos?.[0]?.fileUrl || animal.profileImageUrl || null;
    const canonicalUrl = `/animal/${animal.id}`;

    return {
      title: `${title} | Animalytics`,
      description,
      keywords: [
        displayName,
        breedName || '',
        sex,
        location || '',
        breederName || '',
        'dog breeding',
        'animalytics',
      ].filter(Boolean),
      openGraph: {
        title: `${title} | Animalytics`,
        description,
        type: 'profile',
        url: canonicalUrl,
        ...(image && {
          images: [{ url: image, width: 800, height: 600, alt: title }],
        }),
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | Animalytics`,
        description,
        ...(image && { images: [image] }),
      },
      alternates: {
        canonical: canonicalUrl,
      },
    };
  } catch (error) {
    console.error('Error generating animal metadata:', error);
    return {
      title: 'Animal Profile',
      description: 'View this animal profile on Animalytics.',
    };
  }
}

export default async function AnimalProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const resolvedSearch = await (searchParams ?? Promise.resolve({})) as { tab?: string };

  return <AnimalProfileClient id={id} initialTab={resolvedSearch.tab || 'profile'} />;
}
