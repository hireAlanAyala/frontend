import { Box, Flex, Spacer, HStack, Heading, Link, Button } from '@chakra-ui/react';
import NextLink from 'next/link';
import { Router } from '../../src/config';

export const NavBar = () => {
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
            <Button disabled variant="link" fontSize={['sm', 'md']}>
              Invest
            </Button>
            <Button size="sm" colorScheme="blue" variant="outline">
              Connect
            </Button>
          </HStack>
        </Flex>
      </Box>
    </header>
  );
};
