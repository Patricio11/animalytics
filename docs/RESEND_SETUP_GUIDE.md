# 📧 Resend Email Setup Guide for Animalytics

## Overview

This guide will help you set up Resend for sending production emails (verification, password reset, notifications) on your Vercel deployment.

**Why Resend?**
- ✅ Free tier: 3,000 emails/month
- ✅ Excellent deliverability
- ✅ Simple API
- ✅ Great for transactional emails
- ✅ Custom domain support

---

## Step 1: Create Resend Account

1. **Go to** [https://resend.com](https://resend.com)
2. **Click** "Sign Up"
3. **Enter** your email and create password
4. **Verify** your email address
5. **Complete** onboarding

---

## Step 2: Get Your API Key

1. **Log in** to Resend dashboard
2. **Click** on "API Keys" in the left sidebar
3. **Click** "Create API Key"
4. **Name it:** `Animalytics Production`
5. **Select permissions:** Full Access (or Send Access)
6. **Click** "Create"
7. **Copy** the API key (starts with `re_...`)

⚠️ **Important:** Save this key somewhere safe! You won't be able to see it again.

---

## Step 3: Add Your Domain to Resend

### 3.1 Add Domain

1. In Resend dashboard, click **"Domains"**
2. Click **"Add Domain"**
3. Enter: `animalytics.co`
4. Click **"Add"**

### 3.2 Get DNS Records

Resend will show you DNS records to add. They'll look something like this:

```
┌─────────────────────────────────────────────────────────────┐
│ DNS Records to Add                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. SPF Record (TXT)                                        │
│    Name: @                                                  │
│    Value: v=spf1 include:amazonses.com ~all               │
│                                                             │
│ 2. DKIM Record 1 (TXT)                                     │
│    Name: resend._domainkey                                 │
│    Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ...     │
│                                                             │
│ 3. DKIM Record 2 (TXT)                                     │
│    Name: resend2._domainkey                                │
│    Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ...     │
│                                                             │
│ 4. MX Record (for bounce handling)                         │
│    Name: @                                                  │
│    Value: feedback-smtp.us-east-1.amazonses.com           │
│    Priority: 10                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 4: Add DNS Records to Your Domain

### Where to Add DNS Records

Go to your domain registrar (where you bought `animalytics.co`):
- **Namecheap:** Advanced DNS → Add New Record
- **GoDaddy:** DNS Management → Add Record
- **Cloudflare:** DNS → Add Record
- **Google Domains:** DNS → Custom Records

### Add Each Record

**1. SPF Record**
```
Type: TXT
Name: @ (or leave blank)
Value: v=spf1 include:amazonses.com ~all
TTL: 3600 (or Auto)
```

**2. DKIM Record 1**
```
Type: TXT
Name: resend._domainkey
Value: [paste the long value from Resend]
TTL: 3600
```

**3. DKIM Record 2**
```
Type: TXT
Name: resend2._domainkey
Value: [paste the long value from Resend]
TTL: 3600
```

**4. MX Record (Optional but recommended)**
```
Type: MX
Name: @ (or leave blank)
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
TTL: 3600
```

### 4.3 Wait for DNS Propagation

- DNS changes can take **5 minutes to 48 hours**
- Usually happens within **15-30 minutes**
- Resend will automatically verify once records are detected

### 4.4 Verify Domain

1. Go back to Resend dashboard → Domains
2. Click on `animalytics.co`
3. Click **"Verify Domain"**
4. If successful, you'll see ✅ **Verified**

---

## Step 5: Configure Vercel Environment Variables

### 5.1 Go to Vercel Dashboard

1. Open [https://vercel.com](https://vercel.com)
2. Select your **Animalytics** project
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar

### 5.2 Add SMTP Variables

Add these environment variables **one by one**:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `SMTP_HOST` | `smtp.resend.com` | Production |
| `SMTP_PORT` | `587` | Production |
| `SMTP_SECURE` | `false` | Production |
| `SMTP_USER` | `resend` | Production |
| `SMTP_PASS` | `re_your_api_key_here` | Production |
| `SMTP_FROM` | `noreply@animalytics.co` | Production |
| `SMTP_FROM_NAME` | `Animalytics` | Production |
| `BETTER_AUTH_URL` | `https://animalytics.co` | Production |

⚠️ **Replace `re_your_api_key_here` with your actual Resend API key!**

### 5.3 How to Add Each Variable

For each variable:
1. Click **"Add New"**
2. Enter **Key** (e.g., `SMTP_HOST`)
3. Enter **Value** (e.g., `smtp.resend.com`)
4. Select **Environment:** Production ✅
5. Click **"Save"**

---

## Step 6: Redeploy Your Application

### Option A: Trigger Redeploy from Vercel

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

### Option B: Push to Git

```bash
git push origin main
```

Vercel will automatically redeploy.

---

## Step 7: Test Email Sending

### 7.1 Test Signup Email

1. Go to `https://animalytics.co/auth/signup`
2. Create a new account with a **real email address**
3. Check your inbox for verification email
4. Click the verification link

### 7.2 Check Vercel Logs

1. Go to Vercel → **Deployments**
2. Click on latest deployment
3. Click **"Functions"** tab
4. Look for email-related logs:

```
📧 Email Config (Production):
  Host: smtp.resend.com
  Port: 587
  Secure: false
  User: ✓ Set
  Pass: ✓ Set
  From: noreply@animalytics.co

📧 Sending verification email...
User: test@example.com
✅ Verification email sent successfully
```

### 7.3 Check Resend Dashboard

1. Go to Resend → **Emails**
2. You should see your sent emails
3. Check delivery status

---

## Troubleshooting

### ❌ Email Not Received

**Check 1: Domain Verified?**
- Go to Resend → Domains
- Make sure `animalytics.co` shows ✅ Verified
- If not, check DNS records

**Check 2: Spam Folder**
- Check recipient's spam/junk folder
- Mark as "Not Spam"

**Check 3: Vercel Logs**
- Check for errors in Vercel function logs
- Look for SMTP connection errors

**Check 4: Resend Logs**
- Go to Resend → Emails
- Check if email was sent
- Check delivery status

### ❌ DNS Records Not Verifying

**Wait Longer**
- DNS can take up to 48 hours
- Usually 15-30 minutes

**Check DNS Propagation**
- Use [https://dnschecker.org](https://dnschecker.org)
- Enter: `animalytics.co`
- Select TXT records
- Check if Resend records appear

**Common Issues:**
- Wrong record name (use exact name from Resend)
- Extra quotes in TXT value (remove them)
- Wrong TTL (use 3600 or Auto)

### ❌ SMTP Authentication Failed

**Check API Key:**
- Make sure you copied the full key
- Should start with `re_`
- No extra spaces

**Check Environment Variables:**
- Go to Vercel → Settings → Environment Variables
- Verify `SMTP_PASS` is set correctly
- Redeploy after changing

### ❌ Wrong "From" Address

**Update SMTP_FROM:**
```
SMTP_FROM=noreply@animalytics.co
```

**Must use verified domain:**
- Can't use `@gmail.com` or other domains
- Must use `@animalytics.co`
- Domain must be verified in Resend

---

## Email Templates

Your app sends these emails:

### 1. Verification Email
**Trigger:** User signs up  
**Subject:** Verify your email address  
**From:** `noreply@animalytics.co`  
**Template:** `lib/services/email.ts` → `sendVerificationEmail()`

### 2. Password Reset Email
**Trigger:** User clicks "Forgot Password"  
**Subject:** Reset your password  
**From:** `noreply@animalytics.co`  
**Template:** `lib/services/email.ts` → `sendPasswordResetEmail()`

### 3. Notification Emails (Future)
**Trigger:** Task reminders, breeding alerts, etc.  
**From:** `noreply@animalytics.co`

---

## Resend Limits

### Free Tier
- ✅ **3,000 emails/month**
- ✅ **100 emails/day**
- ✅ **1 verified domain**
- ✅ **Unlimited API keys**

### If You Need More
- **Pro Plan:** $20/month for 50,000 emails
- **Business Plan:** $80/month for 100,000 emails

---

## Security Best Practices

### ✅ DO:
- Keep API key secret
- Use environment variables
- Verify domain with DNS records
- Monitor email logs in Resend

### ❌ DON'T:
- Commit API key to Git
- Share API key publicly
- Use unverified domains
- Send spam or marketing emails

---

## Monitoring

### Resend Dashboard
- **Emails:** See all sent emails
- **Analytics:** Open rates, click rates
- **Logs:** Delivery status, errors
- **Webhooks:** Set up delivery notifications

### Vercel Logs
- Check function logs for email sending
- Look for SMTP errors
- Monitor email volume

---

## Next Steps

After emails are working:

1. ✅ **Test all email flows:**
   - Signup verification
   - Password reset
   - Email change verification

2. ✅ **Customize email templates:**
   - Add your logo
   - Match brand colors
   - Improve copy

3. ✅ **Set up webhooks (optional):**
   - Track email opens
   - Track link clicks
   - Handle bounces

4. ✅ **Monitor usage:**
   - Check Resend dashboard monthly
   - Upgrade plan if needed

---

## Support

### Resend Support
- **Docs:** [https://resend.com/docs](https://resend.com/docs)
- **Email:** support@resend.com
- **Discord:** [Resend Community](https://resend.com/discord)

### Vercel Support
- **Docs:** [https://vercel.com/docs](https://vercel.com/docs)
- **Support:** [https://vercel.com/support](https://vercel.com/support)

---

## Quick Reference

### Environment Variables (Vercel)
```bash
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=resend
SMTP_PASS=re_your_api_key_here
SMTP_FROM=noreply@animalytics.co
SMTP_FROM_NAME=Animalytics
BETTER_AUTH_URL=https://animalytics.co
```

### Test Email Command (Local)
```bash
# In your terminal
npm run dev

# Then test signup at:
# http://localhost:3000/auth/signup
```

---

**Status:** Ready to configure! 🚀  
**Last Updated:** December 15, 2024

Follow the steps above and your production emails will be working in about 30 minutes! 📧✨
