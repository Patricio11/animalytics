# 🛒 Marketplace Public Migration Plan

**Goal:** Make marketplace and animal profiles public while gating contact/purchase actions

**Current State:** Marketplace is in `(breeder)` folder (requires login)  
**Target State:** Marketplace in `(public)` folder (browse without login, login to contact)

---

## 📊 Current Structure

```
app/(breeder)/marketplace/
├── page.tsx                    # Marketplace listing page
├── [id]/page.tsx              # Animal detail page
└── _create_deprecated/        # Old create page
```

**Problem:** All in `(breeder)` = Requires authentication

---

## ✅ Migration Strategy

### **Phase 1: Copy to Public** ✅
Move marketplace pages to `(public)` folder

### **Phase 2: Remove "Create Listing" Button** ✅
Public users shouldn't see "Create Listing" - that's for logged-in breeders only

### **Phase 3: Add Authentication Gates** ✅
Add "Sign in to contact" prompts on:
- Contact Breeder button
- Make Offer button  
- Save/Favorite button
- Purchase/Reserve button

### **Phase 4: Update Navigation** ✅
Add marketplace links to:
- Public header
- Landing page menu

---

## 🎯 User Flows

### **Public User (Not Logged In)**
1. Browse marketplace ✅
2. Search and filter ✅
3. View animal details ✅
4. Click "Contact Breeder" → **Redirect to Sign In** ⚠️
5. Click "Make Offer" → **Redirect to Sign In** ⚠️

### **Logged-In User (Buyer)**
1. Browse marketplace ✅
2. Contact breeders ✅
3. Make offers ✅
4. Save favorites ✅

### **Logged-In Breeder**
1. Browse marketplace ✅
2. Create listings ✅ (from breeder dashboard)
3. Manage own listings ✅
4. Contact other breeders ✅

---

## 📁 Files to Create/Modify

### **Create:**
1. `app/(public)/marketplace/page.tsx` - Public marketplace (no "Create" button)
2. `app/(public)/marketplace/[id]/page.tsx` - Public animal detail
3. `components/marketplace/AuthGate.tsx` - Sign-in prompt component

### **Modify:**
1. `components/layout/PublicHeader.tsx` - Add marketplace link
2. Landing page - Add marketplace to menu

### **Keep in (breeder):**
- Original marketplace pages (for breeder-specific features)
- Create listing functionality

---

## 🔐 Authentication Gates

### **Component: AuthGate**
```typescript
<AuthGate
  action="contact breeder"
  fallback={<SignInPrompt />}
>
  <Button>Contact Breeder</Button>
</AuthGate>
```

### **Actions Requiring Auth:**
- ❌ Contact breeder
- ❌ Make offer
- ❌ Save favorite
- ❌ Purchase/reserve
- ❌ Send message

### **Actions Public:**
- ✅ Browse listings
- ✅ Search/filter
- ✅ View details
- ✅ View breeder profile (public)
- ✅ Share listings

---

## 🎨 UI Changes

### **Public Marketplace Page**
**Remove:**
- "Create Listing" button (top right)

**Add:**
- "Sign in to list your animals" banner (optional)

### **Animal Detail Page**
**Replace Contact Buttons With:**
```
┌─────────────────────────────────┐
│  🔒 Sign in to Contact Breeder  │
│                                 │
│  Create account or sign in to  │
│  contact this breeder          │
│                                 │
│  [Sign In] [Create Account]    │
└─────────────────────────────────┘
```

---

## 🚀 Implementation Steps

### **Step 1: Create Public Marketplace Page**
- Copy from `(breeder)/marketplace/page.tsx`
- Remove "Create Listing" button
- Keep all browsing functionality

### **Step 2: Create Public Animal Detail Page**
- Copy from `(breeder)/marketplace/[id]/page.tsx`
- Add AuthGate to contact buttons
- Show sign-in prompt for protected actions

### **Step 3: Create AuthGate Component**
- Check if user is logged in
- Show children if logged in
- Show sign-in prompt if not

### **Step 4: Update Navigation**
- Add "Marketplace" to PublicHeader
- Add to landing page menu

### **Step 5: Test Flows**
- Public browsing
- Sign-in redirects
- Post-login return to page

---

## 🧪 Testing Checklist

### **As Public User (Not Logged In)**
- [ ] Can access `/marketplace`
- [ ] Can search and filter
- [ ] Can view animal details
- [ ] See "Sign in to contact" on buttons
- [ ] Clicking contact redirects to sign-in
- [ ] After sign-in, returns to animal page

### **As Logged-In User**
- [ ] Can browse marketplace
- [ ] Can contact breeders
- [ ] Can make offers
- [ ] Can save favorites

### **As Breeder**
- [ ] Can access breeder marketplace (with create button)
- [ ] Can create listings
- [ ] Can manage listings
- [ ] Can browse public marketplace

---

## 📊 Route Structure (After Migration)

```
app/
├── (public)/
│   ├── marketplace/
│   │   ├── page.tsx           # Public browse (no create button)
│   │   └── [id]/page.tsx      # Public detail (with auth gates)
│   └── breeders/
│       ├── page.tsx           # Breeders directory
│       └── [slug]/page.tsx    # Public breeder profile
│
└── (breeder)/
    ├── marketplace/
    │   ├── page.tsx           # Breeder marketplace (with create)
    │   └── [id]/page.tsx      # Breeder manage listing
    └── ...
```

---

## 💡 Key Decisions

### **Why Keep Both Versions?**
- **Public:** Browse-only, no create button, auth gates
- **Breeder:** Full features, create/manage listings

### **Why Not Just Hide Buttons?**
- Cleaner UX
- Faster page load (no unnecessary components)
- Clear separation of concerns

### **Return URL After Sign-In**
Store current URL before redirecting:
```typescript
const returnUrl = encodeURIComponent(window.location.pathname);
router.push(`/auth/signin?returnUrl=${returnUrl}`);
```

---

## ✅ Success Criteria

- [ ] Public users can browse marketplace without login
- [ ] Contact actions prompt sign-in
- [ ] After sign-in, user returns to same page
- [ ] Breeders can still create/manage listings
- [ ] Navigation includes marketplace links
- [ ] SEO-friendly public pages

---

**Ready to implement? Let's start with Step 1!** 🚀
