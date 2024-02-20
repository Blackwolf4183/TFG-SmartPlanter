import {
  HStack,
  VStack,
  Heading,
  Text,
  Spacer,
  Button,
  Center,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { IoIosCalendar } from 'react-icons/io';
import { FiCalendar } from "react-icons/fi";
import { HiLogout } from "react-icons/hi";
import { BiBell } from 'react-icons/bi';
import LatestReadingsBento from '../components/BentoGridItems/LatestReadingsBento';
import AverageIntake from '../components/BentoGridItems/AverageIntake';
import WateringBento from '../components/BentoGridItems/WateringBento';
import ErrorBento from '../components/BentoGridItems/ErrorBento';

const Main = () => {
  return (
    <Center>
      {/* Heading with message, date and buttons */}
      <VStack w="100%" color="fontColor" mt="10">
        <HStack w="100%" maxW={'750px'}>
          <HStack mt="5">
            <VStack align="left" spacing="1">
              <Heading fontSize={'2xl'}> ¡Bienvenido de vuelta!</Heading>
              <HStack ml="1">
                <FiCalendar style={{ width: '20px', height: '20px' }} />
                {/* TODO: make dynamic */}
                <Text fontWeight={'light'}>Lunes 3 Enero 2024</Text>
              </HStack>
            </VStack>
          </HStack>

          <Spacer />

          <HStack>
            {/* Notifications button */}
            <Button
              w="40px"
              h="40px"
              p="0"
              bgColor={'white'}
              colorScheme="gray"
            >
              <BiBell
                style={{ width: '20px', height: '20px', color: 'black' }}
              />
            </Button>

            {/* Logout button */}
            <Button
              w="40px"
              h="40px"
              p="0"
              bgColor={'white'}
              colorScheme="gray"
            >
              <HiLogout
                style={{ width: '20px', height: '20px', color: 'black' }}
              />
            </Button>

          </HStack>
        </HStack>

        {/* Bento grid */}
        <Grid
          mt="10"
          w="100%"
          maxW={'750px'}
          templateRows="repeat(4, 1fr)"
          templateColumns="repeat(7, 1fr)"
          gap={4}
          mb="10"
        >
          {/* FIRST ROW */}
          <LatestReadingsBento colSpan={5} rowSpan={1}/>
          <AverageIntake colSpan={2} rowSpan={1}/>
          
          {/* SECOND ROW */}
          <WateringBento colSpan={3} rowSpan={1}/>
          <ErrorBento colSpan={4} rowSpan={1}/>


          {/* THIRD ROW */}
          <GridItem colSpan={7} rowSpan={1}  bg="card" h="240px" borderRadius={"10"}>

          </GridItem>

          {/* FOURTH ROW */}
          <GridItem colSpan={4} rowSpan={1}  bg="card" h="240px" borderRadius={"10"}>

          </GridItem>
          <GridItem colSpan={3} rowSpan={1}  bg="card" h="240px" borderRadius={"10"}>

          </GridItem>

        </Grid>
      </VStack>
    </Center>
  );
};

export default Main;
