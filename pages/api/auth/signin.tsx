import { ComponentType, FC, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,  
  Flex,
  Heading,
  Text,
  VStack,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Link as ChakraLink,
  Divider,
  chakra
} from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
import { BsGithub, BsTwitter, BsGoogle } from 'react-icons/bs';
import { Logger } from '@/utils/logger';
import FirebaseAuthService from '@/services/firebaseAuthService';

const SignIn: FC = () => {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Log component lifecycle
  useEffect(() => {
    Logger.info('SignIn', 'Component mounted');
    
    return () => {
      Logger.info('SignIn', 'Component unmounted');
    };
  }, []);

  // Handle social login providers
  const handleSocialLogin = async (provider: 'google' | 'github' | 'twitter') => {
    setIsLoading(true);
    
    try {
      Logger.info('SignIn', `${provider} sign in initiated`);
      
      // Use NextAuth signIn method for consistent session handling
      const result = await signIn(provider, { 
        redirect: false, 
        callbackUrl: '/auth/new-user' 
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Successful login
      toast({
        title: "Sign In Successful",
        description: `Signed in with ${provider}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Redirect to new user or dashboard
      router.push('/auth/new-user');
    } catch (error) {
      Logger.error('SignIn', `${provider} sign in failed`, { 
        error: error instanceof Error ? error.message : String(error)
      });

      toast({
        title: "Sign In Failed",
        description: error instanceof Error ? error.message : "An error occurred during sign in",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email sign in
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      Logger.info('SignIn', 'Email sign in initiated');

      // Validate email
      if (!email) {
        throw new Error('Please enter an email address');
      }

      // Use NextAuth for email sign in
      const result = await signIn('email', { 
        email, 
        redirect: false, 
        callbackUrl: '/auth/verify-request' 
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Verification Email Sent",
        description: "Check your email to complete sign in",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Redirect to verification page
      router.push('/auth/verify-request');
    } catch (error) {
      Logger.error('SignIn', 'Email sign in failed', { 
        error: error instanceof Error ? error.message : String(error)
      });

      toast({
        title: "Sign In Failed",
        description: error instanceof Error ? error.message : "An error occurred during sign in",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg">
      <Heading mb={6} textAlign="center">Sign In to Huaxi Blockchain</Heading>

      <chakra.form onSubmit={handleEmailSignIn}>
        <VStack spacing={4}>
          {/* Email Input */}
          <FormControl>
            <FormLabel>Email Address</FormLabel>
            <Input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </FormControl>

          {/* Email Sign In Button */}
          <Button 
            type="submit" 
            colorScheme="blue" 
            width="full"
            isLoading={isLoading}
          >
            Continue with Email
          </Button>

          {/* Divider */}
          <Flex align="center" width="full" my={4}>
            <Divider />
            <Text px={4} color="gray.500">OR</Text>
            <Divider />
          </Flex>

          {/* Social Login Buttons */}
          <VStack spacing={3} width="full">
            <Button
              leftIcon={<BsGoogle />}
              colorScheme="red"
              width="full"
              onClick={() => handleSocialLogin('google')}
              isLoading={isLoading}
            >
              Continue with Google
            </Button>

            <Button
              leftIcon={<BsGithub />}
              colorScheme="gray"
              width="full"
              onClick={() => handleSocialLogin('github')}
              isLoading={isLoading}
            >
              Continue with GitHub
            </Button>

            <Button
              leftIcon={<BsTwitter />}
              colorScheme="twitter"
              width="full"
              onClick={() => handleSocialLogin('twitter')}
              isLoading={isLoading}
            >
              Continue with Twitter
            </Button>
          </VStack>

          {/* Additional Links */}
          <Flex justifyContent="space-between" width="full" mt={4}>
            <ChakraLink 
              color="blue.500" 
              onClick={() => router.push('/auth/reset-password')}
            >
              Forgot Password?
            </ChakraLink>
            <ChakraLink 
              color="blue.500" 
              onClick={() => router.push('/auth/signup')}
            >
              Create an Account
            </ChakraLink>
          </Flex>
        </VStack>
      </chakra.form>
    </Box>
  );
};

export default SignIn;