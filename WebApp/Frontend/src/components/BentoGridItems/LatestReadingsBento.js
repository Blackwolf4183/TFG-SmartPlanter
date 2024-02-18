import React from 'react';
import { GridItem, HStack, Spacer, VStack, Box, Text } from '@chakra-ui/react';

const LatestReadingsBento = ({ colSpan, rowSpan }) => {
  return (
    <GridItem
      colSpan={colSpan}
      rowSpan={rowSpan}
      bg="card"
      h="240px"
      borderRadius={'10'}
      p="30px"
    >
      <VStack w="100%">
        <HStack w="100%">
          <Box
            w="42px"
            h="42px"
            borderRadius="100%"
            overflow="hidden"
            backgroundColor="gray.200"
          >
            <img
              src="./plantIllustration.png"
              alt="dummy plant"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>

          <VStack align={'left'} spacing="0" pl="2">
            <Text fontWeight={'500'}>Aloe Vera</Text>
            <Text fontWeight={'light'} mt="-1">
              Aloe barbadensis miller
            </Text>
          </VStack>

          <Spacer />
          {/* TODO: hacer dinamico */}
          <Text fontWeight={'ligth'}>Actualizado hace ~24 min</Text>
        </HStack>

        <HStack mt="5" spacing="15px">
          <VStack
            w="130px"
            h="110px"
            borderRadius={10}
            bgColor={"darkBg"}
            justify={"center"}
            spacing="0"
          >
            <HStack w="100%" justify={"center"}>
                <Box w="9px" h="9px" bgColor={"rgba(254,254,254,0.44)"}borderRadius={"100%"}/>
                <Box w="16px" h="16px" bgColor={"rgba(254,254,254,0.44)"}borderRadius={"100%"}/>
                <Box w="35px" h="35px" bgColor={"card"}borderRadius={"100%"}></Box>
                <Box w="16px" h="16px" bgColor={"rgba(254,254,254,0.44)"}borderRadius={"100%"}/>
                <Box w="9px" h="9px" bgColor={"rgba(254,254,254,0.44)"}borderRadius={"100%"}/>
            </HStack>
            
            {/* TODO: hacer dinamico */}
            <Text color="white" fontWeight={"light"}>72%</Text>
            <Text color="rgba(255,255,255,0.73)" fontWeight={"light"}>Humedad</Text>

          </VStack>

          <VStack
            w="130px"
            h="110px"
            borderWidth={'2px'}
            borderRadius={10}
            borderColor={'rgba(219,219,219,0.56)'}
          ></VStack>
          
          <VStack
            w="130px"
            h="110px"
            borderWidth={'2px'}
            borderRadius={10}
            borderColor={'rgba(219,219,219,0.56)'}
          ></VStack>
        </HStack>
      </VStack>
    </GridItem>
  );
};

export default LatestReadingsBento;
