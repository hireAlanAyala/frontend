import { Box, Flex, Spacer, HStack, Link } from '@chakra-ui/react';
import { FaGithub } from 'react-icons/fa';
import { AiOutlineMail } from 'react-icons/ai';

export const Footer = () => {
  return (
    <footer>
      <Box borderTopWidth="1px" py="16px" px={['16px']} pos="absolute" bottom="0" w="100%">
        <Flex maxW="2xl" margin="0 auto" alignItems="baseline">
          <HStack spacing={['16px', '24px']}>
            <Link fontSize={['sm', 'md']}>
              <FaGithub />
            </Link>
            <Link fontSize={['sm', 'md']}>
              <AiOutlineMail />
            </Link>
            <Link fontSize={['sm', 'md']}>News</Link>
          </HStack>
          <Spacer />
          <HStack spacing={['16px', '24px']}></HStack>
        </Flex>
      </Box>
    </footer>
  );
};