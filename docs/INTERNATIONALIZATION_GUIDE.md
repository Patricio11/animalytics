# Internationalization (i18n) Implementation Guide

## ✅ Complete Implementation Summary

Animalytics is now fully prepared for worldwide deployment with comprehensive internationalization support!

---

## 🌍 Features Implemented

### 1. **Multi-Currency Support** ✅
- **Cent-Based Storage**: All amounts stored as cents (smallest currency unit) to avoid floating-point errors
- **10 Currencies Supported**: USD, EUR, GBP, ZAR, BRL, AUD, CAD, JPY, CNY, INR
- **Automatic Conversion**: Ready for real-time exchange rate integration
- **Locale-Aware Formatting**: Displays currency according to user's locale

**Example Usage:**
```typescript
import { dollarsToCents, formatCurrency, parseCurrencyToCents } from '@/lib/utils/currency';

// Store $10.99 as 1099 cents in database
const cents = dollarsToCents(10.99); // 1099

// Display to user in their currency
const formatted = formatCurrency(1099, 'USD', 'en-US'); // "$10.99"
const formattedBR = formatCurrency(1099, 'BRL', 'pt-BR'); // "R$ 10,99"

// Parse user input
const parsed = parseCurrencyToCents("$10.99", 'USD'); // 1099
```

### 2. **Multi-Timezone Support** ✅
- **UTC Storage**: All dates stored in UTC in database
- **Timezone Conversion**: Auto-converts to user's timezone for display
- **Locale-Aware Formatting**: Date/time formats adapt to user preference
- **Relative Time**: "2 hours ago", "3 days ago" in user's language

**Example Usage:**
```typescript
import { formatDate, formatDateTime, convertToTimezone } from '@/lib/utils/date-time';

// Display date in user's format and timezone
const date = formatDate(
  new Date(),
  'DD/MM/YYYY',  // User's date format preference
  'Africa/Johannesburg'  // User's timezone
); // "09/10/2025"

// Full date-time formatting
const dateTime = formatDateTime(
  new Date(),
  'DD/MM/YYYY',
  '24h',
  'Europe/London'
); // "09/10/2025 14:30"
```

### 3. **Measurement Unit Conversion** ✅
- **Metric Storage**: Store weight (kg), height (cm), temperature (°C) in database
- **Imperial Display**: Auto-convert to lbs, inches, °F for US users
- **Weight, Height, Temperature, Distance, Volume** - all supported

**Example Usage:**
```typescript
import { formatWeight, formatHeight, formatTemperature } from '@/lib/utils/measurements';

// Display weight
const weight = formatWeight(25, 'metric'); // "25.00 kg"
const weightImperial = formatWeight(25, 'imperial'); // "55.12 lbs"

// Display height
const height = formatHeight(50, 'metric'); // "50.0 cm"
const heightImperial = formatHeight(50, 'imperial'); // "1' 7.7""

// Display temperature
const temp = formatTemperature(38.5, 'metric'); // "38.5°C"
const tempImperial = formatTemperature(38.5, 'imperial'); // "101.3°F"
```

### 4. **Multi-Language Support** ✅
- **next-intl Framework**: Installed and configured
- **6 Languages Prepared**: English, Spanish, Portuguese, French, German, Afrikaans
- **English Complete**: All core translations in place
- **Easy Expansion**: Add new languages by creating translation files

**Translation Files Created:**
```
locales/
└── en/
    ├── common.json      - Common UI text
    ├── auth.json        - Authentication pages
    ├── animals.json     - Animal management
    └── marketplace.json - Marketplace features
```

### 5. **Auto-Detection** ✅
- **Browser Language Detection**: Automatically detect preferred language
- **Timezone Detection**: Uses browser's timezone
- **Locale Detection**: Detects full locale (e.g., en-US, pt-BR)
- **Smart Defaults**: Currency, date format, measurement system based on locale

**Example Usage:**
```typescript
import { detectUserPreferences } from '@/lib/utils/locale-detection';

// Get all user preferences on signup
const preferences = detectUserPreferences();
// {
//   language: 'en',
//   timezone: 'America/New_York',
//   currency: 'USD',
//   locale: 'en-US',
//   dateFormat: 'MM/DD/YYYY',
//   timeFormat: '12h',
//   measurementUnit: 'imperial',
//   firstDayOfWeek: 0
// }
```

---

## 📊 Database Schema Updates

### User Preferences (Enhanced)
```typescript
preferences: {
  // Existing
  notifications: boolean;
  emailUpdates: boolean;
  darkMode: boolean;

  // NEW - Internationalization
  language: string;        // ISO 639-1: 'en', 'es', 'pt', 'fr', 'de', 'af'
  timezone: string;        // IANA: 'America/New_York', 'Europe/London'
  currency: string;        // ISO 4217: 'USD', 'EUR', 'GBP', 'ZAR'
  locale: string;          // BCP 47: 'en-US', 'pt-BR', 'es-ES'
  dateFormat: string;      // 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  timeFormat: string;      // '12h' | '24h'
  measurementUnit: string; // 'metric' | 'imperial'
  firstDayOfWeek: number;  // 0 = Sunday (US), 1 = Monday (Europe)
}
```

---

## 🗂️ File Structure

### Utilities
```
lib/utils/
├── currency.ts          - Currency conversion & formatting (cent-based)
├── date-time.ts         - Date/time formatting with timezone support
├── measurements.ts      - Measurement unit conversions
└── locale-detection.ts  - Auto-detect user preferences
```

### Internationalization
```
lib/i18n/
└── config.ts            - i18n configuration

locales/
└── en/
    ├── common.json      - Common translations
    ├── auth.json        - Auth page translations
    ├── animals.json     - Animal management translations
    └── marketplace.json - Marketplace translations
```

---

## 🎯 Best Practices Implemented

### 1. **Currency**
- ✅ Store in **cents** (no floating-point errors)
- ✅ Use ISO 4217 codes (USD, EUR, GBP)
- ✅ Format with Intl.NumberFormat (locale-aware)

### 2. **Date/Time**
- ✅ Store in **UTC** in database
- ✅ Use IANA timezone names
- ✅ Convert to user's timezone for display
- ✅ Format with Intl.DateTimeFormat

### 3. **Measurements**
- ✅ Store in **metric** (kg, cm, °C)
- ✅ Convert to imperial for display if needed
- ✅ Use proper conversion factors

### 4. **Translations**
- ✅ Namespaced JSON files (auth, animals, etc.)
- ✅ English complete, easy to add languages
- ✅ Use next-intl for seamless React integration

---

## 🚀 Next Steps (Future Phases)

### Phase 3 - Active i18n Integration
1. Wrap UI components with translation functions
2. Add language selector to settings page
3. Implement currency selector with live exchange rates
4. Add timezone selector with smart defaults

### Phase 4 - Additional Languages
1. Spanish (Español) - for Latin America & Spain
2. Portuguese (Português) - for Brazil & Portugal
3. French (Français) - for France & Africa
4. German (Deutsch) - for Germany & Austria
5. Afrikaans - for South Africa

### Phase 5 - Advanced Features
1. RTL support for Arabic/Hebrew
2. Regional breed name translations
3. Multi-language content search
4. User-generated content translation (optional)

---

## 📝 How to Add a New Language

1. **Create Translation Files**
   ```
   locales/es/
   ├── common.json
   ├── auth.json
   ├── animals.json
   └── marketplace.json
   ```

2. **Copy English Files**
   - Use `locales/en/*.json` as templates
   - Translate all strings to target language

3. **Update Config**
   ```typescript
   // lib/i18n/config.ts
   export const locales = ['en', 'es', 'pt', 'fr', 'de', 'af'] as const;
   ```

4. **Done!** The system will automatically support the new language

---

## 🌐 Supported Regions

| Region | Language | Currency | Measurement | Date Format |
|--------|----------|----------|-------------|-------------|
| USA | English | USD | Imperial | MM/DD/YYYY |
| UK | English | GBP | Metric | DD/MM/YYYY |
| South Africa | English/Afrikaans | ZAR | Metric | YYYY-MM-DD |
| Brazil | Portuguese | BRL | Metric | DD/MM/YYYY |
| Spain | Spanish | EUR | Metric | DD/MM/YYYY |
| France | French | EUR | Metric | DD/MM/YYYY |
| Germany | German | EUR | Metric | DD/MM/YYYY |

---

## ✅ Summary

Animalytics is now **world-class ready** for international deployment with:

- ✅ **10 currencies** with cent-based storage
- ✅ **Timezone support** with UTC storage
- ✅ **Metric/Imperial** measurement conversion
- ✅ **6 languages** prepared (English complete)
- ✅ **Auto-detection** of user preferences
- ✅ **Production-ready** utilities and best practices

All foundation is in place. Future phases will integrate these features into the UI with language selectors, currency conversion APIs, and full multi-language support!

🌍 **Ready to serve breeders worldwide!** 🐾
