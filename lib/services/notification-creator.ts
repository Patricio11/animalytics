import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { NOTIFICATION_CONFIGS } from '@/lib/types/notification';
import type { NotificationType, NotificationCategory, NotificationPriority } from '@/lib/types/notification';
import { getMessagesPath, type UserRole } from '@/lib/utils/routing';

// ============================================================================
// NOTIFICATION CREATOR SERVICE
// ============================================================================

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title?: string;
  message?: string;
  actionUrl?: string;
  actionLabel?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  const config = NOTIFICATION_CONFIGS[params.type];

  if (!config) {
    console.error(`Unknown notification type: ${params.type}`);
    return null;
  }

  try {
    const [notification] = await db
      .insert(notifications)
      .values({
        userId: params.userId,
        type: params.type,
        category: config.category,
        priority: config.priority,
        title: params.title || config.defaultTitle,
        message: params.message || config.defaultMessage,
        actionUrl: params.actionUrl,
        actionLabel: params.actionLabel || config.actionLabel,
        relatedEntityType: params.relatedEntityType,
        relatedEntityId: params.relatedEntityId,
        icon: config.icon,
        iconColor: config.iconColor,
        metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
        expiresAt: params.expiresAt,
      })
      .returning();

    console.log(`✅ Notification created: ${notification.id} (${params.type})`);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

// ============================================================================
// PROGESTERONE-SPECIFIC NOTIFICATION CREATORS
// ============================================================================

/**
 * Create progesterone test due notification
 */
export async function createProgesteroneTestDueNotification(params: {
  userId: string;
  bitchName: string;
  day: number;
  heatCycleId: string;
}) {
  return createNotification({
    userId: params.userId,
    type: 'progesterone_test_due',
    title: `Progesterone Test Due - ${params.bitchName}`,
    message: `Day ${params.day} progesterone test is due for ${params.bitchName}`,
    actionUrl: `/calculators/progesterone/${params.heatCycleId}`,
    actionLabel: 'Add Reading',
    relatedEntityType: 'heat_cycle',
    relatedEntityId: params.heatCycleId,
    metadata: {
      bitchName: params.bitchName,
      day: params.day,
    },
  });
}

/**
 * Create daily test required notification
 */
export async function createDailyTestNotification(params: {
  userId: string;
  bitchName: string;
  day: number;
  lastLevel: number;
  heatCycleId: string;
}) {
  return createNotification({
    userId: params.userId,
    type: 'progesterone_daily_test',
    title: `⚡ Daily Test Required - ${params.bitchName}`,
    message: `Day ${params.day}: Last reading was ${params.lastLevel} ng/mL. Daily testing is now required to catch the breeding window.`,
    actionUrl: `/calculators/progesterone/${params.heatCycleId}`,
    actionLabel: 'Add Reading',
    relatedEntityType: 'heat_cycle',
    relatedEntityId: params.heatCycleId,
    metadata: {
      bitchName: params.bitchName,
      day: params.day,
      lastLevel: params.lastLevel,
    },
  });
}

/**
 * Create breeding window open notification
 */
export async function createBreedingWindowNotification(params: {
  userId: string;
  bitchName: string;
  day: number;
  progesteroneLevel: number;
  heatCycleId: string;
  breedingMethod: string;
}) {
  const isOptimal = params.progesteroneLevel >= 15 && params.progesteroneLevel <= 25;
  
  return createNotification({
    userId: params.userId,
    type: 'breeding_window_open',
    title: `🎯 Breeding Window Open - ${params.bitchName}!`,
    message: `Day ${params.day}: Progesterone is ${params.progesteroneLevel} ng/mL. ${isOptimal ? 'Perfect for natural breeding or AI!' : 'Optimal for frozen semen AI!'}`,
    actionUrl: `/calculators/progesterone/${params.heatCycleId}`,
    actionLabel: 'View Details',
    relatedEntityType: 'heat_cycle',
    relatedEntityId: params.heatCycleId,
    metadata: {
      bitchName: params.bitchName,
      day: params.day,
      progesteroneLevel: params.progesteroneLevel,
      breedingMethod: params.breedingMethod,
    },
  });
}

/**
 * Create ovulation detected notification
 */
export async function createOvulationNotification(params: {
  userId: string;
  bitchName: string;
  day: number;
  heatCycleId: string;
}) {
  return createNotification({
    userId: params.userId,
    type: 'ovulation_detected',
    title: `Ovulation Detected - ${params.bitchName}`,
    message: `Ovulation detected on Day ${params.day}. Optimal breeding window is now open.`,
    actionUrl: `/calculators/progesterone/${params.heatCycleId}`,
    actionLabel: 'View Cycle',
    relatedEntityType: 'heat_cycle',
    relatedEntityId: params.heatCycleId,
    metadata: {
      bitchName: params.bitchName,
      day: params.day,
    },
  });
}

/**
 * Create whelping approaching notification
 */
export async function createWhelpingApproachingNotification(params: {
  userId: string;
  bitchName: string;
  whelpingDate: string;
  daysUntil: number;
  litterId: string;
}) {
  return createNotification({
    userId: params.userId,
    type: 'whelping_approaching',
    title: `Whelping Approaching - ${params.bitchName}`,
    message: `Expected whelping date is ${params.whelpingDate} (${params.daysUntil} days away). Prepare whelping area and supplies.`,
    actionUrl: `/litters/${params.litterId}`,
    actionLabel: 'View Litter',
    relatedEntityType: 'litter',
    relatedEntityId: params.litterId,
    metadata: {
      bitchName: params.bitchName,
      whelpingDate: params.whelpingDate,
      daysUntil: params.daysUntil,
    },
  });
}

// ============================================================================
// HEALTH NOTIFICATION CREATORS
// ============================================================================

/**
 * Create vaccination due notification
 */
export async function createVaccinationDueNotification(params: {
  userId: string;
  animalName: string;
  vaccineName: string;
  dueDate: string;
  animalId: string;
}) {
  return createNotification({
    userId: params.userId,
    type: 'vaccination_due',
    title: `Vaccination Due - ${params.animalName}`,
    message: `${params.vaccineName} vaccination is due on ${params.dueDate}`,
    actionUrl: `/animals/${params.animalId}`,
    actionLabel: 'Schedule',
    relatedEntityType: 'animal',
    relatedEntityId: params.animalId,
    metadata: {
      animalName: params.animalName,
      vaccineName: params.vaccineName,
      dueDate: params.dueDate,
    },
  });
}

// ============================================================================
// MESSAGING NOTIFICATION CREATORS
// ============================================================================

/**
 * Create message received notification
 * NOTE: recipientUserRole is the actual user role (breeder/buyer), NOT conversation role (buyer/seller)
 * - Breeders use /messages (can buy AND sell)
 * - Buyers use /buyer/messages (can only buy)
 */
export async function createMessageReceivedNotification(params: {
  userId: string;
  senderName: string;
  messagePreview: string;
  conversationId: string;
  recipientUserRole: UserRole;
}) {
  return createNotification({
    userId: params.userId,
    type: 'message_received',
    title: `New Message from ${params.senderName}`,
    message: params.messagePreview,
    actionUrl: getMessagesPath(params.recipientUserRole),
    actionLabel: 'Read Message',
    relatedEntityType: 'conversation',
    relatedEntityId: params.conversationId,
    metadata: {
      from: params.senderName,
      messageType: 'Direct Message',
    },
  });
}

// ============================================================================
// MARKETPLACE NOTIFICATION CREATORS
// ============================================================================

/**
 * Create inquiry received notification
 */
export async function createInquiryReceivedNotification(params: {
  userId: string;
  listingTitle: string;
  inquirerName: string;
  listingId: string;
}) {
  return createNotification({
    userId: params.userId,
    type: 'inquiry_received',
    title: `New Inquiry - ${params.listingTitle}`,
    message: `${params.inquirerName} has sent you an inquiry about your listing`,
    actionUrl: `/marketplace/${params.listingId}`,
    actionLabel: 'Reply',
    relatedEntityType: 'listing',
    relatedEntityId: params.listingId,
    metadata: {
      listingTitle: params.listingTitle,
      inquirerName: params.inquirerName,
    },
  });
}

// ============================================================================
// SYSTEM NOTIFICATION CREATORS
// ============================================================================

/**
 * Create KYC approved notification
 */
export async function createKYCApprovedNotification(params: {
  userId: string;
  level: number;
}) {
  return createNotification({
    userId: params.userId,
    type: 'kyc_approved',
    title: `KYC Level ${params.level} Approved!`,
    message: `Your verification has been approved. You can now access additional features.`,
    actionUrl: '/verification',
    actionLabel: 'View Status',
    metadata: {
      level: params.level,
    },
  });
}

/**
 * Create system announcement
 */
export async function createSystemAnnouncement(params: {
  userId: string;
  title: string;
  message: string;
  actionUrl?: string;
  priority?: NotificationPriority;
}) {
  return createNotification({
    userId: params.userId,
    type: 'system_announcement',
    title: params.title,
    message: params.message,
    actionUrl: params.actionUrl,
    actionLabel: 'Read More',
  });
}

// ============================================================================
// BULK NOTIFICATION CREATORS
// ============================================================================

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(
  userIds: string[],
  params: Omit<CreateNotificationParams, 'userId'>
) {
  const results = await Promise.allSettled(
    userIds.map(userId => createNotification({ ...params, userId }))
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.length - successful;

  console.log(`✅ Bulk notifications: ${successful} created, ${failed} failed`);

  return { successful, failed };
}

// ============================================================================
// PURCHASE NOTIFICATIONS
// ============================================================================

/**
 * Notify seller when payment is completed
 */
export async function createPaymentCompletedNotification(params: {
  sellerId: string;
  buyerName: string;
  listingTitle: string;
  amount: number;
  currency: string;
  purchaseId: string;
}) {
  return createNotification({
    userId: params.sellerId,
    type: 'system',
    title: '💰 Payment Received!',
    message: `${params.buyerName} has paid ${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: params.currency,
    }).format(params.amount / 100)} for "${params.listingTitle}". Please prepare the item for dispatch.`,
    actionUrl: `/purchases/${params.purchaseId}`,
    actionLabel: 'View Purchase',
    relatedEntityType: 'purchase',
    relatedEntityId: params.purchaseId,
    metadata: {
      purchaseId: params.purchaseId,
      amount: params.amount,
      currency: params.currency,
      buyerName: params.buyerName,
    },
  });
}

/**
 * Notify buyer when seller dispatches item
 */
export async function createItemDispatchedNotification(params: {
  buyerId: string;
  listingTitle: string;
  purchaseId: string;
}) {
  return createNotification({
    userId: params.buyerId,
    type: 'system',
    title: '📦 Item Dispatched!',
    message: `Your purchase "${params.listingTitle}" has been dispatched and is on its way.`,
    actionUrl: `/purchases/${params.purchaseId}`,
    actionLabel: 'Track Purchase',
    relatedEntityType: 'purchase',
    relatedEntityId: params.purchaseId,
    metadata: {
      purchaseId: params.purchaseId,
    },
  });
}

/**
 * Notify seller when buyer confirms receipt
 */
export async function createPurchaseCompletedNotification(params: {
  sellerId: string;
  buyerName: string;
  listingTitle: string;
  purchaseId: string;
}) {
  return createNotification({
    userId: params.sellerId,
    type: 'system',
    title: '✅ Purchase Completed!',
    message: `${params.buyerName} has confirmed receipt of "${params.listingTitle}". Funds will be released from escrow.`,
    actionUrl: `/purchases/${params.purchaseId}`,
    actionLabel: 'View Purchase',
    relatedEntityType: 'purchase',
    relatedEntityId: params.purchaseId,
    metadata: {
      purchaseId: params.purchaseId,
      buyerName: params.buyerName,
    },
  });
}
