/**
 * Admin Payment Settings API
 * GET - Get global payment settings
 * PUT - Update global payment settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { paymentSettings, paymentSettingsAudit } from '@/lib/db/schema/payment-settings';
import { users } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';

// Helper to check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId));

  return user?.role === 'admin';
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

    // Get settings (or create default if none exist)
    let [settings] = await db.select().from(paymentSettings);

    if (!settings) {
      // Create default settings
      [settings] = await db
        .insert(paymentSettings)
        .values({
          standardFeePercent: 500, // 5%
          premiumFeePercent: 300, // 3%
          minimumFee: 100, // $1.00
          maximumFee: 50000, // $500.00
          autoReleaseDays: 7,
          disputeWindowDays: 14,
          minimumWithdrawal: 2500, // $25.00
          withdrawalProcessingDays: 3,
          defaultCurrency: 'USD',
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      settings: {
        id: settings.id,
        standardFeePercent: settings.standardFeePercent,
        premiumFeePercent: settings.premiumFeePercent,
        minimumFee: settings.minimumFee,
        maximumFee: settings.maximumFee,
        autoReleaseDays: settings.autoReleaseDays,
        disputeWindowDays: settings.disputeWindowDays,
        minimumWithdrawal: settings.minimumWithdrawal,
        withdrawalProcessingDays: settings.withdrawalProcessingDays,
        defaultCurrency: settings.defaultCurrency,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    // Get current settings
    let [currentSettings] = await db.select().from(paymentSettings);

    if (!currentSettings) {
      // Create if doesn't exist
      [currentSettings] = await db
        .insert(paymentSettings)
        .values({})
        .returning();
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updatedBy: session.user.id,
      updatedAt: new Date(),
    };

    // Update fields if provided
    const fields = [
      'standardFeePercent',
      'premiumFeePercent',
      'minimumFee',
      'maximumFee',
      'autoReleaseDays',
      'disputeWindowDays',
      'minimumWithdrawal',
      'withdrawalProcessingDays',
      'defaultCurrency',
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        // Log the change
        const oldValue = currentSettings[field as keyof typeof currentSettings];
        if (oldValue !== body[field]) {
          await db.insert(paymentSettingsAudit).values({
            entityType: 'payment_settings',
            entityId: currentSettings.id,
            action: 'update',
            fieldChanged: field,
            oldValue: String(oldValue),
            newValue: String(body[field]),
            changedBy: session.user.id,
          });
        }
        updateData[field] = body[field];
      }
    }

    // Update settings
    const [updatedSettings] = await db
      .update(paymentSettings)
      .set(updateData)
      .where(eq(paymentSettings.id, currentSettings.id))
      .returning();

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
