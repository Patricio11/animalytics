import { db } from '@/lib/db';
import { frozenSemen } from '@/lib/db/schema/animals';

export async function seedFrozenSemen(userId: string, animalIds: string[]) {
  console.log('Seeding frozen semen for user:', userId);

  // Find male animals (assuming animal3 is male Max)
  const maleAnimalId = animalIds[2];

  if (!maleAnimalId) {
    console.log('⚠️ No male animals available to seed frozen semen');
    return [];
  }

  const sampleFrozenSemen = [
    {
      id: 'fs1',
      userId,
      sourceAnimalId: maleAnimalId,
      batchIdentifier: 'BATCH-2024-001',
      collectionDate: '2024-06-15',
      clinic: 'ABC Veterinary Clinic',
      storageLocation: 'Liquid Nitrogen Tank #2',
      strawCount: 20,
      strawsRemaining: 15,
      qualityRating: 'excellent',
      motility: '85.00',
      concentration: 520,
      morphology: '88.00',
      volume: '2.50',
      notes: 'Collected after full assessment. Excellent quality.',
    },
    {
      id: 'fs2',
      userId,
      sourceAnimalId: maleAnimalId,
      batchIdentifier: 'BATCH-2024-002',
      collectionDate: '2024-08-20',
      clinic: 'Elite Breeding Center',
      storageLocation: 'Liquid Nitrogen Tank #1',
      strawCount: 15,
      strawsRemaining: 12,
      qualityRating: 'good',
      motility: '75.00',
      concentration: 420,
      morphology: '82.00',
      volume: '2.20',
      notes: 'Good quality batch, suitable for breeding.',
    },
    {
      id: 'fs3',
      userId,
      sourceAnimalId: maleAnimalId,
      batchIdentifier: 'BATCH-2024-003',
      collectionDate: '2024-10-05',
      clinic: 'ABC Veterinary Clinic',
      storageLocation: 'Liquid Nitrogen Tank #2',
      strawCount: 10,
      strawsRemaining: 3,
      qualityRating: 'excellent',
      motility: '90.00',
      concentration: 550,
      morphology: '90.00',
      volume: '2.80',
      notes: 'Outstanding quality. Limited stock remaining.',
    },
  ];

  const createdFrozenSemen = await db.insert(frozenSemen).values(sampleFrozenSemen).returning();

  console.log(`✅ Created ${createdFrozenSemen.length} frozen semen batches`);
  return createdFrozenSemen;
}
