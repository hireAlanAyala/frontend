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
} from '@chakra-ui/react';
import { UpDownIcon } from '@chakra-ui/icons';

export const Savers = ({ APY }) => {
  return (
    <main>
      <Container maxW="xl" mt="24">
        <Box rounded="xl" bg="gray.700" p="16px" color="white">
          <VStack spacing="16px">
            <Stat rounded="xl" borderWidth="1px" w="100%" p="16px">
              <Flex flexDir="column" justifyContent="center" alignItems="center">
                <StatLabel>Total saved</StatLabel>
                <StatNumber>15,000.00 DAI</StatNumber>
                <StatHelpText>@ {(APY * 100).toFixed(2)}% APY</StatHelpText>
              </Flex>
            </Stat>
            <VStack spacing="8px" w="100%">
              <Tag w="100%" colorScheme="blue" size="lg">
                <HStack spacing="8px" alignItems="baseline">
                  <Text color="gray.100" fontSize="sm">
                    From:
                  </Text>
                  <TagLabel>Wallet</TagLabel>
                </HStack>
                <Spacer />
                <Text color="gray.100" fontSize="sm">
                  500 DAI
                </Text>
              </Tag>
              <Button size="xs" colorScheme="cyan" leftIcon={<UpDownIcon />}>
                Swap
              </Button>
              <Tag w="100%" colorScheme="blue" size="lg">
                <HStack spacing="8px" alignItems="baseline">
                  <Text color="gray.100" fontSize="sm">
                    To:
                  </Text>
                  <TagLabel>Savers</TagLabel>
                </HStack>
                <Spacer />
                <Text color="gray.100" fontSize="sm">
                  15,000 DAI
                </Text>
              </Tag>
            </VStack>
            <InputGroup size="lg">
              <Input placeholder="Amount" />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm">
                  Max
                </Button>
              </InputRightElement>
            </InputGroup>
            <Button w="100%" colorScheme="blue" size="lg">
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
