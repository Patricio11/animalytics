# Google OAuth Submission - Quick Reference

This document provides the essential URLs and information needed for submitting Animalytics to Google for OAuth verification.

---

## Essential URLs

### Development (Testing)
- **Application Homepage:** `http://localhost:3000`
- **Privacy Policy:** `http://localhost:3000/privacy`
- **Terms of Service:** `http://localhost:3000/terms`
- **OAuth Callback URL:** `http://localhost:3000/api/auth/callback/google`

### Production
- **Application Homepage:** `https://yourdomain.com`
- **Privacy Policy:** `https://yourdomain.com/privacy`
- **Terms of Service:** `https://yourdomain.com/terms`
- **OAuth Callback URL:** `https://yourdomain.com/api/auth/callback/google`

---

## OAuth Consent Screen Information

### App Information
- **App Name:** Animalytics
- **User Support Email:** support@animalytics.co
- **Developer Contact Email:** Your email address

### Scopes Required
The following OAuth scopes are requested:
- `openid` - Required for authentication
- `userinfo.email` - To identify the user
- `userinfo.profile` - To get user's name and profile picture

### Why We Need These Scopes
Animalytics is a breeding management platform that requires user identification to:
- Create and manage user accounts
- Provide personalized breeding program management
- Enable secure data storage per user
- Allow users to sign in without remembering passwords

We request the minimum necessary permissions and do not request access to any sensitive Google services (Gmail, Drive, Calendar, etc.).

---

## Application Description

**Short Description (140 characters max):**
Professional breeding management platform for animal breeders, veterinarians, and event organizers.

**Long Description:**
Animalytics is a comprehensive breeding management platform designed for professional animal breeders, veterinarians, and event organizers. Our application helps users:

- Manage animal profiles with detailed health records
- Track breeding cycles and progesterone levels
- Analyze breeding performance with AI-powered insights
- Monitor health records and veterinary appointments
- Generate reports and analytics
- Collaborate with veterinarians and other professionals

Users sign in with Google to access their personalized breeding program data securely. We only use Google OAuth for authentication purposes and do not access any other Google services.

---

## Privacy & Data Practices

### Data Collection
We collect and store:
- User profile information (name, email from Google)
- Animal breeding records entered by the user
- Health records and veterinary information
- Usage analytics to improve the service

### Data Usage
- **Authentication:** Email is used for account identification
- **Communication:** Email for account notifications and support
- **Personalization:** Name and profile picture for user interface
- **No Third-Party Sharing:** We do not sell or share user data with third parties

### Data Security
- All data encrypted in transit (HTTPS/TLS)
- Secure password hashing for email/password users
- Regular security audits
- Database backups and redundancy
- Access controls and authentication

### User Rights
Users can:
- Access their data at any time
- Export their data in portable format
- Delete their account and all associated data
- Update their information
- Opt out of marketing communications

---

## Verification Requirements

### Domain Verification
1. Add your domain to Google Search Console
2. Verify ownership through DNS or HTML file upload
3. Add verified domain to OAuth consent screen

### Privacy Policy Requirements ✅
- ✅ Publicly accessible at `/privacy`
- ✅ Describes data collection practices
- ✅ Explains how data is used
- ✅ Details data sharing policies
- ✅ Includes user rights and choices
- ✅ Contact information provided

### Terms of Service Requirements ✅
- ✅ Publicly accessible at `/terms`
- ✅ Defines acceptable use
- ✅ Describes service limitations
- ✅ Includes dispute resolution
- ✅ Contact information provided

---

## Testing Instructions for Google Reviewers

### How to Test the Application:

1. **Navigate to:** `https://yourdomain.com/auth/signin`

2. **Click:** "Continue with Google" button

3. **Expected Flow:**
   - Redirect to Google consent screen
   - Request permissions: openid, email, profile
   - After approval, redirect to `/dashboard`
   - User sees their breeding management dashboard

4. **Features to Test:**
   - User profile shows Google name and picture
   - User can manage animal records
   - User can view health records
   - User can access calculators and tools
   - User can sign out and sign back in

5. **Data Access:**
   - Only profile information (name, email, picture) is accessed
   - No access to Gmail, Drive, or other Google services
   - No sensitive permissions requested

---

## Screenshots for Submission

Prepare the following screenshots (1280x720 or 1920x1080):

1. **Homepage** - Landing page showing app branding
2. **Sign-In Page** - Showing "Sign in with Google" button
3. **Consent Screen** - What users see when authorizing
4. **Dashboard** - Main application interface after login
5. **Privacy Policy Page** - Full privacy policy
6. **Terms of Service Page** - Full terms of service

---

## Contact Information

### Support
- **Email:** support@animalytics.co
- **Response Time:** Within 48 hours

### Privacy Inquiries
- **Email:** privacy@animalytics.co

### Legal
- **Email:** legal@animalytics.co

---

## Verification Timeline

**Standard Review Process:**
1. Submit application with all required information
2. Google review: 2-4 weeks typically
3. May request additional information or clarification
4. Once approved, OAuth will work for all users

**During Review:**
- App remains in "Testing" mode
- Limited to test users you specify
- Full functionality available to test users

**After Approval:**
- App moves to "In Production"
- Available to all Google users
- No user limits

---

## Checklist Before Submission

- [ ] Domain verified in Google Search Console
- [ ] Privacy Policy accessible and complete
- [ ] Terms of Service accessible and complete
- [ ] OAuth redirect URIs configured correctly
- [ ] Test users added for Google review
- [ ] App tested with test accounts
- [ ] Screenshots prepared
- [ ] Support email functional
- [ ] OAuth scopes justified in submission
- [ ] Application description written
- [ ] All required fields filled in consent screen

---

## Common Review Issues to Avoid

❌ **Privacy Policy Issues:**
- Not publicly accessible
- Missing required sections
- Outdated information
- No contact details

✅ **Our Privacy Policy:**
- Publicly accessible at `/privacy`
- Comprehensive and up-to-date
- All required sections included
- Clear contact information

❌ **Redirect URI Issues:**
- Incorrect URL format
- HTTP instead of HTTPS in production
- Trailing slashes
- Mismatched domains

✅ **Our Redirect URIs:**
- Exact match: `/api/auth/callback/google`
- HTTPS in production
- Properly formatted
- Tested and working

❌ **Scope Issues:**
- Requesting unnecessary permissions
- Not justifying scope usage
- Asking for sensitive scopes without reason

✅ **Our Scopes:**
- Minimal required scopes only
- Clear justification provided
- No sensitive scopes requested
- Industry-standard authentication flow

---

## Additional Resources

- **Google OAuth Documentation:** https://developers.google.com/identity/protocols/oauth2
- **OAuth Verification Guide:** https://support.google.com/cloud/answer/9110914
- **Consent Screen Requirements:** https://support.google.com/cloud/answer/10311615
- **Better Auth Documentation:** https://www.better-auth.com/docs

---

## Support During Review

If Google requests additional information or modifications:

1. Check the Google Cloud Console for messages
2. Review the specific requirements they mention
3. Make necessary updates to the application
4. Update documentation if needed
5. Resubmit for review

All pages (Privacy Policy, Terms of Service) are built with the application and will automatically update when you deploy changes.

---

**Last Updated:** January 13, 2025

**Application Status:** Ready for Google OAuth Submission ✅
