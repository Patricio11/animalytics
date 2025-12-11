# 🎯 Mating Markers - Visual Guide

## What You'll See in the UI

### 1. Adding a Progesterone Reading (P4: 20 ng/mL - In Breeding Window)

```
┌─────────────────────────────────────────────────────────┐
│  Add Progesterone Reading                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Test Date: [Dec 11, 2024]  (Day 12)                  │
│  Progesterone Level: [20.0] ng/mL                      │
│  Laboratory: [VIDAS ▼]                                 │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 💚 Breeding Window Detected (P4: 20.0 ng/mL)     │ │
│  │ Mark this reading if a mating occurred on this   │ │
│  │ date                                              │ │
│  │                                                   │ │
│  │ ☐ 💙 Mark as Mating                              │ │
│  │   A breeding occurred on this date               │ │
│  │   (will show as M1, M2, etc. on chart)          │ │
│  │                                                   │ │
│  │ ☐ ✨ Mark as LAST Mating                         │ │
│  │   This was the final breeding in the fertility   │ │
│  │   window                                          │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  [Cancel]  [💜 Save Reading]                           │
└─────────────────────────────────────────────────────────┘
```

### 2. When "Mark as Last Mating" is Checked

```
┌─────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────┐ │
│  │ 💚 Breeding Window Detected (P4: 20.0 ng/mL)     │ │
│  │                                                   │ │
│  │ ☐ 💙 Mark as Mating                              │ │
│  │ ☑ ✨ Mark as LAST Mating                         │ │
│  │                                                   │ │
│  │ ┌─────────────────────────────────────────────┐ │ │
│  │ │ 🎯 Last Mating Countdown Starts!            │ │ │
│  │ │                                             │ │ │
│  │ │ Pregnancy screening tasks will be           │ │ │
│  │ │ auto-generated:                             │ │ │
│  │ │                                             │ │ │
│  │ │ • Day 28: Ultrasound + Blood test          │ │ │
│  │ │ • Day 30: Progesterone plateau check       │ │ │
│  │ │ • Day 45, 50, 55: Pregnancy monitoring     │ │ │
│  │ └─────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 3. Success Message After Marking as Last Mating

```
┌─────────────────────────────────────────────────────────┐
│  ✅ Reading saved and marked as LAST MATING!           │
│                                                         │
│  🎯 Pregnancy screening tasks have been generated!     │
│                                                         │
│  Check the Breeding Records tab for details.           │
│                                                         │
│  [OK]                                                   │
└─────────────────────────────────────────────────────────┘
```

### 4. Progesterone Chart with Mating Markers

```
Progesterone Levels Over Time
────────────────────────────────────────────────────────

40 ng/mL ┤
         │                                    🎯 LAST
35       ┤                              ╱╱╱╱╱ │ ╱╱╱╱
         │                         ╱╱╱╱╱      │
30       ┤                    ╱╱╱╱╱           │
         │               ╱╱╱╱╱    M2          │
25       ┤          ╱╱╱╱╱        │            │
         │      ╱╱╱╱╱   M1       │            │
20       ┤  ╱╱╱╱╱       │        │            │
         │╱╱╱           │        │            │
15       ┼──────────────┼────────┼────────────┼─── Breeding Window
         │              │        │            │
10       ┤              │        │            │
         │              │        │            │
5        ┤              │        │            │
         │              │        │            │
0        └──────────────┴────────┴────────────┴────
         Day 5      Day 10   Day 12      Day 14

Legend:
  M1, M2     = Regular matings (green lines)
  🎯 LAST    = Last mating (red dashed line)
  ─────      = Breeding window (15-35 ng/mL)
```

### 5. Breeding Records List (Below Chart)

```
Breeding Records
────────────────────────────────────────────────────────

┌──────────────────────────────────────────────────────┐
│ M1 - Dec 10, 2024 (natural)                         │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ M2 - Dec 12, 2024 (natural)                         │
└──────────────────────────────────────────────────────┘

┌══════════════════════════════════════════════════════┐
║ 🎯 LAST MATING - Dec 14, 2024 (natural)            ║
╚══════════════════════════════════════════════════════╝
   ↑ Red border indicates last mating
```

### 6. Auto-Generated Tasks (Tasks Page)

```
Tasks - Pregnancy Screening
────────────────────────────────────────────────────────

📅 Jan 11, 2025 (Day 28)
┌──────────────────────────────────────────────────────┐
│ 🔴 HIGH PRIORITY                                     │
│ Day 28: Scan & Bloods - Bella                       │
│ CRITICAL: Ultrasound scan to confirm pregnancy      │
│ [Mark Complete]                                      │
└──────────────────────────────────────────────────────┘

📅 Jan 11, 2025 (Day 28)
┌──────────────────────────────────────────────────────┐
│ 🔴 HIGH PRIORITY                                     │
│ Day 28: Relaxin Blood Test - Bella                  │
│ Blood test for relaxin hormone                      │
│ [Mark Complete]                                      │
└──────────────────────────────────────────────────────┘

📅 Jan 13, 2025 (Day 30)
┌──────────────────────────────────────────────────────┐
│ 🔴 HIGH PRIORITY                                     │
│ Day 30: Progesterone Check - Bella                  │
│ Check for P4 plateau (21-28 ng/mL = pregnant)      │
│ [Mark Complete]                                      │
└──────────────────────────────────────────────────────┘

📅 Jan 28, 2025 (Day 45)
┌──────────────────────────────────────────────────────┐
│ 🟡 MEDIUM PRIORITY                                   │
│ Mid-Pregnancy Checkup - Bella                       │
│ Monitor bitch health and fetal development          │
│ [Mark Complete]                                      │
└──────────────────────────────────────────────────────┘

📅 Feb 2, 2025 (Day 50)
┌──────────────────────────────────────────────────────┐
│ 🟡 MEDIUM PRIORITY                                   │
│ X-Ray for Puppy Count - Bella                       │
│ Count puppies and assess skeletal development       │
│ [Mark Complete]                                      │
└──────────────────────────────────────────────────────┘

📅 Feb 7, 2025 (Day 55)
┌──────────────────────────────────────────────────────┐
│ 🔴 HIGH PRIORITY                                     │
│ Pre-Whelping Checkup - Bella                        │
│ Final checkup before whelping (~63 days)            │
│ [Mark Complete]                                      │
└──────────────────────────────────────────────────────┘
```

## Color Coding

### Mating Markers:
- **Green** = Regular matings (M1, M2, M3...)
- **Red** = Last mating (🎯 LAST)

### Task Priorities:
- **🔴 RED** = High priority (Days 28, 30, 55)
- **🟡 YELLOW** = Medium priority (Days 45, 50)

### Breeding Window Alert:
- **Green background** = P4 in breeding range (15-35 ng/mL)
- **Red alert box** = Last mating selected (shows task preview)

## Mobile View

On mobile devices, the chart and markers adapt responsively:
- Markers remain visible
- Touch-friendly badges
- Scrollable breeding records list
- Full task details in accordion format

---

**Ready to test!** Just run the database migration and start adding readings! 🚀
