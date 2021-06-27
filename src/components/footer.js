import { Box, Flex, Spacer, HStack, Link } from '@chakra-ui/react';
import { FaGithub } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer>
      <Box borderTopWidth="1px" py="16px" px={['16px']} pos="absolute" bottom="0" w="100%">
        <Flex maxW="2xl" margin="0 auto" alignItems="baseline">
          <HStack spacing={['16px', '24px']}>
            <Link fontSize={['sm', 'md']}>
              <FaGithub />
            </Link>
            <Link fontSize={['sm', 'md']}>News</Link>
          </HStack>
          <Spacer />
          <HStack spacing={['16px', '24px']}>
            <Link fontSize={['sm', 'md']}>Disclaimer</Link>
            <Link fontSize={['sm', 'md']}>Privacy</Link>
          </HStack>
        </Flex>
      </Box>
    </footer>
  );
};
