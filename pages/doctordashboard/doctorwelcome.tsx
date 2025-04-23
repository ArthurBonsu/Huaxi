// pages/doctordashboard/doctorwelcome.tsx
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
  Image,
  List,
  ListItem,
  ListIcon,
  Divider,
  useToast,
  Flex,
  SimpleGrid,
  Icon,
  Progress,
  FormControl,
  FormLabel,
  Select,
  Input
} from '@chakra-ui/react';
import { usePatientDoctorContext } from '@/contexts/PatientDoctorContext';
import { CheckCircleIcon, InfoIcon } from '@chakra-ui/icons';
import { Logger } from '@/utils/logger';

const DoctorWelcome: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const { 
    currentAccount, 
    connectWallet,
    createDoctorProfile 
  } = usePatientDoctorContext();
  
  const [onboardingStep, setOnboardingStep] = useState(1);
  const totalSteps = 4; // Added one more step for profile creation
  
  const [doctorProfile, setDoctorProfile] = useState({
    name: '',
    specialization: '',
    licenseNumber: '',
    hospital: ''
  });

  // Check if user already has profile on mount
  useEffect(() => {
    if (currentAccount) {
      const hasProfile = localStorage.getItem(`doctor_onboarded_${currentAccount}`);
      if (hasProfile) {
        // User already has a profile, redirect to main dashboard
        router.push('/doctordashboard');
      }
    }
  }, [currentAccount, router]);

  // Log component lifecycle
  useEffect(() => {
    Logger.info('DoctorWelcome', 'Component mounted');
    
    return () => {
      Logger.info('DoctorWelcome', 'Component unmounted');
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
  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDoctorProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile creation
  const handleCreateProfile = async () => {
    try {
      // Validate inputs
      if (!doctorProfile.name || !doctorProfile.specialization) {
        toast({
          title: "Missing Information",
          description: "Please provide your name and specialization to continue.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Create profile using context method
      await createDoctorProfile({
        name: doctorProfile.name,
        specialization: doctorProfile.specialization,
        address: currentAccount
      });

      // Mark as onboarded in localStorage
      if (currentAccount) {
        localStorage.setItem(`doctor_onboarded_${currentAccount}`, 'true');
        localStorage.setItem(`doctor_name_${currentAccount}`, doctorProfile.name);
        
        // Store additional info if needed
        const additionalInfo = {
          licenseNumber: doctorProfile.licenseNumber,
          hospital: doctorProfile.hospital
        };
        localStorage.setItem(`doctor_details_${currentAccount}`, JSON.stringify(additionalInfo));
      }

      toast({
        title: "Profile Created",
        description: "Your doctor profile has been created successfully.",
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
      router.push('/doctordashboard');
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
              To use the Doctor Dashboard, you need to connect your wallet. This is necessary to:
            </Text>
            <List spacing={3}>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                Securely authenticate your identity as a medical professional
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                Sign transactions on the blockchain
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                Manage patient appointments and records
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
            <Heading size="lg">Step 2: Create Your Doctor Profile</Heading>
            <Text>
              Let&apos;s set up your doctor profile. This information will be used to verify your identity and professional credentials.
            </Text>
            
            <VStack spacing={4} w="full">
              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input 
                  name="name"
                  value={doctorProfile.name}
                  onChange={handleProfileInputChange}
                  placeholder="Enter your full name"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Specialization</FormLabel>
                <Select 
                  name="specialization"
                  value={doctorProfile.specialization}
                  onChange={handleProfileInputChange}
                  placeholder="Select your specialization"
                >
                  <option value="General Practice">General Practice</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Oncology">Oncology</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>License Number</FormLabel>
                <Input 
                  name="licenseNumber"
                  value={doctorProfile.licenseNumber}
                  onChange={handleProfileInputChange}
                  placeholder="Enter your medical license number"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Hospital/Institution</FormLabel>
                <Input 
                  name="hospital"
                  value={doctorProfile.hospital}
                  onChange={handleProfileInputChange}
                  placeholder="Enter your hospital or institution name"
                />
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

      case 3:
        return (
          <VStack spacing={6} align="flex-start" w="full">
            <Heading size="lg">Step 3: Dashboard Features</Heading>
            <Text>
              The Doctor Dashboard provides you with powerful tools to manage your medical practice on the blockchain:
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
                <Heading fontSize="xl" mb={4}>Patient Requests</Heading>
                <Text>
                  Review and manage incoming appointment requests from patients. Accept or decline requests based on your availability.
                </Text>
              </Box>
              
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
                <Heading fontSize="xl" mb={4}>Patient Status</Heading>
                <Text>
                  Track the status of your patients&apos; appointments, medical records, and payment status.
                </Text>
              </Box>
              
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
                <Heading fontSize="xl" mb={4}>Medical Records</Heading>
                <Text>
                  Securely access and update patient medical records. All changes are recorded on the blockchain for transparency.
                </Text>
              </Box>
              
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
                <Heading fontSize="xl" mb={4}>Payment Verification</Heading>
                <Text>
                  Verify appointment payments made in HCOIN and manage your earnings through the blockchain.
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

      case 4:
        return (
          <VStack spacing={6} align="flex-start" w="full">
            <Heading size="lg">Step 4: Ready to Begin</Heading>
            <Text>
              You&apos;re all set to start using the Doctor Dashboard. Here are some final tips before you begin:
            </Text>
            
            <List spacing={3}>
              <ListItem>
                <ListIcon as={InfoIcon} color="blue.500" />
                Make sure to keep your wallet secure at all times
              </ListItem>
              <ListItem>
                <ListIcon as={InfoIcon} color="blue.500" />
                All blockchain transactions require a small gas fee
              </ListItem>
              <ListItem>
                <ListIcon as={InfoIcon} color="blue.500" />
                Your profile is now securely stored on the blockchain
              </ListItem>
              <ListItem>
                <ListIcon as={InfoIcon} color="blue.500" />
                Patient data is encrypted and securely stored on the blockchain
              </ListItem>
            </List>
            
            <Box pt={6} w="full">
              <Button colorScheme="green" size="lg" w="full" onClick={handleNextStep}>
                Go to Doctor Dashboard
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
        <title>Welcome to Doctor Dashboard | Huaxi Medical Blockchain</title>
        <meta name="description" content="Welcome to the Doctor Dashboard on Huaxi Medical Blockchain system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Container maxW="container.lg" py={10}>
        <VStack spacing={8} align="flex-start">
          <Heading as="h1" size="2xl">
            Welcome to the Doctor Dashboard
          </Heading>
          
          <Text fontSize="lg" color="gray.600">
            Thank you for joining the Huaxi Medical Blockchain system. This onboarding will guide you through the initial setup.
          </Text>
          
          <Flex w="full" justify="space-between" align="center">
            <Text fontWeight="bold">Onboarding Progress</Text>
            <Text>{onboardingStep} of {totalSteps}</Text>
          </Flex>
          
          <Progress value={(onboardingStep / totalSteps) * 100} w="full" colorScheme="green" />
          
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
            
            {onboardingStep > 1 && onboardingStep !== 2 && (
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

export default DoctorWelcome;