import React from 'react'
import { Box, GridItem,HStack,Text, VStack } from '@chakra-ui/react'

const ErrorBento = ({colSpan,rowSpan}) => {
  return (
    <GridItem
      colSpan={colSpan}
      rowSpan={rowSpan}
      bg="card"
      h="240px"
      borderRadius={'10'}
      p="30px"
    >
        <Text>Errores</Text>

        {/* TODO: hacer errores dinamicos */}
        <VStack w="100%" justify={"left"} mt="2" align="left">
            <HStack h="50px" w="360px" boxShadow={"rgba(0, 0, 0, 0.16) 0px 1px 4px;"} borderRadius={10}>
                <Box h="70%" w="5px" ml="2" bgColor={"error"} borderRadius={10}/>
                <VStack align={"left"} spacing="0">
                    <Text fontSize={"10px"} fontWeight={"medium"}>Error en el sensor de Humedad</Text>
                    <Text fontSize={"10px"} mt="-1">Lorem ipsum dolor sit amet, consectetur adipiscing elit</Text>
                </VStack>
            </HStack>
        </VStack>
        
    </GridItem>
  )
}

export default ErrorBento