import { auth } from "./config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { ExtendedUser } from "./types";

/**
 * Get current session (cached per request)
 * Use this in Server Components to access session data
 */
export const getSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
});

/**
 * Require authentication - redirects to signin if not authenticated
 * Use this in Server Components that require authentication
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/signin");
  }
  return session;
}

/**
 * Require specific role - redirects to unauthorized if role doesn't match
 * Use this in Server Components that require specific roles
 */
type UserRole = "breeder" | "veterinarian" | "admin" | "event_organizer";

export async function requireRole(
  allowedRoles: Array<UserRole>
) {
  const session = await requireAuth();
  const user = session.user as ExtendedUser;
  const userRole = user.role as string;

  if (!allowedRoles.includes(userRole as UserRole)) {
    redirect("/unauthorized");
  }

  return session;
}

/**
 * Get user role from session
 */
export async function getUserRole() {
  const session = await getSession();
  if (!session) return null;

  const user = session.user as ExtendedUser;
  return (user.role as UserRole) || null;
}

/**
 * Check if user has access to a specific route based on their role
 */
export async function canAccessRoute(route: string) {
  const session = await getSession();
  if (!session) return false;

  const user = session.user as ExtendedUser;
  const userRole = user.role as string;

  // Define role-based route access
  const roleRoutes: Record<string, string[]> = {
    breeder: [
      "/dashboard",
      "/animals",
      "/calculators",
      "/tasks",
      "/reports",
      "/marketplace",
      "/frozen-semen",
      "/breeders",
      "/documents",
      "/settings",
    ],
    veterinarian: [
      "/dashboard",
      "/appointments",
      "/records",
      "/patients",
      "/settings",
    ],
    admin: [
      "/dashboard",
      "/users",
      "/system",
      "/analytics",
      "/settings",
    ],
    event_organizer: [
      "/dashboard",
      "/events",
      "/registrations",
      "/results",
      "/settings",
    ],
  };

  const allowedRoutes = roleRoutes[userRole] || [];

  // Check if route starts with any allowed route
  return allowedRoutes.some((allowedRoute) => route.startsWith(allowedRoute));
}
