import { db } from '@/lib/db';
import { matings } from '@/lib/db/schema/matings';

export async function seedMatings(userId: string, animalIds: string[]) {
  console.log('Seeding matings for user:', userId);

  if (animalIds.length < 3) {
    console.log('⚠️ Need at least 3 animals to seed matings');
    return [];
  }

  const sampleMatings = [
    {
      id: 'mating1',
      userId,
      bitchId: animalIds[0], // Luna
      dogId: animalIds[2], // Max
      matingDate: '2024-12-01',
      status: 'planned' as const,
      breedingMethod: 'natural_ai' as const,
      notes: 'First planned mating for Luna',
    },
    {
      id: 'mating2',
      userId,
      bitchId: animalIds[1], // Bella
      dogId: animalIds[2], // Max
      matingDate: '2024-11-15',
      status: 'confirmed' as const,
      breedingMethod: 'natural_ai' as const,
      progesteroneRating: 85,
      conceptionRating: 78.5,
      overallRating: 81.1,
      informationAccuracy: 4,
      notes: 'Successful mating with good ratings',
    },
    {
      id: 'mating3',
      userId,
      bitchId: animalIds[0], // Luna
      dogId: animalIds[2], // Max
      matingDate: '2024-10-20',
      status: 'resulted_in_litter' as const,
      breedingMethod: 'natural_ai' as const,
      progesteroneRating: 90,
      conceptionRating: 82,
      overallRating: 85,
      informationAccuracy: 5,
      notes: 'Excellent mating, resulted in healthy litter',
    },
  ];

  const createdMatings = await db.insert(matings).values(sampleMatings).returning();

  console.log(`✅ Created ${createdMatings.length} matings`);
  return createdMatings;
}
