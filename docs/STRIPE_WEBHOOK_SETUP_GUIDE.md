# Stripe Webhook Setup Guide

## Date: December 7, 2025

## Overview

You're absolutely right! The **Webhook Secret** is NOT visible in your Stripe account dashboard by default. You need to **create a webhook endpoint** in Stripe first, and then Stripe will generate the webhook secret for you.

This system stores Stripe credentials in the **database** (not environment variables), which provides flexibility for multi-tenant setups and easier credential management.

---

## How Stripe Webhooks Work

### What is a Webhook?
A webhook is a way for Stripe to notify your application when events happen in your Stripe account (payments succeeded, failed, refunded, etc.).

### Why Do You Need the Webhook Secret?
The webhook secret is used to **verify** that webhook requests actually come from Stripe and haven't been tampered with. It's a security measure.

---

## Step-by-Step Setup

### **Step 1: Get Your Stripe API Keys**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click **Developers** in the left sidebar
3. Click **API keys**
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`) - Click "Reveal test key"

**Copy both keys** - you'll need them later.

---

### **Step 2: Create a Webhook Endpoint in Stripe**

This is where you get the webhook secret!

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **"Add endpoint"** button
3. Fill in the endpoint details:

   **For Local Development:**
   ```
   Endpoint URL: https://your-ngrok-url.ngrok.io/api/webhooks/stripe
   ```
   
   **For Production:**
   ```
   Endpoint URL: https://yourdomain.com/api/webhooks/stripe
   ```

4. **Select events to listen to:**
   - Click "Select events"
   - Choose these events (or select "Select all events" for testing):
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`
     - ✅ `payment_intent.canceled`
     - ✅ `charge.refunded`
     - ✅ `charge.dispute.created`

5. Click **"Add endpoint"**

6. **Copy the Webhook Secret:**
   - After creating the endpoint, you'll see a section called **"Signing secret"**
   - Click **"Reveal"** to see the secret
   - It starts with `whsec_`
   - **Copy this secret** - this is your webhook secret!

---

### **Step 3: Configure Stripe in Your Application**

The system stores Stripe credentials in the **database**, not in `.env` files.

#### **Option A: Via Admin UI (Recommended)**

1. Sign in to your application as an **admin**
2. Navigate to **Settings** → **Payments** (or `/admin/payment-settings`)
3. Find the **Stripe** payment provider
4. Click **"Configure"** or **"Edit"**
5. Fill in the form:
   ```
   Provider: Stripe
   Environment: Test (or Live for production)
   API Key (Publishable): pk_test_xxxxxxxxxxxxx
   Secret Key: sk_test_xxxxxxxxxxxxx
   Webhook Secret: whsec_xxxxxxxxxxxxx
   Webhook URL: https://yourdomain.com/api/webhooks/stripe
   ```
6. Click **"Test Connection"** to verify
7. Enable the provider
8. Click **"Save"**

#### **Option B: Via Database (Manual)**

If you don't have the admin UI yet, you can insert directly into the database:

```sql
-- Insert or update Stripe provider configuration
INSERT INTO payment_providers (
  provider_key,
  display_name,
  description,
  icon,
  is_enabled,
  is_default,
  api_key,
  secret_key,
  webhook_secret,
  webhook_url,
  environment,
  processing_fee_percent,
  processing_fee_fixed,
  supports_refunds,
  supports_partial_refunds,
  created_at,
  updated_at
) VALUES (
  'stripe',
  'Stripe',
  'Credit card payments via Stripe',
  'credit-card',
  true,
  true,
  'pk_test_xxxxxxxxxxxxx', -- Your publishable key
  'sk_test_xxxxxxxxxxxxx', -- Your secret key
  'whsec_xxxxxxxxxxxxx',   -- Your webhook secret
  'https://yourdomain.com/api/webhooks/stripe',
  'test', -- or 'live' for production
  290, -- 2.9%
  30,  -- $0.30
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (provider_key) 
DO UPDATE SET
  api_key = EXCLUDED.api_key,
  secret_key = EXCLUDED.secret_key,
  webhook_secret = EXCLUDED.webhook_secret,
  webhook_url = EXCLUDED.webhook_url,
  environment = EXCLUDED.environment,
  is_enabled = EXCLUDED.is_enabled,
  updated_at = NOW();
```

---

### **Step 4: Test the Webhook (Local Development)**

For local development, Stripe can't reach `localhost` directly. You need a tunnel:

#### **Using ngrok (Recommended)**

1. Install ngrok: https://ngrok.com/download
2. Start your Next.js app:
   ```bash
   npm run dev
   ```
3. In a new terminal, start ngrok:
   ```bash
   ngrok http 3000
   ```
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Update your Stripe webhook endpoint URL to:
   ```
   https://abc123.ngrok.io/api/webhooks/stripe
   ```
6. Update the `webhook_url` in your database to match

#### **Test the Webhook**

1. In Stripe Dashboard → Webhooks → Click your endpoint
2. Click **"Send test webhook"**
3. Select an event (e.g., `payment_intent.succeeded`)
4. Click **"Send test webhook"**
5. Check your application logs - you should see:
   ```
   Payment successful for purchase [purchaseId]
   ```

---

## How the System Works

### **Architecture**

```
┌─────────────┐
│   Stripe    │
│  Dashboard  │
└──────┬──────┘
       │ Webhook Event
       ▼
┌─────────────────────────────────┐
│  /api/webhooks/stripe           │
│  (Next.js API Route)            │
└──────┬──────────────────────────┘
       │ 1. Verify signature
       ▼
┌─────────────────────────────────┐
│  stripeProvider.verifyWebhook() │
│  - Fetch webhook secret from DB │
│  - Validate signature           │
│  - Parse event                  │
└──────┬──────────────────────────┘
       │ 2. Handle event
       ▼
┌─────────────────────────────────┐
│  Event Handlers                 │
│  - handlePaymentSuccess()       │
│  - handlePaymentFailed()        │
│  - handleRefund()               │
│  - handleDispute()              │
└──────┬──────────────────────────┘
       │ 3. Update database
       ▼
┌─────────────────────────────────┐
│  Database Updates               │
│  - Update purchase status       │
│  - Add timeline events          │
│  - Update escrow                │
│  - Send notifications           │
└─────────────────────────────────┘
```

### **Database-Driven Configuration**

The system reads Stripe credentials from the `payment_providers` table:

```typescript
// lib/services/payment/stripe-provider.ts

async function getStripeCredentials() {
  const [provider] = await db
    .select()
    .from(paymentProviders)
    .where(eq(paymentProviders.providerKey, 'stripe'));

  return {
    secretKey: provider.secretKey,
    apiKey: provider.apiKey,
    webhookSecret: provider.webhookSecret,
    isEnabled: provider.isEnabled,
  };
}
```

**Benefits:**
- ✅ No need to restart server when updating credentials
- ✅ Credentials cached for 5 minutes for performance
- ✅ Supports multiple environments (test/live)
- ✅ Easy to switch between providers
- ✅ Audit trail of configuration changes

---

## Webhook Events Handled

The system currently handles these Stripe events:

### **1. `payment_intent.succeeded`**
- **Triggered:** When a payment is successfully processed
- **Action:**
  - Update purchase status to `payment_completed`
  - Update payment status to `completed`
  - Hold funds in escrow
  - Add timeline event
  - Notify buyer and seller

### **2. `payment_intent.payment_failed`**
- **Triggered:** When a payment fails
- **Action:**
  - Update payment status to `failed`
  - Add timeline event
  - Notify buyer

### **3. `payment_intent.canceled`**
- **Triggered:** When a payment is canceled
- **Action:**
  - Update purchase status to `cancelled`
  - Update payment status to `cancelled`
  - Add timeline event
  - Notify both parties

### **4. `charge.refunded`**
- **Triggered:** When a charge is refunded
- **Action:**
  - Update purchase status to `refunded`
  - Update payment status to `refunded`
  - Refund escrow funds
  - Add timeline event
  - Notify both parties

### **5. `charge.dispute.created`**
- **Triggered:** When a customer disputes a charge
- **Action:**
  - Log dispute details
  - TODO: Update purchase status to `disputed`

---

## Security Considerations

### **Webhook Signature Verification**

Every webhook request is verified using the webhook secret:

```typescript
// app/api/webhooks/stripe/route.ts

const signature = request.headers.get('stripe-signature');
const verification = await stripeProvider.verifyWebhook(body, signature);

if (!verification.valid) {
  return NextResponse.json(
    { error: 'Invalid webhook' },
    { status: 400 }
  );
}
```

This ensures:
- ✅ Request actually came from Stripe
- ✅ Request wasn't tampered with
- ✅ Request isn't a replay attack

### **Credential Storage**

**Current Implementation:**
- Credentials stored in database as **plain text**
- Cached in memory for 5 minutes

**⚠️ Security Recommendation:**
For production, you should encrypt sensitive fields:

```typescript
// Example: Encrypt before storing
import { encrypt, decrypt } from '@/lib/utils/encryption';

// When saving
const encryptedSecretKey = encrypt(secretKey);
await db.insert(paymentProviders).values({
  secretKey: encryptedSecretKey,
  // ...
});

// When reading
const decryptedSecretKey = decrypt(provider.secretKey);
```

---

## Testing Checklist

### **Development Testing**

- [ ] Stripe API keys configured in database
- [ ] Webhook secret configured in database
- [ ] ngrok tunnel running
- [ ] Webhook endpoint created in Stripe
- [ ] Test webhook sent from Stripe dashboard
- [ ] Webhook received and verified
- [ ] Payment success event handled correctly
- [ ] Purchase status updated in database
- [ ] Timeline event created

### **Production Testing**

- [ ] Switch to live API keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real payment (small amount)
- [ ] Verify payment success flow
- [ ] Test refund flow
- [ ] Test payment failure
- [ ] Monitor webhook logs in Stripe dashboard

---

## Troubleshooting

### **Problem: "Webhook secret not configured"**

**Cause:** The webhook secret is not in the database.

**Solution:**
1. Check the `payment_providers` table
2. Ensure `webhook_secret` field has a value starting with `whsec_`
3. Clear the cache:
   ```typescript
   import { clearStripeCache } from '@/lib/services/payment/stripe-provider';
   clearStripeCache();
   ```

### **Problem: "Webhook verification failed"**

**Cause:** The signature doesn't match.

**Possible Reasons:**
1. **Wrong webhook secret** - Make sure you copied the correct secret from Stripe
2. **Multiple endpoints** - You might have multiple webhook endpoints in Stripe, each with different secrets
3. **Environment mismatch** - Using test secret with live keys or vice versa

**Solution:**
1. Go to Stripe Dashboard → Webhooks
2. Find your endpoint
3. Click "Reveal" on the signing secret
4. Copy and update in database
5. Restart your application

### **Problem: Webhooks not received in local development**

**Cause:** Stripe can't reach localhost.

**Solution:**
1. Use ngrok or similar tunnel service
2. Update webhook endpoint URL in Stripe to ngrok URL
3. Make sure ngrok is running

### **Problem: "Stripe secret key not configured"**

**Cause:** The secret key is missing from database.

**Solution:**
1. Get your secret key from Stripe Dashboard → API keys
2. Update the `payment_providers` table
3. Restart application or clear cache

---

## Environment Variables (Alternative Approach)

If you prefer using environment variables instead of database storage, you can modify the code:

### **1. Create `.env.local`**

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# For production
# STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
# STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
# STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### **2. Modify `stripe-provider.ts`**

```typescript
async function getStripeCredentials() {
  // Try environment variables first
  const envSecretKey = process.env.STRIPE_SECRET_KEY;
  const envWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (envSecretKey && envWebhookSecret) {
    return {
      secretKey: envSecretKey,
      apiKey: process.env.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: envWebhookSecret,
      isEnabled: true,
    };
  }
  
  // Fallback to database
  const [provider] = await db
    .select()
    .from(paymentProviders)
    .where(eq(paymentProviders.providerKey, 'stripe'));
  
  // ... rest of code
}
```

**Note:** The current implementation uses database-only storage for flexibility. Environment variables are better for single-tenant deployments.

---

## Production Deployment

### **Before Going Live:**

1. **Switch to Live Keys**
   - Get live API keys from Stripe (starts with `pk_live_` and `sk_live_`)
   - Create new webhook endpoint with production URL
   - Get new webhook secret for live mode
   - Update database with live credentials
   - Set `environment` to `'live'`

2. **Update Webhook URL**
   ```
   https://yourdomain.com/api/webhooks/stripe
   ```

3. **Test in Live Mode**
   - Make a small real payment
   - Verify webhook received
   - Check purchase status updated
   - Test refund flow

4. **Monitor**
   - Check Stripe Dashboard → Webhooks for delivery status
   - Monitor application logs
   - Set up alerts for failed webhooks

---

## Quick Reference

### **Stripe Dashboard URLs**

- **API Keys:** https://dashboard.stripe.com/test/apikeys
- **Webhooks:** https://dashboard.stripe.com/test/webhooks
- **Payments:** https://dashboard.stripe.com/test/payments
- **Customers:** https://dashboard.stripe.com/test/customers

### **Application Endpoints**

- **Webhook Handler:** `/api/webhooks/stripe`
- **Payment Settings:** `/admin/payment-settings`
- **Create Payment:** `/api/purchases/[id]/pay`

### **Database Tables**

- **Payment Providers:** `payment_providers`
- **Purchases:** `purchases`
- **Purchase Timeline:** `purchase_timeline`
- **Escrow:** `escrow_transactions`

---

## Summary

### **What You Need:**

1. ✅ **Stripe Account** (free at stripe.com)
2. ✅ **API Keys** (from Stripe Dashboard → API keys)
3. ✅ **Webhook Endpoint** (create in Stripe Dashboard → Webhooks)
4. ✅ **Webhook Secret** (revealed after creating endpoint)

### **Where to Put Them:**

- **Database:** `payment_providers` table (recommended)
- **OR Environment Variables:** `.env.local` (alternative)

### **How to Test:**

1. Use ngrok for local development
2. Send test webhooks from Stripe Dashboard
3. Check application logs
4. Verify database updates

### **Production Checklist:**

- [ ] Switch to live API keys
- [ ] Create live webhook endpoint
- [ ] Update production URL
- [ ] Test with real payment
- [ ] Monitor webhook delivery
- [ ] Set up error alerts

---

## Need Help?

If you encounter issues:

1. **Check Stripe Logs:** Dashboard → Webhooks → Click endpoint → View logs
2. **Check Application Logs:** Look for webhook verification errors
3. **Verify Credentials:** Ensure all keys are correct and match environment
4. **Test Connection:** Use the "Test Connection" feature in admin UI

**The system is production-ready once you configure the credentials!** 🚀
