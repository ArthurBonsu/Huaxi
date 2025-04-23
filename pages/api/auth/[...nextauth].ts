import { FC, useState, useEffect, useContext } from 'react';
import NextAuth, { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import TwitterProvider from 'next-auth/providers/twitter';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import clientPromise from 'database/ConnectDB';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { NextApiRequest, NextApiResponse } from 'next';
import { Logger } from '@/utils/logger';

const options: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST!,
        port: Number(process.env.EMAIL_SERVER_PORT!),
        auth: {
          user: process.env.EMAIL_SERVER_USER!,
          pass: process.env.EMAIL_SERVER_PASSWORD!,
        },
      },
      from: process.env.EMAIL_FROM!,
    }),
  ],
  callbacks: {
    async session({ user, session, token }) {
      Logger.debug('Auth:NextAuth', 'Session callback', { 
        userId: user?.id || token.id,
        isNewUser: token.isNewUser
      });
      
      if (session.user) {
        session.user.id = token.id as string;
        
        // Add a flag to indicate if this is a new user
        (session.user as any).isNewUser = token.isNewUser || false;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      Logger.debug('Auth:NextAuth', 'JWT callback', { 
        tokenId: token.jti,
        userId: user?.id,
        isNewUser: user?.id ? true : token.isNewUser
      });
      
      // Set isNewUser flag
      if (user) {
        token.id = user.id;
        token.isNewUser = true;
      }

      // Check if the user has selected a role
      if (typeof window !== 'undefined') {
        const hasSelectedRole = localStorage.getItem(`user_role_${token.id}`);
        token.hasSelectedRole = !!hasSelectedRole;
      }
      
      return token;
    },
    async signIn({ user, account, profile }) {
      Logger.info('Auth:NextAuth', 'Sign in callback', { 
        userId: user.id,
        provider: account?.provider,
        isNewUser: !user.email
      });
      
      // Additional checks can be added here if needed
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Customize redirect logic
      // For new users, always redirect to new-user page
      return baseUrl + '/auth/new-user';
    }
  },
  events: {
    async signIn(message) {
      Logger.info('Auth:NextAuth', 'User signed in', { 
        userId: message.user.id,
        provider: message.account?.provider
      });
    },
    async signOut(message) {
      Logger.info('Auth:NextAuth', 'User signed out', { 
        userId: message.token.sub 
      });
    },
    async createUser(message) {
      Logger.info('Auth:NextAuth', 'New user created', { 
        userId: message.user.id,
        email: message.user.email
      });
    },
    async linkAccount(message) {
      Logger.info('Auth:NextAuth', 'Account linked', { 
        userId: message.user.id,
        provider: message.account.provider
      });
    },
    async session(message) {
      Logger.debug('Auth:NextAuth', 'Session accessed', { 
        userId: message.token.sub
      });
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error', 
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user', 
  },
  adapter: MongoDBAdapter(clientPromise),
  logger: {
    error(code, ...message) {
      Logger.error('Auth:NextAuth', `Error: ${code}`, { message });
    },
    warn(code, ...message) {
      Logger.warn('Auth:NextAuth', `Warning: ${code}`, { message });
    },
    debug(code, ...message) {
      Logger.debug('Auth:NextAuth', `Debug: ${code}`, { message });
    },
  },
};

const authHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const sessionId = `auth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  Logger.info('Auth:NextAuth', 'Auth request received', { 
    sessionId,
    method: req.method,
    url: req.url,
    action: req.query?.nextauth?.[0] 
  });
  
  try {
    Logger.debug('Auth:NextAuth', 'Processing NextAuth request', { sessionId });
    const result = await NextAuth(req, res, options);
    
    Logger.info('Auth:NextAuth', 'Auth request completed successfully', { 
      sessionId 
    });
    
    return result;
  } catch (error) {
    Logger.error('Auth:NextAuth', 'Authentication failed', { 
      sessionId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    res.status(500).json({ message: 'Authentication failed' });
  }
};

export default authHandler;