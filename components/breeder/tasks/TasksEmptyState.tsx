"use client";

import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, Calendar, Droplet, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyKind = "today" | "pending" | "tests" | "overdue" | "due-soon" | "completed";

interface TasksEmptyStateProps {
  kind: EmptyKind;
  onCreateTask?: () => void;
}

const COPY: Record<EmptyKind, { icon: any; title: string; subtitle: string; emoji: string; bg: string; iconColor: string }> = {
  today: {
    icon: Sparkles,
    emoji: "☀️",
    title: "Nothing on the agenda today",
    subtitle: "Enjoy the breather — or get a head start on tomorrow.",
    bg: "from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30",
    iconColor: "text-amber-600",
  },
  pending: {
    icon: CheckCircle2,
    emoji: "🎉",
    title: "All caught up!",
    subtitle: "No pending tasks. Time to grab a coffee.",
    bg: "from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30",
    iconColor: "text-green-600",
  },
  tests: {
    icon: Droplet,
    emoji: "🧪",
    title: "No progesterone tests scheduled",
    subtitle: "Tests will appear here once you start tracking heat cycles.",
    bg: "from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30",
    iconColor: "text-purple-600",
  },
  overdue: {
    icon: CheckCircle2,
    emoji: "👌",
    title: "No overdue tasks",
    subtitle: "You're on top of everything. Keep it up.",
    bg: "from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30",
    iconColor: "text-green-600",
  },
  "due-soon": {
    icon: Calendar,
    emoji: "📅",
    title: "Nothing due in the next few days",
    subtitle: "Your schedule's clear — perfect time to plan ahead.",
    bg: "from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30",
    iconColor: "text-blue-600",
  },
  completed: {
    icon: CheckCircle2,
    emoji: "💪",
    title: "No completed tasks yet",
    subtitle: "Tick off your first task and build a streak.",
    bg: "from-slate-100 to-slate-200 dark:from-slate-900/30 dark:to-slate-800/30",
    iconColor: "text-slate-600",
  },
};

export function TasksEmptyState({ kind, onCreateTask }: TasksEmptyStateProps) {
  const config = COPY[kind];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center text-center py-12 sm:py-16 px-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, type: "spring", bounce: 0.3 }}
        className={cn(
          "w-24 h-24 rounded-full bg-gradient-to-br flex items-center justify-center mb-5 relative",
          config.bg
        )}
      >
        <Icon className={cn("w-10 h-10", config.iconColor)} />
        <span className="absolute -top-2 -right-2 text-3xl" aria-hidden>
          {config.emoji}
        </span>
      </motion.div>

      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1.5">{config.title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{config.subtitle}</p>

      {onCreateTask && (kind === "today" || kind === "pending") && (
        <Button
          variant="outline"
          onClick={onCreateTask}
          className="mt-6 hover:bg-primary/10 hover:border-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create a task
        </Button>
      )}
    </motion.div>
  );
}
