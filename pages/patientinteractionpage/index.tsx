import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@chakra-ui/react';
import { usePatientDoctorContext } from '@/contexts/PatientDoctorContext';
import { APPOINTMENT_CONFIG, validateAppointmentRequest } from 'config/appointment_config';
import { Logger } from '@/utils/logger';

const PatientInteractionPage: React.FC = () => {
  Logger.info('PatientInteractionPage', 'Component rendering');
  const router = useRouter();
  
  const { 
    currentAccount, 
    connectWallet,
    createPatientRequest,
    payForAppointment
  } = usePatientDoctorContext();

  const [patientDetails, setPatientDetails] = useState({
    name: '',
    specialization: '',
    description: '',
    appointmentFee: 0
  });
  
  const [tabIndex, setTabIndex] = useState(0);
  const toast = useToast();
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  // Check if user has completed onboarding
  useEffect(() => {
    const checkPatientProfile = async () => {
      if (!currentAccount) return;
      
      try {
        // Check localStorage for existing profile flag
        const hasCompletedOnboarding = localStorage.getItem(`patient_onboarded_${currentAccount}`);
        
        // If no profile, redirect to welcome page
        if (!hasCompletedOnboarding) {
          Logger.info('PatientInteractionPage', 'No patient profile found, redirecting to welcome');
          router.push('/patientinteractionpage/patientwelcome');
          return;
        }
        
        // Load patient data if they have a profile
        // This would typically come from your blockchain contract
        // For now we'll just mark that we've checked
        setIsCheckingProfile(false);
        
        Logger.info('PatientInteractionPage', 'Patient profile loaded');
      } catch (error) {
        Logger.error('PatientInteractionPage', 'Error checking patient profile', {
          error: error instanceof Error ? error.message : String(error)
        });
        setIsCheckingProfile(false);
      }
    };
    
    if (currentAccount) {
      checkPatientProfile();
    } else {
      setIsCheckingProfile(false);
    }
  }, [currentAccount, router]);

  // Log component lifecycle
  useEffect(() => {
    Logger.info('PatientInteractionPage', 'Component mounted');
    
    return () => {
      Logger.info('PatientInteractionPage', 'Component unmounted');
    };
  }, []);

  // Log when wallet account changes
  useEffect(() => {
    Logger.debug('PatientInteractionPage', 'Wallet account state changed', { 
      account: currentAccount || 'Not connected' 
    });
  }, [currentAccount]);

  // Check wallet connection on mount
  useEffect(() => {
    Logger.debug('PatientInteractionPage', 'Checking wallet connection');
    
    const checkWalletConnection = async () => {
      if (!currentAccount) {
        Logger.info('PatientInteractionPage', 'No wallet connected, attempting to connect');
        try {
          await connectWallet();
          Logger.info('PatientInteractionPage', 'Wallet connected successfully');
        } catch (error) {
          Logger.error('PatientInteractionPage', 'Wallet connection failed', { 
            error: error instanceof Error ? error.message : String(error) 
          });
          
          toast({
            title: "Wallet Connection Failed",
            description: "Please connect your wallet to continue",
            status: "error",
            duration: 3000,
            isClosable: true
          });
        }
      }
    };

    checkWalletConnection();
  }, [connectWallet, currentAccount, toast]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    Logger.debug('PatientInteractionPage', 'Input changed', { field: name, value });
    
    // Dynamic fee calculation based on specialization
    if (name === 'specialization') {
      const feeMultiplier = APPOINTMENT_CONFIG.SPECIALIZATION_FEE_MULTIPLIERS[value] || 1;
      const calculatedFee = APPOINTMENT_CONFIG.MIN_APPOINTMENT_FEE * feeMultiplier;
      
      Logger.debug('PatientInteractionPage', 'Fee calculated', { 
        specialization: value,
        multiplier: feeMultiplier,
        calculatedFee
      });
      
      setPatientDetails(prev => ({
        ...prev,
        [name]: value,
        appointmentFee: calculatedFee
      }));
    } else {
      setPatientDetails(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTabChange = (index: number) => {
    Logger.debug('PatientInteractionPage', 'Tab changed', { oldTab: tabIndex, newTab: index });
    setTabIndex(index);
  };

  const handleConnectWallet = async () => {
    Logger.info('PatientInteractionPage', 'Connect wallet button clicked');
    
    try {
      await connectWallet();
      Logger.info('PatientInteractionPage', 'Wallet connected successfully');
    } catch (error) {
      Logger.error('PatientInteractionPage', 'Wallet connection failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  };

  // Submit appointment request
  const handleSubmitRequest = async () => {
    Logger.info('PatientInteractionPage', 'Submitting appointment request', patientDetails);
    
    // Validate request
    const validationResult = validateAppointmentRequest({
      patientName: patientDetails.name,
      specialization: patientDetails.specialization,
      fee: patientDetails.appointmentFee
    });

    // Check validation
    if (!validationResult.isValid) {
      Logger.warn('PatientInteractionPage', 'Validation failed', { 
        errors: validationResult.errors,
        patientDetails 
      });
      
      toast({
        title: "Validation Error",
        description: validationResult.errors.join(', '),
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      Logger.debug('PatientInteractionPage', 'Calling createPatientRequest', {
        name: patientDetails.name,
        address: currentAccount,
        requestTimestamp: Date.now(),
        paymentAmount: patientDetails.appointmentFee
      });
      
      // Create patient request
      await createPatientRequest({
        name: patientDetails.name,
        address: currentAccount,
        requestTimestamp: Date.now(),
        paymentAmount: patientDetails.appointmentFee
      });

      Logger.info('PatientInteractionPage', 'Appointment request created successfully');
      
      toast({
        title: "Request Submitted",
        description: "Your appointment request has been created",
        status: "success",
        duration: 3000,
        isClosable: true
      });

      // Reset form
      Logger.debug('PatientInteractionPage', 'Resetting form');
      setPatientDetails({
        name: '',
        specialization: '',
        description: '',
        appointmentFee: 0
      });
    } catch (error) {
      Logger.error('PatientInteractionPage', 'Appointment request creation failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      toast({
        title: "Request Failed",
        description: error instanceof Error ? error.message : "Unable to submit request",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Show loading state while checking profile
  if (isCheckingProfile && currentAccount) {
    return (
      <Box maxWidth="600px" margin="auto" p={6} textAlign="center">
        <Heading mb={6}>Loading Your Profile</Heading>
        <Text>Please wait while we load your information...</Text>
      </Box>
    );
  }

  return (
    <Box maxWidth="600px" margin="auto" p={6}>
      <Heading mb={6} textAlign="center">
        Patient Appointment System
      </Heading>

      {!currentAccount ? (
        <Button 
          colorScheme="blue" 
          onClick={handleConnectWallet}
          width="full"
          mb={4}
        >
          Connect Wallet
        </Button>
      ) : (
        <Tabs 
          variant="soft-rounded" 
          colorScheme="green"
          index={tabIndex}
          onChange={handleTabChange}
        >
          <TabList mb={4}>
            <Tab>New Appointment</Tab>
            <Tab>My Appointments</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Patient Name</FormLabel>
                  <Input 
                    name="name"
                    value={patientDetails.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Specialization</FormLabel>
                  <Select 
                    name="specialization"
                    value={patientDetails.specialization}
                    onChange={handleInputChange}
                    placeholder="Select doctor specialization"
                  >
                    {Object.keys(APPOINTMENT_CONFIG.SPECIALIZATION_FEE_MULTIPLIERS).map(spec => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Appointment Description</FormLabel>
                  <Input 
                    name="description"
                    value={patientDetails.description}
                    onChange={handleInputChange}
                    placeholder="Briefly describe your medical concern"
                  />
                </FormControl>

                <FormControl isReadOnly>
                  <FormLabel>Appointment Fee</FormLabel>
                  <Input 
                    value={`${patientDetails.appointmentFee} HCOIN`}
                    isReadOnly
                  />
                </FormControl>

                <Button 
                  colorScheme="green" 
                  width="full"
                  onClick={handleSubmitRequest}
                >
                  Submit Appointment Request
                </Button>
              </VStack>
            </TabPanel>

            <TabPanel>
              {/* Future implementation of patient's appointment history */}
              <Text textAlign="center" color="gray.500">
                Your appointment history will appear here
              </Text>
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </Box>
  );
};

export default PatientInteractionPage;