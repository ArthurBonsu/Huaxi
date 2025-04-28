// pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import TwitterProvider from 'next-auth/providers/twitter';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import clientPromise from 'database/ConnectDB';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { NextApiRequest, NextApiResponse } from 'next';
import { Logger } from '@/utils/logger';

// User profile interface that can be added to database
interface UserProfile {
  userId: string;
  role?: 'patient' | 'doctor';
  name?: string;
  profileCompleted?: boolean;
  walletAddress?: string;
  specialization?: string; // For doctors
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
        // Use type assertion to avoid type errors
        (session.user as any).id = user?.id || token.sub || '';
        
        // Add isNewUser flag to session
        (session.user as any).isNewUser = token.isNewUser || false;
        
        // Add user role to session if available
        if (token.role) {
          (session.user as any).role = token.role;
        }
        
        // Add profileCompleted flag to session
        (session.user as any).profileCompleted = token.profileCompleted || false;
      }
      
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      Logger.debug('Auth:NextAuth', 'JWT callback', { 
        tokenId: token.jti,
        userId: user?.id,
        isNewUser: isNewUser
      });
      
      // Set user ID and isNewUser flag
      if (user) {
        token.id = user.id;
        token.isNewUser = isNewUser;
      }

      // Check if we have user profile information in the database
      if (token.sub) {
        try {
          const client = await clientPromise;
          const db = client.db();
          
          // Try to find user profile in profiles collection
          const userProfile = await db.collection('profiles')
            .findOne({ userId: token.sub });
          
          if (userProfile) {
            // Add profile data to token
            token.role = userProfile.role;
            token.profileCompleted = userProfile.profileCompleted;
            token.walletAddress = userProfile.walletAddress;
          } else {
            // No profile found, user needs to complete profile
            token.profileCompleted = false;
          }
        } catch (error) {
          Logger.error('Auth:NextAuth', 'Error fetching user profile', {
            userId: token.sub,
            error: error instanceof Error ? error.message : String(error)
          });
          
          // Don't fail if database query fails
          token.profileCompleted = false;
        }
      }
      
      return token;
    },
    async signIn({ user, account, profile }) {
      Logger.info('Auth:NextAuth', 'Sign in callback', { 
        userId: user.id,
        provider: account?.provider,
        isNewUser: !user.email
      });
      
      // Allow sign in
      return true;
    },
    async redirect({ url, baseUrl }) {
      Logger.debug('Auth:NextAuth', 'Redirect callback', { url, baseUrl });
      
      // Handle specific redirects
      if (url.startsWith('/auth/verify-request')) {
        return url;
      }
      
      // Direct new users to the profile setup page
      if (url.includes('?callbackUrl=')) {
        const callbackUrl = new URL(url, baseUrl).searchParams.get('callbackUrl');
        if (callbackUrl) return callbackUrl;
      }
      
      // Default redirect to the new-user page
      return `${baseUrl}/auth/new-user`;
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
      
      // Initialize user profile in database
      try {
        const client = await clientPromise;
        const db = client.db();
        
        const newProfile: UserProfile = {
          userId: message.user.id,
          profileCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await db.collection('profiles').insertOne(newProfile);
        
        Logger.info('Auth:NextAuth', 'Created initial user profile', {
          userId: message.user.id
        });
      } catch (error) {
        Logger.error('Auth:NextAuth', 'Failed to create initial user profile', {
          userId: message.user.id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
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
  // Increase session duration for better user experience
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Better security with CSRF protection
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === "production",
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