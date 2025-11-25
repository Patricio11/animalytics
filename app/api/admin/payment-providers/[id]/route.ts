/**
 * Admin Payment Provider Detail API
 * GET - Get provider details
 * PUT - Update provider
 * DELETE - Delete provider
 * POST - Test provider connection
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { paymentProviders, paymentSettingsAudit } from '@/lib/db/schema/payment-settings';
import { users } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';
import { clearStripeCache } from '@/lib/services/payment/stripe-provider';
import { settingsService } from '@/lib/services/payment';

// Helper to check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId));

  return user?.role === 'admin';
}

// Helper to mask sensitive data
function maskSecret(value: string | null): string | null {
  if (!value) return null;
  if (value.length <= 8) return '****';
  return value.substring(0, 4) + '****' + value.substring(value.length - 4);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    const [provider] = await db
      .select()
      .from(paymentProviders)
      .where(eq(paymentProviders.id, id));

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      provider: {
        ...provider,
        apiKey: maskSecret(provider.apiKey),
        secretKey: maskSecret(provider.secretKey),
        webhookSecret: maskSecret(provider.webhookSecret),
      },
    });
  } catch (error) {
    console.error('Error fetching provider:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Get current provider
    const [currentProvider] = await db
      .select()
      .from(paymentProviders)
      .where(eq(paymentProviders.id, id));

    if (!currentProvider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updatedBy: session.user.id,
      updatedAt: new Date(),
    };

    // Fields that can be updated
    const fields = [
      'displayName',
      'description',
      'icon',
      'isEnabled',
      'isDefault',
      'apiKey',
      'secretKey',
      'webhookSecret',
      'webhookUrl',
      'environment',
      'settings',
      'processingFeePercent',
      'processingFeeFixed',
      'supportsRefunds',
      'supportsPartialRefunds',
      'supportsRecurring',
      'sortOrder',
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        const oldValue = currentProvider[field as keyof typeof currentProvider];

        // Don't log if value hasn't changed
        if (oldValue !== body[field]) {
          // Don't log actual secret values
          const isSensitive = ['apiKey', 'secretKey', 'webhookSecret'].includes(field);

          await db.insert(paymentSettingsAudit).values({
            entityType: 'payment_providers',
            entityId: id,
            action: 'update',
            fieldChanged: field,
            oldValue: isSensitive ? '****' : String(oldValue ?? ''),
            newValue: isSensitive ? '****' : String(body[field]),
            changedBy: session.user.id,
          });
        }

        updateData[field] = body[field];
      }
    }

    // If setting as default, unset other defaults
    if (body.isDefault === true) {
      await db
        .update(paymentProviders)
        .set({ isDefault: false })
        .where(eq(paymentProviders.isDefault, true));
    }

    // Update provider
    const [updatedProvider] = await db
      .update(paymentProviders)
      .set(updateData)
      .where(eq(paymentProviders.id, id))
      .returning();

    // Clear caches so new credentials are used immediately
    if (currentProvider.providerKey === 'stripe') {
      clearStripeCache();
    }
    settingsService.clearCache();

    return NextResponse.json({
      success: true,
      provider: {
        ...updatedProvider,
        apiKey: maskSecret(updatedProvider.apiKey),
        secretKey: maskSecret(updatedProvider.secretKey),
        webhookSecret: maskSecret(updatedProvider.webhookSecret),
      },
    });
  } catch (error) {
    console.error('Error updating provider:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    // Get provider before deleting
    const [provider] = await db
      .select()
      .from(paymentProviders)
      .where(eq(paymentProviders.id, id));

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Log deletion
    await db.insert(paymentSettingsAudit).values({
      entityType: 'payment_providers',
      entityId: id,
      action: 'delete',
      changedBy: session.user.id,
    });

    // Delete provider
    await db.delete(paymentProviders).where(eq(paymentProviders.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting provider:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST - Test provider connection
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    // Get provider
    const [provider] = await db
      .select()
      .from(paymentProviders)
      .where(eq(paymentProviders.id, id));

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    let testSuccess = false;
    let testError: string | null = null;

    // Test connection based on provider type
    try {
      switch (provider.providerKey) {
        case 'stripe':
          if (!provider.secretKey) {
            throw new Error('Secret key not configured');
          }
          // Test Stripe connection by listing 1 customer
          const Stripe = (await import('stripe')).default;
          const stripe = new Stripe(provider.secretKey);
          await stripe.customers.list({ limit: 1 });
          testSuccess = true;
          break;

        case 'paypal':
          // PayPal test would go here
          testError = 'PayPal connection test not implemented';
          break;

        case 'bank_transfer':
          // Bank transfer doesn't need connection test
          testSuccess = true;
          break;

        default:
          testError = `Unknown provider type: ${provider.providerKey}`;
      }
    } catch (err) {
      testError = err instanceof Error ? err.message : 'Connection test failed';
    }

    // Update provider with test results
    await db
      .update(paymentProviders)
      .set({
        lastTestedAt: new Date(),
        lastTestSuccess: testSuccess,
        lastTestError: testError,
        updatedAt: new Date(),
      })
      .where(eq(paymentProviders.id, id));

    // Log the test
    await db.insert(paymentSettingsAudit).values({
      entityType: 'payment_providers',
      entityId: id,
      action: 'test_connection',
      newValue: testSuccess ? 'success' : testError || 'failed',
      changedBy: session.user.id,
    });

    return NextResponse.json({
      success: testSuccess,
      error: testError,
      testedAt: new Date(),
    });
  } catch (error) {
    console.error('Error testing provider:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
