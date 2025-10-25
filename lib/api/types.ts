// API Response Types
// These types represent the shape of data returned from API endpoints

export interface APIAnimal {
  id: string;
  userId: string;
  name: string;
  breedId: string | null;
  sex: 'male' | 'female';
  dateOfBirth: string | null;
  microchipNumber: string | null;
  registrationNumber: string | null;
  weight: string | null; // Decimal from database
  height: string | null; // Decimal from database
  color: string | null;
  markings: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  temperament: string | null;
  healthStatus: string | null;
  isBreedingActive: boolean;
  isChampion: boolean;
  titles: string[] | null;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  breed?: {
    id: string;
    name: string;
    successRating: string | null;
    sizeCategory: string | null;
    averageWeight: string | null;
    averageHeight: string | null;
    description: string | null;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  photos?: {
    id: string;
    fileUrl: string;
    category: string;
    displayOrder: number;
    isPrimary: boolean;
  }[];
}

export interface APIMating {
  id: string;
  userId: string;
  bitchId: string;
  dogId: string | null;
  frozenSemenBatchId: string | null;
  matingDate: string;
  expectedWhelping: string | null;
  actualWhelping: string | null;
  status: 'planned' | 'confirmed' | 'resulted_in_litter' | 'no_pregnancy';
  notes: string | null;
  progesteroneCycleRating: number | null;
  conceptionRating: number | null;
  overallRating: number | null;
  createdAt: Date;
  updatedAt: Date;
  bitch?: APIAnimal;
  dog?: APIAnimal;
  frozenSemenBatch?: {
    id: string;
    batchIdentifier: string;
    sourceAnimalId: string;
  };
}

export interface APITask {
  id: string;
  userId: string;
  type: 'feeding' | 'exercise' | 'grooming' | 'weight' | 'cleaning' | 'event';
  title: string | null;
  notes: string | null;
  dueDate: string;
  dueTime: string | null;
  completedAt: string | null;
  animalId: string | null;
  priority: 'low' | 'medium' | 'high';
  recurring: boolean;
  recurringPattern: string | null;
  metadata: Record<string, string | number | boolean | null> | null;
  createdAt: Date;
  updatedAt: Date;
  animal?: APIAnimal;
}

export interface APIFrozenSemenBatch {
  id: string;
  userId: string;
  batchIdentifier: string;
  sourceAnimalId: string;
  collectionDate: string;
  clinicId: string | null;
  totalStraws: number;
  strawsRemaining: number;
  status: 'available' | 'reserved' | 'used' | 'expired';
  storageLocation: string | null;
  storageNotes: string | null;
  semenQuality: 'excellent' | 'good' | 'fair' | 'poor' | null;
  volume: number | null;
  concentration: number | null;
  motility: number | null;
  morphology: number | null;
  createdAt: Date;
  updatedAt: Date;
  sourceAnimal?: APIAnimal;
}

export interface APIDashboardStats {
  totalAnimals: {
    total: number;
    male: number;
    female: number;
    active: number;
    breeding: number;
  };
  activeMatingsCount: number;
  pendingTasksCount: number;
  completedTasksCount: number;
  recentAnimals: APIAnimal[];
  upcomingTasks: APITask[];
}
