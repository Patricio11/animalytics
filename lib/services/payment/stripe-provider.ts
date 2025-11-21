/**
 * Stripe Payment Provider Implementation
 *
 * Handles all Stripe-specific payment operations while conforming
 * to the PaymentProvider interface for seamless provider switching.
 */

import Stripe from 'stripe';
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

// Lazy initialization of Stripe client
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(secretKey);
  }
  return stripeInstance;
}

export class StripeProvider implements PaymentProvider {
  name: 'stripe' = 'stripe';

  isConfigured(): boolean {
    return !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PUBLISHABLE_KEY;
  }

  private get stripe(): Stripe {
    return getStripe();
  }

  async createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntentResult> {
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY.');
    }

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

    const paymentIntent = await this.stripe.paymentIntents.create(intentParams);

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || undefined,
      status: this.mapStripeStatus(paymentIntent.status),
      amount: paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase(),
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentConfirmResult> {
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured.');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

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
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured.');
    }

    try {
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

      const refund = await this.stripe.refunds.create(refundParams);

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
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured.');
    }

    // Check if customer already exists
    const existingCustomers = await this.stripe.customers.list({
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

    const customer = await this.stripe.customers.create(customerParams);

    return {
      id: customer.id,
      email: customer.email || params.email,
      name: customer.name || undefined,
    };
  }

  async getCustomer(customerId: string): Promise<CustomerResult | null> {
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured.');
    }

    try {
      const customer = await this.stripe.customers.retrieve(customerId);

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
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return {
        valid: false,
        error: 'Webhook secret not configured',
      };
    }

    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);

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
  getStripeInstance(): Stripe {
    return this.stripe;
  }
}

// Export singleton instance
export const stripeProvider = new StripeProvider();
