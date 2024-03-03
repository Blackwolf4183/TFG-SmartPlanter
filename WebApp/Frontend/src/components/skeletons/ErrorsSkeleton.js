import { Skeleton, VStack } from '@chakra-ui/react';
import React from 'react';

const ErrorsSkeleton = () => {
  return (
    <VStack mt="2">
      <Skeleton h="50px" w="405px" />
      <Skeleton h="50px" w="405px" />
      <Skeleton h="50px" w="405px" />
    </VStack>
  );
};

export default ErrorsSkeleton;
