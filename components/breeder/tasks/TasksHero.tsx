"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Flame, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { calculateStreak, getWeeklyCompletionData, getTodayStats, getGreeting } from "@/lib/utils/tasks-stats";

interface TasksHeroProps {
  tasks: any[];
  userName?: string | null;
  overdueCount: number;
}

export function TasksHero({ tasks, userName, overdueCount }: TasksHeroProps) {
  const streak = calculateStreak(tasks);
  const weeklyData = getWeeklyCompletionData(tasks);
  const todayStats = getTodayStats(tasks);
  const totalThisWeek = weeklyData.reduce((sum, d) => sum + d.count, 0);
  const maxDayCount = Math.max(...weeklyData.map((d) => d.count), 1);

  const subline = (() => {
    if (overdueCount > 0) return `${overdueCount} overdue ${overdueCount === 1 ? "task needs" : "tasks need"} your attention.`;
    if (todayStats.total === 0) return "No tasks scheduled for today — enjoy the breather.";
    if (todayStats.ratio === 100) return `All ${todayStats.total} of today's tasks done. Nice work!`;
    return `${todayStats.completed} of ${todayStats.total} done today — keep going.`;
  })();

  return (
    <Card className="shadow-card border-0 bg-gradient-to-br from-primary/5 via-surface to-primary-pink/5 overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
          {/* Greeting + subline */}
          <div className="space-y-1">
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-2xl md:text-3xl font-bold text-foreground"
            >
              {getGreeting(userName)}
              {userName && <span className="ml-1">👋</span>}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-base text-muted-foreground"
            >
              {subline}
            </motion.p>
          </div>

          {/* Stats — desktop */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {/* Streak */}
            <StatBlock
              icon={<Flame className={cn("w-5 h-5", streak > 0 ? "text-orange-500" : "text-muted-foreground")} />}
              value={streak}
              label={streak === 1 ? "day streak" : "day streak"}
              accent={streak > 0 ? "from-orange-500/15 to-red-500/10 border-orange-200 dark:border-orange-900/40" : ""}
            />
            {/* Today ratio */}
            <StatBlock
              icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
              value={`${todayStats.ratio}%`}
              label="today done"
              accent="from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-900/40"
            />
            {/* Week total */}
            <StatBlock
              icon={<TrendingUp className="w-5 h-5 text-primary" />}
              value={totalThisWeek}
              label="this week"
              accent="from-primary/10 to-primary-pink/10 border-primary/20"
            />
          </div>
        </div>

        {/* Weekly bar chart + overdue alert row */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 mt-6 pt-6 border-t border-border/40">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Last 7 days</p>
            <div className="flex items-end justify-between gap-1.5 h-16">
              {weeklyData.map((day, i) => {
                const isToday = i === weeklyData.length - 1;
                const heightPct = (day.count / maxDayCount) * 100;
                return (
                  <div key={i} className="flex flex-col items-center flex-1 gap-1.5">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(heightPct, 4)}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
                      className={cn(
                        "w-full rounded-t-md transition-colors",
                        day.count > 0
                          ? isToday
                            ? "bg-gradient-to-t from-primary to-primary-pink"
                            : "bg-primary/40"
                          : "bg-muted"
                      )}
                      title={`${day.count} ${day.count === 1 ? "task" : "tasks"} on ${day.date.toLocaleDateString()}`}
                    />
                    <span className={cn("text-[10px] font-medium", isToday ? "text-primary" : "text-muted-foreground")}>
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {overdueCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30"
            >
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
              <div>
                <p className="text-sm font-semibold text-destructive">{overdueCount} overdue</p>
                <p className="text-xs text-muted-foreground">Tackle these first</p>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatBlock({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  accent?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-xl bg-gradient-to-br border",
        accent || "from-muted/40 to-muted/20 border-border/40"
      )}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-2xl font-bold text-foreground tabular-nums">{value}</span>
      </div>
      <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">{label}</span>
    </div>
  );
}
