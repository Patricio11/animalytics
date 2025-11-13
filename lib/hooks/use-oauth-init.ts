import { useEffect, useRef } from 'react';
import { authClient } from '@/lib/auth/client';

/**
 * Custom hook to initialize OAuth user profile after sign-in
 * This automatically detects if the user signed in via OAuth and initializes their profile
 */
export function useOAuthInit() {
  const { data: session } = authClient.useSession();
  const hasInitialized = useRef(false);

  useEffect(() => {
    const initializeOAuthUser = async () => {
      // Only run once per session
      if (hasInitialized.current) {
        return;
      }

      // Check if user is logged in
      if (!session?.user) {
        return;
      }

      try {
        console.log('🔐 Checking if OAuth initialization is needed...');

        // Call the initialization endpoint
        const response = await fetch('/api/auth/initialize-oauth-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ OAuth initialization result:', data.message);
          hasInitialized.current = true;
        } else {
          console.error('❌ Failed to initialize OAuth user:', response.statusText);
        }
      } catch (error) {
        console.error('❌ Error initializing OAuth user:', error);
      }
    };

    initializeOAuthUser();
  }, [session]);
}
