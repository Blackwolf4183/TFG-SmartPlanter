import React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  Button,
  Text
} from '@chakra-ui/react';

import { RiPlantLine } from 'react-icons/ri';
import { BsExclamation } from 'react-icons/bs';
import { BiDroplet } from 'react-icons/bi';
import { BiTestTube } from 'react-icons/bi';
import { BiBandAid } from 'react-icons/bi';
import { useState } from 'react';

import Cookies from 'js-cookie';
import axios from 'axios';


const states = [
  {
    name: 'Saludable',
    description:
      'La planta aparece vibrante y vigorosa sin signos de estrés o enfermedad.',
    icon: RiPlantLine,
    color: 'green.100',
  },
  {
    name: 'Estresada',
    description:
      'La planta muestra signos de estrés, que podrían incluir caída, decoloración leve o crecimiento detenido.',
    icon: BsExclamation,
    color: 'yellow.100',
  },
  {
    name: 'Deshidratada',
    description:
      'La planta parece marchita o tiene bordes secos y crujientes en las hojas, lo que indica una falta de agua.',
    icon: BiDroplet,
    color: 'blue.100',
  },
  {
    name: 'Exceso de riego',
    description:
      'La planta podría tener hojas amarillentas, manchas blandas en descomposición o un aspecto generalmente empapado.',
    icon: BiDroplet,
    color: 'orange.100',
  },
  {
    name: 'Deficiencia nutrientes',
    description:
      'Los indicadores podrían incluir clorosis (hojas amarillentas) u otras decoloraciones, a menudo comenzando con las hojas más viejas.',
    icon: BiTestTube,
    color: 'purple.100',
  },
  {
    name: 'Enferma',
    description:
      'La planta muestra signos de enfermedad, como manchas en las hojas, mildiú polvoriento o crecimientos inusuales.',
    icon: BiBandAid,
    color: 'red.100',
  },
];


const PredictionDialog = ({ isOpen, onClose, predictionData, requestResultToast }) => {
  const cancelRef = React.useRef();

    const [isIrrigationRequestLoading, setIsIrrigationRequestLoading] = useState(false)

  const adjustIrrigation = (state) => {
    //Start irrigation request "loading"
    setIsIrrigationRequestLoading(true)

    //Get deviceId from cookies and make request by setting url with device_id param
    const deviceId = Cookies.get('deviceId');

    const irrigationRequestObject = {
      "deviceId": deviceId,
      "irrigationType": "THRESHOLD",
      "threshold": states[state].name === 'Deshidratada' ? 50 : 90,
      "everyHours": null,
      "irrigationAmount": states[state].name === 'Deshidratada' ? 150 : 50
    }

    // Get the JWT from the '_auth' cookie
    const jwt = Cookies.get('_auth');

    // Set up the Axios headers with the JWT as a bearer token
    const headers = {
      Authorization: `Bearer ${jwt}`,
    };

    axios.post(process.env.REACT_APP_BACKEND_URL + 'plants/irrigation',irrigationRequestObject, {headers})
    .then( res => {
      requestResultToast({
        title: 'Se ha aplicado el riego seleccionado',
        status: 'success',
        isClosable: true,
      })
    })
    .catch(err => {
      requestResultToast({
        title: 'Error al realizar la petición',
        status: 'error',
        isClosable: true,
      })
    })
    .finally(() => {
      setIsIrrigationRequestLoading(false)
    })
}

  return (
    predictionData?.prediction && (
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
        size={'md'}
        color="fontColor"
      >
        <AlertDialogOverlay />

        <AlertDialogContent bgColor={'white'} color="fontColor">
          <AlertDialogHeader>
            {states[predictionData.prediction_state].name}
          </AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>{predictionData.prediction}
          {(predictionData.prediction_state === 2 ||
              predictionData.prediction_state === 3) && (
            <Text>Usa el botón de 'Ajustar Riego' para ajustar la pauta de riego de tu planta automáticamente</Text>
              
            )}
          </AlertDialogBody>
          <AlertDialogFooter>
            {(predictionData.prediction_state === 2 ||
              predictionData.prediction_state === 3) && (
              <Button colorScheme="blue" ml={3} isLoading={isIrrigationRequestLoading} onClick={() => adjustIrrigation(predictionData.prediction_state)}>
                Ajustar riego
              </Button>
            )}
            <Button colorScheme="red" ml={3}>
              Volver
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  );
};

export default PredictionDialog;
