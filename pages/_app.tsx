import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { SessionProvider, useSession } from 'next-auth/react';

// Context Providers
import { PatientDoctorProvider } from '@/contexts/PatientDoctorContext';
import AppLayout from '@/components/AppLayout';
import { Logger } from '@/utils/logger';

// Firebase Configuration
import { auth } from '@/services/firebaseConfig';
import FirebaseAuthService from '@/services/firebaseAuthService';

// Global Styles
import '@/styles/globals.css';

// Custom Theme
import theme from '@/theme';

// NextAuth Configuration
import { nextAuthConfig } from '@/lib/nextAuthConfig';

function MyAppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const checkAndRedirectNewUser = useCallback(() => {
    if (status === 'authenticated' && session?.user) {
      const userId = session.user.id;
      
      // Ensure we're only checking on client-side
      if (typeof window !== 'undefined') {
        const hasSelectedRole = localStorage.getItem(`user_role_${userId}`);
        
        // Redirect logic for new users
        if (!hasSelectedRole && router.pathname !== '/auth/new-user') {
          router.push('/auth/new-user');
        }
      }
    }
  }, [session, status, router]);

  // Firebase authentication state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Optionally sync Firebase user with NextAuth session
          const profile = await FirebaseAuthService.getUserProfile(firebaseUser.uid);
          
          Logger.info('App', 'Firebase auth state changed', {
            uid: firebaseUser.uid,
            email: firebaseUser.email
          });
        } catch (error) {
          Logger.error('App', 'Error syncing Firebase user', { 
            error: error instanceof Error ? error.message : String(error) 
          });
        }
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    checkAndRedirectNewUser();
  }, [checkAndRedirectNewUser]);

  // Prevent server-side rendering issues
  if (typeof window === 'undefined') {
    return null;
  }

  return <Component {...pageProps} />;
}

function MyApp(props: AppProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Initialize logging and event listeners
  useEffect(() => {
    // Ensure this only runs on client-side
    if (typeof window !== 'undefined') {
      Logger.info('Application', 'Application initialized', {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      });
      
      // Log browser and environment info
      Logger.info('Application', 'Client environment details', {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      
      // Set up error logging
      const handleError = (event: ErrorEvent) => {
        Logger.error('Application', 'Uncaught error', {
          message: event.message,
          source: event.filename,
          lineNumber: event.lineno,
          columnNumber: event.colno,
          stack: event.error?.stack
        });
      };
      
      const handleRejection = (event: PromiseRejectionEvent) => {
        Logger.error('Application', 'Unhandled promise rejection', {
          reason: event.reason,
          stack: event.reason?.stack
        });
      };
      
      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleRejection);
      
      // Cleanup function
      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleRejection);
        Logger.info('Application', 'Application terminated');
      };
    }
  }, []); 

  // Ensure client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration errors
  if (!isMounted) {
    return null;
  }

  return (
    <SessionProvider 
      session={props.pageProps.session} 
      {...nextAuthConfig}
    >
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <PatientDoctorProvider>
          <AppLayout>
            <MyAppContent {...props} />
          </AppLayout>
        </PatientDoctorProvider>
      </ChakraProvider>
    </SessionProvider>
  );
}

export default MyApp;