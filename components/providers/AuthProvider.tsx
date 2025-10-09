"use client";

import { ReactNode } from "react";

/**
 * Better Auth doesn't require a traditional provider wrapper.
 * The authClient works directly via hooks without context.
 * This component is a placeholder for future auth-related setup.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
