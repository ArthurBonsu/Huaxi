// pages/auth/signout.tsx
import { ComponentType, FC, useState, useEffect, useContext } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Heading } from '@chakra-ui/react';
import { Logger } from '@/utils/logger';

const SignOut: FC = () => {
  Logger.info('SignOut', 'Component rendering');
  
  const router = useRouter();
  const { data: session } = useSession();

  // Log component lifecycle
  useEffect(() => {
    Logger.info('SignOut', 'Component mounted');
    
    return () => {
      Logger.info('SignOut', 'Component unmounted');
    };
  }, []);

  useEffect(() => {
    const performSignOut = async () => {
      Logger.info('SignOut', 'Signing out user', {
        userId: session?.user?.id
      });
      
      try {
        await signOut({ redirect: false });
        Logger.info('SignOut', 'User signed out successfully');
        
        // Redirect after signout
        Logger.debug('SignOut', 'Redirecting to home page');
        router.push('/');
      } catch (error) {
        Logger.error('SignOut', 'Error during sign out', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    };

    if (session) {
      performSignOut();
    } else {
      Logger.info('SignOut', 'No active session, redirecting to home');
      router.push('/');
    }
  }, [router, session]);

  return <Heading>Signing you out...</Heading>;
};

export default SignOut;