import React, { useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Spacer, 
  Button,
  useColorMode,
  IconButton
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { usePatientDoctorContext } from '@/contexts/PatientDoctorContext';
import Link from 'next/link';
import { Logger } from '@/utils/logger';

interface LayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<LayoutProps> = ({ children }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { 
    currentAccount, 
    connectWallet 
  } = usePatientDoctorContext();

  useEffect(() => {
    Logger.info('AppLayout', 'Component mounted');
    return () => {
      Logger.info('AppLayout', 'Component unmounted');
    };
  }, []);

  useEffect(() => {
    Logger.debug('AppLayout', 'Wallet account changed', { account: currentAccount || 'Not connected' });
  }, [currentAccount]);

  useEffect(() => {
    Logger.info('AppLayout', 'Color mode changed', { mode: colorMode });
  }, [colorMode]);

  const handleToggleColorMode = () => {
    Logger.debug('AppLayout', 'Toggle color mode clicked', { currentMode: colorMode });
    toggleColorMode();
  };

  const handleConnectWallet = async () => {
    Logger.info('AppLayout', 'Connect wallet button clicked');
    try {
      await connectWallet();
      Logger.info('AppLayout', 'Wallet connected successfully');
    } catch (error) {
      Logger.error('AppLayout', 'Failed to connect wallet', { error: error instanceof Error ? error.message : String(error) });
    }
  };

  return (
    <Flex direction="column" minHeight="100vh">
      {/* Navigation Header */}
      <Box 
        as="header" 
        bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
        p={4}
        boxShadow="md"
      >
        <Flex maxWidth="container.xl" margin="auto" alignItems="center">
          <Heading size="md">
            Hospital Blockchain Platform
          </Heading>

          <Spacer />

          {/* Theme Toggle */}
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={handleToggleColorMode}
            mr={4}
            variant="ghost"
          />

          {/* Navigation Links */}
          <Flex alignItems="center" gap={4}>
            <Link href="/patient" passHref>
              <Button 
                as="a" 
                variant="ghost" 
                colorScheme="blue"
                onClick={() => Logger.debug('AppLayout', 'Patient navigation clicked')}
              >
                Patient
              </Button>
            </Link>

            <Link href="/doctor" passHref>
              <Button 
                as="a" 
                variant="ghost" 
                colorScheme="green"
                onClick={() => Logger.debug('AppLayout', 'Doctor navigation clicked')}
              >
                Doctor
              </Button>
            </Link>

            {/* Wallet Connection */}
            {!currentAccount ? (
              <Button 
                colorScheme="purple"
                onClick={handleConnectWallet}
              >
                Connect Wallet
              </Button>
            ) : (
              <Button 
                variant="outline" 
                colorScheme="blue"
              >
                {`${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`}
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Main Content Area */}
      <Box 
        as="main" 
        flex="1" 
        p={6}
        bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
      >
        <Box maxWidth="container.xl" margin="auto">
          {children}
        </Box>
      </Box>

      {/* Footer */}
      <Box 
        as="footer" 
        bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
        p={4}
        textAlign="center"
      >
        <Flex 
          maxWidth="container.xl" 
          margin="auto" 
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            © {new Date().getFullYear()} Hospital Blockchain Platform
          </Box>

          <Flex gap={4}>
            <Link href="/privacy" passHref>
              <Button 
                as="a" 
                variant="link" 
                size="sm"
                onClick={() => Logger.debug('AppLayout', 'Privacy policy clicked')}
              >
                Privacy Policy
              </Button>
            </Link>

            <Link href="/terms" passHref>
              <Button 
                as="a" 
                variant="link" 
                size="sm"
                onClick={() => Logger.debug('AppLayout', 'Terms of service clicked')}
              >
                Terms of Service
              </Button>
            </Link>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
};

export default AppLayout;