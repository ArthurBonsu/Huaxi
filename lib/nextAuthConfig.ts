import type { NextAuthOptions } from 'next-auth';
import type { DefaultSession, DefaultUser } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import TwitterProvider from 'next-auth/providers/twitter';
import EmailProvider from 'next-auth/providers/email';
import FirebaseAdapter from './firebaseNextAuthAdapter';
import { Logger } from '@/utils/logger';
import { User } from 'next-auth/core/types';

// Extend default types
declare module 'next-auth' {
  interface User extends DefaultUser {
    id: string;
    role?: 'patient' | 'doctor';
    profileCompleted?: boolean;
    walletAddress?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & {
      role?: 'patient' | 'doctor';
      profileCompleted?: boolean;
      walletAddress?: string;
    }
    expires: string;
  }
}

// Email service configuration
const emailConfig = {
  server: {
    host: process.env.EMAIL_SERVER_HOST || '',
    port: process.env.EMAIL_SERVER_PORT 
      ? Number(process.env.EMAIL_SERVER_PORT) 
      : 587,
    auth: {
      user: process.env.EMAIL_SERVER_USER || '',
      pass: process.env.EMAIL_SERVER_PASSWORD || ''
    }
  },
  from: process.env.EMAIL_FROM || 'noreply@example.com'
};

export const nextAuthConfig: NextAuthOptions = {
  // Configure your authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'openid profile email'
        }
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'user:email'
        }
      }
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || ''
    }),
    EmailProvider(emailConfig)
  ],

  // Use Firebase Adapter
  adapter: FirebaseAdapter,

  // Customize the authentication flow
  callbacks: {
    async session({ session, user }) {
      // Ensure id is always added
      session.user.id = user.id;
      
      // Safely add additional properties
      const extendedUser = user as User;
      (session.user as any).role = extendedUser.role;
      (session.user as any).profileCompleted = extendedUser.profileCompleted;
      (session.user as any).walletAddress = extendedUser.walletAddress;

      Logger.debug('NextAuth:Session', 'Session callback', {
        userId: user?.id,
        email: session.user.email
      });

      return session;
    },

    async signIn({ user, account, profile }) {
      // Additional sign-in logic
      Logger.info('NextAuth:SignIn', 'User sign-in', {
        userId: user.id,
        email: user.email,
        provider: account?.provider
      });

      return true;
    }
  },

  // Custom pages for authentication flow
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user'
  },

  // Session management
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Additional security configurations
  useSecureCookies: process.env.NODE_ENV === 'production',
  secret: process.env.NEXTAUTH_SECRET || 'your_fallback_secret'
};