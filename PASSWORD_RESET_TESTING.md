# Password Reset Testing Guide

## 🔐 Complete Forgot Password Flow

### Overview
The password reset system is now fully functional with Better Auth integration and beautiful email templates.

---

## 📋 Prerequisites

### 1. Email Configuration (Required)
Add these environment variables to your `.env.local`:

```env
# Development (Mailtrap for testing)
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_mailtrap_username
MAILTRAP_PASS=your_mailtrap_password

# Production (Optional - for live deployment)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Email sender
EMAIL_FROM=Animalytics <noreply@animalytics.com>

# Better Auth
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Get Mailtrap Credentials (Free)
1. Go to [mailtrap.io](https://mailtrap.io)
2. Sign up for free account
3. Create an inbox
4. Copy SMTP credentials to `.env.local`

---

## 🧪 Testing the Flow

### Step 1: Request Password Reset
1. Navigate to: `http://localhost:3000/auth/forgot-password`
2. Enter a registered email address
3. Click "Send Reset Link"
4. You should see success message

### Step 2: Check Email (Mailtrap)
1. Log into your Mailtrap inbox
2. You should see email: "🔐 Reset Your Password - Animalytics"
3. Email includes:
   - Beautiful branded design
   - "Reset Password" button
   - Security notice (1-hour expiration)
   - Fallback link if button doesn't work

### Step 3: Reset Password
1. Click "Reset Password" button in email
2. You'll be redirected to: `http://localhost:3000/auth/reset-password?token=...`
3. Enter new password (requirements shown):
   - At least 8 characters
   - Uppercase and lowercase letters
   - At least one number
4. Confirm password
5. Click "Reset Password"
6. Success message appears
7. Auto-redirect to login page after 3 seconds

### Step 4: Login with New Password
1. Navigate to: `http://localhost:3000/auth/login`
2. Enter email and NEW password
3. Should successfully log in

---

## ✨ Features Implemented

### 🎨 Beautiful Email Template
- Gradient branding
- Responsive design
- Security warnings
- Professional styling
- Dark mode compatible

### 🔒 Security Features
- Token-based reset (1-hour expiration)
- Password strength validation
- Secure password hashing
- One-time use tokens
- Email verification

### 💅 UI/UX Features
- Real-time password strength indicator
- Show/hide password toggle
- Form validation with helpful errors
- Loading states
- Success confirmation
- Auto-redirect after success

### 📱 Pages
1. **Forgot Password** (`/auth/forgot-password`)
   - Email input
   - Success state
   - Error handling

2. **Reset Password** (`/auth/reset-password`)
   - Token validation
   - Password requirements
   - Strength indicator
   - Confirmation field
   - Success state

---

## 🔍 API Endpoints Used

Better Auth automatically provides these endpoints:

- `POST /api/auth/forget-password` - Request reset
  ```json
  {
    "email": "user@example.com",
    "redirectTo": "http://localhost:3000/auth/reset-password"
  }
  ```

- `POST /api/auth/reset-password` - Reset password
  ```json
  {
    "token": "reset_token_from_email",
    "password": "NewPassword123"
  }
  ```

---

## 🐛 Troubleshooting

### Email Not Sending
1. Check `.env.local` has correct Mailtrap credentials
2. Restart dev server after adding env vars
3. Check console for email errors
4. Verify Mailtrap inbox is active

### Token Invalid/Expired
- Tokens expire after 1 hour
- Each token can only be used once
- Request new reset link if expired

### Password Validation Failing
Ensure password meets requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

---

## 📧 Email Template Preview

The email includes:
- 🐕 Animalytics branding
- 🔐 "Reset Your Password" title
- Personalized greeting
- Large "Reset Password" button
- Security notice box:
  - ⚠️ Link expires in 1 hour
  - Don't share with anyone
  - Ignore if you didn't request
- Fallback text link
- Professional footer

---

## 🚀 Production Deployment

### Before Going Live:
1. Replace Mailtrap with production SMTP:
   - SendGrid
   - AWS SES
   - Mailgun
   - Postmark
   
2. Update environment variables:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your_sendgrid_api_key
   BETTER_AUTH_URL=https://yourdomain.com
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. Test thoroughly in production environment

---

## 📝 Code Structure

### Files Modified/Created:
1. `lib/auth/config.ts` - Better Auth configuration
2. `lib/services/email.ts` - Email service with templates
3. `app/auth/reset-password/page.tsx` - Reset password page (NEW)
4. `app/auth/forgot-password/page.tsx` - Already existed

### Email Service Functions:
- `sendPasswordResetEmail()` - Send reset email
- `generatePasswordResetEmailHTML()` - Email template
- `verifyEmailConfig()` - Test SMTP connection

---

## ✅ Testing Checklist

- [ ] Environment variables configured
- [ ] Mailtrap inbox created
- [ ] Dev server restarted
- [ ] Can access forgot password page
- [ ] Email sends successfully
- [ ] Email appears in Mailtrap
- [ ] Email design looks good
- [ ] Reset link works
- [ ] Token validation works
- [ ] Password requirements enforced
- [ ] Password strength indicator works
- [ ] Can reset password successfully
- [ ] Can login with new password
- [ ] Expired token shows error
- [ ] Invalid token shows error

---

## 🎉 Success!

Your password reset system is now fully functional with:
- ✅ Beautiful email templates
- ✅ Secure token-based flow
- ✅ Professional UI/UX
- ✅ Complete error handling
- ✅ Production-ready code

Happy testing! 🚀
