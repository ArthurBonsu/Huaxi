// pages/auth/new-user.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Heading,
  Text,
  useToast,
  RadioGroup,
  Radio,
  Stack,
  Container,
  useColorModeValue,
  Flex,
  Avatar,
  Center,
  Icon,
  Divider,
  Progress
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { FaUserDoctor, FaUser } from 'react-icons/fa6';
import { Logger } from '@/utils/logger';
import Head from 'next/head';
import { usePatientDoctorContext } from '@/contexts/PatientDoctorContext';

const NewUser: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [role, setRole] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSelectedRole, setHasSelectedRole] = useState(false);
  const { currentAccount } = usePatientDoctorContext();
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      Logger.warn('NewUser', 'No active session, redirecting to sign in');
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  // Check if user already has role
  useEffect(() => {
    if (session?.user?.id) {
      const storedRole = localStorage.getItem(`user_role_${session.user.id}`);
      
      if (storedRole) {
        Logger.info('NewUser', 'User already has a role', { role: storedRole });
        setRole(storedRole);
        setHasSelectedRole(true);
      }
    }
  }, [session]);

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

  const handleContinue = async () => {
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
    setIsSubmitting(true);
    
    try {
      // Save role in local storage
      if (session?.user?.id) {
        localStorage.setItem(`user_role_${session.user.id}`, role);
        setHasSelectedRole(true);
      }
      
      // Show success message
      toast({
        title: "Role Selected",
        description: `You have selected ${role} role successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Redirect to appropriate welcome page
      if (role === 'doctor') {
        router.push('/doctordashboard/doctorwelcome');
      } else {
        router.push('/patientinteractionpage/patientwelcome');
      }
    } catch (error) {
      Logger.error('NewUser', 'Error saving role selection', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      toast({
        title: "Error",
        description: "Failed to save your role selection. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeRole = () => {
    setHasSelectedRole(false);
  };

  // Loading state
  if (status === 'loading') {
    return (
      <>
        <Head>
          <title>Complete Your Profile | Hospital Blockchain Platform</title>
        </Head>
        <Container maxW="container.md" py={10}>
          <Center minH="60vh">
            <VStack spacing={5}>
              <Heading mb={4}>Loading...</Heading>
              <Progress size="xs" isIndeterminate width="300px" />
            </VStack>
          </Center>
        </Container>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Complete Your Profile | Hospital Blockchain Platform</title>
      </Head>
      <Container maxW="container.md" py={10}>
        <Box maxW="md" mx="auto" textAlign="center" p={6} borderWidth="1px" borderRadius="lg" bg={bgColor} boxShadow="lg">
          <VStack spacing={6} align="center">
            {session?.user && (
              <Avatar 
                size="xl" 
                name={(session.user.name || session.user.email || "User") as string}
                src={session.user.image || undefined}
              />
            )}
            
            <Heading mb={2}>Welcome to Hospital Blockchain!</Heading>
            
            {hasSelectedRole ? (
              <VStack spacing={4} width="full">
                <Text>
                  You have selected the following role:
                </Text>
                
                <Box 
                  p={6} 
                  borderWidth="1px" 
                  borderRadius="md" 
                  borderColor={role === 'doctor' ? 'green.200' : 'blue.200'}
                  bg={role === 'doctor' ? 'green.50' : 'blue.50'}
                  width="full"
                >
                  <Flex align="center" justify="center">
                    <Icon 
                      as={role === 'doctor' ? FaUserDoctor : FaUser} 
                      boxSize={8} 
                      color={role === 'doctor' ? 'green.500' : 'blue.500'} 
                      mr={3}
                    />
                    <Text fontSize="xl" fontWeight="bold">
                      {role === 'doctor' ? 'Doctor' : 'Patient'}
                    </Text>
                  </Flex>
                </Box>
                
                <Text fontSize="sm" color="gray.600">
                  This determines which features you&apos;ll have access to in the platform.
                </Text>
                
                <Divider my={2} />
                
                <Button 
                  colorScheme={role === 'doctor' ? 'green' : 'blue'} 
                  width="full"
                  onClick={handleContinue}
                  isLoading={isSubmitting}
                >
                  Continue to {role === 'doctor' ? 'Doctor' : 'Patient'} Portal
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleChangeRole}
                >
                  Change Role
                </Button>
              </VStack>
            ) : (
              <VStack spacing={6} align="center" width="full">
                <Text mb={4}>
                  Please select your role to complete your profile:
                </Text>
                
                <RadioGroup onChange={setRole} value={role} width="full">
                  <Stack direction="column" spacing={4}>
                    <Box 
                      as="label" 
                      cursor="pointer" 
                      borderWidth="1px" 
                      borderRadius="md" 
                      p={4} 
                      _hover={{ borderColor: 'blue.300', bg: 'blue.50' }}
                      borderColor={role === 'patient' ? 'blue.300' : borderColor}
                      bg={role === 'patient' ? 'blue.50' : 'transparent'}
                    >
                      <Flex align="center">
                        <Radio value="patient" size="lg" mr={3} colorScheme="blue" />
                        <Icon as={FaUser} boxSize={5} mr={3} color="blue.500" />
                        <Text fontWeight="medium">I am a Patient</Text>
                      </Flex>
                    </Box>
                    
                    <Box 
                      as="label" 
                      cursor="pointer" 
                      borderWidth="1px" 
                      borderRadius="md" 
                      p={4} 
                      _hover={{ borderColor: 'green.300', bg: 'green.50' }}
                      borderColor={role === 'doctor' ? 'green.300' : borderColor}
                      bg={role === 'doctor' ? 'green.50' : 'transparent'}
                    >
                      <Flex align="center">
                        <Radio value="doctor" size="lg" mr={3} colorScheme="green" />
                        <Icon as={FaUserDoctor} boxSize={5} mr={3} color="green.500" />
                        <Text fontWeight="medium">I am a Doctor</Text>
                      </Flex>
                    </Box>
                  </Stack>
                </RadioGroup>
                
                <Button 
                  colorScheme="teal" 
                  onClick={handleContinue} 
                  isDisabled={!role}
                  width="full"
                  isLoading={isSubmitting}
                  mt={4}
                >
                  Continue
                </Button>
              </VStack>
            )}
            
            {!currentAccount && (
              <Alert status="info" borderRadius="md" mt={4}>
                <AlertIcon />
                <Text fontSize="sm">
                  You&apos;ll need to connect your wallet in the next step to complete your setup.
                </Text>
              </Alert>
            )}
          </VStack>
        </Box>
      </Container>
    </>
  );
};

const Alert: React.FC<{status: string; borderRadius: string; mt: number; children: React.ReactNode}> = ({ status, borderRadius, mt, children }) => {
  const bgColors = {
    info: useColorModeValue('blue.50', 'blue.900'),
    warning: useColorModeValue('yellow.50', 'yellow.900'),
    success: useColorModeValue('green.50', 'green.900'),
    error: useColorModeValue('red.50', 'red.900'),
  };
  
  return (
    <Box 
      p={3} 
      borderRadius={borderRadius} 
      bg={bgColors[status as keyof typeof bgColors]} 
      mt={mt}
      width="full"
    >
      {children}
    </Box>
  );
};

const AlertIcon = () => (
  <Box mr={3} mt="1px">
    <Icon viewBox="0 0 24 24" color="blue.500" boxSize={5}>
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-5h2v2h-2zm0-8h2v6h-2z"
      />
    </Icon>
  </Box>
);

export default NewUser;