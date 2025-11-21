/**
 * Payment Services Module
 *
 * Central export point for all payment-related functionality.
 * Includes provider factory, types, and utility functions.
 */

import { PaymentProvider, PaymentProviderType } from './types';
import { stripeProvider } from './stripe-provider';

// Re-export types
export * from './types';

// Re-export providers
export { stripeProvider } from './stripe-provider';

/**
 * Payment Provider Factory
 *
 * Returns the appropriate payment provider based on the type.
 * Add new providers here as they are implemented.
 */
export function getPaymentProvider(type: PaymentProviderType): PaymentProvider {
  switch (type) {
    case 'stripe':
      return stripeProvider;

    case 'paypal':
      // TODO: Implement PayPal provider
      throw new Error('PayPal provider not yet implemented');

    case 'bank_transfer':
      // TODO: Implement bank transfer provider
      throw new Error('Bank transfer provider not yet implemented');

    case 'wise':
      // TODO: Implement Wise provider
      throw new Error('Wise provider not yet implemented');

    default:
      throw new Error(`Unknown payment provider: ${type}`);
  }
}

/**
 * Get the default payment provider
 */
export function getDefaultProvider(): PaymentProvider {
  return stripeProvider;
}

/**
 * Check if a payment provider is available and configured
 */
export function isProviderAvailable(type: PaymentProviderType): boolean {
  try {
    const provider = getPaymentProvider(type);
    return provider.isConfigured();
  } catch {
    return false;
  }
}

/**
 * Get all available (configured) payment providers
 */
export function getAvailableProviders(): PaymentProviderType[] {
  const providers: PaymentProviderType[] = ['stripe', 'paypal', 'bank_transfer', 'wise'];

  return providers.filter((type) => {
    try {
      return isProviderAvailable(type);
    } catch {
      return false;
    }
  });
}

/**
 * Format currency amount from cents to display string
 */
export function formatCurrency(amountInCents: number, currency: string = 'USD'): string {
  const amount = amountInCents / 100;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Convert amount from dollars to cents
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert amount from cents to dollars
 */
export function toDollars(cents: number): number {
  return cents / 100;
}
