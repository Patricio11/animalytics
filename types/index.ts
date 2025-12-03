import { UserRole } from '@/lib/constants/roles';

export interface Animal {
  id: string;
  userId: string; // Owner's user ID
  name: string;
  type: 'dog' | 'bitch';
  breed: string;
  dateOfBirth: string;
  age?: string; // Calculated or manually set age (e.g., "3 years")
  photos: string[];
  documents: Document[];
  frozenSemen?: FrozenSemenRecord[];
  owner: Owner;
  location: string;
  description?: string;
  healthRecords: HealthRecord[];
  weight?: number;
  height?: number;
  color?: string;
  markings?: string;
  microchipId?: string;
  registrationNumber?: string;
  bloodline?: string;
  achievements?: Achievement[];
  isForSale?: boolean;
  price?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  avatar?: string;
  joinedDate: string;
  totalAnimals: number;
  reputation: number;
}

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'certificate';
  category: 'health' | 'pedigree' | 'certificate' | 'photo' | 'other';
  url: string;
  uploadedAt: string;
  size: number;
}

export interface FrozenSemenRecord {
  id: string;
  collectionDate: string;
  qualityRating: number;
  motility: number;
  concentration: number;
  storageLocation: string;
  notes?: string;
  isAvailable: boolean;
}

export interface HealthRecord {
  id: string;
  date: string;
  type: 'vaccination' | 'checkup' | 'treatment' | 'surgery' | 'test';
  description: string;
  veterinarian: string;
  notes?: string;
  nextDueDate?: string;
}

export interface Achievement {
  id: string;
  title: string;
  date: string;
  organization: string;
  category: 'show' | 'working' | 'health' | 'breeding';
  description?: string;
}

export interface MatingRecord {
  id: string;
  dogId: string;
  bitchId: string;
  matingDate: string;
  progesteroneLevel: number;
  progesteroneCycleRating: number;
  conceptionRating: number;
  overallRating: number;
  notes?: string;
  expectedWhelping?: string;
  actualWhelping?: string;
  litterSize?: number;
  status: 'planned' | 'completed' | 'successful' | 'unsuccessful';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  animalId: string;
  type: 'feeding' | 'exercise' | 'grooming' | 'cleaning' | 'event' | 'puppies' | 'health' | 'training';
  date: string;
  title: string;
  details: Record<string, any>;
  notes?: string;
  photos?: string[];
  createdBy: string;
  createdAt: string;
}

export interface MarketplaceListing {
  id: string;
  animalId: string;
  price: number;
  description: string;
  location: string;
  contactInfo: {
    name: string;
    phone: string;
    email: string;
  };
  listedDate: string;
  status: 'active' | 'sold' | 'pending' | 'removed';
  views: number;
  inquiries: number;
  highlights: string[];
  shippingAvailable: boolean;
  negotiable: boolean;
}

export interface ConceptionCalculation {
  bitchRating: number;
  dogRating: number;
  informationAccuracy: number;
  factors: {
    age: number;
    health: number;
    previousLitters: number;
    genetics: number;
    timing: number;
    environment: number;
  };
  recommendations: string[];
  confidenceLevel: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  animalId?: string;
  category: 'health' | 'breeding' | 'grooming' | 'training' | 'general';
  createdAt: string;
  completedAt?: string;
}

export interface DashboardStats {
  totalAnimals: number;
  totalMatings: number;
  successfulMatings: number;
  activeTasks: number;
  upcomingEvents: number;
  recentActivities: ActivityLog[];
  topPerformingAnimals: Animal[];
  monthlyStats: {
    matings: number;
    births: number;
    sales: number;
    revenue: number;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Vet-specific types
export interface Appointment {
  id: string;
  animalId: string;
  ownerId: string;
  vetId: string;
  date: string;
  time: string;
  type: 'checkup' | 'vaccination' | 'surgery' | 'consultation' | 'emergency';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: Medication[];
  followUpDate?: string;
  notes: string;
  attachments?: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface VeterinaryReport {
  id: string;
  animalId: string;
  appointmentId?: string;
  vetId: string;
  type: 'health_certificate' | 'breeding_fitness' | 'surgery_report' | 'diagnosis';
  findings: string;
  recommendations: string;
  validUntil?: string;
  attachments: Document[];
  issuedAt: string;
}

// Event organizer types
export interface Event {
  id: string;
  name: string;
  description: string;
  type: 'dog_show' | 'breeding_exhibition' | 'training_seminar' | 'competition';
  date: string;
  endDate?: string;
  location: {
    venue: string;
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  organizerId: string;
  categories: EventCategory[];
  registration: {
    opens: string;
    closes: string;
    fee: number;
    maxParticipants?: number;
    requirements: string[];
  };
  status: 'draft' | 'published' | 'registration_open' | 'registration_closed' | 'in_progress' | 'completed' | 'cancelled';
  prizes: Prize[];
  sponsors?: Sponsor[];
  rules: string;
  attachments: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface EventCategory {
  id: string;
  name: string;
  description: string;
  ageGroups: string[];
  breedRestrictions?: string[];
  fee: number;
  maxParticipants?: number;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  categoryId: string;
  animalId: string;
  ownerId: string;
  registrationDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentId?: string;
  notes?: string;
  documents: Document[];
}

export interface Prize {
  id: string;
  category: string;
  position: number;
  title: string;
  description?: string;
  value?: number;
  sponsor?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  level: 'platinum' | 'gold' | 'silver' | 'bronze';
}

export interface EventResult {
  id: string;
  eventId: string;
  categoryId: string;
  animalId: string;
  ownerId: string;
  position: number;
  score?: number;
  judge?: string;
  notes?: string;
  photos?: string[];
  certificateUrl?: string;
}

// Admin-specific types
export interface SystemSettings {
  id: string;
  category: 'general' | 'email' | 'payment' | 'security' | 'features';
  key: string;
  value: any;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  isPublic: boolean;
  updatedBy: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface Analytics {
  period: 'day' | 'week' | 'month' | 'year';
  users: {
    total: number;
    active: number;
    new: number;
    byRole: Record<UserRole, number>;
  };
  animals: {
    total: number;
    new: number;
    byBreed: Record<string, number>;
  };
  activities: {
    total: number;
    byType: Record<string, number>;
  };
  revenue: {
    total: number;
    subscriptions: number;
    marketplace: number;
    events: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  organization?: string;
  licenseNumber?: string; // For vets
  certifications?: string[]; // For vets and event organizers
  specializations?: string[]; // For vets
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    darkMode: boolean;
    language: string;
    timezone: string;
  };
  subscription: {
    plan: 'free' | 'premium' | 'professional' | 'enterprise';
    expiresAt?: string;
    features: string[];
  };
  permissions: string[];
  isVerified: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}