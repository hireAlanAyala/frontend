/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Button,
  InputGroup,
  Input,
  InputRightElement,
  Flex,
  Spacer,
  VStack,
  HStack,
  Text,
  Tag,
  TagLabel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  Link,
  Tooltip,
  Skeleton,
  useToast,
} from '@chakra-ui/react';
import { UpDownIcon } from '@chakra-ui/icons';
import { ethers } from 'ethers';
import { useAccounts, useSaversVault, useDAI } from '../hooks';
import { App } from '../config';

const getTransferAmount = (amount) => {
  let transferAmount = amount;
  if (transferAmount[transferAmount.length - 1] === '.') {
    transferAmount = transferAmount.slice(0, -1);
  }
  const [ether, wei] = transferAmount.split('.');
  const etherAmount = ethers.BigNumber.from(ether).mul(ethers.constants.WeiPerEther);
  const weiAmount = wei
    ? ethers.BigNumber.from(wei).mul(
        ethers.constants.WeiPerEther.div(ethers.BigNumber.from(10).pow(wei.length)),
      )
    : ethers.BigNumber.from(0);
  return etherAmount.add(weiAmount);
};

export const Savers = ({ APY }) => {
  const [direction, setDirection] = useState([App.DAI, App.SAVERS_DAI]);
  const [amount, setAmount] = useState('');
  const [isMax, setIsMax] = useState(false);
  const [approvalRequired, setApprovalRequired] = useState(false);
  const toast = useToast();

  const { getProvider } = useAccounts((state) => ({ getProvider: state.getProvider }));

  const {
    saversDAIBalance,
    saversDAILoading,
    withdraw,
    withdrawMax,
    deposit,
    currentTransaction,
    setCurrentTransaction,
  } = useSaversVault((state) => ({
    saversDAIBalance: state.saversDAIBalance,
    saversDAILoading: state.loading,
    withdraw: state.withdraw,
    withdrawMax: state.withdrawMax,
    deposit: state.deposit,
    currentTransaction: state.currentTransaction,
    setCurrentTransaction: state.setCurrentTransaction,
  }));

  const { DAIBalance, DAILoading, allowanceForSavers, approve } = useDAI((state) => ({
    DAIBalance: state.DAIBalance,
    DAILoading: state.loading,
    allowanceForSavers: state.allowanceForSavers,
    approve: state.approve,
  }));

  const loading = saversDAILoading || DAILoading;

  const balance = ethers.utils.formatUnits(saversDAIBalance);
  const fullDisplayBalance = ethers.utils.commify(balance);
  const roundedDisplayBalance = Math.floor(balance * 100) / 100;

  const daiBalance = ethers.utils.formatUnits(DAIBalance);
  const fullDAIDisplayBalance = ethers.utils.commify(daiBalance);
  const roundedDAIDisplayBalance = Math.floor(daiBalance * 100) / 100;

  const getAmount = () => {
    if (!isMax) {
      return amount;
    } else {
      return direction[0] === App.DAI ? daiBalance : balance;
    }
  };

  const onSwap = () => {
    setDirection([direction[1], direction[0]]);
  };

  const onApprove = async () => {
    if (!getAmount()) return;
    const provider = getProvider();

    const transferAmount = getTransferAmount(getAmount());
    try {
      await approve(App.SAVERS_VAULT, transferAmount, provider.getSigner(), setCurrentTransaction);
    } catch (error) {
      console.error(error);
    }
  };

  const onTransfer = async () => {
    if (!getAmount()) return;
    const provider = getProvider();

    const transferAmount = getTransferAmount(getAmount());
    if (direction[0] === App.DAI) {
      try {
        await deposit(transferAmount, provider.getSigner());
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        if (isMax) {
          await withdrawMax(provider.getSigner());
        } else {
          await withdraw(transferAmount, provider.getSigner());
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const renderTag = (direction, isDAI) => {
    return (
      <Tag w="100%" colorScheme="blue" size="lg">
        <HStack spacing="8px" alignItems="baseline">
          <Text color="gray.100" fontSize="sm">
            {direction}
          </Text>
          <TagLabel>{isDAI ? 'Wallet' : 'Savers'}</TagLabel>
        </HStack>
        <Spacer />
        <Skeleton isLoaded={!loading}>
          <Tooltip hasArrow label={`${isDAI ? fullDAIDisplayBalance : fullDisplayBalance} DAI`}>
            <Text color="gray.100" fontSize="sm">
              {`${isDAI ? roundedDAIDisplayBalance : roundedDisplayBalance} DAI`}
            </Text>
          </Tooltip>
        </Skeleton>
      </Tag>
    );
  };

  const onInputChange = (ev) => {
    let input = ev.target.value.replace(/[^0-9.]/g, '');

    const index = input.indexOf('.');
    if (index === 0) {
      input = '0' + input;
    } else if (index > -1) {
      input = input.substr(0, index + 1) + input.slice(index).replace(/\./g, '');
    }

    setAmount(input);
  };

  useEffect(() => {
    setApprovalRequired(getTransferAmount(getAmount() || '0').gt(allowanceForSavers));
  }, [amount, allowanceForSavers, isMax, direction]);

  useEffect(() => {
    currentTransaction &&
      toast({
        title: 'Transaction pending.',
        description: 'Open MetaMask for details.',
        status: 'info',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
  }, [currentTransaction]);

  return (
    <main>
      <Container maxW="xl" mt={['8', '24']}>
        <Box rounded="xl" bg="gray.700" p="16px" color="white">
          <VStack spacing="16px">
            <Stat rounded="xl" borderWidth="1px" w="100%" p="16px">
              <Flex flexDir="column" justifyContent="center" alignItems="center" textAlign="center">
                <StatLabel>Total saved</StatLabel>
                <Skeleton isLoaded={!loading}>
                  <Tooltip hasArrow label={`${fullDisplayBalance} DAI`}>
                    <StatNumber>{`${roundedDisplayBalance} DAI`}</StatNumber>
                  </Tooltip>
                </Skeleton>
                <StatHelpText>@ {(APY * 100).toFixed(2)}% APY</StatHelpText>
              </Flex>
            </Stat>
            <VStack spacing="8px" w="100%">
              {renderTag('From:', direction[0] === App.DAI)}
              <Button onClick={onSwap} size="xs" colorScheme="cyan" leftIcon={<UpDownIcon />}>
                Swap
              </Button>
              {renderTag('To:', direction[1] === App.DAI)}
            </VStack>
            <InputGroup size="lg">
              <Input
                placeholder="Amount"
                disabled={isMax}
                value={getAmount()}
                onChange={onInputChange}
              />
              <InputRightElement width="4.5rem">
                <Button
                  onClick={() => setIsMax(!isMax)}
                  h="1.75rem"
                  size="sm"
                  colorScheme={isMax ? 'blue' : undefined}
                >
                  Max
                </Button>
              </InputRightElement>
            </InputGroup>
            {direction[0] === App.DAI && approvalRequired ? (
              <Button onClick={onApprove} isLoading={loading} w="100%" colorScheme="blue" size="lg">
                Approve
              </Button>
            ) : (
              <Button
                onClick={onTransfer}
                isLoading={loading}
                w="100%"
                colorScheme="blue"
                size="lg"
              >
                Transfer
              </Button>
            )}
          </VStack>
        </Box>
        <Alert mt="16px" status="info" rounded="xl" fontSize="sm">
          <AlertIcon />
          <Text>
            <Link color="blue.500" isExternal>
              Click here
            </Link>{' '}
            to find out more about Savers!
          </Text>
        </Alert>
      </Container>
    </main>
  );
};
