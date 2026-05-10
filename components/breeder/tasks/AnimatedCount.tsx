"use client";

import { motion, AnimatePresence } from "framer-motion";

interface AnimatedCountProps {
  value: number;
  className?: string;
}

/**
 * A number that smoothly transitions when its value changes.
 * Useful for tab counters that should celebrate progress instead of snapping.
 */
export function AnimatedCount({ value, className }: AnimatedCountProps) {
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="tabular-nums"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
