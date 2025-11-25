/**
 * Payment Settings Service
 *
 * Retrieves payment configuration from database
 * with caching for performance.
 */

import { db } from '@/lib/db';
import { paymentSettings, paymentProviders } from '@/lib/db/schema/payment-settings';
import { eq } from 'drizzle-orm';
import { PlatformFeeConfig } from './types';

// Cache settings for 5 minutes
let settingsCache: {
  data: typeof paymentSettings.$inferSelect | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0,
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get platform settings with caching
 */
export async function getPaymentSettings() {
  const now = Date.now();

  // Return cached if valid
  if (settingsCache.data && now - settingsCache.timestamp < CACHE_TTL) {
    return settingsCache.data;
  }

  // Fetch from database
  let [settings] = await db.select().from(paymentSettings);

  // Create default if none exist
  if (!settings) {
    [settings] = await db
      .insert(paymentSettings)
      .values({
        standardFeePercent: 500,
        premiumFeePercent: 300,
        minimumFee: 100,
        maximumFee: 50000,
        autoReleaseDays: 7,
        disputeWindowDays: 14,
        minimumWithdrawal: 2500,
        withdrawalProcessingDays: 3,
        defaultCurrency: 'USD',
      })
      .returning();
  }

  // Update cache
  settingsCache = {
    data: settings,
    timestamp: now,
  };

  return settings;
}

/**
 * Get platform fee configuration
 */
export async function getPlatformFeeConfig(): Promise<PlatformFeeConfig> {
  const settings = await getPaymentSettings();

  return {
    standardRate: settings.standardFeePercent / 10000, // Convert from basis points
    premiumRate: settings.premiumFeePercent / 10000,
    minFee: settings.minimumFee,
    maxFee: settings.maximumFee,
  };
}

/**
 * Get escrow configuration
 */
export async function getEscrowConfig() {
  const settings = await getPaymentSettings();

  return {
    autoReleaseDays: settings.autoReleaseDays,
    disputeWindowDays: settings.disputeWindowDays,
  };
}

/**
 * Get withdrawal configuration
 */
export async function getWithdrawalConfig() {
  const settings = await getPaymentSettings();

  return {
    minimumWithdrawal: settings.minimumWithdrawal,
    processingDays: settings.withdrawalProcessingDays,
    defaultCurrency: settings.defaultCurrency,
  };
}

/**
 * Get provider configuration by key
 */
export async function getProviderConfig(providerKey: string) {
  const [provider] = await db
    .select()
    .from(paymentProviders)
    .where(eq(paymentProviders.providerKey, providerKey));

  return provider || null;
}

/**
 * Get all enabled providers
 */
export async function getEnabledProviders() {
  const providers = await db
    .select()
    .from(paymentProviders)
    .where(eq(paymentProviders.isEnabled, true));

  return providers;
}

/**
 * Get the default provider
 */
export async function getDefaultProvider() {
  const [provider] = await db
    .select()
    .from(paymentProviders)
    .where(eq(paymentProviders.isDefault, true));

  return provider || null;
}

/**
 * Clear settings cache (call after updating settings)
 */
export function clearSettingsCache() {
  settingsCache = {
    data: null,
    timestamp: 0,
  };
}

/**
 * Calculate platform fee using database settings
 */
export async function calculatePlatformFeeFromSettings(
  amount: number,
  isPremiumSeller: boolean
): Promise<number> {
  const config = await getPlatformFeeConfig();
  const rate = isPremiumSeller ? config.premiumRate : config.standardRate;
  let fee = Math.round(amount * rate);

  // Apply min/max constraints
  fee = Math.max(fee, config.minFee);
  fee = Math.min(fee, config.maxFee);

  return fee;
}

export const settingsService = {
  getSettings: getPaymentSettings,
  getFeeConfig: getPlatformFeeConfig,
  getEscrowConfig,
  getWithdrawalConfig,
  getProviderConfig,
  getEnabledProviders,
  getDefaultProvider,
  clearCache: clearSettingsCache,
  calculateFee: calculatePlatformFeeFromSettings,
};
