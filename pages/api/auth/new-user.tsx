// pages/auth/new-user.tsx
import { FC, useState, useEffect } from 'react';
import { Heading, Text, Box, Button } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Logger } from '@/utils/logger';

const NewUser: FC = () => {
  Logger.info('NewUser', 'Component rendering');
  
  const { data: session } = useSession();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // Log component lifecycle
  useEffect(() => {
    Logger.info('NewUser', 'Component mounted', {
      userId: session?.user?.id,
      email: session?.user?.email
    });
    
    return () => {
      Logger.info('NewUser', 'Component unmounted');
    };
  }, [session]);

  // Auto-redirect countdown
  useEffect(() => {
    if (!session) return;
    
    Logger.debug('NewUser', 'Starting redirect countdown');
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          Logger.info('NewUser', 'Redirect countdown completed, navigating to dashboard');
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, [router, session]);

  const handleContinue = () => {
    Logger.info('NewUser', 'Continue button clicked');
    router.push('/');
  };

  if (!session) {
    Logger.warn('NewUser', 'No active session, redirecting to sign in');
    router.push('/api/auth/signin');
    return null;
  }

  return (
    <Box maxW="md" mx="auto" mt={8} textAlign="center">
      <Heading mb={4}>Welcome to Hospital Blockchain!</Heading>
      <Text mb={6}>
  Your account has been created successfully. You&apos;ll be redirected to the dashboard in {countdown} seconds.
</Text>
      <Button colorScheme="blue" onClick={handleContinue}>
        Continue to Dashboard
      </Button>
    </Box>
  );
};

export default NewUser;