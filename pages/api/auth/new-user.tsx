// pages/auth/new-user.tsx
import { FC, useState, useEffect } from 'react';
import { Heading, Text, Box, Button, RadioGroup, Radio, Stack, VStack, useToast } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Logger } from '@/utils/logger';

const NewUser: FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [role, setRole] = useState<string>('');
  const [countdown, setCountdown] = useState(5);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      Logger.warn('NewUser', 'No active session, redirecting to sign in');
      router.push('/api/auth/signin');
    }
  }, [status, router]);

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

  // Countdown and redirect logic
  useEffect(() => {
    if (!session || !role) return;
    
    Logger.debug('NewUser', 'Starting redirect countdown', { role });
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          Logger.info('NewUser', 'Redirect countdown completed, navigating to welcome page');
          
          // Save role in local storage
          localStorage.setItem(`user_role_${session.user.id}`, role);
          
          // Redirect based on role
          if (role === 'doctor') {
            router.push('/doctordashboard/doctorwelcome');
          } else {
            router.push('/patientinteractionpage/patientwelcome');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, [router, session, role]);

  const handleContinue = () => {
    if (!role) {
      toast({
        title: "Please select a role",
        description: "You need to select either Patient or Doctor to continue",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    Logger.info('NewUser', 'Continue button clicked', { selectedRole: role });
    
    // Save role in local storage
    if (session?.user?.id) {
      localStorage.setItem(`user_role_${session.user.id}`, role);
    }
    
    // Redirect based on role
    if (role === 'doctor') {
      router.push('/doctordashboard/doctorwelcome');
    } else {
      router.push('/patientinteractionpage/patientwelcome');
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <Box maxW="md" mx="auto" mt={8} textAlign="center">
        <Heading mb={4}>Loading...</Heading>
      </Box>
    );
  }

  return (
    <Box maxW="md" mx="auto" mt={8} textAlign="center" p={6} borderWidth="1px" borderRadius="lg">
      <Heading mb={4}>Welcome to Hospital Blockchain!</Heading>
      <Text mb={6}>
        Your account has been created successfully. Please select your role:
      </Text>
      
      <VStack spacing={6} align="center" mb={6}>
        <RadioGroup onChange={setRole} value={role}>
          <Stack direction="column" spacing={4}>
            <Radio value="patient" size="lg">I am a Patient</Radio>
            <Radio value="doctor" size="lg">I am a Doctor</Radio>
          </Stack>
        </RadioGroup>
      </VStack>
      
      {role && (
        <Text mb={6}>
          You&apos;ll be redirected to the {role} portal in {countdown} seconds.
        </Text>
      )}
      
      <Button 
        colorScheme="blue" 
        onClick={handleContinue} 
        isDisabled={!role}
        width="full"
      >
        Continue to {role ? (role === 'doctor' ? 'Doctor' : 'Patient') : 'Selected'} Portal
      </Button>
    </Box>
  );
};

export default NewUser;