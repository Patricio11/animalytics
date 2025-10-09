import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db/config";
import { users, sessions, accounts, verifications } from "@/lib/db/schema";
import * as nodemailer from 'nodemailer';
import { getRoleDashboardUrl } from '@/lib/utils/auth-redirect';

// Mailtrap SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  baseURL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-this-in-production",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }) => {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: user.email,
          subject: 'Reset Your Password - SpaceHub',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Reset Your Password</h2>
              <p>Hello ${user.name || 'there'},</p>
              <p>You requested to reset your password for your SpaceHub account.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${url}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
              </div>
              <p>If you didn't request this, please ignore this email.</p>
              <p>This link will expire in 1 hour for security reasons.</p>
              <p>Best regards,<br>The SpaceHub Team</p>
            </div>
          `,
        });
      } catch (error) {
        console.error('Failed to send reset password email:', error);
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token, url }) => {
      try {
        console.log('Sending verification email to:', user.email);
        console.log('Verification URL:', url);

        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: user.email,
          subject: 'Verify Your Email - Welcome to SpaceHub!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0;">Welcome to SpaceHub!</h1>
                <p style="margin: 10px 0 0 0;">Find Your Perfect Commercial Space</p>
              </div>
              <div style="padding: 30px 20px; background: #f8fafc; border-radius: 0 0 8px 8px;">
                <p>Hello ${user.name || 'there'},</p>
                <p>Thank you for joining SpaceHub! We're excited to help you find the perfect commercial space.</p>
                <p>To complete your registration and start exploring amazing properties, please verify your email address:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${url}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Verify Email Address</a>
                </div>
                <p>Once verified, you'll be able to:</p>
                <ul style="color: #4b5563;">
                  <li>Browse thousands of commercial properties</li>
                  <li>Save your favorite listings</li>
                  <li>Contact property owners directly</li>
                  <li>Manage your bookings and inquiries</li>
                </ul>
                <p>If you didn't create this account, please ignore this email.</p>
                <p>Best regards,<br>The SpaceHub Team</p>
              </div>
            </div>
          `,
        });

        console.log('Verification email sent successfully!');
      } catch (error) {
        console.error('Failed to send verification email:', error);
        throw error;
      }
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
        defaultValue: "buyer",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
    },
  },
  trustedOrigins: [
    process.env.NEXTAUTH_URL || "http://localhost:3000",
    "http://localhost:3000",
  ],
  callbacks: {
    async signIn({ user }: { user: any }) {
      // Log successful sign-in with role info
      console.log('User signed in successfully:', {
        id: user.id,
        email: user.email,
        role: user.role
      });
      return true;
    },
    async redirect({ url, baseUrl, user }: { url: string; baseUrl: string; user?: any }) {
      // Handle redirects based on user role
      if (user?.role) {
        const dashboardUrl = getRoleDashboardUrl(user.role);
        console.log('Redirecting user after auth:', {
          userRole: user.role,
          redirectTo: `${baseUrl}${dashboardUrl}`
        });
        return `${baseUrl}${dashboardUrl}`;
      }

      // Default redirect
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/buyer/dashboard`;
    },
  },
});

export type Session = typeof auth.$Infer.Session & {
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
    phone?: string;
  }
};
export type User = Session['user'];