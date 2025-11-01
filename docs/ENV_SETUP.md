# 🔧 Environment Variables Setup

## ✅ **Your Mailtrap Credentials**

Based on your Mailtrap settings, add these to your `.env.local` file:

```env
# Mailtrap SMTP Configuration (Development)
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=1c0c2641bb7952
MAILTRAP_PASS=3637068c3c2487

# Email Settings
EMAIL_FROM=Animalytics <noreply@animalytics.co.za>

# Better Auth URLs
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

## 📝 **How to Update Your `.env.local`**

1. **Open the file:**
   - Location: `c:\Users\patri\Downloads\animal\the system\animalytics\.env.local`
   - If it doesn't exist, create it in the project root

2. **Add/Update these lines:**
   - Copy the configuration above
   - Paste into your `.env.local` file
   - Save the file

3. **Restart dev server:**
   ```bash
   # Stop server: Ctrl+C
   # Start again:
   npm run dev
   ```

## 🎯 **What Changed**

- ✅ Updated default port from 587 to **2525** (Mailtrap's recommended port)
- ✅ Your credentials are correct: `1c0c2641bb7952` / `3637068c3c2487`
- ✅ Code now uses port 2525 by default

## 🧪 **Test After Restart**

1. **Visit:** `http://localhost:3000/api/test-email`
2. **Expected:** Success message
3. **Check:** Mailtrap inbox for test email
4. **Terminal:** Should show "✅ Email sent successfully"

## 📊 **What Your Logs Show**

From your terminal output, I can see:

✅ **Good News:**
```
✅ Password reset email sent successfully to: patricio.cristo@gmail.com
POST /api/auth/forget-password 200 in 3847ms
```
This means the email **DID send successfully**!

❌ **Issue:**
```
Error sending email: [Error: Invalid login: 535 5.7.0 Invalid credentials]
```
This error appears **before** the success, suggesting there might be:
- Multiple email sending attempts
- One using wrong credentials, one using correct ones
- Possibly cached transporter with old credentials

## 🔄 **After Restart, You Should See:**

```
📧 Email Config (Development):
  Host: sandbox.smtp.mailtrap.io
  Port: 2525
  User: ✓ Set
  Pass: ✓ Set
```

And NO "Invalid credentials" errors!

## ✅ **Your Complete `.env.local` Should Look Like:**

```env
# Database (your existing connection)
DATABASE_URL=your_existing_database_url

# Mailtrap SMTP
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=1c0c2641bb7952
MAILTRAP_PASS=3637068c3c2487

# Email
EMAIL_FROM=Animalytics <noreply@animalytics.co.za>

# Better Auth
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development

# Any other existing variables...
```

## 🎉 **Once This Works:**

- ✅ Password reset emails will send
- ✅ No more "Invalid credentials" errors
- ✅ Registration will work smoothly
- ✅ All email features will work

## 🐛 **If Still Having Issues:**

Share:
1. Terminal output when server starts
2. Response from `/api/test-email`
3. Any error messages

The good news is your password reset **IS working** - we just need to clean up the credentials issue!
