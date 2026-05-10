import confetti from "canvas-confetti";

const PRIMARY_COLORS = ["#0082c8", "#7c3aed", "#ec4899", "#10b981", "#f59e0b"];

/**
 * Fire a small confetti burst, optionally from a specific element's position.
 * Defaults to a celebratory mid-screen burst if no anchor element is given.
 */
export function fireConfetti(anchor?: HTMLElement | null) {
  if (typeof window === "undefined") return;

  let origin = { x: 0.5, y: 0.5 };
  if (anchor) {
    const rect = anchor.getBoundingClientRect();
    origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };
  }

  confetti({
    particleCount: 60,
    spread: 60,
    startVelocity: 32,
    decay: 0.92,
    scalar: 0.85,
    ticks: 120,
    origin,
    colors: PRIMARY_COLORS,
    disableForReducedMotion: true,
  });
}

/**
 * Bigger celebration — for finishing the last task of the day.
 */
export function fireBigCelebration() {
  if (typeof window === "undefined") return;
  const duration = 1500;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999, colors: PRIMARY_COLORS, disableForReducedMotion: true };

  const interval: any = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.3 + 0.1, y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.3 + 0.7, y: Math.random() - 0.2 } });
  }, 250);
}
