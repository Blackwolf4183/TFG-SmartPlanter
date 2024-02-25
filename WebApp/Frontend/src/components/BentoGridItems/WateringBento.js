import React from 'react';
import { GridItem, HStack, Text, VStack,Box } from '@chakra-ui/react';
import { ImDroplet } from 'react-icons/im';
import { FiClock } from "react-icons/fi";
import { BsGraphUp } from "react-icons/bs";

const WateringBento = ({ colSpan, rowSpan }) => {
  return (
    <GridItem
      colSpan={colSpan}
      rowSpan={rowSpan}
      bg="card"
      h="240px"
      borderRadius={'10'}
      p="30px"
    >
      <Text>Riego</Text>
      <Text fontWeight={'light'} fontSize={'sm'}>
        Elegir tipo de riego
      </Text>

      <VStack mt="5" w="100%" align="left">
        <HStack spacing="5">
          <Box w="32px" h="32px" borderColor={'rgba(219,219,219,59)'} borderWidth={"2px"} pt="1.5" align="center" borderRadius={10}>
            <ImDroplet style={{ color: '#5EC0F6' }} />
          </Box>
          <Text fontWeight={'light'}>Umbral de humedad</Text>
        </HStack>
        <HStack spacing="5">
          <Box w="32px" h="32px" borderColor={'rgba(219,219,219,59)'} borderWidth={"2px"} pt="1.5" align="center" borderRadius={10}>
            <FiClock/>
          </Box>
          <Text fontWeight={'light'}>Hora programada</Text>
        </HStack>
        <HStack spacing="5">
          <Box w="32px" h="32px" borderColor={'rgba(219,219,219,59)'} borderWidth={"2px"} pt="1.5" align="center" borderRadius={10}>
            <BsGraphUp/>
          </Box>
          <Text fontWeight={'light'}>Riego Inteligente</Text>
        </HStack>
      </VStack>
    </GridItem>
  );
};

export default WateringBento;
