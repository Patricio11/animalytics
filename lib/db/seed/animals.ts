import { db } from '@/lib/db';
import { animals, breeds, animalPhotos } from '@/lib/db/schema/animals';

export async function seedAnimals(userId: string) {
  console.log('Seeding animals for user:', userId);

  // First, create some breeds if they don't exist
  const existingBreeds = await db.query.breeds.findMany();

  let borderCollieBreed, labradorBreed, germanShepherdBreed;

  if (existingBreeds.length === 0) {
    console.log('Creating initial breeds...');
    const createdBreeds = await db
      .insert(breeds)
      .values([
        {
          id: 'breed_border_collie',
          name: 'Border Collie',
          description: 'Intelligent and energetic herding dog',
          sizeCategory: 'medium',
        },
        {
          id: 'breed_labrador',
          name: 'Labrador Retriever',
          description: 'Friendly and outgoing sporting dog',
          sizeCategory: 'large',
        },
        {
          id: 'breed_german_shepherd',
          name: 'German Shepherd',
          description: 'Confident and courageous herding dog',
          sizeCategory: 'large',
        },
      ])
      .returning();

    borderCollieBreed = createdBreeds[0];
    labradorBreed = createdBreeds[1];
    germanShepherdBreed = createdBreeds[2];
  } else {
    borderCollieBreed =
      existingBreeds.find((b) => b.name === 'Border Collie') || existingBreeds[0];
    labradorBreed =
      existingBreeds.find((b) => b.name === 'Labrador Retriever') || existingBreeds[0];
    germanShepherdBreed =
      existingBreeds.find((b) => b.name === 'German Shepherd') || existingBreeds[0];
  }

  // Create sample animals
  const sampleAnimals = [
    {
      id: 'animal1',
      userId,
      name: 'Luna',
      breedId: borderCollieBreed.id,
      sex: 'female' as const,
      dateOfBirth: '2020-06-15',
      weight: '18.50',
      height: '52.00',
      color: 'Black and White',
      microchipNumber: 'MC123456789',
      registrationNumber: 'BC2020-001',
      healthStatus: 'excellent',
      isActive: true,
      isBreedingActive: true,
    },
    {
      id: 'animal2',
      userId,
      name: 'Bella',
      breedId: labradorBreed.id,
      sex: 'female' as const,
      dateOfBirth: '2019-03-22',
      weight: '28.00',
      height: '56.00',
      color: 'Golden',
      microchipNumber: 'MC987654321',
      registrationNumber: 'LAB2019-002',
      healthStatus: 'good',
      isActive: true,
      isBreedingActive: true,
    },
    {
      id: 'animal3',
      userId,
      name: 'Max',
      breedId: germanShepherdBreed.id,
      sex: 'male' as const,
      dateOfBirth: '2018-11-10',
      weight: '35.00',
      height: '63.00',
      color: 'Black and Tan',
      microchipNumber: 'MC555666777',
      registrationNumber: 'GSD2018-003',
      healthStatus: 'excellent',
      isActive: true,
      isBreedingActive: true,
    },
  ];

  // Check if animals already exist
  const existingAnimals = await db.query.animals.findMany({
    where: (animals, { inArray }) => inArray(animals.id, sampleAnimals.map(a => a.id)),
  });

  let createdAnimals;
  if (existingAnimals.length > 0) {
    console.log(`ℹ️  ${existingAnimals.length} animals already exist (using existing)`);
    createdAnimals = existingAnimals;
  } else {
    createdAnimals = await db.insert(animals).values(sampleAnimals).returning();
    console.log(`✅ Created ${createdAnimals.length} animals`);
  }

  // Add profile photos for each animal
  const photoData = [
    {
      id: 'photo_luna_1',
      animalId: 'animal1',
      category: 'profile' as const,
      fileUrl: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&h=400&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=200&h=200&fit=crop',
      fileName: 'luna-profile.jpg',
      fileSize: 125000,
      width: 400,
      height: 400,
      caption: 'Luna - Border Collie',
      displayOrder: 0,
      isPrimary: true,
    },
    {
      id: 'photo_bella_1',
      animalId: 'animal2',
      category: 'profile' as const,
      fileUrl: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=400&h=400&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=200&h=200&fit=crop',
      fileName: 'bella-profile.jpg',
      fileSize: 132000,
      width: 400,
      height: 400,
      caption: 'Bella - Labrador Retriever',
      displayOrder: 0,
      isPrimary: true,
    },
    {
      id: 'photo_max_1',
      animalId: 'animal3',
      category: 'profile' as const,
      fileUrl: 'https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=400&h=400&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=200&h=200&fit=crop',
      fileName: 'max-profile.jpg',
      fileSize: 145000,
      width: 400,
      height: 400,
      caption: 'Max - German Shepherd',
      displayOrder: 0,
      isPrimary: true,
    },
  ];

  // Check if photos already exist
  const existingPhotos = await db.query.animalPhotos.findMany({
    where: (animalPhotos, { inArray }) => inArray(animalPhotos.id, photoData.map(p => p.id)),
  });

  if (existingPhotos.length === 0) {
    await db.insert(animalPhotos).values(photoData);
    console.log(`✅ Created ${photoData.length} animal photos`);
  } else {
    console.log(`ℹ️  ${existingPhotos.length} animal photos already exist (skipping)`);
  }

  return createdAnimals;
}
