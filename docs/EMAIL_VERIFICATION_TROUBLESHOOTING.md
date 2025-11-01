# 🔧 Email Verification Troubleshooting

## ❌ Current Issue

**Problem:** Verification email not being sent during signup

**Symptoms:**
- User signs up successfully
- Redirected to "Check Your Email" page
- No email received in Mailtrap
- Resend button gives 400 error

---

## 🔍 Diagnosis

### **Check Terminal Logs During Signup:**

When you sign up, you should see these logs:

```
✅ Account created successfully
💾 Saving user preferences to database...
✅ Preferences saved to database
📧 Sending verification email...
User: user@example.com
Verification URL: http://localhost:3000/api/auth/verify-email?token=...
✅ Verification email sent successfully to: user@example.com
```

**If you DON'T see the verification email logs**, Better Auth isn't triggering the `sendVerificationEmail` callback.

---

## ✅ Solutions Implemented

### **1. Custom Resend Endpoint**

Created: `/api/auth/resend-verification`

This endpoint:
- Finds user by email
- Checks if already verified
- Generates new verification token
- Saves to database
- Sends verification email

**Usage:**
```typescript
POST /api/auth/resend-verification
Body: { "email": "user@example.com" }
```

### **2. Updated Resend Button**

The "Resend Email" button now uses our custom endpoint instead of Better Auth's endpoint.

---

## 🧪 Testing

### **Test 1: Check if Email is Being Sent During Signup**

1. Sign up with a new email
2. Watch terminal logs carefully
3. Look for:
   ```
   📧 Sending verification email...
   ✅ Verification email sent successfully
   ```

**If you see these logs:**
- ✅ Email is being sent
- Check Mailtrap inbox
- Check spam folder
- Verify SMTP credentials

**If you DON'T see these logs:**
- ❌ Better Auth isn't calling sendVerificationEmail
- This is a configuration issue

### **Test 2: Use Resend Button**

1. Go to verification notice page
2. Click "Resend Verification Email"
3. Check terminal logs:
   ```
   📧 Resending verification email for: user@example.com
   ✅ Found unverified user: user-id
   ✅ New verification token created
   ✅ Verification email sent successfully
   ```
4. Check Mailtrap inbox

---

## 🔧 Possible Causes & Fixes

### **Cause 1: Better Auth Not Calling sendVerificationEmail**

**Check:**
```typescript
// lib/auth/config.ts
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,  // ← Must be true
  sendVerificationEmail: async ({ user, url, token }) => {
    // ← This should be called during signup
  },
}
```

**Fix:**
- Ensure `requireEmailVerification: true`
- Restart dev server
- Try signup again

### **Cause 2: SMTP Credentials Wrong**

**Check:**
```bash
# Visit test endpoint
http://localhost:3000/api/test-email
```

**Expected:**
```json
{
  "success": true,
  "message": "Test email sent successfully!"
}
```

**If fails:**
- Check `.env.local` has correct Mailtrap credentials
- Restart dev server
- Test again

### **Cause 3: Email Service Error**

**Check terminal for:**
```
❌ Failed to send verification email: [error details]
```

**Common errors:**
- Invalid credentials → Fix SMTP settings
- Connection timeout → Check port (should be 2525)
- Rate limit → Wait and try again

---

## 🎯 Quick Fix Steps

### **Option A: Use Resend Button**

1. Go to verification notice page
2. Click "Resend Verification Email"
3. Check Mailtrap inbox
4. Click verification link

### **Option B: Manual Verification (Development Only)**

If emails still not working, you can manually verify in database:

```sql
UPDATE users 
SET email_verified = true 
WHERE email = 'user@example.com';
```

Then login normally.

---

## 📊 Expected Flow

### **Normal Flow:**

```
1. User signs up
   ↓
2. Better Auth creates account
   ↓
3. Better Auth calls sendVerificationEmail
   ↓
4. Email service sends email
   ↓
5. Email appears in Mailtrap
   ↓
6. User clicks link
   ↓
7. Email verified
   ↓
8. User can login
```

### **With Resend:**

```
1. User signs up
   ↓
2. No email received
   ↓
3. User clicks "Resend Email"
   ↓
4. Custom endpoint generates new token
   ↓
5. Email service sends email
   ↓
6. Email appears in Mailtrap
   ↓
7. User clicks link
   ↓
8. Email verified
   ↓
9. User can login
```

---

## 🔍 Debug Checklist

Run through this checklist:

- [ ] ✅ SMTP test endpoint returns 200
- [ ] ✅ Mailtrap credentials correct in `.env.local`
- [ ] ✅ Dev server restarted after env changes
- [ ] ✅ `requireEmailVerification: true` in auth config
- [ ] ✅ Terminal shows "Sending verification email" during signup
- [ ] ✅ Terminal shows "Email sent successfully"
- [ ] ✅ Mailtrap inbox is open and refreshed
- [ ] ✅ Checked spam/junk folder
- [ ] ✅ Resend button works
- [ ] ✅ Resend email appears in Mailtrap

---

## 📝 Files Created/Modified

### **Created:**
1. `app/api/auth/resend-verification/route.ts`
   - Custom resend endpoint
   - Generates new token
   - Sends verification email

### **Modified:**
1. `app/auth/verify-email-notice/page.tsx`
   - Updated resend button
   - Uses custom endpoint
   - Better error handling

---

## 🆘 Still Not Working?

### **Share These Details:**

1. **Terminal logs during signup:**
   - Copy full output from signup
   - Look for verification email logs

2. **Response from test endpoint:**
   ```bash
   curl http://localhost:3000/api/test-email
   ```

3. **Response from resend endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/resend-verification \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com"}'
   ```

4. **Environment variables (hide password):**
   ```
   MAILTRAP_HOST=?
   MAILTRAP_PORT=?
   MAILTRAP_USER=?
   BETTER_AUTH_URL=?
   ```

5. **Mailtrap inbox status:**
   - Is inbox active?
   - Any emails received?
   - Correct inbox selected?

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Terminal shows verification email logs during signup
2. ✅ Email appears in Mailtrap inbox within seconds
3. ✅ Email has "Verify Email Address" button
4. ✅ Clicking button redirects to verification page
5. ✅ Verification succeeds
6. ✅ User can login

---

**Try the resend button now and check your terminal logs!** 🚀
