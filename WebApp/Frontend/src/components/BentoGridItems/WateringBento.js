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
      h="272px"
      borderRadius={'10'}
      p="30px"
    >
      <Text fontSize={"xl"}>Riego</Text>
      <Text fontWeight={'light'} fontSize={'md'}>
        Elegir tipo de riego
      </Text>

      <VStack mt="5" w="100%" align="left">
        <HStack spacing="5">
          <Box w="40px" h="40px" borderColor={'rgba(219,219,219,59)'} borderWidth={"2px"} pt="2" align="center" borderRadius={10}>
            <ImDroplet style={{ color: '#5EC0F6',width:"20px", height:"20px" }} />
          </Box>
          <Text>Umbral de humedad</Text>
        </HStack>
        <HStack spacing="5">
          <Box w="40px" h="40px" borderColor={'rgba(219,219,219,59)'} borderWidth={"2px"} pt="2" align="center" borderRadius={10}>
            <FiClock style={{ width:"20px", height:"20px" }}/>
          </Box>
          <Text >Hora programada</Text>
        </HStack>
        <HStack spacing="5">
          <Box w="40px" h="40px" borderColor={'rgba(219,219,219,59)'} borderWidth={"2px"} pt="2" align="center" borderRadius={10}>
            <BsGraphUp style={{ width:"20px", height:"20px" }}/>
          </Box>
          <Text >Riego Inteligente</Text>
        </HStack>
      </VStack>
    </GridItem>
  );
};

export default WateringBento;
