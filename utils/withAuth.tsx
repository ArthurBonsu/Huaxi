// utils/withAuth.tsx
import { FC, ComponentType } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Flex, Heading, Button } from '@chakra-ui/react';

export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  const WithAuthComponent: FC<P> = (props) => {
    const { data: session, status } = useSession();

    if (status === 'loading') {
      return <Heading>Loading...</Heading>;
    }

    if (!session) {
      return (
        <Flex direction="column" align="center" justify="center" minH="100vh">
          <Heading mb={4}>You must be signed in to view this page</Heading>
          <Button onClick={() => signIn()}>Sign In</Button>
        </Flex>
      );
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuthComponent;
}