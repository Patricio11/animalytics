import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { animals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import PublicProfileClient from './PublicProfileClient';

async function getAnimalForSeo(id: string) {
  const animal = await db.query.animals.findFirst({
    where: eq(animals.id, id),
    columns: {
      id: true,
      name: true,
      registeredName: true,
      sex: true,
      profileImageUrl: true,
      temperament: true,
      bio: true,
      color: true,
    },
    with: {
      breed: {
        columns: { name: true },
      },
    },
  });

  return animal;
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

    const name = animal.registeredName || animal.name || 'Animal Profile';
    const breedName = animal.breed?.name || '';
    const title = breedName ? `${name} - ${breedName}` : name;
    const description = animal.bio?.substring(0, 160)
      || animal.temperament?.substring(0, 160)
      || `View ${name}'s profile${breedName ? ` - ${breedName}` : ''}${animal.sex ? `, ${animal.sex}` : ''}${animal.color ? `, ${animal.color}` : ''}. Browse animal profiles on Animalytics.`;

    const image = animal.profileImageUrl;

    return {
      title: `${title} - Animal Profile`,
      description,
      keywords: [
        name,
        breedName,
        animal.sex || '',
        animal.color || '',
        'dog profile', 'breeding animal', 'pedigree',
      ].filter(Boolean),
      openGraph: {
        title: `${title} | Animalytics`,
        description,
        type: 'profile',
        url: `/public-profile/${id}`,
        ...(image && {
          images: [
            {
              url: image,
              width: 800,
              height: 600,
              alt: `${name} - Animal Profile`,
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
    };
  } catch (error) {
    console.error('Error generating animal metadata:', error);
    return {
      title: 'Animal Profile',
      description: 'View this animal profile on Animalytics.',
    };
  }
}

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <PublicProfileClient params={params} />;
}
