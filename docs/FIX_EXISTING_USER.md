# Fix Regional Settings for Existing User

## Problem
Your existing user account shows UTC timezone and USD currency instead of South African defaults (SAST, ZAR).

## Why This Happened
The location detection was not integrated into the signup flow yet. New users signing up now will automatically get location-based settings, but your existing account needs to be fixed manually.

---

## ✅ Solution: Two Options

### **Option 1: Use the Fix Page (Easiest)**

1. Navigate to: `http://localhost:3000/settings/fix-regional`
2. Click the "Fix My Regional Settings" button
3. Your settings will be updated to South Africa defaults
4. Go to Settings → Regional to verify

### **Option 2: Call the API Directly**

Using Thunder Client, Postman, or curl:

```bash
curl -X POST http://localhost:3000/api/settings/regional/fix \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie"
```

Or in your browser console (while logged in):

```javascript
fetch('/api/settings/regional/fix', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(data => console.log(data));
```

---

## ✅ What Gets Fixed

Your account will be updated with:

| Setting | Value |
|---------|-------|
| Currency | ZAR (R) |
| Timezone | Africa/Johannesburg (SAST, UTC+02:00) |
| Date Format | DD/MM/YYYY |
| Time Format | 24-hour |
| Measurement | Metric (kg, cm, °C) |
| Language | English |
| Locale | en-ZA |
| First Day of Week | Monday |

---

## ✅ Future Users

**New users signing up will automatically get:**
- Location detection via IP address
- Regional settings based on their country
- South African users → ZAR, SAST, DD/MM/YYYY automatically

**The signup flow now includes:**
```typescript
// After successful signup
await fetch('/api/settings/regional/initialize', {
  method: 'POST'
});
```

This detects the user's location and applies the appropriate regional preset.

---

## 🧪 Test New Signup Flow

1. Sign out of your current account
2. Create a new test account from South Africa
3. After signup, check Settings → Regional
4. Should show: ZAR, SAST, DD/MM/YYYY automatically

---

## 📋 Verification Steps

After fixing your settings:

1. Go to Settings → Regional
2. Verify:
   - ✅ Currency: ZAR (R South African Rand)
   - ✅ Timezone: Africa/Johannesburg (SAST, UTC+02:00)
   - ✅ Date Format: DD/MM/YYYY
   - ✅ Time Format: 24-hour
   - ✅ Measurement: Metric

3. Check database:
```sql
SELECT 
  email,
  preferences->>'currency' as currency,
  preferences->>'timezone' as timezone,
  preferences->>'dateFormat' as date_format
FROM users
WHERE email = 'your-email@example.com';
```

---

## 🔧 Files Modified

1. **app/auth/signup/page.tsx** - Added location detection after signup
2. **app/api/settings/regional/fix/route.ts** - Manual fix endpoint (NEW)
3. **app/(breeder)/settings/fix-regional/page.tsx** - Fix UI page (NEW)

---

## 🎯 Summary

- ✅ **Existing users**: Use fix page or API endpoint
- ✅ **New users**: Automatic location detection on signup
- ✅ **South African defaults**: ZAR, SAST, DD/MM/YYYY, Metric
- ✅ **Database persistence**: All settings saved to PostgreSQL

**Your issue is now fixed!** 🚀
