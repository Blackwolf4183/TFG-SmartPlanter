import { VStack, Center, Grid } from '@chakra-ui/react';

import LatestReadingsBento from '../components/BentoGridItems/LatestReadingsBento';
import AverageIntake from '../components/BentoGridItems/WaterConsumptionBento';
import WateringBento from '../components/BentoGridItems/WateringBento';
import ErrorBento from '../components/BentoGridItems/ErrorBento';
import Header from '../components/Header';
import AdviceBento from '../components/BentoGridItems/AdviceBento';
import ExploreYourPlantBento from '../components/BentoGridItems/ExploreYourPlantBento';
import LogToDeviceModal from '../components/LogToDeviceModal';

import Cookies from 'js-cookie';

import { useEffect } from 'react';
import { useSignOut } from 'react-auth-kit';
import { useDisclosure } from '@chakra-ui/react';
import GraphicsBentoWrapper from '../components/GraphicsBentoWrapper';

const Main = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const signOut = useSignOut();

  //Auth details in cookies
  useEffect(() => {
    //Artificial timeout to give the cookies time to be set
    setTimeout(() => {
      const userAuthDataString = Cookies.get('_auth_state');

      if(!userAuthDataString) signOut();

      const userAuthDataObject = JSON.parse(userAuthDataString)
      
      if (userAuthDataObject.deviceId == undefined || userAuthDataObject.deviceId == null) {
        //Prompt user with screen to register or log plant
        onOpen();
      }
    }, 250);
  }, []);

  return (
    <>
      {/* Modal for device details */}
      <LogToDeviceModal isOpen={isOpen} onClose={onClose} />
      <Center >
        <VStack w="100%" color="fontColor" mt="10">
          {/* Heading with message, date and buttons */}
          <Header />

          {/* Bento grid */}
          <Grid
            mt="10"
            w="100%"
            maxW={'850px'}
            templateRows="repeat(10, 136)"
            templateColumns="repeat(7, 1fr)"
            gap={4}
            mb="10"
          >
            {/* FIRST ROW */}
            <LatestReadingsBento colSpan={5} rowSpan={2} />
            <AverageIntake colSpan={2} rowSpan={2} />

            {/* SECOND ROW */}
            <WateringBento colSpan={3} rowSpan={2} />
            <ErrorBento colSpan={4} rowSpan={2} />

            {/* THIRD ,FOURTH AND FITH ROW */}
            <GraphicsBentoWrapper/>

            {/* SIXTH ROW */}
            <AdviceBento colSpan={4} rowSpan={2} />
            <ExploreYourPlantBento colSpan={3} rowSpan={2} />
          </Grid>
        </VStack>
      </Center>
    </>
  );
};

export default Main;
