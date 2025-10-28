# 🚀 Breeder Profile - Quick Start Guide

**Dev Server:** ✅ Running on http://localhost:3000

---

## 📍 Where to Go

### Test Page (Start Here!)
```
http://localhost:3000/profile/test
```
This page will help you test all the new components and API routes.

### Original Profile Page (To Be Refactored)
```
http://localhost:3000/profile/breeder
```
This is the old page with mock data. We'll refactor this in Phase 6.

---

## 🎯 Quick Test (5 Minutes)

### Step 1: Open Test Page
Navigate to: `http://localhost:3000/profile/test`

### Step 2: Initialize Profile
You should see a card saying "No Profile". Click the **"Initialize Test Profile"** button.

**Expected Result:**
- ✅ Success toast appears
- ✅ Page refreshes automatically
- ✅ Profile data appears in JSON preview
- ✅ Components render below

### Step 3: Verify Components

Scroll down and you should see:

**1. ProfileBanner Component**
- Large banner image (320px height)
- Gradient overlay
- Looks professional

**2. ProfileHeader Component**
- Avatar image (or fallback letter)
- Display name: "Your Name Kennels" (or similar)
- Tagline below name
- 4 colored badges (KYC, Background, Health, Premium)
- Location, years in business, website link

**3. ProfileStats Component**
- 4 cards in a grid:
  - Profile Views: 1,247
  - Total Sales: 156
  - Avg. Rating: 4.9
  - Response Rate: 98%

### Step 4: Test Edit Dialog

Click the **"Test Edit Dialog"** button.

**Expected Result:**
- ✅ Modal dialog opens
- ✅ 3 tabs visible: Basic Info, Business, Policies
- ✅ Form fields populated with current data

**Try This:**
1. Change the "Display Name" field
2. Change the "Tagline" field
3. Click **"Save Changes"**
4. Success toast should appear
5. Click **"Refresh Data"** to see your changes

---

## ✅ Success Checklist

If you can do all of these, everything is working:

- [ ] Test page loads without errors
- [ ] Can initialize profile
- [ ] See profile data in JSON
- [ ] Banner component renders
- [ ] Header component shows with badges
- [ ] Stats cards display correctly
- [ ] Edit dialog opens
- [ ] Can navigate between tabs
- [ ] Can save changes
- [ ] Changes persist after refresh

---

## 🐛 Troubleshooting

### "Unauthorized" Error
**Solution:** Sign in first at `/auth/signin` with `breeder@test.com`

### Components Not Showing
**Solution:** Check browser console (F12) for errors

### "Profile already exists" Error
**Solution:** Good! Your profile is already created. Just refresh the page.

### Database Error
**Solution:** Run `npm run db:push` to sync schema

---

## 📊 What You're Testing

### Backend (API Routes)
- ✅ `GET /api/breeder/profile` - Fetch profile
- ✅ `POST /api/breeder/profile/initialize` - Create profile
- ✅ `PUT /api/breeder/profile` - Update profile

### Frontend (Components)
- ✅ `ProfileBanner` - Banner image display
- ✅ `ProfileHeader` - Avatar, name, badges, info
- ✅ `ProfileStats` - 4 stat cards
- ✅ `EditProfileDialog` - Edit form with tabs

### Integration
- ✅ TanStack Query for data fetching
- ✅ Mutations for updates
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling

---

## 🎨 Visual Guide

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    BANNER IMAGE                         │
│                    (320px height)                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
         ┌───────────────────────────────────┐
         │                                   │
         │   ┌─────┐                        │
         │   │     │  Display Name          │
         │   │ AVA │  Tagline               │
         │   │ TAR │  [Badges]              │
         │   │     │  Location | Years | Web│
         │   └─────┘                        │
         │                                   │
         └───────────────────────────────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Views   │ │  Sales   │ │  Rating  │ │ Response │
│  1,247   │ │   156    │ │   4.9    │ │   98%    │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

### Component Hierarchy

```
TestPage
├── API Status Card
├── Profile Data (JSON)
└── Component Previews
    ├── ProfileBanner
    ├── ProfileHeader
    │   ├── Avatar
    │   ├── Display Name
    │   ├── Tagline
    │   ├── Verification Badges
    │   └── Quick Info
    ├── ProfileStats
    │   ├── Profile Views Card
    │   ├── Total Sales Card
    │   ├── Avg Rating Card
    │   └── Response Rate Card
    └── EditProfileDialog (Modal)
        ├── Basic Info Tab
        ├── Business Tab
        └── Policies Tab
```

---

## 📱 Responsive Testing

Test on different screen sizes:

### Desktop (1920x1080)
- 4 stat cards in a row
- Banner full width
- Header with avatar on left

### Tablet (768x1024)
- 2 stat cards per row
- Banner full width
- Header stacked

### Mobile (375x667)
- 2 stat cards per row (smaller)
- Banner full width
- Header fully stacked
- Edit dialog full screen

---

## 🎯 Next Actions

After testing successfully:

1. **Report Results:** Let me know if everything works!

2. **Phase 5:** We'll add image upload functionality
   - Banner upload with UploadThing
   - Logo upload with UploadThing
   - Image preview

3. **Phase 6:** We'll refactor the main profile page
   - Replace mock data
   - Use new components
   - Fix layout issues
   - Add edit functionality

---

## 📞 Need Help?

If something doesn't work:

1. Check browser console (F12)
2. Check network tab for API errors
3. Check terminal for server errors
4. Read `BREEDER_PROFILE_TESTING.md` for detailed troubleshooting

---

**Happy Testing! 🎉**

Start here: `http://localhost:3000/profile/test`
