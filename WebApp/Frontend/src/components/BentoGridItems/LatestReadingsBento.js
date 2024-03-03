import React from 'react';
import { GridItem, HStack, Spacer, VStack, Box, Text, Center } from '@chakra-ui/react';
import { RiPlantFill } from "react-icons/ri";
import { FaThermometerHalf,FaRegSun  } from "react-icons/fa";

const LatestReadingsBento = ({ colSpan, rowSpan }) => {
  return (
    <GridItem
      colSpan={colSpan}
      rowSpan={rowSpan}
      bg="card"
      h="272px"
      borderRadius={'10'}
      p="30px"
    >
      <VStack w="100%">
        <HStack w="100%">
          <Box
            w="48px"
            h="48px"
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

          {/* Humidity box */}
          <VStack
            w="150px"
            h="125px"
            borderRadius={10}
            bgColor={"darkBg"}
            justify={"center"}
            spacing="0"
            pt="3"
          >
            <HStack w="100%" justify={"center"} spacing="1">
                <Box w="14px" h="14px" bgColor={"rgba(254,254,254,0.44)"}borderRadius={"100%"}/>
                <Box w="21px" h="21px" bgColor={"rgba(254,254,254,0.44)"}borderRadius={"100%"}/>
                <Box w="40px" h="40px" bgColor={"card"} borderRadius={"100%"}>
                  <Center mt="2.5">
                    <RiPlantFill style={{color:"#21A366", width:"20px", height:"20px"}}/>
                  </Center>
                </Box>
                <Box w="21px" h="21px" bgColor={"rgba(254,254,254,0.44)"}borderRadius={"100%"}/>
                <Box w="14px" h="14px" bgColor={"rgba(254,254,254,0.44)"}borderRadius={"100%"}/>
            </HStack>
            
            {/* TODO: hacer dinamico */}
            <Text color="white" fontWeight={"reegular"} fontSize={"15px"} mt="2">72%</Text>
            <Text color="rgba(255,255,255,0.73)" fontWeight={"light"} fontSize={"14px"} mt="-1">Humedad</Text>

          </VStack>

          {/* Temperature box */}
          <VStack
            w="150px"
            h="125px"
            borderWidth={'2px'}
            borderRadius={10}
            borderColor={'rgba(219,219,219,0.56)'}
            pt="3"
            justify={"center"}
            spacing="0"
          >
            <HStack w="100%" justify={"center"} spacing="1">
            <Box w="35px" h="35px" bgColor={"card"} borderRadius={"100%"}>
                  <Center mt="2.5">
                  <FaThermometerHalf style={{color:"black", width:"20px", height:"20px"}}/>
                  </Center>
                </Box>
            </HStack>
            
            {/* TODO: hacer dinamico */}
            <Text  fontWeight={"regular"} fontSize={"15px"} mt="2">25º</Text>
            <Text color="rgba(0,0,0,0.73)" fontWeight={"light"} fontSize={"14px"} mt="-1">Temperatura</Text>
          </VStack>
          
          {/* Light box */}
          <VStack
            w="150px"
            h="125px"
            borderWidth={'2px'}
            borderRadius={10}
            borderColor={'rgba(219,219,219,0.56)'}
            pt="3"
            justify={"center"}
            spacing="0"
          >
            <HStack w="100%" justify={"center"} spacing="1">
                <Box w="14px" h="14px" bgColor={"rgba(251,190,34,0.17)"}borderRadius={"100%"}/>
                <Box w="21px" h="21px" bgColor={"rgba(251,190,34,0.17)"}borderRadius={"100%"}/>
                <Box w="40px" h="40px" bgColor={"rgba(251,190,34,0.17)"} borderRadius={"100%"}>
                  <Center mt="2.5">
                    <FaRegSun style={{color:"#FBBE22", width:"20px", height:"20px"}}/>
                  </Center>
                </Box>
                <Box w="21px" h="21px" bgColor={"rgba(251,190,34,0.17)"}borderRadius={"100%"}/>
                <Box w="14px" h="14px" bgColor={"rgba(251,190,34,0.17)"}borderRadius={"100%"}/>
            </HStack>
            
            {/* TODO: hacer dinamico */}
            <Text  fontWeight={"regular"} fontSize={"15px"} mt="2">72%</Text>
            <Text  fontWeight={"light"} fontSize={"14px"} mt="-1">Intensidad de luz</Text>
          </VStack>
        </HStack>
      </VStack>
    </GridItem>
  );
};

export default LatestReadingsBento;
