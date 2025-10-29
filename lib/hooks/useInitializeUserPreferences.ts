import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to initialize user preferences after first login
 * Checks localStorage for pending preferences saved during signup
 */
export function useInitializeUserPreferences(userId?: string, userEmail?: string) {
  const { toast } = useToast();

  useEffect(() => {
    if (!userId || !userEmail) return;

    const initializePreferences = async () => {
      try {
        // Check if there are pending preferences in localStorage
        const pendingPrefsJson = localStorage.getItem('pendingUserPreferences');
        if (!pendingPrefsJson) {
          console.log('No pending preferences found');
          return;
        }

        const pendingPrefs = JSON.parse(pendingPrefsJson);
        
        // Verify this is for the current user
        if (pendingPrefs.email !== userEmail) {
          console.log('Pending preferences are for a different user');
          return;
        }

        console.log('📦 Found pending preferences, initializing...');

        // Initialize regional settings based on location
        try {
          const regionalResponse = await fetch('/api/settings/regional/initialize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });

          if (regionalResponse.ok) {
            const regionalData = await regionalResponse.json();
            console.log('✅ Regional settings initialized:', regionalData);
          } else {
            console.error('Regional settings initialization failed');
          }
        } catch (regionalError) {
          console.error('Failed to initialize regional settings:', regionalError);
        }

        // Save breed preferences if user is a breeder and selected breeds
        if (pendingPrefs.role === 'breeder' && pendingPrefs.breedIds?.length > 0) {
          try {
            const breedResponse = await fetch('/api/breeders/breed-preferences', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ breedIds: pendingPrefs.breedIds }),
            });

            if (breedResponse.ok) {
              console.log('✅ Breed preferences saved');
              toast({
                title: 'Welcome to Animalytics!',
                description: 'Your preferences have been saved.',
              });
            } else {
              console.error('Failed to save breed preferences');
            }
          } catch (breedError) {
            console.error('Failed to save breed preferences:', breedError);
          }
        }

        // Clear pending preferences from localStorage
        localStorage.removeItem('pendingUserPreferences');
        console.log('✅ Preferences initialized and cleared from localStorage');

      } catch (error) {
        console.error('Error initializing user preferences:', error);
      }
    };

    // Run initialization
    initializePreferences();
  }, [userId, userEmail, toast]);
}
