import React from 'react'
import { Box, GridItem,HStack,Text, VStack } from '@chakra-ui/react'


const GraphicBento = ({colSpan, rowSpan}) => {
  return (
    <GridItem
      colSpan={colSpan}
      rowSpan={rowSpan}
      bg="card"
      h="272px"
      borderRadius={'10'}
      p="30px"
    >

    </GridItem>
  )
}

export default GraphicBento