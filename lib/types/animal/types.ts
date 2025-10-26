/**
 * Core animal type definitions
 * Base types and common interfaces for animal management
 */

// ============================================================================
// ENUMS & BASIC TYPES
// ============================================================================

export type Sex = 'male' | 'female';

export type AnimalStatus = 'active' | 'retired' | 'deceased' | 'sold';

// ============================================================================
// BASE ANIMAL INTERFACE
// ============================================================================

/**
 * Base animal interface with common fields
 */
export interface BaseAnimal {
  id: string;
  name: string;
  sex: Sex;
  breed?: string;
  dateOfBirth?: string;
  registrationNumber?: string;
  microchipNumber?: string;
  color?: string;
  weight?: number;
  status?: AnimalStatus;
  profileImageUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
