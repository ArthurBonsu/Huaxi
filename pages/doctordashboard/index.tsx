import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast
} from '@chakra-ui/react';
import { usePatientDoctorContext } from '@/contexts/PatientDoctorContext';
import PatientRequestList from '@/components/PatientRequestList';
import PatientStatusList from '@/components/PatientStatusList';
import { Logger } from '@/utils/logger';

const DoctorDashboard: React.FC = () => {
  Logger.info('DoctorDashboard', 'Component rendering');
  const router = useRouter();
  
  const {
    currentAccount,
    connectWallet,
    createDoctorProfile
  } = usePatientDoctorContext();

  const [doctorDetails, setDoctorDetails] = useState({
    name: '',
    specialization: ''
  });

  const toast = useToast();
  const [tabIndex, setTabIndex] = useState(0);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [hasDoctorProfile, setHasDoctorProfile] = useState(false);

  // Check if user has completed onboarding
  useEffect(() => {
    const checkDoctorProfile = async () => {
      if (!currentAccount) return;
      
      try {
        // Check localStorage for existing profile flag
        const hasCompletedOnboarding = localStorage.getItem(`doctor_onboarded_${currentAccount}`);
        
        // If no profile, redirect to welcome page
        if (!hasCompletedOnboarding) {
          Logger.info('DoctorDashboard', 'No doctor profile found, redirecting to welcome');
          router.push('/doctordashboard/doctorwelcome');
          return;
        }
        
        // If they have a profile, mark as existing user
        setHasDoctorProfile(true);
        setIsCheckingProfile(false);
        
        Logger.info('DoctorDashboard', 'Doctor profile loaded');
      } catch (error) {
        Logger.error('DoctorDashboard', 'Error checking doctor profile', {
          error: error instanceof Error ? error.message : String(error)
        });
        setIsCheckingProfile(false);
      }
    };
    
    if (currentAccount) {
      checkDoctorProfile();
    } else {
      setIsCheckingProfile(false);
    }
  }, [currentAccount, router]);

  // Log component lifecycle
  useEffect(() => {
    Logger.info('DoctorDashboard', 'Component mounted');
    
    return () => {
      Logger.info('DoctorDashboard', 'Component unmounted');
    };
  }, []);

  // Log when wallet account changes
  useEffect(() => {
    Logger.debug('DoctorDashboard', 'Wallet account state changed', { 
      account: currentAccount || 'Not connected' 
    });
  }, [currentAccount]);

  // Check wallet connection on mount
  useEffect(() => {
    Logger.debug('DoctorDashboard', 'Checking wallet connection');
    
    const checkWalletConnection = async () => {
      if (!currentAccount) {
        Logger.info('DoctorDashboard', 'No wallet connected, attempting to connect');
        try {
          await connectWallet();
          Logger.info('DoctorDashboard', 'Wallet connected successfully');
        } catch (error) {
          Logger.error('DoctorDashboard', 'Wallet connection failed', { 
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
  }, [currentAccount, connectWallet, toast]);

  // Handle doctor profile creation
  const handleCreateProfile = async () => {
    Logger.info('DoctorDashboard', 'Creating doctor profile', doctorDetails);
    
    try {
      // Validate input
      if (!doctorDetails.name || !doctorDetails.specialization) {
        Logger.warn('DoctorDashboard', 'Incomplete doctor profile details', doctorDetails);
        
        toast({
          title: "Incomplete Profile",
          description: "Please fill in all doctor details",
          status: "error",
          duration: 3000,
          isClosable: true
        });
        return;
      }

      // Create doctor profile
      Logger.debug('DoctorDashboard', 'Calling createDoctorProfile', {
        ...doctorDetails,
        address: currentAccount
      });
      
      await createDoctorProfile({
        name: doctorDetails.name,
        specialization: doctorDetails.specialization,
        address: currentAccount
      });

      // Mark user as having completed onboarding
      if (currentAccount) {
        localStorage.setItem(`doctor_onboarded_${currentAccount}`, 'true');
        localStorage.setItem(`doctor_name_${currentAccount}`, doctorDetails.name);
      }

      setHasDoctorProfile(true);
      
      Logger.info('DoctorDashboard', 'Doctor profile created successfully');
      
      toast({
        title: "Profile Created",
        description: "Your doctor profile has been successfully created",
        status: "success",
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      Logger.error('DoctorDashboard', 'Doctor profile creation failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      toast({
        title: "Profile Creation Failed",
        description: error instanceof Error ? error.message : "Unable to create profile",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleTabChange = (index: number) => {
    Logger.debug('DoctorDashboard', 'Tab changed', { oldTab: tabIndex, newTab: index });
    setTabIndex(index);
  };

  const handleConnectWallet = async () => {
    Logger.info('DoctorDashboard', 'Connect wallet button clicked');
    
    try {
      await connectWallet();
      Logger.info('DoctorDashboard', 'Wallet connected successfully');
    } catch (error) {
      Logger.error('DoctorDashboard', 'Wallet connection failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    Logger.debug('DoctorDashboard', 'Input changed', { field: name, value });
    
    setDoctorDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Show loading state while checking profile
  if (isCheckingProfile && currentAccount) {
    return (
      <Box maxWidth="800px" margin="auto" p={6} textAlign="center">
        <Heading mb={6}>Loading Your Profile</Heading>
        <Text>Please wait while we load your information...</Text>
      </Box>
    );
  }

  return (
    <Box maxWidth="800px" margin="auto" p={6}>
      <Heading mb={6} textAlign="center">
        Doctor Dashboard
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
      ) : hasDoctorProfile ? (
        <Tabs 
          variant="enclosed" 
          colorScheme="green" 
          index={tabIndex} 
          onChange={handleTabChange}
        >
          <TabList mb={4}>
            <Tab>Patient Requests</Tab>
            <Tab>Patient Status</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <PatientRequestList />
            </TabPanel>
            
            <TabPanel>
              <PatientStatusList />
            </TabPanel>
          </TabPanels>
        </Tabs>
      ) : (
        <Box
          borderWidth={1}
          borderRadius="lg"
          p={6}
          mt={6}
        >
          <Heading size="md" mb={4}>
            Create Doctor Profile
          </Heading>

          <VStack spacing={4}>
            <Box width="full">
              <Text mb={2}>Doctor Name</Text>
              <input
                type="text"
                name="name"
                value={doctorDetails.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E0'
                }}
              />
            </Box>

            <Box width="full">
              <Text mb={2}>Specialization</Text>
              <select
                name="specialization"
                value={doctorDetails.specialization}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E0'
                }}
              >
                <option value="">Select Specialization</option>
                <option value="General Practice">General Practice</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Oncology">Oncology</option>
              </select>
            </Box>

            <Button
              colorScheme="green"
              width="full"
              onClick={handleCreateProfile}
            >
              Create Profile
            </Button>
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default DoctorDashboard;