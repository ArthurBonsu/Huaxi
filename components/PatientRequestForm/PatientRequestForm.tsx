import React, { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  Heading, 
  FormControl, 
  FormLabel, 
  Input, 
  Button, 
  Select,
  useToast
} from '@chakra-ui/react';
import { usePatientDoctorContext } from '@/contexts/PatientDoctorContext';
import { logger } from '@/utils/logger';

// Define specialization options
const DOCTOR_SPECIALIZATIONS = [
  'General Practice',
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Oncology'
];

const PatientRequestForm: React.FC = () => {
  const { 
    currentAccount, 
    connectWallet, 
    createPatientRequest 
  } = usePatientDoctorContext();

  const [patientDetails, setPatientDetails] = useState({
    name: '',
    address: '',
    specialization: '',
    requestDescription: '',
    paymentAmount: 0
  });

  const toast = useToast();

  useEffect(() => {
    logger.info('PatientRequestForm', 'Component mounted');
    return () => {
      logger.info('PatientRequestForm', 'Component unmounted');
    };
  }, []);

  useEffect(() => {
    logger.debug('PatientRequestForm', 'Wallet account changed', { account: currentAccount || 'Not connected' });
  }, [currentAccount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    logger.debug('PatientRequestForm', 'Input changed', { field: name, value });
    setPatientDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConnectWallet = async () => {
    logger.info('PatientRequestForm', 'Connect wallet button clicked');
    try {
      await connectWallet();
      logger.info('PatientRequestForm', 'Wallet connected successfully');
    } catch (error) {
      logger.error('PatientRequestForm', 'Failed to connect wallet', { error: error instanceof Error ? error.message : String(error) });
    }
  };

  const handleSubmitRequest = async () => {
    logger.info('PatientRequestForm', 'Submit request button clicked', { patientDetails });
    
    // Validate input
    if (!patientDetails.name || !patientDetails.specialization) {
      logger.warn('PatientRequestForm', 'Form validation failed', { 
        nameProvided: !!patientDetails.name, 
        specializationProvided: !!patientDetails.specialization 
      });
      
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      // If no wallet connected, connect first
      if (!currentAccount) {
        logger.info('PatientRequestForm', 'No wallet connected, attempting to connect');
        await connectWallet();
      }

      logger.info('PatientRequestForm', 'Creating patient request', {
        name: patientDetails.name,
        address: currentAccount,
        requestTimestamp: Date.now(),
        paymentAmount: patientDetails.paymentAmount
      });

      // Create patient request
      await createPatientRequest({
        name: patientDetails.name,
        address: currentAccount,
        requestTimestamp: Date.now(),
        paymentAmount: patientDetails.paymentAmount
      });

      logger.info('PatientRequestForm', 'Patient request created successfully');

      // Show success toast
      toast({
        title: "Request Submitted",
        description: "Your appointment request has been created",
        status: "success",
        duration: 3000,
        isClosable: true
      });

      // Reset form
      logger.debug('PatientRequestForm', 'Resetting form fields');
      setPatientDetails({
        name: '',
        address: '',
        specialization: '',
        requestDescription: '',
        paymentAmount: 0
      });
    } catch (error) {
      logger.error('PatientRequestForm', 'Error submitting patient request', { error: error instanceof Error ? error.message : String(error) });
      
      // Handle errors
      toast({
        title: "Request Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  return (
    <Box 
      maxWidth="500px" 
      margin="auto" 
      padding={6} 
      borderWidth={1} 
      borderRadius="lg"
    >
      <VStack spacing={4}>
        <Heading size="lg">Patient Appointment Request</Heading>

        {!currentAccount && (
          <Button 
            colorScheme="blue" 
            onClick={handleConnectWallet}
            width="full"
          >
            Connect Wallet
          </Button>
        )}

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
          <FormLabel>Doctor Specialization</FormLabel>
          <Select 
            name="specialization"
            value={patientDetails.specialization}
            onChange={handleInputChange}
            placeholder="Select Doctor Specialization"
          >
            {DOCTOR_SPECIALIZATIONS.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Request Description</FormLabel>
          <Input 
            name="requestDescription"
            value={patientDetails.requestDescription}
            onChange={handleInputChange}
            placeholder="Briefly describe your medical concern"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Appointment Fee (HCOIN)</FormLabel>
          <Input 
            name="paymentAmount"
            type="number"
            value={patientDetails.paymentAmount}
            onChange={handleInputChange}
            placeholder="Enter appointment fee in HCOIN"
          />
        </FormControl>

        <Button 
          colorScheme="green" 
          width="full"
          onClick={handleSubmitRequest}
          isDisabled={!currentAccount}
        >
          Submit Appointment Request
        </Button>
      </VStack>
    </Box>
  );
};

export default PatientRequestForm;