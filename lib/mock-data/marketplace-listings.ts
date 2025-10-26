/**
 * Marketplace listings mock data
 * Complete listing system for breeding marketplace
 * 
 * NOTE: Type definitions have been moved to @/lib/types/marketplace
 * Import types from there instead of this file
 */

import type {
  MarketplaceListing,
  Clinic,
  ListingCategory,
  ListingStatus,
  ListingContact,
} from '@/lib/types/marketplace';

// Mock clinics
export const mockClinics: Clinic[] = [
  {
    id: 'clinic-1',
    name: 'Melbourne Veterinary Reproduction Center',
    location: 'Melbourne, VIC',
    phone: '+61 3 9555 0123',
    services: ['Artificial Insemination', 'Frozen Semen Storage', 'Progesterone Testing', 'Ultrasound'],
  },
  {
    id: 'clinic-2',
    name: 'Sydney Canine Fertility Clinic',
    location: 'Sydney, NSW',
    phone: '+61 2 9876 5432',
    services: ['Semen Collection', 'Semen Analysis', 'AI Services', 'Reproductive Surgery'],
  },
  {
    id: 'clinic-3',
    name: 'Brisbane Pet Reproduction Services',
    location: 'Brisbane, QLD',
    phone: '+61 7 3456 7890',
    services: ['Frozen Semen Storage', 'AI Services', 'Fertility Testing', 'Whelping Support'],
  },
  {
    id: 'clinic-4',
    name: 'Perth Breeding Support Center',
    location: 'Perth, WA',
    phone: '+61 8 9234 5678',
    services: ['Semen Collection', 'AI Services', 'Progesterone Testing', 'Breeding Consultation'],
  },
];

// Mock marketplace listings
export const mockMarketplaceListings: MarketplaceListing[] = [
  // Stud Dogs
  {
    id: 'listing-1',
    category: 'stud-dog',
    animalId: 'animal2',
    animalName: 'Max',
    breederId: 'owner1',
    breederName: 'Sarah Johnson',
    breederAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b85e6ffe?w=150&h=150&fit=crop&crop=face',
    breederReputation: 4.8,
    title: 'Champion Golden Retriever Stud - Max',
    description: 'Max is a champion Golden Retriever with excellent temperament and proven track record. Multiple best in show awards. Health tested for hips, elbows, eyes, and heart. OFA Excellent rating. Available for natural or AI breeding.',
    price: 1500,
    currency: 'AUD',
    images: [
      'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=600&fit=crop',
    ],
    contact: {
      name: 'Sarah Johnson',
      phone: '+61 412 345 678',
      email: 'sarah@breeder.com',
      location: 'Melbourne, VIC',
      availabilityNotes: 'Available for stud service year-round. Progesterone testing recommended.',
    },
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    views: 156,
    interested: 12,
    featured: true,
    breed: 'Golden Retriever',
    sex: 'male',
    age: '4 years',
    color: 'Golden',
    registrationNumber: 'AKC-GR-123456',
    healthCertified: true,
    championLines: true,
  },
  {
    id: 'listing-2',
    category: 'stud-dog',
    animalId: 'animal3',
    animalName: 'Rocky',
    breederId: 'owner2',
    breederName: 'Mike Thompson',
    breederAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    breederReputation: 4.9,
    title: 'German Shepherd Stud - Rocky',
    description: 'Exceptional working line German Shepherd. Proven producer of high-drive working dogs. HD/ED A/A rating. DM clear. Available for approved bitches only.',
    price: 2000,
    currency: 'AUD',
    images: [
      'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800&h=600&fit=crop',
    ],
    contact: {
      name: 'Mike Thompson',
      phone: '+61 423 456 789',
      email: 'mike@dogbreeder.com',
      location: 'Sydney, NSW',
      availabilityNotes: 'Prefer natural breeding. AI available if required.',
    },
    status: 'active',
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-01-10T14:00:00Z',
    views: 203,
    interested: 18,
    breed: 'German Shepherd',
    sex: 'male',
    age: '3 years',
    color: 'Black and Tan',
    registrationNumber: 'GSDCA-2021-789',
    healthCertified: true,
    championLines: true,
  },
  // Dogs for Sale
  {
    id: 'listing-3',
    category: 'dog-for-sale',
    animalId: 'animal1',
    animalName: 'Luna',
    breederId: 'owner1',
    breederName: 'Sarah Johnson',
    breederAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b85e6ffe?w=150&h=150&fit=crop&crop=face',
    breederReputation: 4.8,
    title: 'Proven Breeding Bitch - Luna',
    description: 'Beautiful Golden Retriever bitch with excellent temperament. Has produced 3 healthy litters with average 8 puppies. Current on all health testing. Would make an excellent foundation bitch.',
    price: 3500,
    currency: 'AUD',
    images: [
      'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800&h=600&fit=crop',
    ],
    contact: {
      name: 'Sarah Johnson',
      phone: '+61 412 345 678',
      email: 'sarah@breeder.com',
      location: 'Melbourne, VIC',
    },
    status: 'active',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
    views: 89,
    interested: 7,
    breed: 'Golden Retriever',
    sex: 'female',
    age: '5 years',
    color: 'Golden',
    registrationNumber: 'AKC-GR-654321',
    healthCertified: true,
    championLines: true,
  },
  // Puppies for Sale
  {
    id: 'listing-4',
    category: 'pups-for-sale',
    breederId: 'owner3',
    breederName: 'Emma Davis',
    breederAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    breederReputation: 4.7,
    title: 'Golden Retriever Puppies - 8 Weeks Old',
    description: 'Beautiful litter of 6 Golden Retriever puppies ready for their forever homes. Parents are health tested and have excellent temperaments. Puppies come with first vaccinations, microchip, and puppy pack.',
    price: 2800,
    currency: 'AUD',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop',
    ],
    contact: {
      name: 'Emma Davis',
      phone: '+61 434 567 890',
      email: 'emma@kennels.com',
      location: 'Brisbane, QLD',
      availabilityNotes: '3 males and 3 females available. Viewing by appointment.',
    },
    status: 'active',
    createdAt: '2024-01-25T11:00:00Z',
    updatedAt: '2024-01-25T11:00:00Z',
    views: 342,
    interested: 28,
    featured: true,
    breed: 'Golden Retriever',
    age: '8 weeks',
    healthCertified: true,
  },
  // Reproductive Services
  {
    id: 'listing-5',
    category: 'reproductive-services',
    animalId: 'animal2',
    animalName: 'Max',
    breederId: 'owner1',
    breederName: 'Sarah Johnson',
    breederAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b85e6ffe?w=150&h=150&fit=crop&crop=face',
    breederReputation: 4.8,
    title: 'AI Services - Champion Golden Retriever',
    description: 'Artificial insemination services available using fresh chilled semen. Semen collection and AI performed at Melbourne Veterinary Reproduction Center. Excellent motility and proven fertility.',
    price: 1200,
    currency: 'AUD',
    images: [
      'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800&h=600&fit=crop',
    ],
    contact: {
      name: 'Sarah Johnson',
      phone: '+61 412 345 678',
      email: 'sarah@breeder.com',
      location: 'Melbourne, VIC',
      availabilityNotes: 'Collection can be scheduled within 24 hours. Overnight shipping available Australia-wide.',
    },
    clinicId: 'clinic-1',
    status: 'active',
    createdAt: '2024-01-18T13:00:00Z',
    updatedAt: '2024-01-18T13:00:00Z',
    views: 124,
    interested: 9,
    breed: 'Golden Retriever',
    sex: 'male',
    age: '4 years',
    healthCertified: true,
    championLines: true,
  },
  // Frozen Semen
  {
    id: 'listing-6',
    category: 'frozen-semen',
    frozenSemenId: 'semen-1',
    breederId: 'owner2',
    breederName: 'Mike Thompson',
    breederAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    breederReputation: 4.9,
    title: 'Frozen Semen - Champion German Shepherd',
    description: 'Premium frozen semen from international champion German Shepherd. Excellent post-thaw motility (>70%). Multiple straws available. Stored at Sydney Canine Fertility Clinic.',
    price: 1800,
    currency: 'AUD',
    images: [
      'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800&h=600&fit=crop',
    ],
    contact: {
      name: 'Mike Thompson',
      phone: '+61 423 456 789',
      email: 'mike@dogbreeder.com',
      location: 'Sydney, NSW',
      availabilityNotes: '5 straws available. Can ship to any Australian reproductive clinic.',
    },
    clinicId: 'clinic-2',
    status: 'active',
    createdAt: '2024-01-12T16:00:00Z',
    updatedAt: '2024-01-12T16:00:00Z',
    views: 98,
    interested: 11,
    breed: 'German Shepherd',
    sex: 'male',
    healthCertified: true,
    championLines: true,
  },
];

// Helper function to get listings by category
export function getListingsByCategory(category: ListingCategory | 'all'): MarketplaceListing[] {
  if (category === 'all') {
    return mockMarketplaceListings;
  }
  return mockMarketplaceListings.filter(listing => listing.category === category);
}

// Helper function to get clinic by ID
export function getClinicById(clinicId: string): Clinic | undefined {
  return mockClinics.find(clinic => clinic.id === clinicId);
}

// Helper function to get category label
export function getCategoryLabel(category: ListingCategory): string {
  const labels: Record<ListingCategory, string> = {
    'dog-for-sale': 'Dog for Sale',
    'pups-for-sale': 'Puppies for Sale',
    'reproductive-services': 'Reproductive Services',
    'frozen-semen': 'Frozen Semen',
    'stud-dog': 'Stud Dog',
  };
  return labels[category];
}

// Helper function to check if category requires clinic
export function categoryRequiresClinic(category: ListingCategory): boolean {
  return category === 'reproductive-services' || category === 'frozen-semen';
}