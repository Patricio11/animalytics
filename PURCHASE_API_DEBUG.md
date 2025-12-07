# Purchase API Debug Guide

## Error Details

**Error Message:**
```
POST https://animalytics.co/api/purchases 400 (Bad Request)
Error: Payment method is required
```

**Issue:** The API is receiving the request but claims `paymentMethod` is missing, even though the frontend is sending it.

---

## Debugging Steps

### **Step 1: Check Console Logs**

With the debug logging I just added, you should now see:

**Frontend (Browser Console):**
```
🚀 Sending purchase request: {
  listingId: "...",
  animalId: "...",
  paymentMethod: "stripe",
  deliveryMethod: "pickup",
  buyerNotes: "..."
}
```

**Backend (Server Terminal):**
```
📦 Purchase request body: {
  "listingId": "...",
  "animalId": "...",
  "paymentMethod": "stripe",
  "deliveryMethod": "pickup",
  "buyerNotes": "..."
}

🔍 Extracted fields: {
  listingId: "...",
  paymentMethod: "stripe",
  deliveryMethod: "pickup",
  buyerNotes: "..."
}
```

**OR if paymentMethod is missing:**
```
❌ Missing paymentMethod, body was: { ... }
```

---

### **Step 2: Possible Causes**

#### **Cause 1: Middleware Stripping Body**
Some middleware might be consuming the request body before it reaches the API route.

**Check:** `middleware.ts` file

#### **Cause 2: Next.js Body Parser Config**
Next.js might have body size limits or parsing issues.

**Check:** `next.config.ts` or `next.config.js`

#### **Cause 3: Production vs Development**
The error shows `https://animalytics.co` (production). There might be:
- Reverse proxy (Nginx, Cloudflare) stripping headers
- CDN caching POST requests (shouldn't happen but possible)
- Different Next.js version in production

#### **Cause 4: Request Body Size**
If `buyerNotes` is very long, it might exceed limits.

**Check:** Network tab → Request payload size

---

### **Step 3: Immediate Fix Options**

#### **Option A: Make paymentMethod Optional with Default**

Since we're defaulting to Stripe anyway, we can make it optional in the API:

```typescript
// app/api/purchases/route.ts

const {
  listingId,
  paymentMethod = 'stripe', // Default to stripe if not provided
  deliveryMethod,
  // ... rest
} = body;

// Remove the paymentMethod validation
// if (!paymentMethod) { ... }  // DELETE THIS

// Or make it optional
if (!paymentMethod) {
  console.warn('⚠️ No paymentMethod provided, defaulting to stripe');
  paymentMethod = 'stripe';
}
```

#### **Option B: Check for Middleware Issues**

Look for `middleware.ts` in your project root:

```typescript
// middleware.ts - if it exists

export function middleware(request: NextRequest) {
  // Check if anything is modifying the request
  console.log('Middleware processing:', request.url);
  
  // Make sure you're not consuming the body here
  // DON'T do: await request.json()
  
  return NextResponse.next();
}
```

#### **Option C: Add Body Size Config**

In `next.config.ts`:

```typescript
const nextConfig = {
  // ... existing config
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
```

---

### **Step 4: Test in Development First**

Before deploying to production, test locally:

```bash
npm run dev
```

Then try the purchase flow. Check:
1. Browser console for the `🚀 Sending purchase request` log
2. Server terminal for the `📦 Purchase request body` log
3. If both show `paymentMethod: "stripe"`, the issue is production-specific

---

## Quick Fix (Recommended)

Since you're always using Stripe as the default payment method, let's make the API more resilient:

```typescript
// app/api/purchases/route.ts - Line ~170

const {
  listingId,
  paymentMethod,
  deliveryMethod,
  deliveryAddress,
  deliveryCity,
  deliveryState,
  deliveryPostalCode,
  deliveryCountry,
  deliveryNotes,
  scheduledDate,
  scheduledTime,
  buyerNotes,
} = body;

// Default to stripe if not provided
const finalPaymentMethod = paymentMethod || 'stripe';

console.log('🔍 Extracted fields:', {
  listingId,
  paymentMethod: finalPaymentMethod,
  deliveryMethod,
  buyerNotes,
});

// Validate required fields
if (!listingId) {
  console.error('❌ Missing listingId');
  return NextResponse.json(
    { error: 'Listing ID is required' },
    { status: 400 }
  );
}

// Remove or modify paymentMethod validation
// Since we're defaulting to stripe, we don't need to validate it

if (!deliveryMethod) {
  return NextResponse.json(
    { error: 'Delivery method is required' },
    { status: 400 }
  );
}

// ... rest of the code, use finalPaymentMethod instead of paymentMethod
```

---

## Production-Specific Checks

If the issue only happens in production:

### **1. Check Vercel/Deployment Logs**

If deployed on Vercel:
```bash
vercel logs
```

Look for the `📦 Purchase request body` log to see what's actually received.

### **2. Check Environment Variables**

Make sure production has all required env vars:
```env
DATABASE_URL=...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://animalytics.co
NEXT_PUBLIC_APP_URL=https://animalytics.co
```

### **3. Check Reverse Proxy Config**

If using Nginx or similar:

```nginx
# nginx.conf

location /api/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    
    # Important: Don't buffer request body
    proxy_request_buffering off;
    client_max_body_size 10M;
}
```

### **4. Check Cloudflare Settings**

If using Cloudflare:
- Go to Rules → Page Rules
- Make sure `/api/*` is NOT cached
- Check if there's a WAF rule blocking POST requests

---

## Testing Checklist

- [ ] Check browser console for `🚀 Sending purchase request` log
- [ ] Check server logs for `📦 Purchase request body` log
- [ ] Verify `paymentMethod: "stripe"` is in both logs
- [ ] Test in development environment
- [ ] Test in production environment
- [ ] Check if other POST requests work (e.g., messaging)
- [ ] Check network tab for request payload
- [ ] Check response headers for any errors

---

## Next Steps

1. **Try the purchase again** and check the new console logs
2. **Copy the logs** from both browser and server
3. **Share the logs** so I can see exactly what's being sent/received
4. **Apply the quick fix** (default paymentMethod to 'stripe')

The debug logs will tell us exactly where the data is getting lost!
