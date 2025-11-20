# Buyer Dashboard - UI/UX Mockups & Design System

**Last Updated:** January 13, 2025

---

## 🎨 Design Philosophy

**Inspired by:** Facebook, Instagram, Airbnb
**Principles:**
- Clean, modern interface
- Card-based design
- Smooth animations
- Touch-optimized
- Information hierarchy
- Visual feedback
- Consistent spacing

---

## 📱 Mobile Dashboard Layout

```
┌──────────────────────────────────────┐
│  ☰   Animalytics    🔔(3)   👤      │ ← Header (fixed)
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 👋 Welcome back, John!         │ │
│  │ You have 3 new messages        │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 📍 Recommended Near You        │ │
│  │                                │ │
│  │  ┌──────┐  ┌──────┐  ┌──────┐│ │
│  │  │ 🐕   │  │ 🐕   │  │ 🐕   ││ │
│  │  │ $500 │  │ $800 │  │$1200 ││ │
│  │  └──────┘  └──────┘  └──────┘│ │
│  │  ← → → →  Swipe to see more  │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 💬 Recent Conversations        │ │
│  │                                │ │
│  │  🟢 Sarah's Kennel   •  2m ago│ │
│  │  Great! When can we meet?     │ │
│  │                                │ │
│  │  ⚫ Blue Ridge Breeders  •  1h│ │
│  │  Thanks for your interest...  │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ ❤️ Saved Listings (5)          │ │
│  │                                │ │
│  │  [Grid of 4 saved animals]    │ │
│  │  [View All →]                  │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 🎯 Perfect Matches             │ │
│  │ Based on your preferences      │ │
│  │                                │ │
│  │  [Matching listings...]        │ │
│  └────────────────────────────────┘ │
│                                      │
├──────────────────────────────────────┤
│  🏠    🔍    💬    ❤️    👤         │ ← Bottom Nav
│ Home Browse  Msgs  Saved  Me        │
└──────────────────────────────────────┘
```

---

## 💻 Desktop Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  🐾 Animalytics    Search...      🔔(3)  💬(5)  👤 John         │
├──────────┬─────────────────────────────────────┬────────────────┤
│          │                                     │                │
│ MENU     │         MAIN FEED                   │  QUICK ACCESS  │
│          │                                     │                │
│ 🏠 Home  │ ┌─────────────────────────────────┐│ ┌────────────┐ │
│ 🔍 Browse│ │ 👋 Welcome back, John            ││ │ MY SAVED   │ │
│ ❤️ Saved │ │ 3 new messages • 2 new matches   ││ │            │ │
│ 💬 Inbox │ └─────────────────────────────────┘│ │ [Animal 1] │ │
│ 🐕 Animals│                                    │ │ [Animal 2] │ │
│ 📦 Orders│ ┌─────────────────────────────────┐│ │ [Animal 3] │ │
│ ⚙️ Settings│ │ 📍 RECOMMENDED NEAR YOU         ││ │            │ │
│          │ │                                 ││ │ View All→ │ │
│ ────────│ │  ┌────┐  ┌────┐  ┌────┐  ┌────┐││ └────────────┘ │
│          │ │  │ 🐕 │  │ 🐕 │  │ 🐕 │  │ 🐕 │││                │
│ FILTERS  │ │  │$500│  │$800│  │$1.2k  │$2k│││ ┌────────────┐ │
│          │ │  └────┘  └────┘  └────┘  └────┘││ │ MESSAGES   │ │
│ 🏷️ Breeds│ └─────────────────────────────────┘│ │            │ │
│ ☑ Labrador│                                    │ │ 🟢 Sarah   │ │
│ ☑ Golden │ ┌─────────────────────────────────┐│ │ Great!...  │ │
│          │ │ 💬 RECENT CONVERSATIONS         ││ │            │ │
│ 💰 Price │ │                                 ││ │ ⚫ Blue...  │ │
│ $0 - $2k │ │ [Conversation 1 - Full width]  ││ │ Thanks... │ │
│ ━━━━━━━ │ │ [Conversation 2 - Full width]  ││ │            │ │
│          │ │ [Conversation 3 - Full width]  ││ │ View All→ │ │
│ 📍 Location│ └─────────────────────────────────┘│ └────────────┘ │
│ ○ 50 mi  │                                    │                │
│          │ ┌─────────────────────────────────┐│ ┌────────────┐ │
│          │ │ 🎯 PERFECT MATCHES              ││ │ QUICK      │ │
│          │ │                                 ││ │ ACTIONS    │ │
│          │ │ [Match 1 - Card]                ││ │            │ │
│          │ │ [Match 2 - Card]                ││ │ + New      │ │
│          │ │ [Match 3 - Card]                ││ │   Search   │ │
│          │ └─────────────────────────────────┘│ │ 📋 Saved   │ │
│          │                                     │ │   Searches │ │
│          │                                     │ │ 🔔 Alerts  │ │
└──────────┴─────────────────────────────────────┴────────────────┘
```

---

## 🎯 Individual Component Designs

### 1. Listing Card (Mobile)

```
┌──────────────────────────────┐
│ ┌──────────────────────────┐ │
│ │                          │ │
│ │      [Animal Photo]      │ │
│ │                          │ │
│ │        (16:9 ratio)      │ │
│ └──────────────────────────┘ │
│                              │
│ ❤️ Golden Retriever Puppy    │  ← Save heart (top right)
│ ⭐⭐⭐⭐⭐ Certified Breeder  │
│                              │
│ 📍 Los Angeles, CA           │
│ 🎂 8 weeks old               │
│ 💰 $1,200                    │
│                              │
│ ┌────────────┐  ┌──────────┐│
│ │ 💬 Message │  │ View →   ││
│ └────────────┘  └──────────┘│
└──────────────────────────────┘
```

### 2. Conversation Preview

```
┌────────────────────────────────┐
│ 🟢 Sarah's Premium Kennels     │ ← Online indicator
│    @sarahskennels              │
│                                │
│ Great! When can we meet the... │ ← Last message preview
│                                │
│ 2 minutes ago          [2]     │ ← Timestamp + unread badge
└────────────────────────────────┘
```

### 3. Message Thread (Mobile)

```
┌──────────────────────────────┐
│ ← Sarah's Kennels      ⋮     │ ← Header with back + menu
├──────────────────────────────┤
│                              │
│  ┌────────────────────────┐ │
│  │ Golden Retriever Puppy │ │ ← Listing context card
│  │ $1,200 • 8 weeks      │ │
│  └────────────────────────┘ │
│                              │
│      ┌──────────────┐        │
│      │ Hi! Is this  │        │ ← Their message
│      │ still avail? │        │
│      └──────────────┘        │
│      10:30 AM                │
│                              │
│  ┌──────────────┐            │
│  │ Yes! Would   │            │ ← My message
│  │ you like to  │            │
│  │ schedule a   │            │
│  │ visit?       │            │
│  └──────────────┘            │
│  10:32 AM ✓✓                │
│                              │
│      ┌──────────────┐        │
│      │ That would be│        │
│      │ great! What  │        │
│      │ times work?  │        │
│      └──────────────┘        │
│      10:35 AM                │
│                              │
│  ┌────────────────┐          │
│  │ How about      │          │
│  │ tomorrow at 2? │          │
│  └────────────────┘          │
│  10:37 AM ✓                 │
│                              │
├──────────────────────────────┤
│ Type a message...  📎  📷   │ ← Message input
└──────────────────────────────┘
```

### 4. My Animals Card

```
┌────────────────────────────┐
│ ┌────────────────────────┐ │
│ │   [Animal Photo]       │ │
│ └────────────────────────┘ │
│                            │
│ 🐕 Max                     │
│ Golden Retriever • Male    │
│                            │
│ Owned since: Jan 2024      │
│ Breeder: Sarah's Kennels   │
│                            │
│ ┌──────────┐  ┌──────────┐│
│ │ Health   │  │ Contact  ││
│ │ Records  │  │ Breeder  ││
│ └──────────┘  └──────────┘│
└────────────────────────────┘
```

### 5. Purchase History Card

```
┌────────────────────────────────┐
│ Purchase #12345                │
│ ────────────────────────────   │
│                                │
│ Golden Retriever Puppy         │
│ Seller: Sarah's Kennels        │
│                                │
│ 💰 $1,200.00                   │
│ 📅 Purchased: Jan 15, 2024     │
│ 📦 Picked up: Jan 20, 2024     │
│                                │
│ Status: ✅ Completed           │
│                                │
│ ┌────────────┐ ┌─────────────┐│
│ │ View       │ │ Leave       ││
│ │ Details    │ │ Review      ││
│ └────────────┘ └─────────────┘│
└────────────────────────────────┘
```

---

## 🎭 Interaction States

### Button States

```typescript
// Primary Button
default:  bg-primary text-white shadow-sm
hover:    bg-primary-dark shadow-md transform-scale-105
active:   bg-primary-darker shadow-sm transform-scale-95
disabled: bg-gray-300 text-gray-500 cursor-not-allowed

// Secondary Button
default:  border-2 border-primary text-primary
hover:    bg-primary-light border-primary-dark
active:   bg-primary border-primary-darker text-white
```

### Card Hover Effects

```typescript
default: shadow-sm
hover:   shadow-lg transform-translateY(-2px) border-primary-light
active:  shadow-md transform-translateY(0)
```

### Loading States

```
┌──────────────────────┐
│ ▓▓▓▓░░░░░░░░░░░░░░  │ ← Skeleton loader
│ ▓▓░░░░░░░░           │
│ ▓▓▓▓▓░░░░░░░         │
└──────────────────────┘
```

---

## 🌈 Color System

```typescript
// Primary Colors
primary: {
  50:  '#EFF6FF',  // Very light blue
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6',  // Main primary
  600: '#2563EB',
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A8A',
}

// Success Colors
success: {
  50:  '#F0FDF4',
  500: '#10B981',  // Main success
  900: '#064E3B',
}

// Warning Colors
warning: {
  50:  '#FFFBEB',
  500: '#F59E0B',  // Main warning
  900: '#78350F',
}

// Error Colors
error: {
  50:  '#FEF2F2',
  500: '#EF4444',  // Main error
  900: '#7F1D1D',
}

// Neutral Colors
gray: {
  50:  '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
}
```

---

## 📐 Spacing System

```typescript
// Tailwind spacing scale
0:   '0px',
1:   '0.25rem',  // 4px
2:   '0.5rem',   // 8px
3:   '0.75rem',  // 12px
4:   '1rem',     // 16px  ← Base unit
5:   '1.25rem',  // 20px
6:   '1.5rem',   // 24px
8:   '2rem',     // 32px
10:  '2.5rem',   // 40px
12:  '3rem',     // 48px
16:  '4rem',     // 64px

// Component Spacing
Card padding:    p-4 md:p-6
Card gap:        gap-4
Section gap:     gap-6 md:gap-8
Page padding:    px-4 md:px-6 lg:px-8
```

---

## ✨ Animations

```typescript
// Transitions
transition-all:     'all 200ms ease-in-out'
transition-colors:  'colors 150ms ease-in-out'
transition-shadow:  'shadow 200ms ease-in-out'
transition-transform: 'transform 150ms ease-in-out'

// Hover Animations
card-hover: {
  transform: 'translateY(-4px)',
  shadow: 'lg',
  borderColor: 'primary-200',
}

// Loading Animations
spin:     'animate-spin'
pulse:    'animate-pulse'
bounce:   'animate-bounce'
```

---

## 📱 Touch Interactions

### Swipe Gestures

```
Swipe Left on Message:  → Archive
Swipe Right on Message: → Mark Unread
Swipe Left on Listing:  → Remove from Saved
Pull Down:              → Refresh
```

### Long Press

```
Long press on listing:  → Quick Actions Menu
Long press on message:  → Message Options
```

---

## 🔔 Notification Badges

```
┌─────────┐
│  💬(3)  │  ← Unread count badge
└─────────┘

Styles:
- Background: bg-red-500
- Text: text-white text-xs font-bold
- Shape: rounded-full
- Size: min-w-5 h-5
- Position: absolute top-0 right-0
```

---

## 📊 Data Visualization

### Activity Timeline

```
┌────────────────────────────┐
│ January 2024               │
│                            │
│ ● Purchased Max            │
│ │ Jan 20 • $1,200          │
│ │                          │
│ ● Saved 3 listings         │
│ │ Jan 15                   │
│ │                          │
│ ● Contacted Sarah          │
│   Jan 10                   │
│                            │
│ December 2023              │
│                            │
│ ● Joined Animalytics       │
│   Dec 28                   │
└────────────────────────────┘
```

### Stats Cards

```
┌──────────┐ ┌──────────┐ ┌──────────┐
│    5     │ │   12     │ │    2     │
│ Saved    │ │ Viewed   │ │ Purchased│
│ Listings │ │ Today    │ │ Animals  │
└──────────┘ └──────────┘ └──────────┘
```

---

## 🎯 Empty States

### No Saved Listings

```
┌────────────────────────────┐
│                            │
│        ❤️                  │
│                            │
│   No saved listings yet    │
│                            │
│  Start browsing to save    │
│  your favorite animals     │
│                            │
│  ┌──────────────────┐     │
│  │  Browse Listings │     │
│  └──────────────────┘     │
│                            │
└────────────────────────────┘
```

### No Messages

```
┌────────────────────────────┐
│                            │
│        💬                  │
│                            │
│   No conversations yet     │
│                            │
│  Contact a breeder to      │
│  start chatting            │
│                            │
│  ┌──────────────────┐     │
│  │  Find Animals    │     │
│  └──────────────────┘     │
│                            │
└────────────────────────────┘
```

---

## 🚀 Performance Considerations

### Image Optimization

```typescript
// Use Next.js Image component
<Image
  src={animalPhoto}
  alt="Animal"
  width={400}
  height={300}
  className="object-cover"
  loading="lazy"  // Lazy load images
  placeholder="blur"  // Show blur while loading
/>
```

### List Virtualization

```typescript
// Use react-window for large lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={listings.length}
  itemSize={150}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <ListingCard listing={listings[index]} />
    </div>
  )}
</FixedSizeList>
```

---

## 🎨 Component Library Usage

```typescript
// shadcn/ui components to use:
- Card, CardHeader, CardContent, CardFooter
- Button, IconButton
- Avatar, AvatarImage, AvatarFallback
- Badge, StatusBadge
- Dialog, Sheet, Drawer
- Tabs, TabsList, TabsTrigger, TabsContent
- Input, Textarea, Select
- Skeleton (loading states)
- Toast (notifications)
- ScrollArea
- Separator
```

---

**Design Status:** Ready for Implementation
**Next Step:** Begin component development using this design system

