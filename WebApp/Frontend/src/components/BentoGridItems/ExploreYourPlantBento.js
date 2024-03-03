import React from 'react'
import { GridItem, Text } from '@chakra-ui/react'

const ExploreYourPlantBento = ({colSpan, rowSpan}) => {
  return (
    <GridItem
      colSpan={colSpan}
      rowSpan={rowSpan}
      bg="card"
      h="272px"
      borderRadius={'10'}
      p="30px"
    >
        <Text>Conoce tu planta</Text>

        
    </GridItem>
  )
}

export default ExploreYourPlantBento