import React from 'react'
import { Box, GridItem,HStack,Text, VStack } from '@chakra-ui/react'

const AdviceBento = ({colSpan, rowSpan}) => {
  return (
    <GridItem
      colSpan={colSpan}
      rowSpan={rowSpan}
      bg="card"
      h="272px"
      borderRadius={'10'}
      p="30px"
    >
        <Text>Consejos</Text>

        {/* TODO: hacer errores dinamicos */}
        <VStack w="100%" justify={"left"} mt="2" align="left">
            <HStack h="50px" w="360px" boxShadow={"rgba(0, 0, 0, 0.16) 0px 1px 4px;"} borderRadius={10}>
                <Box h="70%" w="5px" ml="2" bgColor={"advice"} borderRadius={10}/>
                <VStack align={"left"} spacing="0">
                    <Text fontSize={"10px"} fontWeight={"medium"}>Manten a tu planta más en la penumbra</Text>
                    <Text fontSize={"10px"} mt="-1">Evita que tu planta este expuesta a tanto sol</Text>
                </VStack>
            </HStack>
        </VStack>
        
    </GridItem>
  )
}

export default AdviceBento