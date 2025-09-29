/**
 * Mock data for extended animal profile details
 * Including photos, feeding plans, semen assessments, seasons, and litter details
 */

export interface PhotoCategory {
  category: string;
  photos: {
    id: string;
    url: string;
    caption?: string;
    uploadedAt: string;
  }[];
}

export interface FeedingSchedule {
  id: string;
  time: string;
  foodType: string;
  amount: string;
  notes?: string;
}

export interface SemenAssessment {
  id: string;
  date: string;
  volume: number; // mL
  concentration: number; // million/mL
  motility: number; // percentage
  morphology: number; // percentage
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
  technician?: string;
}

export interface Season {
  id: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  progesteroneReadings?: {
    date: string;
    value: number;
    unit: 'ng/mL' | 'nmol/L';
  }[];
}

export interface Litter {
  id: string;
  matingDate: string;
  sireId: string;
  sireName: string;
  whelpingDate?: string;
  expectedWhelpingDate: string;
  puppyCount?: number;
  survivingPuppies?: number;
  complications: boolean;
  complicationNotes?: string;
  notes?: string;
  status: 'expected' | 'whelped' | 'archived';
  puppies?: {
    id: string;
    name?: string;
    sex: 'male' | 'female';
    weight: number;
    color: string;
    status: 'healthy' | 'sold' | 'retained';
  }[];
}

export interface ReminderSettings {
  enabled: boolean;
  vaccinations: boolean;
  vetCheckups: boolean;
  heatCycles: boolean; // bitches only
  seasonTracking: boolean; // bitches only
  feedingSchedule: boolean;
  customReminders: {
    id: string;
    title: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    nextDate: string;
  }[];
}

export interface AnimalProfileDetails {
  animalId: string;
  photoCategories: PhotoCategory[];
  feedingPlan: {
    schedule: FeedingSchedule[];
    specialDietaryNotes?: string;
  };
  semenAssessments: SemenAssessment[];
  seasons?: Season[]; // bitches only
  litters?: Litter[]; // bitches only
  reminders: ReminderSettings;
}

// Mock data for Luna (animal1 - bitch)
export const mockAnimalProfileDetails: Record<string, AnimalProfileDetails> = {
  animal1: {
    animalId: 'animal1',
    photoCategories: [
      {
        category: 'Shelter',
        photos: [
          {
            id: 'shelter1',
            url: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800&h=600&fit=crop',
            caption: 'Outdoor kennel area',
            uploadedAt: '2024-01-15',
          },
          {
            id: 'shelter2',
            url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop',
            caption: 'Indoor sleeping area',
            uploadedAt: '2024-01-16',
          },
        ],
      },
      {
        category: 'Whelping Areas',
        photos: [
          {
            id: 'whelp1',
            url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop',
            caption: 'Whelping box setup',
            uploadedAt: '2024-02-01',
          },
        ],
      },
      {
        category: 'Vaccinations',
        photos: [
          {
            id: 'vacc1',
            url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop',
            caption: 'Vaccination record card',
            uploadedAt: '2024-01-20',
          },
        ],
      },
      {
        category: 'Baby Photos',
        photos: [
          {
            id: 'baby1',
            url: 'https://images.unsplash.com/photo-1534351450181-ea9f78427fe8?w=800&h=600&fit=crop',
            caption: 'Luna as a puppy - 8 weeks',
            uploadedAt: '2020-05-15',
          },
          {
            id: 'baby2',
            url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=600&fit=crop',
            caption: 'Luna at 12 weeks',
            uploadedAt: '2020-06-15',
          },
        ],
      },
    ],
    feedingPlan: {
      schedule: [
        {
          id: 'feed1',
          time: '07:00',
          foodType: 'Royal Canin Adult',
          amount: '2 cups',
          notes: 'With vitamin supplement',
        },
        {
          id: 'feed2',
          time: '18:00',
          foodType: 'Royal Canin Adult',
          amount: '2 cups',
          notes: 'Mixed with wet food',
        },
      ],
      specialDietaryNotes: 'Grain-free diet, no chicken. Monitor weight during breeding season.',
    },
    semenAssessments: [], // Not applicable for bitches
    seasons: [
      {
        id: 'season1',
        startDate: '2024-02-15',
        endDate: '2024-03-01',
        notes: 'Normal heat cycle, bred on day 12',
        progesteroneReadings: [
          { date: '2024-02-18', value: 2.5, unit: 'ng/mL' },
          { date: '2024-02-20', value: 5.2, unit: 'ng/mL' },
          { date: '2024-02-22', value: 12.8, unit: 'ng/mL' },
          { date: '2024-02-24', value: 18.5, unit: 'ng/mL' },
        ],
      },
      {
        id: 'season2',
        startDate: '2023-08-10',
        endDate: '2023-08-28',
        notes: 'Not bred this cycle',
      },
      {
        id: 'season3',
        startDate: '2023-02-05',
        endDate: '2023-02-20',
        notes: 'Bred, resulted in litter',
        progesteroneReadings: [
          { date: '2023-02-08', value: 3.1, unit: 'ng/mL' },
          { date: '2023-02-10', value: 8.4, unit: 'ng/mL' },
          { date: '2023-02-12', value: 15.2, unit: 'ng/mL' },
        ],
      },
    ],
    litters: [
      {
        id: 'litter1',
        matingDate: '2024-02-25',
        sireId: 'animal2',
        sireName: 'Max',
        expectedWhelpingDate: '2024-04-28',
        whelpingDate: undefined,
        status: 'expected',
        complications: false,
        puppyCount: undefined,
      },
      {
        id: 'litter2',
        matingDate: '2023-02-12',
        sireId: 'animal2',
        sireName: 'Max',
        whelpingDate: '2023-04-15',
        expectedWhelpingDate: '2023-04-15',
        puppyCount: 7,
        survivingPuppies: 7,
        complications: false,
        notes: 'All puppies healthy, smooth whelping process',
        status: 'archived',
        puppies: [
          { id: 'pup1', name: 'Buddy', sex: 'male', weight: 0.45, color: 'Golden', status: 'sold' },
          { id: 'pup2', name: 'Bella', sex: 'female', weight: 0.42, color: 'Golden', status: 'sold' },
          { id: 'pup3', name: 'Charlie', sex: 'male', weight: 0.48, color: 'Golden', status: 'sold' },
          { id: 'pup4', name: 'Daisy', sex: 'female', weight: 0.44, color: 'Golden', status: 'sold' },
          { id: 'pup5', name: 'Rocky', sex: 'male', weight: 0.46, color: 'Golden', status: 'retained' },
          { id: 'pup6', sex: 'female', weight: 0.41, color: 'Golden', status: 'sold' },
          { id: 'pup7', sex: 'male', weight: 0.47, color: 'Golden', status: 'sold' },
        ],
      },
      {
        id: 'litter3',
        matingDate: '2022-03-20',
        sireId: 'animal5',
        sireName: 'Duke',
        whelpingDate: '2022-05-22',
        expectedWhelpingDate: '2022-05-22',
        puppyCount: 5,
        survivingPuppies: 5,
        complications: false,
        notes: 'Excellent litter, strong puppies',
        status: 'archived',
      },
    ],
    reminders: {
      enabled: true,
      vaccinations: true,
      vetCheckups: true,
      heatCycles: true,
      seasonTracking: true,
      feedingSchedule: false,
      customReminders: [
        {
          id: 'rem1',
          title: 'Hip X-ray for breeding certification',
          frequency: 'yearly',
          nextDate: '2024-12-15',
        },
      ],
    },
  },

  // Mock data for Max (animal2 - dog)
  animal2: {
    animalId: 'animal2',
    photoCategories: [
      {
        category: 'Shelter',
        photos: [
          {
            id: 'shelter1',
            url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop',
            caption: 'Kennel area',
            uploadedAt: '2024-01-10',
          },
        ],
      },
      {
        category: 'Baby Photos',
        photos: [
          {
            id: 'baby1',
            url: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=800&h=600&fit=crop',
            caption: 'Max as a puppy',
            uploadedAt: '2019-05-10',
          },
        ],
      },
    ],
    feedingPlan: {
      schedule: [
        {
          id: 'feed1',
          time: '08:00',
          foodType: 'Hill\'s Science Diet Adult Large Breed',
          amount: '3 cups',
        },
        {
          id: 'feed2',
          time: '19:00',
          foodType: 'Hill\'s Science Diet Adult Large Breed',
          amount: '3 cups',
        },
      ],
      specialDietaryNotes: 'High protein diet for active stud.',
    },
    semenAssessments: [
      {
        id: 'semen1',
        date: '2024-02-20',
        volume: 8.5,
        concentration: 650,
        motility: 85,
        morphology: 90,
        quality: 'excellent',
        notes: 'Excellent quality, suitable for AI',
        technician: 'Dr. Johnson',
      },
      {
        id: 'semen2',
        date: '2023-08-15',
        volume: 7.8,
        concentration: 580,
        motility: 82,
        morphology: 88,
        quality: 'excellent',
        notes: 'Very good sample',
        technician: 'Dr. Johnson',
      },
      {
        id: 'semen3',
        date: '2023-02-10',
        volume: 8.2,
        concentration: 620,
        motility: 86,
        morphology: 89,
        quality: 'excellent',
        notes: 'Excellent motility',
        technician: 'Dr. Smith',
      },
    ],
    reminders: {
      enabled: true,
      vaccinations: true,
      vetCheckups: true,
      heatCycles: false,
      seasonTracking: false,
      feedingSchedule: false,
      customReminders: [
        {
          id: 'rem1',
          title: 'Annual health screening',
          frequency: 'yearly',
          nextDate: '2024-11-01',
        },
        {
          id: 'rem2',
          title: 'Semen quality assessment',
          frequency: 'yearly',
          nextDate: '2025-02-15',
        },
      ],
    },
  },
};

// Helper function to get profile details for an animal
export function getAnimalProfileDetails(animalId: string): AnimalProfileDetails | undefined {
  return mockAnimalProfileDetails[animalId];
}