"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface RegionalSettings {
  currency: string;
  timezone: string;
  locale: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  measurementUnit: 'metric' | 'imperial';
  firstDayOfWeek: 0 | 1;
  language: string;
}

interface RegionalSettingsContextType {
  settings: RegionalSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: RegionalSettings = {
  currency: 'ZAR',
  timezone: 'Africa/Johannesburg',
  locale: 'en-ZA',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  measurementUnit: 'metric',
  firstDayOfWeek: 1,
  language: 'en',
};

const RegionalSettingsContext = createContext<RegionalSettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
  refreshSettings: async () => {},
});

export function RegionalSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<RegionalSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/regional');
      
      console.log('🔍 Fetching regional settings...');
      
      if (response.ok) {
        const result = await response.json();
        console.log('📊 Regional settings response:', result);
        
        if (result.success && result.data) {
          const newSettings = {
            currency: result.data.currency || defaultSettings.currency,
            timezone: result.data.timezone || defaultSettings.timezone,
            locale: result.data.locale || defaultSettings.locale,
            dateFormat: result.data.dateFormat || defaultSettings.dateFormat,
            timeFormat: result.data.timeFormat || defaultSettings.timeFormat,
            measurementUnit: result.data.measurementUnit || defaultSettings.measurementUnit,
            firstDayOfWeek: result.data.firstDayOfWeek ?? defaultSettings.firstDayOfWeek,
            language: result.data.language || defaultSettings.language,
          };
          console.log('✅ Settings loaded:', newSettings);
          setSettings(newSettings);
        }
      } else {
        console.warn('⚠️ Regional settings API returned non-OK status:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching regional settings:', error);
      // Keep default settings on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = async () => {
    setIsLoading(true);
    await fetchSettings();
  };

  return (
    <RegionalSettingsContext.Provider value={{ settings, isLoading, refreshSettings }}>
      {children}
    </RegionalSettingsContext.Provider>
  );
}

export function useRegionalSettings() {
  const context = useContext(RegionalSettingsContext);
  if (!context) {
    throw new Error('useRegionalSettings must be used within RegionalSettingsProvider');
  }
  return context;
}
