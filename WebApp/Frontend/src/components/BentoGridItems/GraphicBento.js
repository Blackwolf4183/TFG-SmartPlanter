import React from 'react'

const GraphicBento = ({colSpan, rowSpan}) => {
  return (
    <GridItem
      colSpan={colSpan}
      rowSpan={rowSpan}
      bg="card"
      h="240px"
      borderRadius={'10'}
      p="30px"
    >

    </GridItem>
  )
}

export default GraphicBento