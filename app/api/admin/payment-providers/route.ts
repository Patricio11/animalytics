/**
 * Admin Payment Providers API
 * GET - List all payment providers
 * POST - Create or seed default providers
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { paymentProviders, paymentSettingsAudit } from '@/lib/db/schema/payment-settings';
import { users } from '@/lib/db/schema/users';
import { eq, asc } from 'drizzle-orm';

// Default providers to seed
const defaultProviders = [
  {
    providerKey: 'stripe',
    displayName: 'Stripe',
    description: 'Accept credit cards, debit cards, and more',
    icon: 'credit-card',
    isEnabled: false,
    isDefault: true,
    environment: 'test',
    processingFeePercent: 290, // 2.9%
    processingFeeFixed: 30, // $0.30
    supportsRefunds: true,
    supportsPartialRefunds: true,
    supportsRecurring: true,
    sortOrder: 1,
  },
  {
    providerKey: 'paypal',
    displayName: 'PayPal',
    description: 'Pay with PayPal balance or linked accounts',
    icon: 'wallet',
    isEnabled: false,
    isDefault: false,
    environment: 'test',
    processingFeePercent: 349, // 3.49%
    processingFeeFixed: 49, // $0.49
    supportsRefunds: true,
    supportsPartialRefunds: true,
    supportsRecurring: false,
    sortOrder: 2,
  },
  {
    providerKey: 'bank_transfer',
    displayName: 'Bank Transfer',
    description: 'Direct bank transfer (manual verification)',
    icon: 'building',
    isEnabled: false,
    isDefault: false,
    environment: 'live',
    processingFeePercent: 0,
    processingFeeFixed: 0,
    supportsRefunds: false,
    supportsPartialRefunds: false,
    supportsRecurring: false,
    sortOrder: 3,
  },
];

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

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all providers
    const providers = await db
      .select()
      .from(paymentProviders)
      .orderBy(asc(paymentProviders.sortOrder));

    // If no providers exist, seed defaults
    if (providers.length === 0) {
      for (const provider of defaultProviders) {
        await db.insert(paymentProviders).values(provider);
      }

      // Fetch again
      const seededProviders = await db
        .select()
        .from(paymentProviders)
        .orderBy(asc(paymentProviders.sortOrder));

      return NextResponse.json({
        success: true,
        providers: seededProviders.map((p) => ({
          ...p,
          apiKey: maskSecret(p.apiKey),
          secretKey: maskSecret(p.secretKey),
          webhookSecret: maskSecret(p.webhookSecret),
        })),
      });
    }

    return NextResponse.json({
      success: true,
      providers: providers.map((p) => ({
        ...p,
        apiKey: maskSecret(p.apiKey),
        secretKey: maskSecret(p.secretKey),
        webhookSecret: maskSecret(p.webhookSecret),
      })),
    });
  } catch (error) {
    console.error('Error fetching payment providers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();

    // Check if provider key already exists
    const [existing] = await db
      .select()
      .from(paymentProviders)
      .where(eq(paymentProviders.providerKey, body.providerKey));

    if (existing) {
      return NextResponse.json(
        { error: 'Provider with this key already exists' },
        { status: 400 }
      );
    }

    // Create provider
    const [provider] = await db
      .insert(paymentProviders)
      .values({
        providerKey: body.providerKey,
        displayName: body.displayName,
        description: body.description,
        icon: body.icon,
        isEnabled: body.isEnabled || false,
        isDefault: body.isDefault || false,
        apiKey: body.apiKey,
        secretKey: body.secretKey,
        webhookSecret: body.webhookSecret,
        webhookUrl: body.webhookUrl,
        environment: body.environment || 'test',
        settings: body.settings || {},
        processingFeePercent: body.processingFeePercent || 0,
        processingFeeFixed: body.processingFeeFixed || 0,
        supportsRefunds: body.supportsRefunds ?? true,
        supportsPartialRefunds: body.supportsPartialRefunds ?? true,
        supportsRecurring: body.supportsRecurring ?? false,
        sortOrder: body.sortOrder || 0,
        updatedBy: session.user.id,
      })
      .returning();

    // Log creation
    await db.insert(paymentSettingsAudit).values({
      entityType: 'payment_providers',
      entityId: provider.id,
      action: 'create',
      changedBy: session.user.id,
    });

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
    console.error('Error creating payment provider:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
