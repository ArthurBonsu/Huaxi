import { ethers } from "ethers";
import { FC, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Box, Flex, Heading, Button, HStack, Center } from '@chakra-ui/react';
import SimpleTransfer from '@components/SimpleTransfer';
import Footer from '@components/Footer';
import NavBar from '@components/NavBar';
import { useEthersStore, EtherStore } from 'stores/ethersStore';

const SimpleTransferPage: FC = () => {
  const walletAddress = useEthersStore((state: { address: string }) => state.address);
  const { data: session } = useSession();
  const [isCurrentPage, setisCurrentPage] = useState(false);
  const { push } = useRouter();

  const handleSignOut = async () => {
    const data = await signOut({ redirect: false, callbackUrl: '/some' });
    push(data.url);
  };

  return (
    <Flex color='white'>
      <Center w='100px' bg='green.500'>
        <HStack spacing='24px'>
          {session ? (
            <>
              <div className="min-h-screen">
                <div className='gradient-bg-welcome'>
                  <Heading> You are signed in as {session.user?.email || 'Unknown User'} </Heading>
                  <NavBar title={'Simple Transfer'} address={walletAddress || '0x.. '} />
                  <Button onClick={handleSignOut}>Sign Out</Button>
                  <Button onClick={async () => handleSignOut()}>Sign In</Button>
                </div>
                <SimpleTransfer />
                <Footer
                  message={'Please join us as we make this world a better place'}
                  community={'Community'}
                  copyright={'Trademark Policy'}
                  blog={'Blog'}
                  FAQ={'FAQ'}
                  Contact={'blockdao@gmail.com'}
                  githubUrl={'https://github.com/ArthurBonsu'}
                  twitterUrl={'https://twitter.com/home'}
                  discordUrl={'https://uniswap.org/blog/uniswap-v3'}
                />
              </div>
            </>
          ) : (
            <>
              <Heading> You are not signed in </Heading>
              <Button onClick={async () => signIn()}>Sign In</Button>
            </>
          )}
        </HStack>
      </Center>
    </Flex>
  );
};

export default SimpleTransferPage;
