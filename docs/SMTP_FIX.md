# 🔧 SMTP Credentials Fix

## ❌ Current Error

```
Error sending email: [Error: Invalid login: 535 5.7.0 Invalid credentials]
{
  code: 'EAUTH',
  response: '535 5.7.0 Invalid credentials',
  responseCode: 535,
  command: 'AUTH PLAIN'
}
```

This means your Mailtrap credentials are **incorrect or not loaded**.

---

## ✅ Solution: Update Your `.env.local` File

### Step 1: Open `.env.local`

Located at: `c:\Users\patri\Downloads\animal\the system\animalytics\.env.local`

### Step 2: Add/Update These Lines

```env
# Mailtrap Settings (IMPORTANT: Use your actual credentials from Mailtrap)
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=587
MAILTRAP_USER=1c0c2641bb7952
MAILTRAP_PASS=3637068c3c2487

# Email From
EMAIL_FROM=Animalytics <noreply@animalytics.co.za>

# Better Auth URLs
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

### Step 3: Verify Your Mailtrap Credentials

1. **Go to Mailtrap.io:**
   - Log into your Mailtrap account
   - Go to your inbox

2. **Find SMTP Settings:**
   - Click on "SMTP Settings" or "Show Credentials"
   - Look for these values:
     - **Host:** Should be `sandbox.smtp.mailtrap.io`
     - **Port:** Should be `587` or `2525`
     - **Username:** Copy this exactly
     - **Password:** Copy this exactly

3. **Update `.env.local`:**
   - Replace `MAILTRAP_USER` with your actual username
   - Replace `MAILTRAP_PASS` with your actual password

### Step 4: Restart Dev Server

**CRITICAL:** You MUST restart the dev server after changing `.env.local`

```bash
# Stop the server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

---

## 🧪 Test SMTP Connection

After restarting, visit:
```
http://localhost:3000/api/test-email
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully! Check your Mailtrap inbox.",
  "config": {
    "host": "sandbox.smtp.mailtrap.io",
    "port": 587,
    "user": "✓ Set",
    "pass": "✓ Set"
  }
}
```

**Check Terminal Logs:**
```
📧 Email Config (Development):
  Host: sandbox.smtp.mailtrap.io
  Port: 587
  User: ✓ Set
  Pass: ✓ Set
Email sent successfully: <message-id>
```

---

## 🐛 If Still Not Working

### Issue 1: Credentials Still Wrong

**Symptoms:**
- Still getting "Invalid credentials" error
- User/Pass show as "✓ Set" but email fails

**Solution:**
1. Copy credentials directly from Mailtrap (don't type them)
2. Make sure there are no extra spaces
3. Check for special characters that might need escaping
4. Try regenerating credentials in Mailtrap

### Issue 2: Environment Variables Not Loading

**Symptoms:**
- Terminal shows "✗ Missing" for User or Pass
- Even though you added them to `.env.local`

**Solution:**
1. Make sure file is named exactly `.env.local` (not `.env` or `env.local`)
2. Make sure it's in the root directory of the project
3. Restart dev server completely (stop and start, not just refresh)
4. Check for syntax errors in `.env.local` (no quotes needed for values)

### Issue 3: Wrong Port

**Symptoms:**
- Connection timeout
- "ECONNREFUSED" error

**Solution:**
Try changing the port in `.env.local`:
```env
# Try port 2525 instead of 587
MAILTRAP_PORT=2525
```

Then restart dev server.

---

## 📧 Alternative: Use Different SMTP Service

If Mailtrap continues to fail, you can use a different service:

### Option 1: Gmail (Quick Test)

```env
MAILTRAP_HOST=smtp.gmail.com
MAILTRAP_PORT=587
MAILTRAP_USER=your-gmail@gmail.com
MAILTRAP_PASS=your-app-password  # Not your regular password!
```

**Note:** You need to create an "App Password" in Gmail settings.

### Option 2: SendGrid (Production-Ready)

```env
MAILTRAP_HOST=smtp.sendgrid.net
MAILTRAP_PORT=587
MAILTRAP_USER=apikey
MAILTRAP_PASS=your-sendgrid-api-key
```

---

## 🔍 Debug Checklist

Run through this checklist:

- [ ] ✅ `.env.local` file exists in project root
- [ ] ✅ MAILTRAP_USER is set (copy from Mailtrap)
- [ ] ✅ MAILTRAP_PASS is set (copy from Mailtrap)
- [ ] ✅ MAILTRAP_HOST is `sandbox.smtp.mailtrap.io`
- [ ] ✅ MAILTRAP_PORT is `587` or `2525`
- [ ] ✅ Dev server was restarted after changes
- [ ] ✅ Terminal shows "✓ Set" for User and Pass
- [ ] ✅ `/api/test-email` returns success
- [ ] ✅ Mailtrap inbox receives test email

---

## 💡 Quick Test Command

Create a test file to verify credentials:

```typescript
// test-smtp.ts
import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 587,
  auth: {
    user: '1c0c2641bb7952',  // Your actual username
    pass: '3637068c3c2487',  // Your actual password
  },
});

transport.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP Error:', error);
  } else {
    console.log('✅ SMTP Connection Successful!');
  }
});
```

Run with: `npx ts-node test-smtp.ts`

---

## 📞 Need Help?

If you're still stuck, provide:
1. Terminal output when starting dev server
2. Response from `/api/test-email`
3. Screenshot of Mailtrap SMTP settings
4. Contents of `.env.local` (hide the password)

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Terminal shows "✓ Set" for User and Pass
2. ✅ `/api/test-email` returns success
3. ✅ Mailtrap inbox receives test email
4. ✅ No "Invalid credentials" errors
5. ✅ Email sent successfully log appears

**Once this works, password reset will work automatically!** 🎉
