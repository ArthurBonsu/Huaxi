import { ComponentType, FC, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import {
  Avatar,
  Button,  
  Flex,
  Heading,
  Menu,
  useDisclosure,
  MenuButton,
  MenuList,
  Text,
  useClipboard,
  Input,
  Stack,
  ButtonProps,  
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Box,
  Grid,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  chakra,
} from '@chakra-ui/react';

import { useAppToast } from 'hooks/index';
import { useSession, signIn, signOut } from 'next-auth/react';
import { BsGithub, BsTwitter, BsGoogle } from 'react-icons/bs';
import { signInWithPopup } from 'firebase/auth';
import { GoogleAuthProvider, TwitterAuthProvider } from 'firebase/auth';
import { auth, db } from '../../../services/firebaseConfig';
import { VStack } from '@chakra-ui/react';
import { Logger } from '@/utils/logger';

const providers = [
  { name: 'github',   Icon: BsGithub },
  { name: 'twitter', Icon: BsTwitter },
  { name: 'google', Icon: BsGoogle },
];

interface LoginProps {
  isCollapsed?: boolean;
  username?: string;
  email?: string;
  password?: string;
}

const SignIn: FC<LoginProps> = ({ isCollapsed = false, username, email, password }) => {
  Logger.info('SignIn', 'Component rendering', { isCollapsed });
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emailInput, setEmailInput] = useState(email || '');

  const { hasCopied, onCopy } = useClipboard(username || '');
  const toast = useAppToast();
  const stackSpacing = isCollapsed ? 4 : 1;

  const { data: session, status } = useSession();

  

useEffect(() => {
  if (hasCopied) {
    Logger.debug('SignIn', 'Login details copied');
    toast.showToast('Login details copied', 'info'); // Potential issue
  }
}, [hasCopied, toast]);

  // Log component lifecycle
  useEffect(() => {
    Logger.info('SignIn', 'Component mounted');
    
    return () => {
      Logger.info('SignIn', 'Component unmounted');
    };
  }, []);

  // Log session status changes
  useEffect(() => {
    Logger.debug('SignIn', 'Session status changed', { status });
    
    if (status === 'authenticated') {
      Logger.info('SignIn', 'User authenticated', { 
        userId: session?.user?.id,
        email: session?.user?.email 
      });
    }
  }, [status, session]);

  useEffect(() => {
    if (hasCopied) {
      Logger.debug('SignIn', 'Login details copied');
      toast.showToast('Login details copied', 'info');
    }
  }, [hasCopied, toast]);

  if (status === 'loading') return <Heading>Checking Authentication ...</Heading>;
  if (session) {
    Logger.info('SignIn', 'User already signed in, redirecting to home', {
      userId: session?.user?.id
    });
    
    setTimeout(() => {
      router.push('/');
    }, 5000);
    return <Heading>You are already signed in</Heading>;
  }

  const handleOAuthSignIn = (provider: string) => async () => {
    Logger.info('SignIn', 'OAuth sign in initiated', { provider });
    setIsLoading(true);
    
    try {
      await signIn(provider);
      Logger.info('SignIn', 'OAuth sign in completed', { provider });
    } catch (error) {
      Logger.error('SignIn', 'OAuth sign in failed', { 
        provider,
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirebaseGoogleSignIn = async () => {
    Logger.info('SignIn', 'Firebase Google sign in initiated');
    setIsLoading(true);
    
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      Logger.info('SignIn', 'Firebase Google sign in successful', { 
        userId: result.user.uid 
      });
      
      router.push('/welcome');
    } catch (error: any) {
      Logger.error('SignIn', 'Firebase Google sign in failed', { 
        error: error.message,
        code: error.code
      });
      
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirebaseTwitterSignIn = async () => {
    Logger.info('SignIn', 'Firebase Twitter sign in initiated');
    setIsLoading(true);
    
    const provider = new TwitterAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      Logger.info('SignIn', 'Firebase Twitter sign in successful', { 
        userId: result.user.uid 
      });
      
      router.push('/welcome');
    } catch (error: any) {
      Logger.error('SignIn', 'Firebase Twitter sign in failed', { 
        error: error.message,
        code: error.code
      });
      
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    Logger.info('SignIn', 'Email sign in form submitted', { 
      emailProvided: !!emailInput 
    });
    
    if (!emailInput) {
      Logger.warn('SignIn', 'Email sign in attempted without email');
      return false;
    }
    
    setIsLoading(true);
    signIn('email', { email: emailInput, redirect: false })
      .then(result => {
        Logger.info('SignIn', 'Email sign in initiated', { 
          success: result?.ok,
          error: result?.error
        });
      })
      .catch(error => {
        Logger.error('SignIn', 'Email sign in failed', { 
          error: error instanceof Error ? error.message : String(error)
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    Logger.debug('SignIn', 'Email input changed');
    setEmailInput(e.target.value);
  };

  return (
    <Box maxW="md" mx="auto" mt={8}>
      <Heading mb={6}>Sign In</Heading>
      <chakra.form onSubmit={handleSubmit}>
        <FormControl>
          <FormLabel>Email Address</FormLabel>
          <Input 
            type="email" 
            value={emailInput}
            onChange={handleEmailChange} 
          />
        </FormControl>
        {providers.map((item, index) => (
          <Box key={index}>
            <VStack>
              <Button
                type="submit"
                key={item.name}
                leftIcon={<item.Icon />}
                onClick={handleOAuthSignIn(item.name)}
                textTransform="uppercase"
                w="100%"
                isLoading={isLoading}
              >
                Sign in with {item.name}
              </Button>
            </VStack>
          </Box>
        ))}
      </chakra.form>
      <Stack spacing={4} mt={4}>
        <Button 
          colorScheme="blue" 
          onClick={handleFirebaseGoogleSignIn}
          isLoading={isLoading}
        >
          Sign in with Google
        </Button>
        <Button 
          colorScheme="twitter" 
          onClick={handleFirebaseTwitterSignIn}
          isLoading={isLoading}
        >
          Sign in with Twitter
        </Button>
      </Stack>
    </Box>
  );
};

export default SignIn;