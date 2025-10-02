import {
  Home, Heart, Activity, Calculator, ShoppingBag, Settings,
  Users, Shield, BarChart3, Calendar, Stethoscope,
  FileText, Trophy, UserCheck,
  Presentation, Database
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { UserRole, USER_ROLES } from './roles';

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
  children?: NavigationItem[];
}

export const ROLE_NAVIGATION: Record<UserRole, NavigationItem[]> = {
  [USER_ROLES.BREEDER]: [
    {
      name: 'Dashboard',
      href: '/(breeder)/dashboard',
      icon: Home,
      description: 'Overview of your breeding operation'
    },
    {
      name: 'My Animals',
      href: '/(breeder)/animals',
      icon: Heart,
      description: 'Manage your animal profiles',
      children: [
        { name: 'All Animals', href: '/(breeder)/animals', icon: Heart },
        { name: 'Add New', href: '/(breeder)/animals/new', icon: Heart },
        { name: 'Health Records', href: '/(breeder)/animals/health', icon: Heart },
      ]
    },
    {
      name: 'Activities',
      href: '/(breeder)/activities',
      icon: Activity,
      description: 'Track daily activities and care',
      children: [
        { name: 'Activity Log', href: '/(breeder)/activities', icon: Activity },
        { name: 'Feeding', href: '/(breeder)/activities/feeding', icon: Activity },
        { name: 'Exercise', href: '/(breeder)/activities/exercise', icon: Activity },
        { name: 'Grooming', href: '/(breeder)/activities/grooming', icon: Activity },
      ]
    },
    {
      name: 'Calculators',
      href: '/(breeder)/calculators',
      icon: Calculator,
      description: 'Breeding and conception tools',
      children: [
        { name: 'Mating Calculator', href: '/(breeder)/calculators/mating', icon: Calculator },
        { name: 'Conception Rating', href: '/(breeder)/calculators/conception', icon: Calculator },
        { name: 'Whelping Calendar', href: '/(breeder)/calculators/whelping', icon: Calculator },
      ]
    },
    {
      name: 'Marketplace',
      href: '/(breeder)/marketplace',
      icon: ShoppingBag,
      description: 'Buy and sell animals',
      children: [
        { name: 'Browse Listings', href: '/(breeder)/marketplace', icon: ShoppingBag },
        { name: 'My Listings', href: '/(breeder)/marketplace/my-listings', icon: ShoppingBag },
        { name: 'Create Listing', href: '/(breeder)/marketplace/create', icon: ShoppingBag },
      ]
    },
  ],

  [USER_ROLES.ADMIN]: [
    {
      name: 'Dashboard',
      href: '/(admin)/dashboard',
      icon: Home,
      description: 'System overview and analytics'
    },
    {
      name: 'Users',
      href: '/(admin)/users',
      icon: Users,
      description: 'Manage all system users',
      children: [
        { name: 'All Users', href: '/(admin)/users', icon: Users },
        { name: 'Breeders', href: '/(admin)/users/breeders', icon: Users },
        { name: 'Veterinarians', href: '/(admin)/users/vets', icon: Users },
        { name: 'Event Organizers', href: '/(admin)/users/organizers', icon: Users },
      ]
    },
    {
      name: 'Analytics',
      href: '/(admin)/analytics',
      icon: BarChart3,
      description: 'System analytics and reports',
      children: [
        { name: 'Overview', href: '/(admin)/analytics', icon: BarChart3 },
        { name: 'User Activity', href: '/(admin)/analytics/users', icon: BarChart3 },
        { name: 'Revenue', href: '/(admin)/analytics/revenue', icon: BarChart3 },
        { name: 'Performance', href: '/(admin)/analytics/performance', icon: BarChart3 },
      ]
    },
    {
      name: 'System Settings',
      href: '/(admin)/settings',
      icon: Settings,
      description: 'Configure system settings',
      children: [
        { name: 'General', href: '/(admin)/settings', icon: Settings },
        { name: 'Security', href: '/(admin)/settings/security', icon: Shield },
        { name: 'Integrations', href: '/(admin)/settings/integrations', icon: Settings },
        { name: 'Backup', href: '/(admin)/settings/backup', icon: Database },
      ]
    },
  ],

  [USER_ROLES.VET]: [
    {
      name: 'Dashboard',
      href: '/(vet)/dashboard',
      icon: Home,
      description: 'Your veterinary practice overview'
    },
    {
      name: 'Appointments',
      href: '/(vet)/appointments',
      icon: Calendar,
      description: 'Manage appointments and schedule',
      children: [
        { name: 'Today', href: '/(vet)/appointments/today', icon: Calendar },
        { name: 'Upcoming', href: '/(vet)/appointments', icon: Calendar },
        { name: 'Schedule', href: '/(vet)/appointments/schedule', icon: Calendar },
      ]
    },
    {
      name: 'Animal Records',
      href: '/(vet)/animals',
      icon: Heart,
      description: 'View and update animal health records',
      children: [
        { name: 'All Animals', href: '/(vet)/animals', icon: Heart },
        { name: 'Search', href: '/(vet)/animals/search', icon: Heart },
        { name: 'Health Certificates', href: '/(vet)/animals/certificates', icon: FileText },
      ]
    },
    {
      name: 'Reports',
      href: '/(vet)/reports',
      icon: FileText,
      description: 'Generate health and treatment reports',
      children: [
        { name: 'Health Reports', href: '/(vet)/reports', icon: FileText },
        { name: 'Breeding Fitness', href: '/(vet)/reports/breeding', icon: FileText },
        { name: 'Vaccination Records', href: '/(vet)/reports/vaccinations', icon: Stethoscope },
      ]
    },
  ],

  [USER_ROLES.EVENT_ORGANIZER]: [
    {
      name: 'Dashboard',
      href: '/(event-organizer)/dashboard',
      icon: Home,
      description: 'Event management overview'
    },
    {
      name: 'Events',
      href: '/(event-organizer)/events',
      icon: Calendar,
      description: 'Manage your events',
      children: [
        { name: 'All Events', href: '/(event-organizer)/events', icon: Calendar },
        { name: 'Create Event', href: '/(event-organizer)/events/create', icon: Calendar },
        { name: 'Templates', href: '/(event-organizer)/events/templates', icon: Calendar },
      ]
    },
    {
      name: 'Registrations',
      href: '/(event-organizer)/registrations',
      icon: UserCheck,
      description: 'Manage event registrations',
      children: [
        { name: 'All Registrations', href: '/(event-organizer)/registrations', icon: UserCheck },
        { name: 'Pending Approval', href: '/(event-organizer)/registrations/pending', icon: UserCheck },
        { name: 'Check-in', href: '/(event-organizer)/registrations/checkin', icon: UserCheck },
      ]
    },
    {
      name: 'Results',
      href: '/(event-organizer)/results',
      icon: Trophy,
      description: 'Manage competition results',
      children: [
        { name: 'Enter Results', href: '/(event-organizer)/results', icon: Trophy },
        { name: 'Leaderboards', href: '/(event-organizer)/results/leaderboards', icon: Trophy },
        { name: 'Certificates', href: '/(event-organizer)/results/certificates', icon: Trophy },
      ]
    },
  ],
};

export const QUICK_ACTIONS: Record<UserRole, NavigationItem[]> = {
  [USER_ROLES.BREEDER]: [
    { name: 'Add Animal', href: '/(breeder)/animals/new', icon: Heart },
    { name: 'Log Activity', href: '/(breeder)/activities/new', icon: Activity },
    { name: 'Calculate Mating', href: '/(breeder)/calculators/mating', icon: Calculator },
    { name: 'Create Listing', href: '/(breeder)/marketplace/create', icon: ShoppingBag },
  ],
  [USER_ROLES.ADMIN]: [
    { name: 'Add User', href: '/(admin)/users/new', icon: Users },
    { name: 'View Analytics', href: '/(admin)/analytics', icon: BarChart3 },
    { name: 'System Health', href: '/(admin)/settings/health', icon: Shield },
    { name: 'Backup Data', href: '/(admin)/settings/backup', icon: Database },
  ],
  [USER_ROLES.VET]: [
    { name: 'New Appointment', href: '/(vet)/appointments/new', icon: Calendar },
    { name: 'Health Certificate', href: '/(vet)/reports/new', icon: FileText },
    { name: 'Search Animal', href: '/(vet)/animals/search', icon: Heart },
    { name: 'Emergency Protocol', href: '/(vet)/emergency', icon: Stethoscope },
  ],
  [USER_ROLES.EVENT_ORGANIZER]: [
    { name: 'Create Event', href: '/(event-organizer)/events/create', icon: Calendar },
    { name: 'Check Registrations', href: '/(event-organizer)/registrations', icon: UserCheck },
    { name: 'Enter Results', href: '/(event-organizer)/results/new', icon: Trophy },
    { name: 'Event Analytics', href: '/(event-organizer)/analytics', icon: Presentation },
  ],
};