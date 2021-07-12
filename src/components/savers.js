import { useState } from 'react';
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
} from '@chakra-ui/react';
import { UpDownIcon } from '@chakra-ui/icons';
import { ethers } from 'ethers';
import { useAccounts, useSaversVault, useDAI } from '../hooks';
import { App } from '../config';

export const Savers = ({ APY }) => {
  const [direction, setDirection] = useState([App.DAI, App.SAVERS_DAI]);
  const [amount, setAmount] = useState('');

  const { getProvider } = useAccounts((state) => ({ getProvider: state.getProvider }));

  const { fetchSaversDAIBalance, saversDAIBalance, saversDAILoading, withdraw } = useSaversVault(
    (state) => ({
      fetchSaversDAIBalance: state.fetchSaversDAIBalance,
      saversDAIBalance: state.saversDAIBalance,
      saversDAILoading: state.loading,
      withdraw: state.withdraw,
    }),
  );

  const { fetchDAIBalance, DAIBalance, DAILoading } = useDAI((state) => ({
    fetchDAIBalance: state.fetchDAIBalance,
    DAIBalance: state.DAIBalance,
    DAILoading: state.loading,
  }));

  const loading = saversDAILoading || DAILoading;

  const balance = ethers.utils.formatUnits(saversDAIBalance);
  const fullDisplayBalance = ethers.utils.commify(balance);
  const roundedDisplayBalance = Math.floor(balance * 100) / 100;

  const daiBalance = ethers.utils.formatUnits(DAIBalance);
  const fullDAIDisplayBalance = ethers.utils.commify(daiBalance);
  const roundedDAIDisplayBalance = Math.floor(daiBalance * 100) / 100;

  const onSwap = () => {
    setDirection([direction[1], direction[0]]);
  };

  const rehydrate = (provider) => {
    fetchSaversDAIBalance(selectedAddress, provider);
    fetchDAIBalance(selectedAddress, provider);
  };

  const onTransfer = async () => {
    if (!amount) return;
    const provider = getProvider();

    let transferAmount = amount;
    if (transferAmount[transferAmount.length - 1] === '.') {
      transferAmount = transferAmount.slice(0, -1);
    }
    const [ether, wei] = transferAmount.split('.');
    const etherAmount = ethers.BigNumber.from(ether).mul(ethers.constants.WeiPerEther);
    const weiAmount = wei
      ? ethers.BigNumber.from(wei).mul(ethers.constants.WeiPerEther.div(Math.pow(10, wei.length)))
      : ethers.BigNumber.from(0);
    transferAmount = etherAmount.add(weiAmount);

    if (direction[0] === App.DAI) {
      // TODO: handle deposit
      console.log('handle deposit');
    } else {
      try {
        await withdraw(transferAmount, provider.getSigner());
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
              <Input placeholder="Amount" value={amount} onChange={onInputChange} />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm">
                  Max
                </Button>
              </InputRightElement>
            </InputGroup>
            <Button onClick={onTransfer} isLoading={loading} w="100%" colorScheme="blue" size="lg">
              Transfer
            </Button>
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
