/**
 * Frozen semen inventory mock data
 * Separate entity type for managing frozen semen inventory
 */

import { SemenAssessment, PhotoCategory } from "./animal-profile-details";

export type FrozenSemenStatus = 'available' | 'reserved' | 'used' | 'expired';

export interface FrozenSemenBatch {
  id: string;
  batchIdentifier: string;
  sourceAnimalId: string;
  sourceAnimalName: string;
  breed: string;
  registrationNumber?: string;
  collectionDate: string;
  clinicId: string;
  clinicName: string;
  numberOfStraws: number;
  strawsRemaining: number;
  storageNotes?: string;
  status: FrozenSemenStatus;
  createdAt: string;
  updatedAt: string;
  // Additional details
  semenAssessment?: SemenAssessment;
  photos?: PhotoCategory[];
  documents?: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }[];
  // Tracking
  usageHistory?: {
    id: string;
    date: string;
    strawsUsed: number;
    bitchId: string;
    bitchName: string;
    matingId?: string;
    notes?: string;
  }[];
}

// Mock frozen semen batches
export const mockFrozenSemenBatches: FrozenSemenBatch[] = [
  {
    id: 'fs-1',
    batchIdentifier: 'MAX-2024-001',
    sourceAnimalId: 'animal2',
    sourceAnimalName: 'Max',
    breed: 'Golden Retriever',
    registrationNumber: 'AKC-GR-123456',
    collectionDate: '2024-01-15',
    clinicId: 'clinic-1',
    clinicName: 'Melbourne Veterinary Reproduction Center',
    numberOfStraws: 20,
    strawsRemaining: 15,
    storageNotes: 'Excellent post-thaw motility. Stored in Dewar #3, Position A2.',
    status: 'available',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    semenAssessment: {
      id: 'sa-fs-1',
      date: '2024-01-15',
      volume: 8.5,
      concentration: 580,
      motility: 85,
      morphology: 90,
      quality: 'excellent',
      notes: 'Exceptional quality. Post-thaw motility: 75%',
      technician: 'Dr. Sarah Mitchell',
    },
    photos: [
      {
        category: 'Semen Collection',
        photos: [
          {
            id: 'photo-fs-1-1',
            url: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800&h=600&fit=crop',
            caption: 'Max - Source Animal',
            uploadedAt: '2024-01-15T10:00:00Z',
          },
        ],
      },
    ],
    documents: [
      {
        id: 'doc-fs-1-1',
        name: 'Semen Analysis Report',
        type: 'PDF',
        url: '/documents/semen-analysis-max-001.pdf',
        uploadedAt: '2024-01-15T10:30:00Z',
      },
      {
        id: 'doc-fs-1-2',
        name: 'Health Certificate',
        type: 'PDF',
        url: '/documents/health-cert-max-2024.pdf',
        uploadedAt: '2024-01-15T10:30:00Z',
      },
    ],
    usageHistory: [
      {
        id: 'usage-1',
        date: '2024-01-18',
        strawsUsed: 2,
        bitchId: 'animal1',
        bitchName: 'Luna',
        matingId: 'mating-123',
        notes: 'Surgical AI performed. Good results.',
      },
      {
        id: 'usage-2',
        date: '2024-01-20',
        strawsUsed: 3,
        bitchId: 'animal5',
        bitchName: 'Bella',
        notes: 'TCI breeding. 2 straws used initially, 1 additional 48h later.',
      },
    ],
  },
  {
    id: 'fs-2',
    batchIdentifier: 'ROCKY-2023-012',
    sourceAnimalId: 'animal3',
    sourceAnimalName: 'Rocky',
    breed: 'German Shepherd',
    registrationNumber: 'GSDCA-2021-789',
    collectionDate: '2023-12-10',
    clinicId: 'clinic-2',
    clinicName: 'Sydney Canine Fertility Clinic',
    numberOfStraws: 15,
    strawsRemaining: 12,
    storageNotes: 'Collected from champion working line stud. Tank 2, Cane 5.',
    status: 'available',
    createdAt: '2023-12-10T09:00:00Z',
    updatedAt: '2024-01-10T11:00:00Z',
    semenAssessment: {
      id: 'sa-fs-2',
      date: '2023-12-10',
      volume: 7.0,
      concentration: 650,
      motility: 88,
      morphology: 87,
      quality: 'excellent',
      notes: 'Very high quality. Post-thaw motility: 78%',
      technician: 'Dr. John Chen',
    },
    usageHistory: [
      {
        id: 'usage-3',
        date: '2024-01-10',
        strawsUsed: 3,
        bitchId: 'animal6',
        bitchName: 'Shadow',
        notes: 'Surgical AI. Excellent timing.',
      },
    ],
  },
  {
    id: 'fs-3',
    batchIdentifier: 'DUKE-2024-003',
    sourceAnimalId: 'animal4',
    sourceAnimalName: 'Duke',
    breed: 'Labrador Retriever',
    registrationNumber: 'AKC-LR-789012',
    collectionDate: '2024-02-01',
    clinicId: 'clinic-1',
    clinicName: 'Melbourne Veterinary Reproduction Center',
    numberOfStraws: 25,
    strawsRemaining: 25,
    storageNotes: 'First collection. Excellent quality. Reserved for approved bitches only.',
    status: 'available',
    createdAt: '2024-02-01T13:00:00Z',
    updatedAt: '2024-02-01T13:00:00Z',
    semenAssessment: {
      id: 'sa-fs-3',
      date: '2024-02-01',
      volume: 9.2,
      concentration: 720,
      motility: 92,
      morphology: 93,
      quality: 'excellent',
      notes: 'Outstanding quality. Post-thaw motility: 82%',
      technician: 'Dr. Sarah Mitchell',
    },
  },
  {
    id: 'fs-4',
    batchIdentifier: 'BRUNO-2023-008',
    sourceAnimalId: 'animal7',
    sourceAnimalName: 'Bruno',
    breed: 'Rottweiler',
    collectionDate: '2023-11-20',
    clinicId: 'clinic-3',
    clinicName: 'Brisbane Pet Reproduction Services',
    numberOfStraws: 12,
    strawsRemaining: 2,
    storageNotes: 'Limited straws remaining. Reserve for special matings.',
    status: 'reserved',
    createdAt: '2023-11-20T10:00:00Z',
    updatedAt: '2024-01-25T09:00:00Z',
    semenAssessment: {
      id: 'sa-fs-4',
      date: '2023-11-20',
      volume: 6.5,
      concentration: 520,
      motility: 80,
      morphology: 85,
      quality: 'good',
      notes: 'Good quality. Post-thaw motility: 70%',
      technician: 'Dr. Emma Wilson',
    },
    usageHistory: [
      {
        id: 'usage-4',
        date: '2023-12-15',
        strawsUsed: 4,
        bitchId: 'animal8',
        bitchName: 'Molly',
        notes: 'TCI breeding. Successful pregnancy.',
      },
      {
        id: 'usage-5',
        date: '2024-01-05',
        strawsUsed: 3,
        bitchId: 'animal9',
        bitchName: 'Daisy',
        notes: 'Surgical AI.',
      },
      {
        id: 'usage-6',
        date: '2024-01-25',
        strawsUsed: 3,
        bitchId: 'animal10',
        bitchName: 'Rosie',
        notes: 'Reserved for upcoming breeding.',
      },
    ],
  },
];

// Helper functions
export function getFrozenSemenById(id: string): FrozenSemenBatch | undefined {
  return mockFrozenSemenBatches.find(batch => batch.id === id);
}

export function getFrozenSemenByAnimal(animalId: string): FrozenSemenBatch[] {
  return mockFrozenSemenBatches.filter(batch => batch.sourceAnimalId === animalId);
}

export function getFrozenSemenByClinic(clinicId: string): FrozenSemenBatch[] {
  return mockFrozenSemenBatches.filter(batch => batch.clinicId === clinicId);
}

export function getFrozenSemenByStatus(status: FrozenSemenStatus): FrozenSemenBatch[] {
  return mockFrozenSemenBatches.filter(batch => batch.status === status);
}

export function getAvailableFrozenSemen(): FrozenSemenBatch[] {
  return mockFrozenSemenBatches.filter(batch =>
    batch.status === 'available' && batch.strawsRemaining > 0
  );
}

export function getTotalStrawsRemaining(): number {
  return mockFrozenSemenBatches.reduce((total, batch) => total + batch.strawsRemaining, 0);
}

export function getStatusLabel(status: FrozenSemenStatus): string {
  const labels: Record<FrozenSemenStatus, string> = {
    available: 'Available',
    reserved: 'Reserved',
    used: 'Used',
    expired: 'Expired',
  };
  return labels[status];
}

export function getStatusColor(status: FrozenSemenStatus): string {
  const colors: Record<FrozenSemenStatus, string> = {
    available: 'bg-chart-3 text-white',
    reserved: 'bg-chart-4 text-white',
    used: 'bg-muted text-muted-foreground',
    expired: 'bg-destructive text-white',
  };
  return colors[status];
}