// Extended user type for Better Auth with custom fields
export interface ExtendedUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  role?: string;
  subscription?: {
    plan?: string;
    features?: string[];
  };
  preferences?: {
    notifications?: boolean;
    emailUpdates?: boolean;
    darkMode?: boolean;
    language?: string;
    timezone?: string;
  };
}
