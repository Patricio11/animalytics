import { differenceInCalendarDays, isToday, isYesterday, startOfDay, subDays } from 'date-fns';

interface TaskLike {
  completedAt?: string | Date | null;
  dueDate?: string | Date | null;
}

/**
 * How many distinct days in a row (ending today or yesterday) the user has
 * completed at least one task. A streak survives one missed day if today has
 * no tasks yet (otherwise people who haven't checked in today get demotivated).
 */
export function calculateStreak(tasks: TaskLike[]): number {
  const completedDates = new Set<string>();
  for (const t of tasks) {
    if (!t.completedAt) continue;
    const d = startOfDay(new Date(t.completedAt));
    completedDates.add(d.toISOString().slice(0, 10));
  }

  if (completedDates.size === 0) return 0;

  // Walk backwards from today; allow today to be empty (don't punish for the current day)
  let streak = 0;
  let cursor = startOfDay(new Date());
  // If today has no completion yet, start counting from yesterday
  if (!completedDates.has(cursor.toISOString().slice(0, 10))) {
    cursor = subDays(cursor, 1);
  }
  while (completedDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

/**
 * Number of tasks completed per day for the last 7 days (oldest → newest).
 * Returns array of { date: Date, count: number, label: 'M'|'T'|...}.
 */
export function getWeeklyCompletionData(tasks: TaskLike[]) {
  const days: { date: Date; count: number; label: string }[] = [];
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  for (let i = 6; i >= 0; i--) {
    const day = startOfDay(subDays(new Date(), i));
    const count = tasks.filter((t) => {
      if (!t.completedAt) return false;
      return startOfDay(new Date(t.completedAt)).getTime() === day.getTime();
    }).length;
    days.push({ date: day, count, label: dayLabels[day.getDay()] });
  }
  return days;
}

/**
 * Today's stats: total due today, completed today, ratio.
 */
export function getTodayStats(tasks: TaskLike[]) {
  const dueToday = tasks.filter((t) => t.dueDate && isToday(new Date(t.dueDate)));
  const completedToday = dueToday.filter((t) => t.completedAt);
  return {
    total: dueToday.length,
    completed: completedToday.length,
    ratio: dueToday.length === 0 ? 0 : Math.round((completedToday.length / dueToday.length) * 100),
  };
}

/**
 * Return a time-of-day greeting.
 */
export function getGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  let greeting = 'Hello';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';
  else greeting = 'Good evening';
  return name ? `${greeting}, ${name.split(' ')[0]}` : greeting;
}
