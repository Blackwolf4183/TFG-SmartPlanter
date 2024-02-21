import React from 'react';
import {
  Box,
  Center,
  Flex,
  GridItem,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ImDroplet } from 'react-icons/im';

const AverageIntake = ({ colSpan, rowSpan }) => {
  return (
    <GridItem
      colSpan={colSpan}
      rowSpan={rowSpan}
      bg="card"
      h="240px"
      borderRadius={'10'}
    >
      <Center>
        <VStack spacing="5" mt="50px">
          <Text  fontWeight={500} fontSize={'sm'}>
            Consumo
          </Text>
          {/* TODO: make dynanic */}
          <Text fontSize={'xl'} fontWeight={700}>
            0.67L / día
          </Text>
          <Flex
            w="50px"
            h="50px"
            borderRadius={'100%'}
            borderWidth={'2px'}
            borderColor={'rgba(219,219,219,59)'}
            alignContent={'center'}
            justifyContent={'center'}
          >
            <Center>
              <ImDroplet
                style={{ color: '#5EC0F6', width: '20px', height: '20px' }}
              />
            </Center>
          </Flex>
        </VStack>
      </Center>
    </GridItem>
  );
};

export default AverageIntake;
