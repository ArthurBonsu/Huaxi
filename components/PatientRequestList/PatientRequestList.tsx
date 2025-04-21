import React, { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Button, 
  Flex, 
  Badge, 
  Divider,
  useToast
} from '@chakra-ui/react';
import { usePatientDoctorContext } from '@/contexts/PatientDoctorContext';
import { APPOINTMENT_CONFIG } from '@/config/appointment_config'; // Adjust import path as needed
import { Logger } from '../../utils/logger';

const PatientRequestList: React.FC = () => {
  const { 
    currentAccount, 
    connectWallet, 
    reviewPatientRequests,
    approvePatientRequest,
    rejectPatientRequest,
    pendingPatients
  } = usePatientDoctorContext();

  const [patients, setPatients] = useState(pendingPatients);
  const toast = useToast();

  useEffect(() => {
    Logger.info('PatientRequestList', 'Component mounted');
    return () => {
      Logger.info('PatientRequestList', 'Component unmounted');
    };
  }, []);

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      Logger.info('PatientRequestList', 'Fetching patient requests');
      try {
        // If no wallet connected, connect first
        if (!currentAccount) {
          Logger.info('PatientRequestList', 'No wallet connected, attempting to connect');
          await connectWallet();
        }
        
        // Fetch patient requests
        Logger.debug('PatientRequestList', 'Calling reviewPatientRequests');
        const fetchedPatients = await reviewPatientRequests();
        Logger.info('PatientRequestList', 'Patient requests fetched successfully', { count: fetchedPatients.length });
        setPatients(fetchedPatients);
      } catch (error) {
        Logger.error('PatientRequestList', 'Error fetching patient requests', { error: error instanceof Error ? error.message : String(error) });
        toast({
          title: "Error Fetching Patients",
          description: error instanceof Error ? error.message : "Unable to fetch patient requests",
          status: "error",
          duration: 3000,
          isClosable: true
        });
      }
    };

    fetchPatients();
  }, [currentAccount, connectWallet, reviewPatientRequests, toast]);

  const handleConnectWallet = async () => {
    Logger.info('PatientRequestList', 'Connect wallet button clicked');
    try {
      await connectWallet();
      Logger.info('PatientRequestList', 'Wallet connected successfully');
    } catch (error) {
      Logger.error('PatientRequestList', 'Failed to connect wallet', { error: error instanceof Error ? error.message : String(error) });
    }
  };

  const handleApproveRequest = async (patientId: string) => {
    Logger.info('PatientRequestList', 'Approve patient request clicked', { patientId });
    try {
      Logger.debug('PatientRequestList', 'Calling approvePatientRequest', { patientId });
      await approvePatientRequest(patientId);
      
      Logger.info('PatientRequestList', 'Patient request approved successfully', { patientId });
      toast({
        title: "Patient Approved",
        description: "Patient request has been approved",
        status: "success",
        duration: 3000,
        isClosable: true
      });

      // Update local state
      Logger.debug('PatientRequestList', 'Updating local state after approval');
      setPatients(prev => prev.filter(patient => patient.id !== patientId));
    } catch (error) {
      Logger.error('PatientRequestList', 'Error approving patient request', { 
        patientId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      toast({
        title: "Approval Failed",
        description: error instanceof Error ? error.message : "Unable to approve patient",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleRejectRequest = async (patientId: string) => {
    Logger.info('PatientRequestList', 'Reject patient request clicked', { patientId });
    try {
      Logger.debug('PatientRequestList', 'Calling rejectPatientRequest', { patientId });
      await rejectPatientRequest(patientId);
      
      Logger.info('PatientRequestList', 'Patient request rejected successfully', { patientId });
      toast({
        title: "Patient Rejected",
        description: "Patient request has been rejected",
        status: "warning",
        duration: 3000,
        isClosable: true
      });

      // Update local state
      Logger.debug('PatientRequestList', 'Updating local state after rejection');
      setPatients(prev => prev.filter(patient => patient.id !== patientId));
    } catch (error) {
      Logger.error('PatientRequestList', 'Error rejecting patient request', { 
        patientId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      toast({
        title: "Rejection Failed",
        description: error instanceof Error ? error.message : "Unable to reject patient",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  return (
    <Box 
      maxWidth="600px" 
      margin="auto" 
      padding={6} 
      borderWidth={1} 
      borderRadius="lg"
    >
      <Heading size="lg" mb={6} textAlign="center">
        Pending Patient Requests
      </Heading>

      {!currentAccount && (
        <Button 
          colorScheme="blue" 
          onClick={handleConnectWallet}
          width="full"
          mb={4}
        >
          Connect Wallet
        </Button>
      )}

      {patients.length === 0 ? (
        <Text textAlign="center" color="gray.500">
          No pending patient requests
        </Text>
      ) : (
        <VStack spacing={4} width="full">
          {patients.map((patient) => (
            <Box 
              key={patient.id} 
              width="full" 
              borderWidth={1} 
              borderRadius="md" 
              p={4}
            >
              <Flex justifyContent="space-between" alignItems="center">
                <VStack align="start" spacing={2}>
                  <Text>
                    <strong>Name:</strong> {patient.name}
                  </Text>
                  <Text>
                    <strong>Address:</strong> {patient.address}
                  </Text>
                  <Text>
                    <strong>Request Time:</strong> {new Date(patient.requestTimestamp).toLocaleString()}
                  </Text>
                  <Badge colorScheme="yellow">
                    Payment Amount: {patient.paymentAmount} HCOIN
                  </Badge>
                </VStack>

                <Flex direction="column" gap={2}>
                  <Button 
                    colorScheme="green" 
                    size="sm"
                    onClick={() => handleApproveRequest(patient.id)}
                  >
                    Approve
                  </Button>
                  <Button 
                    colorScheme="red" 
                    size="sm"
                    onClick={() => handleRejectRequest(patient.id)}
                  >
                    Reject
                  </Button>
                </Flex>
              </Flex>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default PatientRequestList;