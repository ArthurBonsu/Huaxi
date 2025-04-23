// pages/_app.tsx
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { SessionProvider, useSession } from 'next-auth/react';

// Context Providers
import { PatientDoctorProvider } from '@/contexts/PatientDoctorContext';
import AppLayout from '@/components/AppLayout';
import { Logger } from '@/utils/logger';

// Global Styles
import '@/styles/globals.css';

// Custom Theme
import theme from '@/theme';

function MyAppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const checkAndRedirectNewUser = useCallback(() => {
    if (status === 'authenticated') {
      const userId = session?.user?.id;
      
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
      
      // Set up performance monitoring
      if (window.performance) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        
        Logger.info('Application', 'Performance metrics', {
          pageLoadTime: `${pageLoadTime}ms`,
          domContentLoaded: `${perfData.domContentLoadedEventEnd - perfData.navigationStart}ms`,
          firstPaint: `${perfData.responseEnd - perfData.requestStart}ms`
        });
      }
      
      // Listen for errors
      const handleError = (event: ErrorEvent) => {
        Logger.error('Application', 'Uncaught error', {
          message: event.message,
          source: event.filename,
          lineNumber: event.lineno,
          columnNumber: event.colno,
          stack: event.error?.stack
        });
      };
      
      // Listen for unhandled promise rejections
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
  }, []); // Empty dependency array to run only once on client-side

  // Log route changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const router = require('next/router').default;

      const handleRouteChangeStart = (url: string) => {
        Logger.info('Router', 'Route change started', { 
          to: url 
        });
      };

      const handleRouteChangeComplete = (url: string) => {
        Logger.info('Router', 'Route change completed', { 
          url,
        });
      };

      const handleRouteChangeError = (err: Error, url: string) => {
        Logger.error('Router', 'Route change error', { 
          url, 
          error: err.message,
          stack: err.stack
        });
      };

      router.events.on('routeChangeStart', handleRouteChangeStart);
      router.events.on('routeChangeComplete', handleRouteChangeComplete);
      router.events.on('routeChangeError', handleRouteChangeError);

      return () => {
        router.events.off('routeChangeStart', handleRouteChangeStart);
        router.events.off('routeChangeComplete', handleRouteChangeComplete);
        router.events.off('routeChangeError', handleRouteChangeError);
      };
    }
  }, []); // Empty dependency array to prevent unnecessary re-attaching

  // Ensure client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration errors
  if (!isMounted) {
    return null;
  }

  return (
    <SessionProvider session={props.pageProps.session}>
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