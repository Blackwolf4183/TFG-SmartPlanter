import React from 'react';
import { Grid, GridItem, Text, VStack, Tooltip, Icon, Circle, HStack, Spacer } from '@chakra-ui/react';
import { RiPlantLine } from "react-icons/ri";
import { BsExclamation } from "react-icons/bs";
import { ImDroplet } from 'react-icons/im';
import { BiDroplet } from "react-icons/bi";
import { BiTestTube } from "react-icons/bi";
import { BiBandAid } from "react-icons/bi";

const states = [
  { name: 'Saludable', description: 'La planta aparece vibrante y vigorosa sin signos de estrés o enfermedad.', icon: RiPlantLine, color: 'green.100' },
  { name: 'Estresada', description: 'La planta muestra signos de estrés, que podrían incluir caída, decoloración leve o crecimiento detenido.', icon: BsExclamation, color: 'yellow.100' },
  { name: 'Deshidratada', description: 'La planta parece marchita o tiene bordes secos y crujientes en las hojas, lo que indica una falta de agua.', icon: BiDroplet, color: 'blue.100' },
  { name: 'Exceso de riego', description: 'La planta podría tener hojas amarillentas, manchas blandas en descomposición o un aspecto generalmente empapado.', icon: BiDroplet, color: 'orange.100' },
  { name: 'Deficiencia nutrientes', description: 'Los indicadores podrían incluir clorosis (hojas amarillentas) u otras decoloraciones, a menudo comenzando con las hojas más viejas.', icon: BiTestTube, color: 'purple.100' },
  { name: 'Enferma', description: 'La planta muestra signos de enfermedad, como manchas en las hojas, mildiú polvoriento o crecimientos inusuales.', icon: BiBandAid, color: 'red.100' },
];

const FeedBackBento = ({colSpan,rowSpan}) => {

  return (
    <GridItem
      colSpan={colSpan}
      rowSpan={rowSpan}
      bg="card"
      borderRadius={'10'}
      p="30px"
    >
      <HStack>
        <Text fontSize="xl" mb="2">Seguimiento de tu planta </Text>
        <Spacer/>
        <Text mb="2" color="blackAlpha.600">Ya has votado hoy</Text>
      </HStack>

    <Grid templateColumns="repeat(3, 1fr)" gap={2}>
      {states.map((state, index) => (
        <GridItem w="100%" key={index}>
          <Tooltip hasArrow label={state.description} placement="top" bg='white' borderRadius="xl" color="black" p="3">
            <VStack
              p={5}
              bg="white"
              borderRadius="lg"
              boxShadow="lg" // adds box shadow to each card
              _hover={{ boxShadow: "xl", bgColor:"gray.100" }} // increases box shadow on hover
              cursor="pointer"
              alignItems="center"
              justifyContent="center"
              height="150px"
              w="130px"
              position="relative" // to allow absolute positioning inside
              textAlign={"center"}
            >
              <Circle size="64px" bg={state.color} position="absolute" top="40%" left="50%" transform="translate(-50%, -50%)">
                <Icon as={state.icon} w={8} h={8} />
              </Circle>
              <Text fontSize="md" mt="20">{state.name}</Text>
            </VStack>
          </Tooltip>
        </GridItem>
      ))}
    </Grid>
    </GridItem>
  );
};

export default FeedBackBento;
