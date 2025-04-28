// pages/auth/verify-request.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { 
  Heading, 
  Text, 
  Box, 
  Button, 
  VStack, 
  Center, 
  Icon, 
  useColorModeValue, 
  Alert,
  AlertIcon,
  AlertDescription,
  Spinner,
  Container,
  Stack,
  Divider
} from '@chakra-ui/react';
import { CheckCircleIcon, EmailIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Logger } from '@/utils/logger';
import Head from 'next/head';

const VerifyRequest: FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Get email from query params
  useEffect(() => {
    if (router.query.email && typeof router.query.email === 'string') {
      setVerificationEmail(router.query.email);
      Logger.info('VerifyRequest', 'Email found in query params', { 
        email: router.query.email 
      });
    }
  }, [router.query]);

  // Define checkVerificationStatus with useCallback to avoid dependency warning
  const checkVerificationStatus = useCallback(async () => {
    try {
      // This would automatically trigger a session refresh via NextAuth
      Logger.info('VerifyRequest', 'Checking verification status');
      
      // Give some time for the check to complete
      setTimeout(() => {
        setCheckingStatus(false);
        
        if (status === 'authenticated') {
          Logger.info('VerifyRequest', 'User authenticated after verification check');
          router.push('/auth/new-user');
        } else {
          // Reset the timer if still not verified
          setSecondsLeft(60);
        }
      }, 2000);
    } catch (error) {
      Logger.error('VerifyRequest', 'Error checking verification status', {
        error: error instanceof Error ? error.message : String(error)
      });
      setCheckingStatus(false);
      setSecondsLeft(60);
    }
  }, [status, router]);

  // If already authenticated, redirect to appropriate page
  useEffect(() => {
    if (status === 'authenticated') {
      Logger.info('VerifyRequest', 'User already authenticated, redirecting');
      router.push('/auth/new-user');
    }
  }, [status, router]);

  // Countdown timer for auto-refresh
  useEffect(() => {
    if (secondsLeft > 0 && status === 'unauthenticated') {
      const timerId = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (secondsLeft === 0) {
      setCheckingStatus(true);
      checkVerificationStatus();
    }
  }, [secondsLeft, status, checkVerificationStatus]);

  // Log component lifecycle
  useEffect(() => {
    Logger.info('VerifyRequest', 'Component mounted', {
      emailProvided: !!verificationEmail
    });
    
    return () => {
      Logger.info('VerifyRequest', 'Component unmounted');
    };
  }, [verificationEmail]);

  const handleBackToSignIn = () => {
    Logger.info('VerifyRequest', 'Back to sign in button clicked');
    router.push('/api/auth/signin');
  };

  const handleResendVerification = () => {
    Logger.info('VerifyRequest', 'Resend verification email clicked', {
      email: verificationEmail
    });
    
    // Here you would implement the logic to resend the verification email
    // This is a placeholder that would be replaced with actual implementation
    alert(`Verification email resent to ${verificationEmail || 'your email address'}!`);
  };

  // If checking authentication, show loading
  if (status === 'loading' || checkingStatus) {
    return (
      <>
        <Head>
          <title>Verify Your Email | Hospital Blockchain Platform</title>
        </Head>
        <Container maxW="container.md" centerContent py={12}>
          <Center minH="60vh">
            <VStack spacing={8}>
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <Text fontSize="lg">Checking verification status...</Text>
            </VStack>
          </Center>
        </Container>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Verify Your Email | Hospital Blockchain Platform</title>
      </Head>
      <Container maxW="container.md" centerContent py={12}>
        <Center minH="70vh">
          <Box
            maxW="lg"
            w="full"
            bg={bgColor}
            boxShadow="xl"
            rounded="lg"
            p={8}
            textAlign="center"
            borderWidth={1}
            borderColor={borderColor}
          >
            <VStack spacing={6}>
              <Icon as={EmailIcon} w={12} h={12} color="blue.500" />
              
              <Heading size="lg">Check your email</Heading>
              
              <Text fontSize="md" color="gray.500">
                We&apos;ve sent a verification link to 
                {verificationEmail ? ` ${verificationEmail}` : ' your email address'}.
                Please click the link to verify your account and continue.
              </Text>
              
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertDescription>
                  This page will automatically check for verification in {secondsLeft} seconds.
                </AlertDescription>
              </Alert>
              
              <Button
                leftIcon={<CheckCircleIcon />}
                colorScheme="blue"
                onClick={checkVerificationStatus}
                isLoading={checkingStatus}
                loadingText="Checking"
                size="lg"
                width="full"
              >
                I&apos;ve verified my email
              </Button>
              
              <Stack direction="column" width="full" spacing={4}>
                <Text fontSize="sm" color="gray.500">
                  Didn&apos;t receive the email? Check your spam folder or
                </Text>
                <Button 
                  variant="outline" 
                  colorScheme="blue" 
                  onClick={handleResendVerification}
                  width="full"
                >
                  Resend verification email
                </Button>
                
                <Box py={2}>
                  <Divider />
                </Box>
                
                <Button 
                  variant="ghost" 
                  onClick={handleBackToSignIn}
                  width="full"
                >
                  Back to Sign In
                </Button>
              </Stack>
            </VStack>
          </Box>
        </Center>
      </Container>
    </>
  );
};

export default VerifyRequest;