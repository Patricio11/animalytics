/**
 * Stripe Payment Provider Implementation
 *
 * Handles all Stripe-specific payment operations while conforming
 * to the PaymentProvider interface for seamless provider switching.
 *
 * IMPORTANT: This provider reads credentials from the database,
 * not from environment variables. Configure in Settings > Payments.
 */

import Stripe from 'stripe';
import { db } from '@/lib/db';
import { paymentProviders } from '@/lib/db/schema/payment-settings';
import { eq } from 'drizzle-orm';
import {
  PaymentProvider,
  PaymentIntentParams,
  PaymentIntentResult,
  PaymentConfirmResult,
  RefundParams,
  RefundResult,
  CustomerParams,
  CustomerResult,
  WebhookVerificationResult,
} from './types';

// Cache for Stripe instance and credentials
let stripeCache: {
  instance: Stripe | null;
  secretKey: string | null;
  webhookSecret: string | null;
  timestamp: number;
} = {
  instance: null,
  secretKey: null,
  webhookSecret: null,
  timestamp: 0,
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get Stripe credentials from database
 */
async function getStripeCredentials(): Promise<{
  secretKey: string | null;
  apiKey: string | null;
  webhookSecret: string | null;
  isEnabled: boolean;
}> {
  const [provider] = await db
    .select()
    .from(paymentProviders)
    .where(eq(paymentProviders.providerKey, 'stripe'));

  if (!provider) {
    return {
      secretKey: null,
      apiKey: null,
      webhookSecret: null,
      isEnabled: false,
    };
  }

  return {
    secretKey: provider.secretKey,
    apiKey: provider.apiKey,
    webhookSecret: provider.webhookSecret,
    isEnabled: provider.isEnabled,
  };
}

/**
 * Get or create Stripe instance with database credentials
 */
async function getStripe(): Promise<Stripe> {
  const now = Date.now();

  // Check if we need to refresh credentials
  if (stripeCache.instance && now - stripeCache.timestamp < CACHE_TTL) {
    return stripeCache.instance;
  }

  // Fetch credentials from database
  const credentials = await getStripeCredentials();

  if (!credentials.secretKey) {
    throw new Error('Stripe secret key not configured. Go to Settings > Payments to configure.');
  }

  // Create new instance
  stripeCache = {
    instance: new Stripe(credentials.secretKey),
    secretKey: credentials.secretKey,
    webhookSecret: credentials.webhookSecret,
    timestamp: now,
  };

  return stripeCache.instance;
}

/**
 * Get webhook secret from cache or database
 */
async function getWebhookSecret(): Promise<string | null> {
  const now = Date.now();

  // Return cached if valid
  if (stripeCache.webhookSecret && now - stripeCache.timestamp < CACHE_TTL) {
    return stripeCache.webhookSecret;
  }

  // Fetch from database
  const credentials = await getStripeCredentials();
  stripeCache.webhookSecret = credentials.webhookSecret;
  stripeCache.timestamp = now;

  return credentials.webhookSecret;
}

/**
 * Clear the Stripe cache (call after updating credentials)
 */
export function clearStripeCache(): void {
  stripeCache = {
    instance: null,
    secretKey: null,
    webhookSecret: null,
    timestamp: 0,
  };
}

export class StripeProvider implements PaymentProvider {
  name: 'stripe' = 'stripe';

  /**
   * Check if Stripe is configured in the database
   */
  async isConfiguredAsync(): Promise<boolean> {
    const credentials = await getStripeCredentials();
    return credentials.isEnabled && !!credentials.secretKey;
  }

  /**
   * Synchronous check - uses cached value or returns false
   * For async operations, use isConfiguredAsync()
   */
  isConfigured(): boolean {
    // Check cache first
    if (stripeCache.secretKey) {
      return true;
    }
    // Fallback to env vars for backward compatibility during migration
    return !!process.env.STRIPE_SECRET_KEY;
  }

  private async getStripeClient(): Promise<Stripe> {
    return getStripe();
  }

  async createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntentResult> {
    const stripe = await this.getStripeClient();

    const intentParams: Stripe.PaymentIntentCreateParams = {
      amount: params.amount,
      currency: params.currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: params.metadata || {},
    };

    // Add customer if provided
    if (params.customerId) {
      intentParams.customer = params.customerId;
    }

    // Add receipt email if customer email provided
    if (params.customerEmail) {
      intentParams.receipt_email = params.customerEmail;
    }

    // Add description if provided
    if (params.description) {
      intentParams.description = params.description;
    }

    const paymentIntent = await stripe.paymentIntents.create(intentParams);

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || undefined,
      status: this.mapStripeStatus(paymentIntent.status),
      amount: paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase(),
    };
  }

  async createCheckoutSession(params: {
    amount: number;
    currency: string;
    customerEmail: string;
    description?: string;
    metadata?: Record<string, string>;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ id: string; url: string | null }> {
    const stripe = await this.getStripeClient();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: params.currency.toLowerCase(),
            product_data: {
              name: params.description || 'Purchase',
            },
            unit_amount: params.amount,
          },
          quantity: 1,
        },
      ],
      customer_email: params.customerEmail,
      metadata: params.metadata || {},
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });

    return {
      id: session.id,
      url: session.url,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentConfirmResult> {
    try {
      const stripe = await this.getStripeClient();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: paymentIntent.status === 'succeeded',
        status: paymentIntent.status,
        transactionId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency.toUpperCase(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        status: 'failed',
        transactionId: paymentIntentId,
        amount: 0,
        currency: 'USD',
        error: errorMessage,
      };
    }
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    try {
      const stripe = await this.getStripeClient();

      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: params.paymentIntentId,
      };

      // Partial refund if amount specified
      if (params.amount) {
        refundParams.amount = params.amount;
      }

      // Add reason if provided
      if (params.reason) {
        refundParams.reason = 'requested_by_customer';
        refundParams.metadata = { reason: params.reason };
      }

      const refund = await stripe.refunds.create(refundParams);

      return {
        success: refund.status === 'succeeded',
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status || 'unknown',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        refundId: '',
        amount: 0,
        status: 'failed',
        error: errorMessage,
      };
    }
  }

  async createCustomer(params: CustomerParams): Promise<CustomerResult> {
    const stripe = await this.getStripeClient();

    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email: params.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      const existing = existingCustomers.data[0];
      return {
        id: existing.id,
        email: existing.email || params.email,
        name: existing.name || undefined,
      };
    }

    // Create new customer
    const customerParams: Stripe.CustomerCreateParams = {
      email: params.email,
      metadata: params.metadata || {},
    };

    if (params.name) {
      customerParams.name = params.name;
    }

    if (params.phone) {
      customerParams.phone = params.phone;
    }

    const customer = await stripe.customers.create(customerParams);

    return {
      id: customer.id,
      email: customer.email || params.email,
      name: customer.name || undefined,
    };
  }

  async getCustomer(customerId: string): Promise<CustomerResult | null> {
    try {
      const stripe = await this.getStripeClient();
      const customer = await stripe.customers.retrieve(customerId);

      if (customer.deleted) {
        return null;
      }

      return {
        id: customer.id,
        email: customer.email || '',
        name: customer.name || undefined,
      };
    } catch {
      return null;
    }
  }

  async verifyWebhook(payload: string, signature: string): Promise<WebhookVerificationResult> {
    const webhookSecret = await getWebhookSecret();

    if (!webhookSecret) {
      return {
        valid: false,
        error: 'Webhook secret not configured. Go to Settings > Payments to configure.',
      };
    }

    try {
      const stripe = await this.getStripeClient();
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

      return {
        valid: true,
        event: {
          id: event.id,
          type: event.type,
          data: {
            object: event.data.object as unknown as Record<string, unknown>,
          },
          created: event.created,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        valid: false,
        error: `Webhook verification failed: ${errorMessage}`,
      };
    }
  }

  /**
   * Map Stripe payment intent status to our standardized status
   */
  private mapStripeStatus(
    stripeStatus: Stripe.PaymentIntent.Status
  ): PaymentIntentResult['status'] {
    const statusMap: Record<Stripe.PaymentIntent.Status, PaymentIntentResult['status']> = {
      requires_payment_method: 'requires_payment_method',
      requires_confirmation: 'requires_confirmation',
      requires_action: 'requires_action',
      processing: 'processing',
      succeeded: 'succeeded',
      canceled: 'canceled',
      requires_capture: 'requires_action',
    };

    return statusMap[stripeStatus] || 'requires_payment_method';
  }

  /**
   * Get the Stripe instance for advanced operations
   * (Use sparingly - prefer interface methods)
   */
  async getStripeInstance(): Promise<Stripe> {
    return this.getStripeClient();
  }
}

// Export singleton instance
export const stripeProvider = new StripeProvider();
