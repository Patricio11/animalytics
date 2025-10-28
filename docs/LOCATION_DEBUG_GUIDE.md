# Location Detection Debug Guide

## 🔍 Issue
New users signing up from South Africa are getting UTC/USD instead of SAST/ZAR.

## 🎯 Root Cause
**Localhost IP Detection Problem**: When running on `localhost:3000`, the location detection API cannot get your real public IP address. It sees the server's IP (127.0.0.1) instead of your actual South African IP.

---

## ✅ Solution Options

### **Option 1: Manual Update (Easiest)**
1. Go to `http://localhost:3000/settings`
2. Click **Regional** tab
3. Manually change:
   - Currency: **ZAR**
   - Timezone: **Africa/Johannesburg (SAST, UTC+02:00)**
   - Date Format: **DD/MM/YYYY**
   - Time Format: **24-hour**
4. Click **Save Changes**

### **Option 2: Use Test Page**
1. Go to `http://localhost:3000/test-location`
2. Click **"Detect My Location"**
3. Check console logs (F12)
4. If location detected correctly, click **"Initialize Settings"**
5. Verify in Settings → Regional

### **Option 3: Force South African Settings**
Use the fix endpoint:
```bash
# While logged in
curl -X POST http://localhost:3000/api/settings/regional/fix
```

Or navigate to: `http://localhost:3000/settings/fix-regional`

---

## 🧪 Testing & Debugging

### **Check Console Logs**
When signing up, check browser console (F12) for:
```
Signup result: {...}
🔐 Checking session...
✅ Session found for user: abc123
🌐 Client IP: xxx.xxx.xxx.xxx
🌍 Detecting location from IP: xxx.xxx.xxx.xxx
📍 Location API response: {...}
✅ Location detected: { country: 'South Africa', ... }
📍 Regional preferences: { currency: 'ZAR', ... }
Regional response status: 200
✅ Regional settings initialized: {...}
```

### **Common Issues**

#### 1. **No IP Detected (Localhost)**
```
🌐 Client IP: not detected
```
**Solution**: The API will auto-detect, but from server side (might not be accurate)

#### 2. **Session Not Found**
```
❌ No session found
Regional response status: 401
```
**Solution**: Increase delay in signup flow (already set to 1000ms)

#### 3. **Location API Rate Limit**
```
Location API error: rate limit exceeded
```
**Solution**: ipapi.co has 1000 requests/day limit. Wait or use manual update.

#### 4. **Wrong Country Detected**
```
✅ Location detected: { country: 'United States', ... }
```
**Solution**: VPN or proxy might be affecting detection. Use manual update.

---

## 🚀 Production Deployment

### **Why It Will Work in Production**
1. **Real Public IPs**: Production servers get actual client IPs
2. **Proper Headers**: Cloudflare/Nginx forward real client IPs
3. **No Localhost**: Users access via real domain

### **Expected Flow in Production**
```
User in South Africa signs up
  ↓
Server gets real SA IP (e.g., 105.xxx.xxx.xxx)
  ↓
ipapi.co detects: South Africa (ZA)
  ↓
Applies preset: ZAR, SAST, DD/MM/YYYY
  ↓
Saves to database
  ↓
User sees correct settings ✅
```

---

## 📝 Current Implementation

### **Signup Flow** (`app/auth/signup/page.tsx`)
```typescript
// 1. Sign up user
await authClient.signUp.email({...});

// 2. Wait for session
await new Promise(resolve => setTimeout(resolve, 1000));

// 3. Initialize regional settings
await fetch('/api/settings/regional/initialize', {
  method: 'POST',
  credentials: 'include',
});
```

### **Initialize Endpoint** (`app/api/settings/regional/initialize/route.ts`)
```typescript
// 1. Check session
const session = await auth.api.getSession();

// 2. Get client IP
const clientIp = getClientIp(request.headers);

// 3. Detect location
const regionalPreferences = await detectAndGetRegionalPreferences(clientIp);

// 4. Update database
await db.update(users).set({ preferences: regionalPreferences });
```

### **Location Detection** (`lib/utils/location.ts`)
```typescript
// 1. Call ipapi.co
const response = await fetch(`https://ipapi.co/${ip}/json/`);

// 2. Parse response
const data = await response.json();

// 3. Get preset for country
const preset = REGIONAL_PRESETS[data.country_code];

// 4. Return regional settings
return preset; // { currency: 'ZAR', timezone: 'Africa/Johannesburg', ... }
```

---

## 🔧 Localhost Workaround

### **Option A: Use ngrok**
```bash
# Install ngrok
ngrok http 3000

# Use the ngrok URL instead of localhost
https://abc123.ngrok.io
```

### **Option B: Deploy to Vercel/Netlify**
```bash
# Deploy to Vercel
vercel deploy

# Test with real domain
https://your-app.vercel.app
```

### **Option C: Mock Location (Development)**
Add to `.env.local`:
```env
MOCK_LOCATION_COUNTRY=ZA
```

Then update `lib/utils/location.ts`:
```typescript
export async function detectUserLocation(ipAddress?: string) {
  // Development mock
  if (process.env.MOCK_LOCATION_COUNTRY) {
    return {
      country: 'South Africa',
      countryCode: process.env.MOCK_LOCATION_COUNTRY,
      timezone: 'Africa/Johannesburg',
      currency: 'ZAR',
    };
  }
  
  // Real detection...
}
```

---

## 📊 Verification Checklist

After signup, verify:

- [ ] Browser console shows location detection logs
- [ ] No 401 errors (session established)
- [ ] Location API returns South Africa (ZA)
- [ ] Regional preferences show ZAR, SAST
- [ ] Settings → Regional shows correct values
- [ ] Database has correct preferences:
  ```sql
  SELECT preferences FROM users WHERE email = 'test@example.com';
  ```

---

## 🎯 Quick Fix for Current User

**Fastest Solution**:
1. Navigate to: `http://localhost:3000/settings`
2. Click **Regional** tab
3. Change to South African settings
4. Click **Save Changes**
5. Done! ✅

**Alternative**:
1. Navigate to: `http://localhost:3000/test-location`
2. Click **Initialize Settings**
3. Check Settings → Regional

---

## 📞 Support

If location detection still doesn't work:

1. **Check Console Logs**: Look for errors in browser console (F12)
2. **Test API Directly**: Visit `http://localhost:3000/api/location/detect`
3. **Check Database**: Verify preferences in PostgreSQL
4. **Manual Override**: Use Settings → Regional to set manually

**Remember**: In production with real IPs, this will work automatically! The localhost issue is development-only.
