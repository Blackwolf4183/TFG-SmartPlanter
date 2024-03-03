import { Skeleton, VStack } from '@chakra-ui/react';
import React from 'react';

const ErrorsSkeleton = () => {
  return (
    <VStack mt="2">
      <Skeleton h="40px" w="360px" />
      <Skeleton h="40px" w="360px" />
      <Skeleton h="40px" w="360px" />
    </VStack>
  );
};

export default ErrorsSkeleton;
