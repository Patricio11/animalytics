import { pgTable, text, timestamp, boolean, pgEnum, jsonb } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['breeder', 'veterinarian', 'admin', 'event_organizer', 'buyer']);
export const planEnum = pgEnum('plan', ['free', 'premium', 'professional', 'enterprise']);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  name: text('name'),
  avatar: text('avatar'), // Profile image URL
  role: userRoleEnum('role').default('breeder'),

  // Vet/Professional fields
  organization: text('organization'),
  licenseNumber: text('license_number'),
  certifications: jsonb('certifications').$type<string[]>(),
  specializations: jsonb('specializations').$type<string[]>(),

  // User preferences (from mockData.ts)
  preferences: jsonb('preferences').$type<{
    notifications: boolean;
    emailUpdates: boolean;
    darkMode: boolean;
    language: string; // ISO 639-1 code: 'en', 'es', 'pt', 'fr', 'de', 'af'
    timezone: string; // IANA timezone: 'America/New_York', 'Europe/London', 'Africa/Johannesburg'
    currency: string; // ISO 4217 code: 'USD', 'EUR', 'GBP', 'ZAR'
    locale: string; // BCP 47 locale: 'en-US', 'en-GB', 'pt-BR', 'es-ES', 'af-ZA'
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12h' | '24h';
    measurementUnit: 'metric' | 'imperial';
    firstDayOfWeek: 0 | 1; // 0 = Sunday (US), 1 = Monday (Europe/SA)
  }>().default({
    notifications: true,
    emailUpdates: true,
    darkMode: false,
    language: 'en',
    timezone: 'UTC',
    currency: 'USD',
    locale: 'en-US',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    measurementUnit: 'metric',
    firstDayOfWeek: 0,
  }),

  // Subscription management
  subscription: jsonb('subscription').$type<{
    plan: 'free' | 'premium' | 'professional' | 'enterprise';
    expiresAt?: string;
    features: string[];
  }>().default({
    plan: 'free',
    features: []
  }),

  // Permissions array
  permissions: jsonb('permissions').$type<string[]>().default([]),

  isVerified: boolean('is_verified').default(false),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Sessions table (for Better Auth)
export const sessions = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
});

// Accounts table (for Better Auth)
export const accounts = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Verification tokens table (for Better Auth)
export const verifications = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
