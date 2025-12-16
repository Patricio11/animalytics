# Email Authentication Debugging Guide

## 🔍 Complete System Overview

### Features Implemented:
1. ✅ **Password Reset** - Full flow with email
2. ✅ **Email Verification** - New user verification
3. ✅ **Beautiful Email Templates** - Professional designs
4. ✅ **Mailtrap Integration** - Development testing
5. ✅ **Better Auth Integration** - Complete configuration

---

## 📧 Email Configuration

### Environment Variables Required:

```env
# Mailtrap Settings (Development)
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

---

## 🧪 Step-by-Step Testing

### Test 1: Email Configuration
```bash
# Visit this URL in your browser:
http://localhost:3000/api/test-email
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully! Check your Mailtrap inbox.",
  "timestamp": "2025-10-29T..."
}
```

**Check Terminal Logs:**
```
🔍 Verifying email configuration...
Environment: development
MAILTRAP_HOST: sandbox.smtp.mailtrap.io
MAILTRAP_PORT: 587
MAILTRAP_USER: ✓ Set
MAILTRAP_PASS: ✓ Set
✅ Email configuration verified successfully
📧 Sending test email...
Email sent successfully: <message-id>
```

**If this fails:**
- ❌ Environment variables not loaded → Restart dev server
- ❌ Wrong credentials → Check Mailtrap dashboard
- ❌ Port blocked → Try port 2525 instead of 587

---

### Test 2: User Registration with Email Verification

1. **Register New User:**
   - Go to: `http://localhost:3000/auth/register`
   - Fill in details
   - Submit form

2. **Check Terminal Logs:**
   ```
   📧 Sending verification email...
   User: user@example.com
   Verification URL: http://localhost:3000/auth/verify-email?token=...
   ✅ Verification email sent successfully to: user@example.com
   ```

3. **Check Mailtrap Inbox:**
   - Email subject: "✉️ Verify Your Email - Animalytics"
   - Should have "Verify Email Address" button
   - Link format: `http://localhost:3000/auth/verify-email?token=...`

4. **Click Verification Link:**
   - Should redirect to `/auth/verify-email`
   - Should show success message
   - Auto-redirect to login after 3 seconds

---

### Test 3: Password Reset

1. **Request Password Reset:**
   - Go to: `http://localhost:3000/auth/forgot-password`
   - Enter registered email
   - Click "Send Reset Link"

2. **Check Terminal Logs:**
   ```
   🔐 Sending password reset email...
   User: user@example.com
   Reset URL: http://localhost:3000/auth/reset-password?token=...
   ✅ Password reset email sent successfully to: user@example.com
   ```

3. **Check Mailtrap Inbox:**
   - Email subject: "🔐 Reset Your Password - Animalytics"
   - Should have "Reset Password" button
   - Security notice about 1-hour expiration

4. **Click Reset Link:**
   - Should redirect to `/auth/reset-password?token=...`
   - Enter new password
   - Submit form
   - Should show success and redirect to login

5. **Login with New Password:**
   - Go to: `http://localhost:3000/auth/login`
   - Use new password
   - Should successfully log in

---

## 🐛 Common Issues & Solutions

### Issue 1: "Email not sending"

**Symptoms:**
- No email in Mailtrap
- No logs in terminal
- Success message shown but no email

**Debug Steps:**

1. **Check if Better Auth is calling the function:**
   ```bash
   # Look for these logs in terminal:
   🔐 Sending password reset email...
   # OR
   📧 Sending verification email...
   ```

2. **If no logs appear:**
   - Better Auth might not be configured correctly
   - Check `/api/auth/[...all]/route.ts` exists
   - Restart dev server

3. **If logs appear but email fails:**
   ```bash
   # Look for error logs:
   ❌ Failed to send password reset email: [error details]
   ```
   - Check SMTP credentials
   - Verify Mailtrap inbox is active
   - Check port (try 2525 if 587 fails)

---

### Issue 2: "Invalid or missing token"

**Symptoms:**
- Reset/verification page shows error
- Token parameter missing from URL

**Solutions:**
1. Check email link is complete (not truncated)
2. Ensure Better Auth is generating correct URLs
3. Verify `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` are set

---

### Issue 3: "Token expired"

**Symptoms:**
- "Token has expired" error
- Link worked before but not now

**Solutions:**
1. Tokens expire after:
   - Password reset: 1 hour
   - Email verification: 24 hours
2. Request new link
3. Check system time is correct

---

### Issue 4: "Email sent but not received"

**Debug Checklist:**

```bash
# 1. Check Mailtrap inbox
- Log into mailtrap.io
- Check correct inbox
- Look in "All Messages" tab

# 2. Check email service logs
# Terminal should show:
Email sent successfully: <message-id>

# 3. Verify email configuration
curl http://localhost:3000/api/test-email

# 4. Check Mailtrap credentials
# In .env.local:
MAILTRAP_USER=1c0c2641bb7952  # Must match Mailtrap
MAILTRAP_PASS=3637068c3c2487  # Must match Mailtrap
```

---

## 🔧 Advanced Debugging

### Enable Detailed Logging

Add to `lib/services/email.ts`:

```typescript
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transport = getTransporter();
    
    // ADD THIS:
    console.log('📤 Sending email to:', options.to);
    console.log('📧 Subject:', options.subject);
    console.log('🔧 Transport config:', {
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      user: process.env.MAILTRAP_USER ? '✓' : '✗',
      pass: process.env.MAILTRAP_PASS ? '✓' : '✗',
    });
    
    const mailOptions = {
      from: options.from || process.env.EMAIL_FROM || 'Animalytics <noreply@animalytics.co>',
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    };

    const info = await transport.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    console.log('📨 Response:', info.response);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}
```

---

### Test SMTP Connection Directly

```typescript
// Add to app/api/test-email/route.ts

// Test SMTP connection
const transport = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 587,
  auth: {
    user: '1c0c2641bb7952',
    pass: '3637068c3c2487',
  },
});

await transport.verify();
console.log('✅ SMTP connection verified');
```

---

## 📊 Better Auth Endpoints

Better Auth automatically creates these endpoints:

### Password Reset:
```bash
# Request reset
POST /api/auth/forget-password
Body: { "email": "user@example.com", "redirectTo": "http://localhost:3000/auth/reset-password" }

# Reset password
POST /api/auth/reset-password
Body: { "token": "...", "password": "newpassword123" }
```

### Email Verification:
```bash
# Verify email
POST /api/auth/verify-email
Body: { "token": "..." }

# Resend verification (if supported)
POST /api/auth/send-verification-email
Body: { "email": "user@example.com" }
```

---

## 🎯 Quick Troubleshooting Checklist

- [ ] ✅ Environment variables in `.env.local`
- [ ] ✅ Dev server restarted after adding env vars
- [ ] ✅ Mailtrap account active
- [ ] ✅ Correct Mailtrap credentials
- [ ] ✅ `/api/test-email` returns success
- [ ] ✅ Terminal shows email sending logs
- [ ] ✅ Mailtrap inbox receiving emails
- [ ] ✅ Email links are complete (not truncated)
- [ ] ✅ Better Auth URLs configured correctly
- [ ] ✅ User exists in database (for password reset)

---

## 🚀 Production Deployment

### Before Going Live:

1. **Switch to Production SMTP:**
   ```env
   # Replace Mailtrap with:
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your_sendgrid_api_key
   BETTER_AUTH_URL=https://yourdomain.com
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

2. **Update Email Service:**
   - The code automatically detects production via `NODE_ENV`
   - Uses production SMTP settings when `NODE_ENV=production`

3. **Test in Production:**
   - Test password reset
   - Test email verification
   - Verify emails arrive quickly
   - Check spam folders

---

## 📝 Files Modified/Created

### Modified:
1. `lib/auth/config.ts` - Better Auth email configuration
2. `lib/services/email.ts` - Email templates and functions

### Created:
1. `app/auth/reset-password/page.tsx` - Password reset page
2. `app/auth/verify-email/page.tsx` - Email verification page
3. `app/api/test-email/route.ts` - Email testing endpoint
4. `PASSWORD_RESET_TESTING.md` - Testing guide
5. `EMAIL_AUTH_DEBUGGING.md` - This file

---

## 💡 Tips

1. **Always check terminal logs first** - They show exactly what's happening
2. **Use `/api/test-email` endpoint** - Quick way to verify SMTP works
3. **Check Mailtrap "All Messages"** - Don't just look in inbox
4. **Restart dev server** - After changing `.env.local`
5. **Copy full link** - Email links can be long, ensure complete copy

---

## 🆘 Still Not Working?

### Contact Information:
- Check Better Auth docs: https://www.better-auth.com/docs
- Mailtrap support: https://mailtrap.io/support
- Check terminal for specific error messages

### Provide These Details:
1. Terminal logs (full output)
2. Response from `/api/test-email`
3. Environment variables (without sensitive values)
4. Browser console errors
5. Mailtrap inbox status

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ `/api/test-email` returns success
2. ✅ Terminal shows "✅ Email sent successfully"
3. ✅ Mailtrap inbox receives emails
4. ✅ Email templates look beautiful
5. ✅ Links in emails work correctly
6. ✅ Password reset completes successfully
7. ✅ Email verification completes successfully
8. ✅ Users can log in after verification

---

**Good luck! 🎉**
