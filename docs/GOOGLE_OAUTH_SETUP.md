# Google OAuth Setup Guide for Animalytics

This guide will help you set up Google OAuth authentication for the Animalytics application.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- Your application deployed or running locally

---

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click **"New Project"**
4. Enter project details:
   - **Project Name:** `Animalytics` (or your preferred name)
   - **Organization:** (optional)
5. Click **"Create"**

---

## Step 2: Enable Google+ API

1. In your Google Cloud project, go to **"APIs & Services" → "Library"**
2. Search for **"Google+ API"** or **"Google Identity"**
3. Click on **"Google+ API"**
4. Click **"Enable"**

---

## Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services" → "OAuth consent screen"**
2. Select **"External"** user type (or "Internal" if you have a Google Workspace)
3. Click **"Create"**

### Fill in the App Information:

**App Information:**
- **App name:** `Animalytics`
- **User support email:** Your email address
- **App logo:** (optional) Upload your application logo

**App Domain:**
- **Application home page:** `https://yourdomain.com` (or `http://localhost:3000` for development)
- **Application privacy policy link:** `https://yourdomain.com/privacy` (or `http://localhost:3000/privacy` for development)
- **Application terms of service link:** `https://yourdomain.com/terms` (or `http://localhost:3000/terms` for development)

> **Note:** The Privacy Policy and Terms of Service pages are already created and accessible at these URLs.

**Authorized domains:**
- Add your domain: `yourdomain.com`
- For local development, you don't need to add `localhost`

**Developer contact information:**
- Add your email address

4. Click **"Save and Continue"**

### Scopes:
1. Click **"Add or Remove Scopes"**
2. Select these scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
3. Click **"Update"**
4. Click **"Save and Continue"**

### Test Users (if using External):
1. Click **"Add Users"**
2. Add your email and any test user emails
3. Click **"Save and Continue"**

4. Review and click **"Back to Dashboard"**

---

## Step 4: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services" → "Credentials"**
2. Click **"Create Credentials" → "OAuth client ID"**
3. Select **"Web application"** as the application type

### Configure the OAuth Client:

**Name:** `Animalytics Web Client`

**Authorized JavaScript origins:**
Add these URIs (each on a separate line):
```
http://localhost:3000
https://yourdomain.com
```

**Authorized redirect URIs:**
Add these URIs (each on a separate line):
```
http://localhost:3000/api/auth/callback/google
https://yourdomain.com/api/auth/callback/google
```

> **Important:** Make sure the paths are exactly `/api/auth/callback/google`

4. Click **"Create"**

---

## Step 5: Get Your Credentials

1. After creating, a modal will show your credentials:
   - **Client ID:** Something like `123456789-abcdefghijk.apps.googleusercontent.com`
   - **Client Secret:** Something like `GOCSPX-abc123xyz`
2. Copy both values - you'll need them next

---

## Step 6: Configure Environment Variables

1. Open your `.env.local` file in the project root
2. Replace the placeholder values with your actual credentials:

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-client-secret
```

> **Security Note:** Never commit `.env.local` to version control. It's already in `.gitignore`.

---

## Step 7: Enable Google OAuth in the Application

The application code has already been updated to enable Google OAuth. The configuration in `lib/auth/config.ts` will automatically enable Google OAuth when the environment variables are present.

### What Happens Automatically:

When a user signs in or signs up with Google, the application automatically:

1. **Creates User Account:**
   - Sets up the user with default "breeder" role
   - Users can change their role to veterinarian, event organizer, or admin later in account settings

2. **Creates Profile (for Breeders):**
   - Creates a breeder profile with URL-friendly slug
   - Sets default location preferences

3. **Initializes Regional Settings:**
   - Detects the user's location from their IP address
   - Sets appropriate currency, date format, time format
   - Configures measurement units based on their region
   - Sets timezone and language preferences

4. **Sets Up User Preferences:**
   - Enables email notifications
   - Configures default UI preferences
   - Prepares the account for immediate use

All of this happens seamlessly in the background, so OAuth users get the same complete setup as email/password users.

---

## Step 8: Test the Integration

### Testing Locally:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/signin`

3. Click the **"Sign in with Google"** button

4. You should be redirected to Google's consent screen

5. After approving, you should be redirected back to `/dashboard`

### Testing Sign Up:

1. Navigate to `http://localhost:3000/auth/signup`

2. Click the **"Sign up with Google"** button

3. Complete the Google authentication

4. You should be redirected to `/dashboard`

---

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem:** The redirect URI in the request doesn't match any registered redirect URIs.

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Click on your OAuth 2.0 Client ID
3. Verify the redirect URI is **exactly:** `http://localhost:3000/api/auth/callback/google`
4. Make sure there are no trailing slashes or typos

### Error: "access_denied"

**Problem:** The app is not yet verified by Google.

**Solution:**
- For development, add yourself as a test user in OAuth consent screen
- For production, submit your app for verification

### Error: "Google sign-in is not available"

**Problem:** Environment variables not set or config not enabled.

**Solution:**
1. Check `.env.local` has correct values
2. Restart your dev server after changing `.env.local`
3. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set

### Users Can't Sign In After Signing Up with Google

**Problem:** OAuth users don't get proper role/profile setup.

**Solution:**
- The application now automatically creates a breeder profile for Google OAuth users
- Users can change their role in settings after first login

---

## Production Deployment

### Before Deploying:

1. **Update OAuth Consent Screen:**
   - Change from "Testing" to "In Production"
   - This may require Google verification if you have many users

2. **Update Authorized URIs:**
   - Add your production domain to JavaScript origins
   - Add production callback URL: `https://yourdomain.com/api/auth/callback/google`

3. **Set Production Environment Variables:**
   - In your hosting platform (Vercel, Railway, etc.)
   - Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - Update `BETTER_AUTH_URL` to your production URL

4. **Verify HTTPS:**
   - Google OAuth requires HTTPS in production
   - Make sure your domain has a valid SSL certificate

---

## Security Best Practices

1. **Keep Credentials Secret:**
   - Never commit credentials to Git
   - Use environment variables
   - Rotate secrets if exposed

2. **Limit Scopes:**
   - Only request email and profile scopes
   - Don't request unnecessary permissions

3. **Validate Redirect URIs:**
   - Only add URIs you control
   - Use exact matches, not wildcards

4. **Monitor Usage:**
   - Check Google Cloud Console for unusual activity
   - Set up quotas and alerts

---

## Need Help?

- **Google OAuth Documentation:** https://developers.google.com/identity/protocols/oauth2
- **Better Auth Documentation:** https://www.better-auth.com/docs/authentication/social
- **Application Logs:** Check browser console and server logs for detailed error messages

---

## Summary

After following these steps:
- ✅ Google OAuth will be fully functional
- ✅ Users can sign in with Google
- ✅ Users can sign up with Google
- ✅ OAuth users get automatic profile creation
- ✅ Sessions are properly managed
- ✅ All authentication flows work seamlessly

The application is now ready for Google authentication!
