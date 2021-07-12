import { useState, useRef } from 'react';
import {
  Box,
  Flex,
  Spacer,
  HStack,
  Heading,
  Link,
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useAccounts, useSaversVault } from '../hooks';
import { App, Router } from '../config';
import { startAndEnd } from '../utils/formatAddress';

export const NavBar = () => {
  const [showLastTx, setShowLastTx] = useState(false);
  const onClose = () => setShowLastTx(false);
  const cancelRef = useRef();

  const { hasMetaMask, selectedAddress, networkVersion, requestAccounts, switchToPolygon } =
    useAccounts((state) => ({
      hasMetaMask: state.hasMetaMask,
      selectedAddress: state.selectedAddress,
      networkVersion: state.networkVersion,
      requestAccounts: state.requestAccounts,
      switchToPolygon: state.switchToPolygon,
    }));

  const { currentTransaction, previousTransaction } = useSaversVault((state) => ({
    currentTransaction: state.currentTransaction,
    previousTransaction: state.previousTransaction,
  }));

  const onConnect = async () => {
    if (!hasMetaMask) {
      window.open('https://metamask.io/', '_blank');
    } else if (networkVersion !== App.CHAIN_ID) {
      switchToPolygon();
    } else if (selectedAddress) {
      setShowLastTx(true);
    } else {
      await requestAccounts();
    }
  };

  const buttonText = () => {
    if (!hasMetaMask) {
      return 'Get MetaMask';
    } else if (networkVersion !== App.CHAIN_ID) {
      return 'Switch to Polygon';
    } else if (selectedAddress) {
      return startAndEnd(selectedAddress);
    } else {
      return 'Connect';
    }
  };

  return (
    <header>
      <Box shadow="md" py="16px" px={['16px']}>
        <Flex maxW="2xl" margin="0 auto" alignItems="baseline">
          <Heading size="lg">Stackup</Heading>
          <Spacer />
          <HStack spacing={['16px', '24px']}>
            <NextLink href={Router.SAVERS}>
              <Link alignItems="center" fontWeight="semibold" fontSize={['sm', 'md']}>
                Savers
              </Link>
            </NextLink>
            <Button
              suppressHydrationWarning
              onClick={onConnect}
              isLoading={currentTransaction}
              size="sm"
              colorScheme="blue"
              variant="outline"
            >
              {buttonText()}
            </Button>
          </HStack>
        </Flex>
      </Box>
      <AlertDialog isOpen={showLastTx} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Latest transaction
            </AlertDialogHeader>

            <AlertDialogBody>
              {previousTransaction
                ? `Latest transaction ${previousTransaction.status ? 'passed ✅' : 'failed ❌'}`
                : 'No transactions done in this session yet!'}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              {previousTransaction && (
                <>
                  <Button
                    colorScheme="blue"
                    onClick={() =>
                      window.open(
                        `https://polygonscan.com/tx/${previousTransaction.transactionHash}`,
                        '_blank',
                      )
                    }
                    ml="16px"
                  >
                    Explorer
                  </Button>
                  <Button
                    colorScheme="cyan"
                    onClick={() =>
                      window.open(
                        `https://dashboard.tenderly.co/tx/polygon/${previousTransaction.transactionHash}`,
                        '_blank',
                      )
                    }
                    ml="16px"
                  >
                    Debug
                  </Button>
                </>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </header>
  );
};
