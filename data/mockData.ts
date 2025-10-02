import { Animal, Owner, MatingRecord, ActivityLog, MarketplaceListing, Task, DashboardStats, User } from '@/types';

export const mockOwners: Owner[] = [
  {
    id: 'owner1',
    name: 'Sarah Johnson',
    email: 'sarah@breeder.com',
    phone: '+1 (555) 123-4567',
    location: 'Melbourne, VIC',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b85e6ffe?w=150&h=150&fit=crop&crop=face',
    joinedDate: '2020-03-15',
    totalAnimals: 12,
    reputation: 4.8,
  },
  {
    id: 'owner2',
    name: 'Mike Thompson',
    email: 'mike@dogbreeder.com',
    phone: '+1 (555) 234-5678',
    location: 'Sydney, NSW',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    joinedDate: '2019-08-22',
    totalAnimals: 8,
    reputation: 4.9,
  },
  {
    id: 'owner3',
    name: 'Emma Davis',
    email: 'emma@kennels.com',
    phone: '+1 (555) 345-6789',
    location: 'Brisbane, QLD',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    joinedDate: '2021-05-10',
    totalAnimals: 6,
    reputation: 4.7,
  },
];

export const mockAnimals: Animal[] = [
  {
    id: 'animal1',
    name: 'Luna',
    type: 'bitch',
    breed: 'Golden Retriever',
    dateOfBirth: '2020-03-15',
    photos: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=800&h=600&fit=crop',
    ],
    documents: [
      {
        id: 'doc1',
        name: 'Health Certificate',
        type: 'pdf',
        category: 'health',
        url: '/docs/luna-health.pdf',
        uploadedAt: '2024-01-15',
        size: 2048000,
      },
      {
        id: 'doc2',
        name: 'Pedigree Certificate',
        type: 'pdf',
        category: 'pedigree',
        url: '/docs/luna-pedigree.pdf',
        uploadedAt: '2024-01-10',
        size: 1524000,
      },
    ],
    owner: mockOwners[0],
    location: 'Melbourne, VIC',
    description: 'Beautiful Golden Retriever with excellent bloodlines and gentle temperament. Perfect for breeding and family companionship.',
    healthRecords: [
      {
        id: 'health1',
        date: '2024-01-20',
        type: 'checkup',
        description: 'Annual health examination',
        veterinarian: 'Dr. Smith',
        notes: 'All clear, excellent health',
      },
    ],
    weight: 28.5,
    color: 'Golden',
    markings: 'White chest patch',
    microchipId: 'MC123456789',
    registrationNumber: 'AKC-GR-2020-0315',
    bloodline: 'Champion Sunburst Bloodline',
    achievements: [
      {
        id: 'ach1',
        title: 'Best in Show',
        date: '2023-09-15',
        organization: 'Melbourne Dog Show',
        category: 'show',
        description: 'First place in Golden Retriever category',
      },
    ],
    isForSale: false,
    createdAt: '2020-03-15',
    updatedAt: '2024-01-20',
  },
  {
    id: 'animal2',
    name: 'Max',
    type: 'dog',
    breed: 'German Shepherd',
    dateOfBirth: '2019-08-22',
    photos: [
      'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800&h=600&fit=crop',
    ],
    documents: [
      {
        id: 'doc3',
        name: 'Championship Certificate',
        type: 'certificate',
        category: 'certificate',
        url: '/docs/max-championship.pdf',
        uploadedAt: '2023-12-01',
        size: 1890000,
      },
    ],
    frozenSemen: [
      {
        id: 'fs1',
        collectionDate: '2023-01-15',
        qualityRating: 9.2,
        motility: 85,
        concentration: 180,
        storageLocation: 'Cryobank A-23',
        isAvailable: true,
      },
      {
        id: 'fs2',
        collectionDate: '2023-06-20',
        qualityRating: 9.0,
        motility: 82,
        concentration: 175,
        storageLocation: 'Cryobank A-24',
        isAvailable: true,
      },
    ],
    owner: mockOwners[1],
    location: 'Sydney, NSW',
    description: 'Champion German Shepherd with proven track record. Excellent stud dog with outstanding offspring.',
    healthRecords: [
      {
        id: 'health2',
        date: '2024-01-10',
        type: 'test',
        description: 'Hip dysplasia screening',
        veterinarian: 'Dr. Brown',
        notes: 'Score: A/A - Excellent',
      },
    ],
    weight: 35.2,
    color: 'Black and Tan',
    microchipId: 'MC987654321',
    registrationNumber: 'AKC-GS-2019-0822',
    bloodline: 'Von Stephanitz Line',
    achievements: [
      {
        id: 'ach2',
        title: 'Schutzhund III',
        date: '2022-11-20',
        organization: 'DVG Australia',
        category: 'working',
        description: 'Passed all three phases with excellent scores',
      },
    ],
    isForSale: false,
    createdAt: '2019-08-22',
    updatedAt: '2024-01-10',
  },
  {
    id: 'animal3',
    name: 'Bella',
    type: 'bitch',
    breed: 'Labrador Retriever',
    dateOfBirth: '2021-05-10',
    photos: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=600&fit=crop',
    ],
    documents: [],
    owner: mockOwners[2],
    location: 'Brisbane, QLD',
    description: 'Young and energetic Labrador with great potential for breeding and companionship.',
    healthRecords: [
      {
        id: 'health3',
        date: '2024-01-05',
        type: 'vaccination',
        description: 'Annual vaccinations',
        veterinarian: 'Dr. Wilson',
        notes: 'All vaccines up to date',
        nextDueDate: '2025-01-05',
      },
    ],
    weight: 25.8,
    color: 'Yellow',
    microchipId: 'MC456789123',
    registrationNumber: 'AKC-LR-2021-0510',
    bloodline: 'English Field Line',
    achievements: [],
    isForSale: true,
    price: 1500,
    createdAt: '2021-05-10',
    updatedAt: '2024-01-05',
  },
  {
    id: 'animal4',
    name: 'Rocky',
    type: 'dog',
    breed: 'Rottweiler',
    dateOfBirth: '2018-12-03',
    photos: [
      'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=800&h=600&fit=crop',
    ],
    documents: [
      {
        id: 'doc4',
        name: 'Hip Score Results',
        type: 'pdf',
        category: 'health',
        url: '/docs/rocky-hip-score.pdf',
        uploadedAt: '2023-11-15',
        size: 1245000,
      },
    ],
    frozenSemen: [
      {
        id: 'fs3',
        collectionDate: '2023-03-10',
        qualityRating: 8.8,
        motility: 80,
        concentration: 165,
        storageLocation: 'Cryobank B-15',
        isAvailable: true,
      },
    ],
    owner: mockOwners[1],
    location: 'Perth, WA',
    description: 'Powerful and well-built Rottweiler with excellent temperament and strong protective instincts.',
    healthRecords: [
      {
        id: 'health4',
        date: '2023-11-15',
        type: 'test',
        description: 'Hip and elbow scoring',
        veterinarian: 'Dr. Taylor',
        notes: 'Hip: 5/5, Elbow: 0/0',
      },
    ],
    weight: 48.5,
    color: 'Black and Tan',
    microchipId: 'MC789123456',
    registrationNumber: 'AKC-RT-2018-1203',
    bloodline: 'German Import Line',
    achievements: [
      {
        id: 'ach3',
        title: 'Protection Dog Certification',
        date: '2021-08-30',
        organization: 'Protection Dogs Australia',
        category: 'working',
        description: 'Certified protection dog with excellent scores',
      },
    ],
    isForSale: true,
    price: 2500,
    createdAt: '2018-12-03',
    updatedAt: '2023-11-15',
  },
];

export const mockMatingRecords: MatingRecord[] = [
  {
    id: 'mating1',
    dogId: 'animal2',
    bitchId: 'animal1',
    matingDate: '2024-01-15',
    progesteroneLevel: 8.2,
    progesteroneCycleRating: 95.0,
    conceptionRating: 78.5,
    overallRating: 88.2,
    notes: 'Excellent timing, high progesterone levels. Both animals in perfect health.',
    expectedWhelping: '2024-03-18',
    status: 'completed',
    createdAt: '2024-01-15',
  },
  {
    id: 'mating2',
    dogId: 'animal4',
    bitchId: 'animal3',
    matingDate: '2024-02-20',
    progesteroneLevel: 6.8,
    progesteroneCycleRating: 78.5,
    conceptionRating: 65.2,
    overallRating: 72.8,
    notes: 'Good conditions, slightly early timing but successful mating.',
    expectedWhelping: '2024-04-22',
    status: 'completed',
    createdAt: '2024-02-20',
  },
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'activity1',
    animalId: 'animal1',
    type: 'feeding',
    date: '2024-01-20',
    title: 'Morning Feeding',
    details: {
      foodType: 'Premium Dry Food',
      amount: '2 cups',
      time: '08:00',
      brand: 'Royal Canin',
    },
    notes: 'Ate well, no issues. Good appetite.',
    createdBy: 'owner1',
    createdAt: '2024-01-20T08:30:00Z',
  },
  {
    id: 'activity2',
    animalId: 'animal1',
    type: 'exercise',
    date: '2024-01-20',
    title: 'Park Walk',
    details: {
      activity: 'Walk in Park',
      duration: '45 minutes',
      intensity: 'Moderate',
      location: 'Central Park',
    },
    photos: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400'],
    createdBy: 'owner1',
    createdAt: '2024-01-20T10:15:00Z',
  },
  {
    id: 'activity3',
    animalId: 'animal2',
    type: 'grooming',
    date: '2024-01-19',
    title: 'Professional Grooming',
    details: {
      service: 'Full Groom',
      groomer: 'Pet Salon Plus',
      cost: '$85',
      services: ['Bath', 'Brush', 'Nail Trim', 'Ear Cleaning'],
    },
    createdBy: 'owner2',
    createdAt: '2024-01-19T14:30:00Z',
  },
  {
    id: 'activity4',
    animalId: 'animal1',
    type: 'health',
    date: '2024-01-18',
    title: 'Veterinary Checkup',
    details: {
      eventType: 'Vet Checkup',
      veterinarian: 'Dr. Smith',
      result: 'Healthy',
      nextAppointment: '2024-07-18',
    },
    createdBy: 'owner1',
    createdAt: '2024-01-18T11:00:00Z',
  },
];

export const mockMarketplaceListings: MarketplaceListing[] = [
  {
    id: 'listing1',
    animalId: 'animal3',
    price: 1500,
    description: 'Beautiful Labrador female with excellent bloodlines. Perfect for breeding or as a family companion. Very friendly and well-trained.',
    location: 'Brisbane, QLD',
    contactInfo: {
      name: 'Emma Davis',
      phone: '+61 412 345 678',
      email: 'emma@kennels.com',
    },
    listedDate: '2024-01-10',
    status: 'active',
    views: 145,
    inquiries: 12,
    highlights: ['Health Tested', 'Champion Bloodline', 'Family Raised'],
    shippingAvailable: true,
    negotiable: true,
  },
  {
    id: 'listing2',
    animalId: 'animal4',
    price: 2500,
    description: 'Champion Rottweiler male with proven stud record. Excellent temperament and protection instincts. Perfect for serious breeders.',
    location: 'Perth, WA',
    contactInfo: {
      name: 'Mike Thompson',
      phone: '+61 423 456 789',
      email: 'mike@dogbreeder.com',
    },
    listedDate: '2024-01-05',
    status: 'active',
    views: 289,
    inquiries: 23,
    highlights: ['Protection Trained', 'Champion Bloodline', 'Health Tested', 'Proven Stud'],
    shippingAvailable: false,
    negotiable: false,
  },
];

export const mockTasks: Task[] = [
  {
    id: 'task1',
    title: 'Vaccination Due - Luna',
    description: 'Annual vaccination appointment with Dr. Smith',
    dueDate: '2024-03-15',
    priority: 'high',
    status: 'pending',
    animalId: 'animal1',
    category: 'health',
    createdAt: '2024-01-20',
  },
  {
    id: 'task2',
    title: 'Grooming Appointment - Max',
    description: 'Monthly grooming session at Pet Salon Plus',
    dueDate: '2024-02-19',
    priority: 'medium',
    status: 'pending',
    animalId: 'animal2',
    category: 'grooming',
    createdAt: '2024-01-19',
  },
  {
    id: 'task3',
    title: 'Breeding Evaluation - Bella',
    description: 'Evaluate readiness for first breeding cycle',
    dueDate: '2024-02-10',
    priority: 'medium',
    status: 'in-progress',
    animalId: 'animal3',
    category: 'breeding',
    createdAt: '2024-01-18',
  },
];

export const mockUser: User = {
  id: 'user1',
  name: 'Sarah Johnson',
  email: 'sarah@breeder.com',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b85e6ffe?w=150&h=150&fit=crop&crop=face',
  role: 'breeder',
  preferences: {
    notifications: true,
    emailUpdates: true,
    darkMode: false,
    language: 'en',
    timezone: 'UTC',
  },
  subscription: {
    plan: 'premium',
    expiresAt: '2024-12-31',
    features: ['unlimited_animals', 'advanced_analytics', 'marketplace_listings', 'priority_support'],
  },
  permissions: ['view_animals', 'manage_animals', 'view_marketplace', 'create_listings', 'use_calculators', 'manage_tasks'],
  isVerified: true,
  lastLogin: '2024-10-01T10:30:00Z',
  createdAt: '2024-01-15T08:00:00Z',
  updatedAt: '2024-10-01T10:30:00Z',
};

export const mockDashboardStats: DashboardStats = {
  totalAnimals: 4,
  totalMatings: 2,
  successfulMatings: 2,
  activeTasks: 3,
  upcomingEvents: 5,
  recentActivities: mockActivityLogs.slice(0, 5),
  topPerformingAnimals: mockAnimals.slice(0, 3),
  monthlyStats: {
    matings: 2,
    births: 1,
    sales: 0,
    revenue: 0,
  },
};

// Calculation functions
export const calculateProgesteroneCycleRating = (progesteroneLevel: number, dayOfCycle: number): number => {
  const optimalRange = { min: 5, max: 10 };
  const optimalDay = { min: 11, max: 15 };

  let levelScore = 0;
  if (progesteroneLevel >= optimalRange.min && progesteroneLevel <= optimalRange.max) {
    levelScore = 100;
  } else if (progesteroneLevel < optimalRange.min) {
    levelScore = Math.max(0, (progesteroneLevel / optimalRange.min) * 100);
  } else {
    levelScore = Math.max(0, 100 - ((progesteroneLevel - optimalRange.max) * 10));
  }

  let timingScore = 0;
  if (dayOfCycle >= optimalDay.min && dayOfCycle <= optimalDay.max) {
    timingScore = 100;
  } else {
    const distance = Math.min(
      Math.abs(dayOfCycle - optimalDay.min),
      Math.abs(dayOfCycle - optimalDay.max)
    );
    timingScore = Math.max(0, 100 - (distance * 15));
  }

  return Math.round((levelScore * 0.7 + timingScore * 0.3));
};

export const calculateConceptionRating = (
  bitchAge: number,
  bitchHealth: number,
  dogAge: number,
  dogHealth: number,
  previousSuccessfulLitters: number
): number => {
  const bitchAgeFactor = bitchAge >= 2 && bitchAge <= 6 ? 100 : Math.max(0, 100 - Math.abs(bitchAge - 4) * 15);
  const dogAgeFactor = dogAge >= 1 && dogAge <= 8 ? 100 : Math.max(0, 100 - Math.abs(dogAge - 4) * 10);
  const healthFactor = (bitchHealth + dogHealth) / 2;
  const experienceFactor = Math.min(100, 60 + (previousSuccessfulLitters * 10));

  const overall = (bitchAgeFactor * 0.25 + dogAgeFactor * 0.2 + healthFactor * 0.35 + experienceFactor * 0.2);

  return Math.round(overall);
};

export const calculateOverallMatingRating = (progesteroneRating: number, conceptionRating: number): number => {
  return Math.round((progesteroneRating * 0.6 + conceptionRating * 0.4));
};