'use client';

import { createAuthClient } from "better-auth/react";
import type { ExtendedUser } from "./types";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});

// Custom hooks
export const useAuth = () => {
  const { data: session, isPending } = authClient.useSession();

  return {
    user: session?.user as ExtendedUser | undefined,
    session,
    isLoading: isPending,
    isAuthenticated: !!session,
    signIn: authClient.signIn,
    signOut: authClient.signOut,
    signUp: authClient.signUp,
  };
};

export const useRole = () => {
  const { user } = useAuth();

  return {
    role: (user?.role as string) || 'breeder',
    isBreeder: user?.role === 'breeder',
    isVet: user?.role === 'veterinarian',
    isAdmin: user?.role === 'admin',
    isEventOrganizer: user?.role === 'event_organizer',
  };
};

export const useSubscription = () => {
  const { user } = useAuth();

  return {
    plan: (user?.subscription?.plan as string) || 'free',
    features: (user?.subscription?.features as string[]) || [],
    isPremium: user?.subscription?.plan === 'premium',
    isProfessional: user?.subscription?.plan === 'professional',
    isEnterprise: user?.subscription?.plan === 'enterprise',
  };
};
