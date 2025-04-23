// pages/auth/verify-request.tsx
import { FC, useState, useEffect } from 'react';
import { Heading, Text, Box, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { Logger } from '@/utils/logger';

const VerifyRequest: FC = () => {
  Logger.info('VerifyRequest', 'Component rendering');
  
  const router = useRouter();
  const { email } = router.query;
  const [countdown, setCountdown] = useState(30);

  // Auto-redirect countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/api/auth/signin');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  // Lifecycle logging effect
  useEffect(() => {
    Logger.info('VerifyRequest', 'Component mounted', {
      emailProvided: !!email
    });
    
    return () => {
      Logger.info('VerifyRequest', 'Component unmounted');
    };
  }, [email]);

  const handleBackToSignIn = () => {
    Logger.info('VerifyRequest', 'Back to sign in button clicked');
    router.push('/api/auth/signin');
  };

  return (
    <Box maxW="md" mx="auto" mt={8} textAlign="center">
      <Heading mb={4}>Check Your Email</Heading>
      <Text mb={6}>
        A verification email has been sent to {email ? `${email}` : 'your email address'}. 
        Please check your inbox and click the link to complete the sign-in process.
      </Text>
      <Text mb={6} fontSize="sm" color="gray.500">
        If you don&apos;t see the email, please check your spam folder.
      </Text>
      <Text mb={4} color="gray.600">
        Redirecting to sign-in in {countdown} seconds...
      </Text>
      <Button 
        colorScheme="blue" 
        onClick={handleBackToSignIn}
        width="full"
      >
        Back to Sign In
      </Button>
    </Box>
  );
};

export default VerifyRequest;