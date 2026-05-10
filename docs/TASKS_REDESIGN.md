# Tasks Page Redesign Tracker

Goal: take the Tasks page from a flat list-with-filters to something breeders actually enjoy opening every day. Personal, dynamic, satisfying to use.

Started: 2026-05-09.

---

## Current state (baseline)

What's there today on `/tasks`:
- Header with title + "New Task" button
- 4 stat cards (Total / Pending / Overdue / Completed)
- Optional Puppy Feeding Generator panel
- Filter row: search input + type dropdown + priority dropdown
- 5 tabs: Pending / Tests / Overdue / Due Soon / Completed
- Each tab renders a vertical list of `TaskCard` components
- TaskDialog modal for create/edit
- TaskViewModal for read-only detail

**What works:** functional, accurate counts, mobile-responsive (after recent fixes), all CRUD covered.
**What's flat:** no sense of "today" vs "later", no momentum / streak signal, plain "No tasks" empty states, completing a task feels invisible (just disappears).

---

## Phase 1 — Make it feel alive (this PR)

Pick the highest-perceived-improvement-per-line-of-code wins. Calendar view is bigger and goes in Phase 2.

| # | Improvement | Status | Notes |
|---|---|---|---|
| 1 | **Today view as default tab** | ✅ Done | New first tab "Today" combines items due today + overdue. Time-of-day greeting in the hero. |
| 2 | **Streak + completion stats hero** | ✅ Done | `TasksHero` component — greeting, streak (🔥), today done %, week total, last-7-days mini bar chart, overdue alert. |
| 3 | **Personality empty states** | ✅ Done | `TasksEmptyState` — gradient circle + emoji + friendly copy per tab kind (today/pending/tests/overdue/due-soon/completed). |
| 4 | **Confetti on complete** | ✅ Done | Small burst on every complete; bigger continuous celebration when finishing the last task of the day. Respects `prefers-reduced-motion`. |
| 5 | **Animated counter badges** | ✅ Done | `AnimatedCount` — slides numbers up/down on transition. Wired into all 6 tab badges. |

---

## Phase 2 — Calendar / timeline view (in progress)

Bigger piece of work, broken into 4 sub-steps to keep each landable.

| # | Sub-step | Status | Notes |
|---|---|---|---|
| 2a | View toggle (list ↔ calendar) | ✅ Done | `TasksViewToggle` segmented control. State persists in URL `?view=calendar` so refresh keeps the chosen mode. |
| 2b | Static `TasksCalendar` month grid | ✅ Done | Full month grid, prev/next/today nav, today ring-highlighted, weekend cells dimmed. Each day shows up to 3 task pills color-coded by type, with `+N more` overflow. Legend at the bottom. |
| 2c | Day detail side panel | ✅ Done | `TasksDaySheet` — Sheet from the right. Lists all tasks for the day using existing `TaskCard`. Empty-day state has an "Add a task" button that pre-fills the day in the create dialog. |
| 2d | Drag-to-reschedule | ✅ Done | Drag any pill onto another day. Updates `dueDate` via the existing `useUpdateTask` mutation (PATCH `/api/tasks/[id]`). Toast confirms the new day and warns on weekends. Drop target highlights primary on hover. Completed tasks aren't draggable. |

Acceptance criteria:
- [x] Toggle between list and calendar without losing filters/search (filters apply to both)
- [x] Calendar correctly buckets tasks by `yyyy-MM-dd` (date-fns handles tz)
- [x] Clicking a day with zero tasks opens the panel with the empty state + "Add a task"
- [x] Dragging a task triggers query invalidation, so badge counts in tabs update on the next visit

## Phase 2 — Status: Complete (pending browser smoke test)

### Post-launch tweaks (after Phase 2)

| Change | Reason |
|---|---|
| Calendar is now the **default** view | User feedback — calendar gives a much better at-a-glance feel than a flat list. URL `?view=list` toggles to list. |
| **Block creating tasks on past dates** | Prevents accidental data clutter and user confusion. Enforced in three places: (1) TaskDialog DatePicker `minDate={today}` in create mode only; (2) TaskDialog `validateForm` rejects past dates with an error; (3) `TasksDaySheet` hides the "Add a task" button for past days and shows a helper message. |
| **Block dragging tasks onto past dates** | Drag-over on a past day shows the no-drop cursor; drop handler is a no-op. |

---

## Phase 3 — Polish & nice-to-have (future)

Things to keep on the radar but not block on:
- Quick-add floating action button on mobile
- Group-by-animal view (avatar + task count per animal)
- Smart suggestions ("Looks like Willow's pregnancy scan is in 3 days — want to add a vet appointment?")
- Sound on complete (off by default, toggleable)
- Optional dark/themed completion celebration (fireworks for last task of the day)

---

## Files we expect to touch

### Phase 1 — done

| File | Change |
|---|---|
| `app/(shared)/tasks/page.tsx` | Added Today tab, swapped stat cards for hero, wired confetti, animated badges |
| `components/breeder/tasks/TasksHero.tsx` | NEW — stats + streak + greeting hero card |
| `components/breeder/tasks/TasksEmptyState.tsx` | NEW — illustrated empty states per tab |
| `components/breeder/tasks/AnimatedCount.tsx` | NEW — number transition for badges |
| `lib/utils/tasks-stats.ts` | NEW — compute streak, week completion, today ratio |
| `lib/utils/confetti.ts` | NEW — small + big celebration helpers |
| `package.json` | Added `canvas-confetti` + `@types/canvas-confetti` |
| `docs/TASKS_REDESIGN.md` | This tracker |

### Phase 2 — done

| File | Change |
|---|---|
| `components/breeder/tasks/TasksCalendar.tsx` | NEW — month grid with type-colored pills + drag/drop |
| `components/breeder/tasks/TasksDaySheet.tsx` | NEW — Sheet showing a single day's tasks |
| `components/breeder/tasks/TasksViewToggle.tsx` | NEW — segmented control list ↔ calendar |
| `app/(shared)/tasks/page.tsx` | Wired view toggle, URL sync, calendar render, drag-handler, day sheet |

---

## How we'll know we're done

- [x] Opening `/tasks` lands on a "Today" tab by default with a friendly greeting
- [x] Hero card shows: weekly bar chart, streak count, today ratio
- [x] Empty states feel friendly, not blank
- [x] Completing a task fires a confetti burst and the badge counter animates down
- [x] Mobile responsiveness preserved (Today tab visible, stats stack vertically)
- [ ] No regression in existing CRUD flows — needs manual smoke test in browser

## Phase 1 — Status: Complete (pending browser smoke test)
