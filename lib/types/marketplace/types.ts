/**
 * Marketplace type definitions
 */

import type { Sex } from '../animal/types';

// ============================================================================
// MARKETPLACE TYPES
// ============================================================================

export type ListingCategory =
  | 'dog-for-sale'
  | 'pups-for-sale'
  | 'reproductive-services'
  | 'frozen-semen'
  | 'stud-dog';

export type ListingStatus = 'active' | 'pending' | 'sold' | 'expired';

export interface ListingContact {
  name: string;
  phone: string;
  email: string;
  location: string;
  availabilityNotes?: string;
}

export interface Clinic {
  id: string;
  name: string;
  location: string;
  phone: string;
  services: string[];
}

export interface MarketplaceListing {
  id: string;
  category: ListingCategory;
  animalId?: string;
  animalName?: string;
  frozenSemenId?: string;
  breederId: string;
  breederName: string;
  breederAvatar?: string;
  breederReputation: number;
  title: string;
  description: string;
  price?: number;
  currency: string;
  images: string[];
  contact: ListingContact;
  clinicId?: string; // For reproductive services and frozen semen
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  views: number;
  interested: number;
  featured?: boolean;
  // Animal details (copied from animal for quick access)
  breed?: string;
  sex?: Sex;
  age?: string;
  color?: string;
  registrationNumber?: string;
  healthCertified?: boolean;
  championLines?: boolean;
}
