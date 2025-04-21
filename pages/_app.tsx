// pages/_app.tsx
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';

// Context Providers
import { PatientDoctorProvider } from '@/contexts/PatientDoctorContext';
import AppLayout from '@/components/AppLayout';
import { Logger } from '@/utils/logger';

// Global Styles
import '@/styles/globals.css';

// Custom Theme
import theme from '@/theme';

function MyApp({ Component, pageProps }: AppProps) {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Initialize logging
  useEffect(() => {
    Logger.info('Application', 'Application initialized', {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      initialRoute: router.pathname
    });
    
    // Log browser and environment info
    if (typeof window !== 'undefined') {
      Logger.info('Application', 'Client environment details', {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    }
    
    // Set up performance monitoring
    if (typeof window !== 'undefined' && window.performance) {
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
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      Logger.info('Application', 'Application terminated');
    };
  }, [router.pathname]);

  // Log route changes
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      Logger.info('Router', 'Route change started', { 
        from: router.pathname, 
        to: url 
      });
    };

    const handleRouteChangeComplete = (url: string) => {
      Logger.info('Router', 'Route change completed', { 
        url,
        query: router.query
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
  }, [router]);

  // Ensure client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration errors
  if (!isMounted) {
    return null;
  }

  return (
    <SessionProvider session={pageProps.session}>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <PatientDoctorProvider>
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
        </PatientDoctorProvider>
      </ChakraProvider>
    </SessionProvider>
  );
}

export default MyApp;