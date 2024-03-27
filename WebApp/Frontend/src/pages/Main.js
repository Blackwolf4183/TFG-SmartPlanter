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
import ChangePlantModal from '../components/ChangePlantModal';

const Main = () => {
  //Log to device modal
  const { isOpen: isOpenLogToDevice, onOpen: onOpenLogToDevice, onClose: onCloseLogToDevice} = useDisclosure();
  const { isOpen: isOpenChangePlant, onOpen: onOpenChangePlant, onClose: onCloseChangePlant} = useDisclosure();

  const signOut = useSignOut();

  //Auth details in cookies
  useEffect(() => {
    //Artificial timeout to give the cookies time to be set
    setTimeout(() => {
      const userAuthDataString = Cookies.get('_auth_state');

      if(!userAuthDataString) signOut();

      const userAuthDataObject = JSON.parse(userAuthDataString)
      
      //If no deviceId set in cookies then we ask the user to pair a device4
      if (userAuthDataObject.deviceId === undefined || userAuthDataObject.deviceId === null) {
        //Prompt user with screen to register or log plant
        onOpenLogToDevice();
      }
    }, 250);
  }, []);

  return (
    <>
      {/* Modal for device details */}
      <LogToDeviceModal isOpen={isOpenLogToDevice} onClose={onCloseLogToDevice} />
      <ChangePlantModal isOpen={isOpenChangePlant} onClose={onCloseChangePlant}/>
      <Center >
        <VStack w="100%" color="fontColor" mt="10">
          {/* Heading with message, date and buttons */}
          <Header onOpenChangePlant={onOpenChangePlant}/>

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
