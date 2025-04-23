// pages/patientinteractionpage/patientwelcome.tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  List,
  ListItem,
  ListIcon,
  Divider,
  useToast,
  Flex,
  SimpleGrid,
  Progress,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  FormControl,
  FormLabel,
  Input,
  FormHelperText
} from '@chakra-ui/react';
import { usePatientDoctorContext } from '@/contexts/PatientDoctorContext';
import { CheckCircleIcon, InfoIcon, QuestionIcon } from '@chakra-ui/icons';
import { Logger } from '@/utils/logger';

const PatientWelcome: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const { 
    currentAccount, 
    connectWallet,
    // Assuming these functions are in your context or would be added
    createPatientProfile 
  } = usePatientDoctorContext();
  
  const [onboardingStep, setOnboardingStep] = useState(1);
  const totalSteps = 4; // Added one more step for profile creation
  
  const [patientProfile, setPatientProfile] = useState({
    name: '',
    email: '',
    birthDate: '',
    phone: ''
  });

  // Check if user already has profile on mount
  useEffect(() => {
    if (currentAccount) {
      const hasProfile = localStorage.getItem(`patient_onboarded_${currentAccount}`);
      if (hasProfile) {
        // User already has a profile, redirect to main dashboard
        router.push('/patientinteractionpage');
      }
    }
  }, [currentAccount, router]);

  // Log component lifecycle
  useEffect(() => {
    Logger.info('PatientWelcome', 'Component mounted');
    
    return () => {
      Logger.info('PatientWelcome', 'Component unmounted');
    };
  }, []);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      setOnboardingStep(2);
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle profile input changes
  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatientProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile creation
  const handleCreateProfile = async () => {
    try {
      // Validate inputs
      if (!patientProfile.name) {
        toast({
          title: "Missing Information",
          description: "Please provide your name to continue.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Create profile on blockchain (assuming this function exists in context)
      // If you don't have this function yet, you can implement it later
      if (typeof createPatientProfile === 'function') {
        await createPatientProfile({
          ...patientProfile,
          address: currentAccount
        });
      }

      // For now, we'll just mark them as onboarded in localStorage
      if (currentAccount) {
        localStorage.setItem(`patient_onboarded_${currentAccount}`, 'true');
        localStorage.setItem(`patient_name_${currentAccount}`, patientProfile.name);
      }

      toast({
        title: "Profile Created",
        description: "Your patient profile has been created successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Move to next step
      setOnboardingStep(onboardingStep + 1);
    } catch (error) {
      toast({
        title: "Profile Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create profile",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle next step
  const handleNextStep = () => {
    if (onboardingStep < totalSteps) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      router.push('/patientinteractionpage');
    }
  };

  // Render content based on current step
  const renderStepContent = () => {
    switch (onboardingStep) {
      case 1:
        return (
          <VStack spacing={6} align="flex-start" w="full">
            <Heading size="lg">Step 1: Connect Your Wallet</Heading>
            <Text>
              To use the Patient Portal, you&apos;ll need to connect your digital wallet. This is necessary to:
            </Text>
            <List spacing={3}>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                Securely identify yourself within the system
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                Make payments for medical appointments using HCOIN
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                Access your medical records securely on the blockchain
              </ListItem>
            </List>
            
            <Box pt={4}>
              {!currentAccount ? (
                <Button colorScheme="blue" size="lg" onClick={handleConnectWallet}>
                  Connect Wallet
                </Button>
              ) : (
                <VStack align="flex-start" spacing={4}>
                  <Flex align="center">
                    <CheckCircleIcon color="green.500" mr={2} />
                    <Text>Wallet connected: {currentAccount.substring(0, 6)}...{currentAccount.substring(currentAccount.length - 4)}</Text>
                  </Flex>
                  <Button colorScheme="green" onClick={handleNextStep}>
                    Continue
                  </Button>
                </VStack>
              )}
            </Box>
          </VStack>
        );

      case 2:
        return (
          <VStack spacing={6} align="flex-start" w="full">
            <Heading size="lg">Step 2: How It Works</Heading>
            <Text>
              The Patient Portal streamlines your healthcare experience through blockchain technology:
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
                <Heading fontSize="xl" mb={4}>Book Appointments</Heading>
                <Text>
                  Easily request appointments with specialized doctors. Choose from various medical specializations based on your needs.
                </Text>
              </Box>
              
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
                <Heading fontSize="xl" mb={4}>Secure Payments</Heading>
                <Text>
                  Pay for medical services using HCOIN, our blockchain-based token. All payments are secure, transparent, and recorded.
                </Text>
              </Box>
              
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
                <Heading fontSize="xl" mb={4}>Medical Records</Heading>
                <Text>
                  Access your medical history securely. Your records are encrypted and stored on the blockchain, accessible only by you and authorized doctors.
                </Text>
              </Box>
              
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
                <Heading fontSize="xl" mb={4}>Appointment Status</Heading>
                <Text>
                  Track your appointment status in real-time. Receive notifications when doctors accept or complete your appointments.
                </Text>
              </Box>
            </SimpleGrid>
            
            <Box pt={4}>
              <Button colorScheme="green" onClick={handleNextStep}>
                Continue
              </Button>
            </Box>
          </VStack>
        );

      case 3:
        return (
          <VStack spacing={6} align="flex-start" w="full">
            <Heading size="lg">Step 3: Create Your Patient Profile</Heading>
            <Text>
              Let&apos;s set up your patient profile. This information will be securely stored and only accessible to your authorized healthcare providers.
            </Text>
            
            <VStack spacing={4} w="full">
              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input 
                  name="name"
                  value={patientProfile.name}
                  onChange={handleProfileInputChange}
                  placeholder="Enter your full name"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input 
                  name="email"
                  type="email"
                  value={patientProfile.email}
                  onChange={handleProfileInputChange}
                  placeholder="Enter your email address"
                />
                <FormHelperText>Optional: For appointment notifications</FormHelperText>
              </FormControl>
              
              <FormControl>
                <FormLabel>Date of Birth</FormLabel>
                <Input 
                  name="birthDate"
                  type="date"
                  value={patientProfile.birthDate}
                  onChange={handleProfileInputChange}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input 
                  name="phone"
                  value={patientProfile.phone}
                  onChange={handleProfileInputChange}
                  placeholder="Enter your phone number"
                />
                <FormHelperText>Optional: For urgent communications</FormHelperText>
              </FormControl>
              
              <Button 
                colorScheme="green" 
                mt={4} 
                w="full"
                onClick={handleCreateProfile}
              >
                Create Profile
              </Button>
            </VStack>
          </VStack>
        );

      case 4:
        return (
          <VStack spacing={6} align="flex-start" w="full">
            <Heading size="lg">Step 4: Frequently Asked Questions</Heading>
            
            <Accordion allowToggle w="full">
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      How do I pay for appointments?
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  Appointments are paid using HCOIN, our blockchain token. You&apos;ll need to have sufficient HCOIN in your connected wallet. The fee varies based on the doctor&apos;s specialization.
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      Is my medical data secure?
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  Yes, all medical data is encrypted and stored securely on the blockchain. Only you and your authorized healthcare providers can access this information.
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      What if I need to cancel an appointment?
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  You can cancel appointments through the Patient Portal. Depending on the cancellation time, you may receive a full or partial refund of your HCOIN payment.
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      How do I get HCOIN?
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  HCOIN can be purchased through our partner exchanges or directly within the platform using your wallet. For demonstration purposes, you might receive some test HCOIN in your wallet.
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
            
            <Box pt={6} w="full">
              <Button colorScheme="green" size="lg" w="full" onClick={handleNextStep}>
                Go to Patient Portal
              </Button>
            </Box>
          </VStack>
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Welcome to Patient Portal | Huaxi Medical Blockchain</title>
        <meta name="description" content="Welcome to the Patient Portal on Huaxi Medical Blockchain system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Container maxW="container.lg" py={10}>
        <VStack spacing={8} align="flex-start">
          <Heading as="h1" size="2xl">
            Welcome to the Patient Portal
          </Heading>
          
          <Text fontSize="lg" color="gray.600">
            Thank you for joining the Huaxi Medical Blockchain system. This guide will help you understand how to use the patient portal.
          </Text>
          
          <Flex w="full" justify="space-between" align="center">
            <Text fontWeight="bold">Onboarding Progress</Text>
            <Text>{onboardingStep} of {totalSteps}</Text>
          </Flex>
          
          <Progress value={(onboardingStep / totalSteps) * 100} w="full" colorScheme="teal" />
          
          <Divider />
          
          <Box w="full">
            {renderStepContent()}
          </Box>
          
          <Divider my={6} />
          
          <Flex w="full" justify="space-between">
            <Button 
              variant="ghost" 
              colorScheme="gray" 
              onClick={() => router.push('/')}
            >
              Back to Home
            </Button>
            
            {onboardingStep > 1 && onboardingStep !== 3 && (
              <Button 
                variant="outline" 
                colorScheme="blue" 
                onClick={() => setOnboardingStep(onboardingStep - 1)}
              >
                Previous Step
              </Button>
            )}
          </Flex>
        </VStack>
      </Container>
    </>
  );
};

export default PatientWelcome;