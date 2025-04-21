import React, { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  Badge,
  Flex
} from '@chakra-ui/react';
import { usePatientDoctorContext } from '@/contexts/PatientDoctorContext';
import { Logger } from '../../utils/logger';

const PatientStatusList: React.FC = () => {
  const { 
    approvedPatients, 
    rejectedPatients 
  } = usePatientDoctorContext();

  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    Logger.info('PatientStatusList', 'Component mounted');
    return () => {
      Logger.info('PatientStatusList', 'Component unmounted');
    };
  }, []);

  useEffect(() => {
    Logger.info('PatientStatusList', 'Approved patients updated', { count: approvedPatients.length });
  }, [approvedPatients]);

  useEffect(() => {
    Logger.info('PatientStatusList', 'Rejected patients updated', { count: rejectedPatients.length });
  }, [rejectedPatients]);

  const handleTabChange = (index: number) => {
    Logger.debug('PatientStatusList', 'Tab changed', { newTabIndex: index });
    setTabIndex(index);
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
        Patient Request Status
      </Heading>

      <Tabs 
        variant="soft-rounded" 
        colorScheme="green" 
        index={tabIndex} 
        onChange={handleTabChange}
      >
        <TabList mb={4}>
          <Tab>Approved Patients</Tab>
          <Tab>Rejected Patients</Tab>
        </TabList>

        <TabPanels>
          {/* Approved Patients Tab */}
          <TabPanel>
            {approvedPatients.length === 0 ? (
              <Text textAlign="center" color="gray.500">
                No approved patient requests
              </Text>
            ) : (
              <VStack spacing={4} width="full">
                {approvedPatients.map((patient) => {
                  Logger.debug('PatientStatusList', 'Rendering approved patient', { id: patient.id });
                  return (
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
                            <strong>Approved Time:</strong> {new Date(patient.requestTimestamp).toLocaleString()}
                          </Text>
                          <Badge colorScheme="green">
                            Approved
                          </Badge>
                        </VStack>
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </TabPanel>

          {/* Rejected Patients Tab */}
          <TabPanel>
            {rejectedPatients.length === 0 ? (
              <Text textAlign="center" color="gray.500">
                No rejected patient requests
              </Text>
            ) : (
              <VStack spacing={4} width="full">
                {rejectedPatients.map((patient) => {
                  Logger.debug('PatientStatusList', 'Rendering rejected patient', { id: patient.id });
                  return (
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
                            <strong>Rejection Time:</strong> {new Date(patient.requestTimestamp).toLocaleString()}
                          </Text>
                          <Badge colorScheme="red">
                            Rejected
                          </Badge>
                        </VStack>
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default PatientStatusList;