import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema/users";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/services/email";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    }
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Require email verification before login
    sendResetPassword: async ({ user, url, token }: any) => {
      // Send password reset email using our email service
      try {
        console.log('🔐 Sending password reset email...');
        console.log('User:', user.email);
        console.log('Reset URL:', url);
        
        await sendPasswordResetEmail(user.email, {
          name: user.name || 'User',
          resetUrl: url,
          token,
        });
        
        console.log('✅ Password reset email sent successfully to:', user.email);
      } catch (error) {
        console.error('❌ Failed to send password reset email:', error);
        console.error('Error details:', error);
        throw error;
      }
    },
  },
  // Email verification configuration (separate from emailAndPassword)
  emailVerification: {
    sendOnSignUp: true, // Send verification email automatically on signup
    sendOnSignIn: true, // Send verification email on signin if not verified
    sendVerificationEmail: async ({ user, url, token }: any, request: any) => {
      // Send email verification email
      try {
        console.log('📧 Sending verification email...');
        console.log('User:', user.email);
        console.log('Verification URL:', url);
        
        await sendVerificationEmail(user.email, {
          name: user.name || 'User',
          verificationUrl: url,
          token,
        });
        
        console.log('✅ Verification email sent successfully to:', user.email);
      } catch (error) {
        console.error('❌ Failed to send verification email:', error);
        console.error('Error details:', error);
        throw error;
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: false, // Enable when Google OAuth credentials are provided
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "breeder",
        required: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
