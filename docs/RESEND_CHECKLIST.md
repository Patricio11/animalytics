# ✅ Resend Setup Checklist

## Quick Setup Checklist for animalytics.co

### 1. Resend Account Setup
- [ ] Sign up at [https://resend.com](https://resend.com)
- [ ] Verify your email
- [ ] Create API key named "Animalytics Production"
- [ ] Copy API key (starts with `re_...`)

### 2. Domain Configuration
- [ ] Add domain `animalytics.co` in Resend
- [ ] Copy DNS records from Resend dashboard
- [ ] Add SPF record to DNS
- [ ] Add DKIM record 1 to DNS
- [ ] Add DKIM record 2 to DNS
- [ ] Add MX record to DNS (optional)
- [ ] Wait 15-30 minutes for DNS propagation
- [ ] Verify domain in Resend (should show ✅)

### 3. Vercel Environment Variables
Add these in Vercel → Settings → Environment Variables:

- [ ] `SMTP_HOST` = `smtp.resend.com`
- [ ] `SMTP_PORT` = `587`
- [ ] `SMTP_SECURE` = `false`
- [ ] `SMTP_USER` = `resend`
- [ ] `SMTP_PASS` = `re_your_api_key_here` ⚠️ Use your actual key!
- [ ] `SMTP_FROM` = `noreply@animalytics.co`
- [ ] `SMTP_FROM_NAME` = `Animalytics`
- [ ] `BETTER_AUTH_URL` = `https://animalytics.co`

### 4. Deploy & Test
- [ ] Redeploy app on Vercel
- [ ] Test signup at `https://animalytics.co/auth/signup`
- [ ] Check email inbox for verification email
- [ ] Check Vercel logs for email sending confirmation
- [ ] Check Resend dashboard for sent emails

### 5. Verify Everything Works
- [ ] Signup email received ✅
- [ ] Verification link works ✅
- [ ] Password reset email works ✅
- [ ] No errors in Vercel logs ✅
- [ ] Emails appear in Resend dashboard ✅

---

## DNS Records Template

Copy these to your domain registrar (replace values with your actual Resend values):

```
Type: TXT
Name: @
Value: v=spf1 include:amazonses.com ~all

Type: TXT
Name: resend._domainkey
Value: [paste from Resend]

Type: TXT
Name: resend2._domainkey
Value: [paste from Resend]

Type: MX
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
```

---

## Vercel Environment Variables (Copy-Paste Ready)

```
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=resend
SMTP_PASS=re_your_api_key_here
SMTP_FROM=noreply@animalytics.co
SMTP_FROM_NAME=Animalytics
BETTER_AUTH_URL=https://animalytics.co
```

---

## Troubleshooting Quick Fixes

**No email received?**
1. Check spam folder
2. Verify domain is verified in Resend
3. Check Vercel logs for errors
4. Check Resend dashboard for delivery status

**Domain not verifying?**
1. Wait 30 minutes
2. Check DNS records are correct
3. Use [dnschecker.org](https://dnschecker.org) to verify
4. Remove any extra quotes from TXT values

**SMTP error?**
1. Check API key is correct
2. Verify all environment variables are set
3. Redeploy after changing variables
4. Check Vercel function logs

---

**Estimated Time:** 30 minutes  
**Difficulty:** Easy  
**Cost:** Free (3,000 emails/month)

See `RESEND_SETUP_GUIDE.md` for detailed instructions! 📧
