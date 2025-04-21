import React from 'react';
import Link from 'next/link';
import { usePatientDoctorContext } from '@/contexts/PatientDoctorContext';
import { Box, Heading, Button, Text, Container, SimpleGrid, VStack, Flex, useToast } from '@chakra-ui/react';

const Home: React.FC = () => {
  const { currentAccount, connectWallet } = usePatientDoctorContext();
  const toast = useToast();

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8}>
        <Heading as="h1" size="2xl" textAlign="center">
          Huaxi Medical Blockchain System
        </Heading>
        
        <Text fontSize="lg" textAlign="center" color="gray.600">
          Secure patient-doctor appointments and medical records on the blockchain
        </Text>
        
        {!currentAccount ? (
          <Button 
            colorScheme="blue" 
            size="lg" 
            onClick={handleConnect}
          >
            Connect Wallet
          </Button>
        ) : (
          <Text>Connected: {currentAccount.substring(0, 6)}...{currentAccount.substring(currentAccount.length - 4)}</Text>
        )}
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} width="100%">
          <Box p={8} borderWidth="1px" borderRadius="lg" shadow="md">
            <VStack spacing={4}>
              <Heading as="h2" size="lg">For Patients</Heading>
              <Text>Request appointments, make payments, and manage your medical records</Text>
              <Link href="/patientinteractionpage" passHref>
                <Button as="a" colorScheme="teal" width="full">
                  Patient Portal
                </Button>
              </Link>
            </VStack>
          </Box>
          
          <Box p={8} borderWidth="1px" borderRadius="lg" shadow="md">
            <VStack spacing={4}>
              <Heading as="h2" size="lg">For Doctors</Heading>
              <Text>Manage appointments, review patient requests, and update medical records</Text>
              <Link href="/doctordashboard" passHref>
                <Button as="a" colorScheme="purple" width="full">
                  Doctor Dashboard
                </Button>
              </Link>
            </VStack>
          </Box>
        </SimpleGrid>
        
        <Box width="100%" pt={10}>
          <Heading as="h3" size="md" mb={4}>
            Recent Transactions
          </Heading>
          <Box p={4} borderWidth="1px" borderRadius="lg">
            <Text color="gray.500" textAlign="center">
              Connect your wallet to view recent transactions
            </Text>
          </Box>
        </Box>
      </VStack>
    </Container>
  );
};

export default Home;