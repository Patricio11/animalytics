"use client";

import { useRegionalSettings } from '@/lib/contexts/regional-settings-context';
import {
  formatCurrency,
  formatDate,
  formatTime,
  formatWeight,
  formatHeight,
  formatTemperature,
  formatRelativeTime,
} from '@/lib/utils/regional-format';

/**
 * Display currency with user's regional settings
 */
export function CurrencyDisplay({
  amount,
  showSymbol = true,
  showCode = false,
  decimals = 2,
  className,
}: {
  amount: number;
  showSymbol?: boolean;
  showCode?: boolean;
  decimals?: number;
  className?: string;
}) {
  const { settings, isLoading } = useRegionalSettings();

  if (isLoading) {
    return <span className={className}>...</span>;
  }

  return (
    <span className={className}>
      {formatCurrency(amount, settings, { showSymbol, showCode, decimals })}
    </span>
  );
}

/**
 * Display date with user's regional settings
 */
export function DateDisplay({
  date,
  includeTime = false,
  shortFormat = false,
  className,
}: {
  date: Date | string;
  includeTime?: boolean;
  shortFormat?: boolean;
  className?: string;
}) {
  const { settings, isLoading } = useRegionalSettings();

  if (isLoading) {
    return <span className={className}>...</span>;
  }

  return (
    <span className={className}>
      {formatDate(date, settings, { includeTime, shortFormat })}
    </span>
  );
}

/**
 * Display time with user's regional settings
 */
export function TimeDisplay({
  time,
  className,
}: {
  time: Date | string;
  className?: string;
}) {
  const { settings, isLoading } = useRegionalSettings();

  if (isLoading) {
    return <span className={className}>...</span>;
  }

  return (
    <span className={className}>
      {formatTime(time, settings)}
    </span>
  );
}

/**
 * Display weight with user's regional settings
 */
export function WeightDisplay({
  weightInKg,
  decimals = 1,
  showUnit = true,
  className,
}: {
  weightInKg: number;
  decimals?: number;
  showUnit?: boolean;
  className?: string;
}) {
  const { settings, isLoading } = useRegionalSettings();

  if (isLoading) {
    return <span className={className}>...</span>;
  }

  return (
    <span className={className}>
      {formatWeight(weightInKg, settings, { decimals, showUnit })}
    </span>
  );
}

/**
 * Display height with user's regional settings
 */
export function HeightDisplay({
  heightInCm,
  decimals = 1,
  showUnit = true,
  className,
}: {
  heightInCm: number;
  decimals?: number;
  showUnit?: boolean;
  className?: string;
}) {
  const { settings, isLoading } = useRegionalSettings();

  if (isLoading) {
    return <span className={className}>...</span>;
  }

  return (
    <span className={className}>
      {formatHeight(heightInCm, settings, { decimals, showUnit })}
    </span>
  );
}

/**
 * Display temperature with user's regional settings
 */
export function TemperatureDisplay({
  tempInCelsius,
  decimals = 1,
  showUnit = true,
  className,
}: {
  tempInCelsius: number;
  decimals?: number;
  showUnit?: boolean;
  className?: string;
}) {
  const { settings, isLoading } = useRegionalSettings();

  if (isLoading) {
    return <span className={className}>...</span>;
  }

  return (
    <span className={className}>
      {formatTemperature(tempInCelsius, settings, { decimals, showUnit })}
    </span>
  );
}

/**
 * Display relative time (e.g., "2 hours ago")
 */
export function RelativeTimeDisplay({
  date,
  className,
}: {
  date: Date | string;
  className?: string;
}) {
  const { settings, isLoading } = useRegionalSettings();

  if (isLoading) {
    return <span className={className}>...</span>;
  }

  return (
    <span className={className}>
      {formatRelativeTime(date, settings)}
    </span>
  );
}
