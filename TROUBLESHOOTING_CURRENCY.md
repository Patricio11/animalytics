# Troubleshooting: Currency Showing Wrong Value

## 🔍 **Issue**
You see "Price (AUD)" but your settings show ZAR.

---

## ✅ **Quick Fixes**

### **1. Check Browser Console (F12)**

Open the browser console and look for these logs:
```
🔍 Fetching regional settings...
📊 Regional settings response: { success: true, data: { currency: 'ZAR', ... } }
✅ Settings loaded: { currency: 'ZAR', ... }
```

**If you see**:
- `currency: 'ZAR'` → Settings are loading correctly
- `currency: 'AUD'` or `currency: 'USD'` → Database has wrong value

### **2. Verify Database Settings**

Go to Settings → Regional tab and check:
- Currency should show: **ZAR (R South African Rand)**
- If it shows something else, update it and click "Save Changes"

### **3. Hard Refresh the Page**

After saving settings:
1. Press **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
2. This clears the cache and reloads the page
3. Check if currency updates

### **4. Check API Response**

In browser console, run:
```javascript
fetch('/api/settings/regional')
  .then(r => r.json())
  .then(data => console.log('Current settings:', data));
```

This will show what the API is returning.

---

## 🔧 **Common Causes**

### **Cause 1: Settings Not Saved**
- **Problem**: You changed settings but didn't click "Save Changes"
- **Solution**: Go to Settings → Regional → Change currency → Click "Save Changes"

### **Cause 2: Browser Cache**
- **Problem**: Old settings cached in browser
- **Solution**: Hard refresh (Ctrl + Shift + R)

### **Cause 3: Database Not Updated**
- **Problem**: Your user record doesn't have regional settings
- **Solution**: Use the fix endpoint:
  1. Go to: `http://localhost:3000/settings/fix-regional`
  2. Click "Fix My Regional Settings"
  3. Verify in Settings → Regional

### **Cause 4: Session Issue**
- **Problem**: API can't identify your user
- **Solution**: 
  1. Sign out
  2. Sign back in
  3. Check settings again

---

## 📊 **Expected Behavior**

### **When Creating Listing**:
```
Step 3: Listing Details
├─ Price (ZAR)  ← Should show YOUR currency
├─ [Input: 5000]
└─ Preview: 5,000 ZAR
```

### **When Viewing Listing**:
```
Listing Card
├─ R5,000 ZAR  ← Shows OWNER's currency
└─ (Not converted to your currency)
```

---

## 🧪 **Debug Steps**

### **Step 1: Check Console Logs**
1. Open browser console (F12)
2. Go to create listing page
3. Look for: `✅ Settings loaded: { currency: 'ZAR', ... }`

### **Step 2: Check Network Tab**
1. Open browser console (F12)
2. Go to Network tab
3. Refresh page
4. Look for `/api/settings/regional` request
5. Check response: Should have `currency: 'ZAR'`

### **Step 3: Check Database**
Run this query in your database:
```sql
SELECT 
  email,
  preferences->>'currency' as currency,
  preferences->>'timezone' as timezone
FROM users
WHERE email = 'your-email@example.com';
```

Should return:
```
currency: ZAR
timezone: Africa/Johannesburg
```

---

## 🚀 **Quick Fix Script**

If settings are still wrong, run this in browser console:
```javascript
// Update settings via API
fetch('/api/settings/regional', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    currency: 'ZAR',
    timezone: 'Africa/Johannesburg',
    locale: 'en-ZA',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    measurementUnit: 'metric',
    firstDayOfWeek: 1,
    language: 'en'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Settings updated:', data);
  window.location.reload(); // Reload page
});
```

---

## ✅ **Verification Checklist**

After fixing:
- [ ] Browser console shows: `✅ Settings loaded: { currency: 'ZAR', ... }`
- [ ] Settings → Regional shows: **ZAR (R South African Rand)**
- [ ] Create listing shows: **Price (ZAR)**
- [ ] Preview shows: **5,000 ZAR**
- [ ] No errors in console

---

## 📞 **Still Not Working?**

1. **Clear all browser data**:
   - Settings → Privacy → Clear browsing data
   - Check: Cookies, Cache
   - Time range: All time

2. **Try incognito/private window**:
   - Open incognito window
   - Log in
   - Check if currency is correct

3. **Check if API endpoint exists**:
   - Navigate to: `http://localhost:3000/api/settings/regional`
   - Should return JSON with your settings

4. **Restart dev server**:
   ```bash
   # Stop server (Ctrl + C)
   # Start again
   npm run dev
   ```

---

## 🎯 **Expected Console Output**

When everything works correctly:
```
🔍 Fetching regional settings...
📊 Regional settings response: {
  success: true,
  data: {
    currency: 'ZAR',
    timezone: 'Africa/Johannesburg',
    locale: 'en-ZA',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    measurementUnit: 'metric',
    firstDayOfWeek: 1,
    language: 'en'
  }
}
✅ Settings loaded: { currency: 'ZAR', ... }
```

Then in the form you should see: **Price (ZAR)**

---

## 💡 **Pro Tip**

Keep the browser console open (F12) while testing. The logs will tell you exactly what's happening with your regional settings!
