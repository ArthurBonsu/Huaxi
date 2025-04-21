import {
  ComponentType,
  FC,
  useState,
  useEffect,
  useContext,
} from 'react';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
import GitHubProvider from 'next-auth/providers/github';
import AppleProvider from 'next-auth/providers/apple';
import { Button, ChakraProvider } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { Logger } from '@/utils/logger';

const getEnvVar = (
  variable: string | undefined,
  name: string
): string => {
  if (!variable) {
    Logger.warn('SignUp', `Environment variable for ${name} is missing`);
    throw new Error(`Environment variable for ${name} is missing.`);
  }
  return variable;
};

// Define the SignInProviders type
interface SignInProviders {
  name: string;
  credentials: string;
  secret: string;
}

const providers: SignInProviders[] = [
  {
    name: 'Google',
    credentials: getEnvVar(process.env.GOOGLE_CLIENT_ID, 'GOOGLE_CLIENT_ID'),
    secret: getEnvVar(process.env.GOOGLE_CLIENT_SECRET, 'GOOGLE_CLIENT_SECRET'),
  },
  {
    name: 'Twitter',
    credentials: getEnvVar(process.env.TWITTER, 'TWITTER'),
    secret: getEnvVar(process.env.TWITTER_SECRET, 'TWITTER_SECRET'),
  },
  {
    name: 'GitHub',
    credentials: getEnvVar(process.env.GITHUB_ID, 'GITHUB_ID'),
    secret: getEnvVar(process.env.GITHUB_SECRET, 'GITHUB_SECRET'),
  },
  {
    name: 'Apple',
    credentials: getEnvVar(process.env.APPLE_ID, 'APPLE_ID'),
    secret: getEnvVar(process.env.APPLE_SECRET, 'APPLE_SECRET'),
  },
];

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: providers.find((p) => p.name === 'Google')?.credentials || '',
      clientSecret: providers.find((p) => p.name === 'Google')?.secret || '',
    }),
    TwitterProvider({
      clientId: providers.find((p) => p.name === 'Twitter')?.credentials || '',
      clientSecret: providers.find((p) => p.name === 'Twitter')?.secret || '',
    }),
    GitHubProvider({
      clientId: providers.find((p) => p.name === 'GitHub')?.credentials || '',
      clientSecret: providers.find((p) => p.name === 'GitHub')?.secret || '',
    }),
    AppleProvider({
      clientId: providers.find((p) => p.name === 'Apple')?.credentials || '',
      clientSecret: providers.find((p) => p.name === 'Apple')?.secret || '',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },
};

export { authOptions };

const SignUpButton: FC = () => {
  Logger.info('SignUpButton', 'Component rendering');
  
  const router = useRouter();

  // Log component lifecycle
  useEffect(() => {
    Logger.info('SignUpButton', 'Component mounted');
    
    return () => {
      Logger.info('SignUpButton', 'Component unmounted');
    };
  }, []);

  const handleSignUpClick = () => {
    Logger.info('SignUpButton', 'Sign up button clicked');
    
    if (typeof window !== 'undefined') {
      router.push('/components/AppSignUp');
    }
  };

  return (
    <ChakraProvider>
      <Button
        onClick={handleSignUpClick}
        variant="outline"
        mt={4}
      >
        Sign Up Here
      </Button>
    </ChakraProvider>
  );
};

export default SignUpButton;