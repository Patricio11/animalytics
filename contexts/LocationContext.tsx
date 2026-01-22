"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserLocation, clearCachedLocation, formatLocation, type UserLocation } from '@/lib/utils/location-detection';

interface LocationContextType {
  location: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  refreshLocation: () => Promise<void>;
  clearLocation: () => void;
  formattedLocation: string;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLocation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const detectedLocation = await getUserLocation();
      setLocation(detectedLocation);
    } catch (err) {
      console.error('Failed to detect location:', err);
      setError('Failed to detect your location');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLocation = async () => {
    clearCachedLocation();
    await loadLocation();
  };

  const clearLocation = () => {
    clearCachedLocation();
    setLocation(null);
  };

  useEffect(() => {
    loadLocation();
  }, []);

  const formattedLocation = formatLocation(location);

  return (
    <LocationContext.Provider
      value={{
        location,
        isLoading,
        error,
        refreshLocation,
        clearLocation,
        formattedLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
