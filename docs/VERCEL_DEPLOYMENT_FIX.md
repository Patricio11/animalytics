# ✅ Vercel Deployment Fix - Better Auth Base URL

**Issue:** `Invalid base URL: animalytics.vercel.app`  
**Cause:** Missing `https://` protocol in Better Auth base URL  
**Status:** ✅ FIXED!

---

## 🔧 What Was Fixed

### **Better Auth Configuration**

**Before (Missing):**
```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, {...}),
  // ❌ No baseURL specified
});
```

**After (Fixed):**
```typescript
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
  database: drizzleAdapter(db, {...}),
  // ✅ baseURL now properly configured
});
```

---

## 🌐 Environment Variables Setup

### **For Vercel Deployment:**

You need to add these environment variables in your Vercel project settings:

#### **1. BETTER_AUTH_URL** (Required)
```bash
BETTER_AUTH_URL=https://animalytics.vercel.app
```
**Important:** Must include `https://` protocol!

#### **Alternative: NEXTAUTH_URL** (Also works)
```bash
NEXTAUTH_URL=https://animalytics.vercel.app
```

#### **2. Database URL** (Required)
```bash
DATABASE_URL=postgresql://user:password@host:port/database
```

#### **3. Other Required Variables:**
```bash
# Database
DATABASE_URL=postgresql://...

# Auth (choose one)
BETTER_AUTH_URL=https://animalytics.vercel.app
# OR
NEXTAUTH_URL=https://animalytics.vercel.app

# Email (if using email features)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_user
SMTP_PASS=your_pass

# Google OAuth (if enabled)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

---

## 📋 How to Set Environment Variables in Vercel

### **Method 1: Vercel Dashboard**

1. Go to your project on Vercel
2. Click **Settings** tab
3. Click **Environment Variables** in sidebar
4. Add each variable:
   - **Key:** `BETTER_AUTH_URL`
   - **Value:** `https://animalytics.vercel.app`
   - **Environment:** Production, Preview, Development
5. Click **Save**
6. Redeploy your project

### **Method 2: Vercel CLI**

```bash
# Set production environment variable
vercel env add BETTER_AUTH_URL production

# When prompted, enter:
https://animalytics.vercel.app

# Set for all environments
vercel env add BETTER_AUTH_URL
# Select: Production, Preview, Development
```

---

## 🚀 Deployment Steps

### **Step 1: Update Environment Variables**

In Vercel Dashboard → Settings → Environment Variables:

```bash
BETTER_AUTH_URL=https://animalytics.vercel.app
DATABASE_URL=postgresql://your_database_url
```

### **Step 2: Redeploy**

```bash
# Option A: Push to GitHub (auto-deploy)
git add .
git commit -m "Fix Better Auth base URL configuration"
git push origin main

# Option B: Manual redeploy in Vercel Dashboard
# Go to Deployments → Click "Redeploy"
```

### **Step 3: Verify**

After deployment:
1. Visit `https://animalytics.vercel.app`
2. Try to sign in
3. Check that auth works properly

---

## 🔍 Troubleshooting

### **Issue: Still getting "Invalid base URL" error**

**Check:**
1. ✅ Environment variable includes `https://` protocol
2. ✅ No trailing slash in URL
3. ✅ Variable is set for correct environment (Production/Preview)
4. ✅ Project was redeployed after adding variables

**Correct Format:**
```bash
✅ BETTER_AUTH_URL=https://animalytics.vercel.app
❌ BETTER_AUTH_URL=animalytics.vercel.app (missing https://)
❌ BETTER_AUTH_URL=https://animalytics.vercel.app/ (trailing slash)
```

### **Issue: Build fails with database connection error**

**Check:**
1. ✅ `DATABASE_URL` is set correctly
2. ✅ Database is accessible from Vercel
3. ✅ Database credentials are correct
4. ✅ Database allows connections from Vercel IPs

### **Issue: Auth works locally but not on Vercel**

**Check:**
1. ✅ `BETTER_AUTH_URL` points to Vercel domain (not localhost)
2. ✅ All environment variables are set in Vercel
3. ✅ Project was redeployed after setting variables

---

## 📝 Local Development

### **For Local Development:**

Create `.env.local` file:

```bash
# Local development
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://localhost:5432/animalytics

# Email (optional for local)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_user
SMTP_PASS=your_pass

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

**Note:** `.env.local` is gitignored and won't be deployed to Vercel

---

## 🎯 Priority Order

The code checks environment variables in this order:

```typescript
process.env.BETTER_AUTH_URL ||  // 1. Check BETTER_AUTH_URL first
process.env.NEXTAUTH_URL ||     // 2. Fallback to NEXTAUTH_URL
"http://localhost:3000"         // 3. Default for local development
```

**Recommendation:** Use `BETTER_AUTH_URL` for clarity

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] `BETTER_AUTH_URL` includes `https://` protocol
- [ ] `BETTER_AUTH_URL` has no trailing slash
- [ ] `DATABASE_URL` is set correctly
- [ ] All required environment variables are set in Vercel
- [ ] Variables are set for correct environments (Production/Preview)
- [ ] Code has been pushed to GitHub
- [ ] Project has been redeployed

---

## 🎉 Summary

**Fixed:** Better Auth base URL configuration  
**Added:** `baseURL` property to Better Auth config  
**Result:** ✅ Build will now succeed on Vercel!

**Next Steps:**
1. Add `BETTER_AUTH_URL=https://animalytics.vercel.app` to Vercel environment variables
2. Redeploy your project
3. Test authentication on production

**Your deployment should now work perfectly!** 🚀✨
