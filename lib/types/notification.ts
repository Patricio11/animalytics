// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType =
  // Progesterone & Heat Cycles
  | 'progesterone_test_due'
  | 'progesterone_daily_test'
  | 'breeding_window_open'
  | 'breeding_window_closing'
  | 'ovulation_detected'
  | 'whelping_approaching'
  | 'heat_cycle_started'
  // Breeding & Litters
  | 'breeding_scheduled'
  | 'breeding_completed'
  | 'pregnancy_confirmed'
  | 'ultrasound_due'
  | 'whelping_started'
  | 'puppy_born'
  | 'litter_registered'
  // Health & Veterinary
  | 'vaccination_due'
  | 'deworming_due'
  | 'vet_appointment'
  | 'health_check_due'
  | 'medication_reminder'
  // Marketplace & Sales
  | 'listing_approved'
  | 'listing_rejected'
  | 'listing_expired'
  | 'inquiry_received'
  | 'offer_received'
  | 'sale_completed'
  // Financial
  | 'payment_received'
  | 'payment_due'
  | 'invoice_generated'
  | 'wallet_low_balance'
  // System & Account
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'kyc_pending_review'
  | 'subscription_expiring'
  | 'subscription_renewed'
  | 'account_verified'
  // Social & Community
  | 'new_follower'
  | 'review_received'
  | 'message_received'
  | 'event_reminder'
  // General
  | 'system_announcement'
  | 'feature_update'
  | 'maintenance_scheduled';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationCategory = 
  | 'breeding'
  | 'health'
  | 'financial'
  | 'marketplace'
  | 'system'
  | 'social';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  icon?: string;
  iconColor?: string;
  read: boolean;
  readAt?: Date;
  archived: boolean;
  archivedAt?: Date;
  metadata?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  enableInApp: boolean;
  enableEmail: boolean;
  enableSms: boolean;
  enablePush: boolean;
  categoryPreferences?: string;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  enableDailyDigest: boolean;
  dailyDigestTime?: string;
  enableWeeklyDigest: boolean;
  weeklyDigestDay?: string;
  weeklyDigestTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryPreferences {
  breeding?: ChannelPreferences;
  health?: ChannelPreferences;
  financial?: ChannelPreferences;
  marketplace?: ChannelPreferences;
  system?: ChannelPreferences;
  social?: ChannelPreferences;
}

export interface ChannelPreferences {
  inApp: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  priority?: NotificationPriority;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  icon?: string;
  iconColor?: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
}

export interface UpdateNotificationRequest {
  read?: boolean;
  archived?: boolean;
}

export interface NotificationFilters {
  read?: boolean;
  archived?: boolean;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  type?: NotificationType;
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCategory: Record<NotificationCategory, number>;
  byPriority: Record<NotificationPriority, number>;
}

// ============================================================================
// NOTIFICATION HELPER TYPES
// ============================================================================

export interface NotificationConfig {
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  icon: string;
  iconColor: string;
  defaultTitle: string;
  defaultMessage: string;
  actionLabel?: string;
}

// Notification configuration map
export const NOTIFICATION_CONFIGS: Record<NotificationType, NotificationConfig> = {
  // Progesterone & Heat Cycles
  progesterone_test_due: {
    type: 'progesterone_test_due',
    category: 'breeding',
    priority: 'high',
    icon: '🔬',
    iconColor: '#8b5cf6',
    defaultTitle: 'Progesterone Test Due',
    defaultMessage: 'Time to perform a progesterone test',
    actionLabel: 'View Cycle',
  },
  progesterone_daily_test: {
    type: 'progesterone_daily_test',
    category: 'breeding',
    priority: 'urgent',
    icon: '⚡',
    iconColor: '#f59e0b',
    defaultTitle: 'Daily Test Required',
    defaultMessage: 'Daily progesterone testing is now required',
    actionLabel: 'Add Reading',
  },
  breeding_window_open: {
    type: 'breeding_window_open',
    category: 'breeding',
    priority: 'urgent',
    icon: '🎯',
    iconColor: '#10b981',
    defaultTitle: 'Breeding Window Open!',
    defaultMessage: 'Optimal breeding time detected',
    actionLabel: 'View Details',
  },
  breeding_window_closing: {
    type: 'breeding_window_closing',
    category: 'breeding',
    priority: 'high',
    icon: '⏰',
    iconColor: '#ef4444',
    defaultTitle: 'Breeding Window Closing',
    defaultMessage: 'Last chance to breed',
    actionLabel: 'View Cycle',
  },
  ovulation_detected: {
    type: 'ovulation_detected',
    category: 'breeding',
    priority: 'high',
    icon: '🔴',
    iconColor: '#ef4444',
    defaultTitle: 'Ovulation Detected',
    defaultMessage: 'Ovulation has been detected',
    actionLabel: 'View Cycle',
  },
  whelping_approaching: {
    type: 'whelping_approaching',
    category: 'breeding',
    priority: 'high',
    icon: '👶',
    iconColor: '#ec4899',
    defaultTitle: 'Whelping Approaching',
    defaultMessage: 'Expected whelping date is near',
    actionLabel: 'View Litter',
  },
  heat_cycle_started: {
    type: 'heat_cycle_started',
    category: 'breeding',
    priority: 'normal',
    icon: '🌡️',
    iconColor: '#8b5cf6',
    defaultTitle: 'Heat Cycle Started',
    defaultMessage: 'A new heat cycle has been recorded',
    actionLabel: 'View Cycle',
  },

  // Breeding & Litters
  breeding_scheduled: {
    type: 'breeding_scheduled',
    category: 'breeding',
    priority: 'normal',
    icon: '📅',
    iconColor: '#3b82f6',
    defaultTitle: 'Breeding Scheduled',
    defaultMessage: 'A breeding has been scheduled',
    actionLabel: 'View Details',
  },
  breeding_completed: {
    type: 'breeding_completed',
    category: 'breeding',
    priority: 'normal',
    icon: '✅',
    iconColor: '#10b981',
    defaultTitle: 'Breeding Completed',
    defaultMessage: 'Breeding has been recorded',
    actionLabel: 'View Details',
  },
  pregnancy_confirmed: {
    type: 'pregnancy_confirmed',
    category: 'breeding',
    priority: 'high',
    icon: '🎉',
    iconColor: '#10b981',
    defaultTitle: 'Pregnancy Confirmed!',
    defaultMessage: 'Pregnancy has been confirmed',
    actionLabel: 'View Litter',
  },
  ultrasound_due: {
    type: 'ultrasound_due',
    category: 'health',
    priority: 'normal',
    icon: '🔍',
    iconColor: '#3b82f6',
    defaultTitle: 'Ultrasound Due',
    defaultMessage: 'Time for pregnancy ultrasound',
    actionLabel: 'Schedule',
  },
  whelping_started: {
    type: 'whelping_started',
    category: 'breeding',
    priority: 'urgent',
    icon: '🚨',
    iconColor: '#ef4444',
    defaultTitle: 'Whelping Started!',
    defaultMessage: 'Whelping has begun',
    actionLabel: 'View Litter',
  },
  puppy_born: {
    type: 'puppy_born',
    category: 'breeding',
    priority: 'high',
    icon: '🐕',
    iconColor: '#10b981',
    defaultTitle: 'Puppy Born!',
    defaultMessage: 'A new puppy has been born',
    actionLabel: 'View Puppy',
  },
  litter_registered: {
    type: 'litter_registered',
    category: 'breeding',
    priority: 'normal',
    icon: '📋',
    iconColor: '#3b82f6',
    defaultTitle: 'Litter Registered',
    defaultMessage: 'Litter has been registered',
    actionLabel: 'View Litter',
  },

  // Health & Veterinary
  vaccination_due: {
    type: 'vaccination_due',
    category: 'health',
    priority: 'high',
    icon: '💉',
    iconColor: '#ef4444',
    defaultTitle: 'Vaccination Due',
    defaultMessage: 'Vaccination is due',
    actionLabel: 'Schedule',
  },
  deworming_due: {
    type: 'deworming_due',
    category: 'health',
    priority: 'normal',
    icon: '💊',
    iconColor: '#f59e0b',
    defaultTitle: 'Deworming Due',
    defaultMessage: 'Deworming treatment is due',
    actionLabel: 'Mark Complete',
  },
  vet_appointment: {
    type: 'vet_appointment',
    category: 'health',
    priority: 'high',
    icon: '🏥',
    iconColor: '#3b82f6',
    defaultTitle: 'Vet Appointment',
    defaultMessage: 'Upcoming veterinary appointment',
    actionLabel: 'View Details',
  },
  health_check_due: {
    type: 'health_check_due',
    category: 'health',
    priority: 'normal',
    icon: '🩺',
    iconColor: '#10b981',
    defaultTitle: 'Health Check Due',
    defaultMessage: 'Regular health check is due',
    actionLabel: 'Schedule',
  },
  medication_reminder: {
    type: 'medication_reminder',
    category: 'health',
    priority: 'high',
    icon: '⏰',
    iconColor: '#ef4444',
    defaultTitle: 'Medication Reminder',
    defaultMessage: 'Time to administer medication',
    actionLabel: 'Mark Given',
  },

  // Marketplace & Sales
  listing_approved: {
    type: 'listing_approved',
    category: 'marketplace',
    priority: 'normal',
    icon: '✅',
    iconColor: '#10b981',
    defaultTitle: 'Listing Approved',
    defaultMessage: 'Your listing has been approved',
    actionLabel: 'View Listing',
  },
  listing_rejected: {
    type: 'listing_rejected',
    category: 'marketplace',
    priority: 'normal',
    icon: '❌',
    iconColor: '#ef4444',
    defaultTitle: 'Listing Rejected',
    defaultMessage: 'Your listing was rejected',
    actionLabel: 'View Reason',
  },
  listing_expired: {
    type: 'listing_expired',
    category: 'marketplace',
    priority: 'low',
    icon: '⏰',
    iconColor: '#6b7280',
    defaultTitle: 'Listing Expired',
    defaultMessage: 'Your listing has expired',
    actionLabel: 'Renew',
  },
  inquiry_received: {
    type: 'inquiry_received',
    category: 'marketplace',
    priority: 'high',
    icon: '💬',
    iconColor: '#3b82f6',
    defaultTitle: 'New Inquiry',
    defaultMessage: 'You have received a new inquiry',
    actionLabel: 'Reply',
  },
  offer_received: {
    type: 'offer_received',
    category: 'marketplace',
    priority: 'high',
    icon: '💰',
    iconColor: '#10b981',
    defaultTitle: 'Offer Received',
    defaultMessage: 'You have received an offer',
    actionLabel: 'Review Offer',
  },
  sale_completed: {
    type: 'sale_completed',
    category: 'marketplace',
    priority: 'normal',
    icon: '🎉',
    iconColor: '#10b981',
    defaultTitle: 'Sale Completed',
    defaultMessage: 'Your sale has been completed',
    actionLabel: 'View Details',
  },

  // Financial
  payment_received: {
    type: 'payment_received',
    category: 'financial',
    priority: 'normal',
    icon: '💵',
    iconColor: '#10b981',
    defaultTitle: 'Payment Received',
    defaultMessage: 'You have received a payment',
    actionLabel: 'View Transaction',
  },
  payment_due: {
    type: 'payment_due',
    category: 'financial',
    priority: 'high',
    icon: '💳',
    iconColor: '#ef4444',
    defaultTitle: 'Payment Due',
    defaultMessage: 'A payment is due',
    actionLabel: 'Pay Now',
  },
  invoice_generated: {
    type: 'invoice_generated',
    category: 'financial',
    priority: 'normal',
    icon: '📄',
    iconColor: '#3b82f6',
    defaultTitle: 'Invoice Generated',
    defaultMessage: 'A new invoice has been generated',
    actionLabel: 'View Invoice',
  },
  wallet_low_balance: {
    type: 'wallet_low_balance',
    category: 'financial',
    priority: 'normal',
    icon: '⚠️',
    iconColor: '#f59e0b',
    defaultTitle: 'Low Wallet Balance',
    defaultMessage: 'Your wallet balance is low',
    actionLabel: 'Add Funds',
  },

  // System & Account
  kyc_approved: {
    type: 'kyc_approved',
    category: 'system',
    priority: 'high',
    icon: '✅',
    iconColor: '#10b981',
    defaultTitle: 'KYC Approved',
    defaultMessage: 'Your verification has been approved',
    actionLabel: 'View Status',
  },
  kyc_rejected: {
    type: 'kyc_rejected',
    category: 'system',
    priority: 'high',
    icon: '❌',
    iconColor: '#ef4444',
    defaultTitle: 'KYC Rejected',
    defaultMessage: 'Your verification was rejected',
    actionLabel: 'Resubmit',
  },
  kyc_pending_review: {
    type: 'kyc_pending_review',
    category: 'system',
    priority: 'normal',
    icon: '⏳',
    iconColor: '#f59e0b',
    defaultTitle: 'KYC Under Review',
    defaultMessage: 'Your verification is being reviewed',
    actionLabel: 'View Status',
  },
  subscription_expiring: {
    type: 'subscription_expiring',
    category: 'system',
    priority: 'high',
    icon: '⏰',
    iconColor: '#f59e0b',
    defaultTitle: 'Subscription Expiring',
    defaultMessage: 'Your subscription is expiring soon',
    actionLabel: 'Renew',
  },
  subscription_renewed: {
    type: 'subscription_renewed',
    category: 'system',
    priority: 'normal',
    icon: '✅',
    iconColor: '#10b981',
    defaultTitle: 'Subscription Renewed',
    defaultMessage: 'Your subscription has been renewed',
    actionLabel: 'View Details',
  },
  account_verified: {
    type: 'account_verified',
    category: 'system',
    priority: 'normal',
    icon: '✅',
    iconColor: '#10b981',
    defaultTitle: 'Account Verified',
    defaultMessage: 'Your account has been verified',
    actionLabel: 'Get Started',
  },

  // Social & Community
  new_follower: {
    type: 'new_follower',
    category: 'social',
    priority: 'low',
    icon: '👥',
    iconColor: '#3b82f6',
    defaultTitle: 'New Follower',
    defaultMessage: 'Someone started following you',
    actionLabel: 'View Profile',
  },
  review_received: {
    type: 'review_received',
    category: 'social',
    priority: 'normal',
    icon: '⭐',
    iconColor: '#f59e0b',
    defaultTitle: 'New Review',
    defaultMessage: 'You have received a new review',
    actionLabel: 'View Review',
  },
  message_received: {
    type: 'message_received',
    category: 'social',
    priority: 'high',
    icon: '💬',
    iconColor: '#3b82f6',
    defaultTitle: 'New Message',
    defaultMessage: 'You have received a new message',
    actionLabel: 'Read Message',
  },
  event_reminder: {
    type: 'event_reminder',
    category: 'social',
    priority: 'normal',
    icon: '📅',
    iconColor: '#8b5cf6',
    defaultTitle: 'Event Reminder',
    defaultMessage: 'Upcoming event reminder',
    actionLabel: 'View Event',
  },

  // General
  system_announcement: {
    type: 'system_announcement',
    category: 'system',
    priority: 'normal',
    icon: '📢',
    iconColor: '#3b82f6',
    defaultTitle: 'System Announcement',
    defaultMessage: 'Important system announcement',
    actionLabel: 'Read More',
  },
  feature_update: {
    type: 'feature_update',
    category: 'system',
    priority: 'low',
    icon: '🎉',
    iconColor: '#8b5cf6',
    defaultTitle: 'New Feature',
    defaultMessage: 'Check out our latest feature',
    actionLabel: 'Learn More',
  },
  maintenance_scheduled: {
    type: 'maintenance_scheduled',
    category: 'system',
    priority: 'normal',
    icon: '🔧',
    iconColor: '#f59e0b',
    defaultTitle: 'Maintenance Scheduled',
    defaultMessage: 'Scheduled maintenance notification',
    actionLabel: 'View Schedule',
  },
};

// ============================================================================
// UTILITY: strip UUIDs accidentally embedded in notification titles
// ============================================================================
const UUID_INLINE = /\s*[-–]\s*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

export function sanitizeNotificationTitle(title: string): string {
  return title.replace(UUID_INLINE, '').trim();
}
