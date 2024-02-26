import { VStack, Center, Grid } from '@chakra-ui/react';

import LatestReadingsBento from '../components/BentoGridItems/LatestReadingsBento';
import AverageIntake from '../components/BentoGridItems/AverageIntakeBento';
import WateringBento from '../components/BentoGridItems/WateringBento';
import ErrorBento from '../components/BentoGridItems/ErrorBento';
import Header from '../components/Header';
import GraphicBento from '../components/BentoGridItems/GraphicBento';
import AdviceBento from '../components/BentoGridItems/AdviceBento';
import ExploreYourPlantBento from '../components/BentoGridItems/ExploreYourPlantBento';

import { useEffect } from 'react';
import { useAuthUser } from 'react-auth-kit';
import { useDisclosure } from '@chakra-ui/react';
import LogToDeviceModal from '../components/LogToDeviceModal';

const Main = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  //Auth details in cookies
  const auth = useAuthUser();

  useEffect(() => {
    if (auth.deviceId == null) {
      //TODO: prompt user with screen to register or log plant
      onOpen();
    }
  }, []);

  return (
    <>
      {/* Modal for device details */}
      <LogToDeviceModal isOpen={isOpen} onClose={onClose} />
      <Center>
        <VStack w="100%" color="fontColor" mt="10">
          {/* Heading with message, date and buttons */}
          <Header />

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
            <LatestReadingsBento colSpan={5} rowSpan={1} />
            <AverageIntake colSpan={2} rowSpan={1} />

            {/* SECOND ROW */}
            <WateringBento colSpan={3} rowSpan={1} />
            <ErrorBento colSpan={4} rowSpan={1} />

            {/* THIRD ROW */}
            <GraphicBento colSpan={7} rowSpan={1} />
            {/* FOURTH ROW */}
            <AdviceBento colSpan={4} rowSpan={1} />
            <ExploreYourPlantBento colSpan={3} rowSpan={1} />
          </Grid>
        </VStack>
      </Center>
    </>
  );
};

export default Main;
