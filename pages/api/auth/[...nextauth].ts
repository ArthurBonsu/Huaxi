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
     
      });
      
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      Logger.debug('Auth:NextAuth', 'JWT callback', { 
        tokenId: token.jti,
        userId: user?.id
      });
      
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      Logger.info('Auth:NextAuth', 'Sign in callback', { 
        userId: user.id,
        provider: account?.provider,
        isNewUser: !user.email
      });
      
      return true;
    },
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
        userId: message.token.sub,
       
      });
    },
  },
  pages: {
    signOut: '/auth/signout',
    error: '/auth/error', // Error code passed in query string as ?error=
    verifyRequest: '/auth/verify-request', // (used for check email message)
    newUser: '/auth/new-user', // New users will be directed here on first sign in (leave the property out if not of interest)
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