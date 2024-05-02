import React, { useState, useEffect } from 'react';
import {
  Button,
  GridItem,
  HStack,
  Skeleton,
  Text,
  VStack,
  useToast,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react';
import Cookies from 'js-cookie';
import useAxios from '../../functions/axiosHook';
import { BiBrain } from "react-icons/bi";
import { BiPencil } from "react-icons/bi";
import PredictionDialog from '../PredictionDialog';

const TrainModelBento = ({ colSpan, rowSpan }) => {
  const [modelInfoUrl, setModelInfoUrl] = useState('');
  const [trainModelUrl, setTrainModelUrl] = useState('')
  const [predictionUrl, setpredictionUrl] = useState('')
  const [componentLoading, setComponentLoading] = useState(true);
  const [isTrainModelButtonLoading, setIsTrainModelButtonLoading] = useState(false)
  const [isPredictionButtonLoading, setIsPredictionButtonLoading] = useState(false)
  const [deviceId, setDeviceId] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);

  const { data: modelInfoData , loading: modelInfoLoading, error: modelInfoError } = useAxios(modelInfoUrl);
  const { data: trainModelData , loading: trainModelLoading, error: trainModelError } = useAxios(trainModelUrl);
  const { data: predictionData , loading: predictionLoading, error: predictionError } = useAxios(predictionUrl);

  const requestResultToast = useToast();

  //For prediction alert dialog
  const { isOpen, onOpen, onClose } = useDisclosure()

  //Useffect for errors on request
  useEffect(() => {
    if (modelInfoError && deviceId) {
      requestResultToast({
        title: 'Algo ha fallado intentando obtener información del modelo.',
        status: 'error',
        isClosable: true,
      });
    }
  }, [modelInfoError, deviceId, requestResultToast]);

  useEffect(() => {
    if (trainModelError && deviceId) {
      requestResultToast({
        title: 'Algo ha fallado intentando al intentar entrenar el modelo.',
        status: 'error',
        isClosable: true,
      });
    }

    setIsTrainModelButtonLoading(false);
  }, [trainModelError, deviceId, requestResultToast]);

  useEffect(() => {
    if (predictionError && deviceId) {
      requestResultToast({
        title: 'Algo ha fallado intentando al intentar obtener una predicción.',
        status: 'error',
        isClosable: true,
      });
    }

    setIsPredictionButtonLoading(false);
  }, [predictionError, deviceId, requestResultToast]);
  //Useffect to get cookies and make enpoint calls
  useEffect(() => {
    setTimeout(() => {
      //Get deviceId from cookies and make request by setting url with device_id param
      const deviceId = Cookies.get('deviceId');

      setDeviceId(deviceId);

      if (deviceId === undefined || deviceId === null || deviceId === 'null')
        return;

      setModelInfoUrl(
        process.env.REACT_APP_BACKEND_URL +
          'ml/model-info?device_id=' +
          deviceId
      );
    }, 250);
  }, []);

  useEffect(() => {
    if (!modelInfoLoading && modelInfoData !== null && modelInfoData.can_train != null) {
      setModelInfo(modelInfoData);
      setComponentLoading(false);
    }
  }, [modelInfoData, modelInfoLoading]);

  const trainModel = () => {

    setIsTrainModelButtonLoading(true);

    setTrainModelUrl(
      process.env.REACT_APP_BACKEND_URL +
        'ml/train-model?device_id=' +
        deviceId
    );
  }

  useEffect(() => {
    if(!trainModelLoading && trainModelData.message){
      setIsTrainModelButtonLoading(false)
      requestResultToast({
        title: trainModelData.message,
        status: 'success',
        isClosable: true,
      });
    }
  }, [trainModelLoading,trainModelData])
  

  const getPrediction = () => {

    setIsPredictionButtonLoading(true);

    setpredictionUrl(
      process.env.REACT_APP_BACKEND_URL +
        'ml/make-prediction?device_id=' +
        deviceId
    );
  }

  useEffect(() => {
    if(!predictionLoading && predictionData?.prediction){
      setIsPredictionButtonLoading(false)
      onOpen(); // open dialog
    }
  }, [predictionLoading,predictionData])


  return (
    <>
      <PredictionDialog isOpen={isOpen} onClose={onClose} predictionData={predictionData} requestResultToast={requestResultToast}/>
      <GridItem
        colSpan={colSpan}
        rowSpan={rowSpan}
        bg="card"
        borderRadius={'10'}
        p="20px"
      >
        <Text fontSize="xl" mb="2">
          Entrena un modelo
        </Text>
        <VStack mt="5" align={"left"}>
          <Text fontStyle={'italic'}>
            Utiliza los datos recopilados por tu maceta y obtén recomendaciones en
            base a la evolución de tu planta.
          </Text>

          <Skeleton isLoaded={!componentLoading} mt="2">
            <HStack mt="5">
              <Text>Lecturas recopiladas hasta ahora:</Text>
              <Text fontWeight={'bold'}>{modelInfo?.sensor_measurements}</Text>
            </HStack>
          </Skeleton>

          <Tooltip
            label={
              modelInfo?.training
                ? 'Tu modelo está en progreso de entrenamiento, espera un momento hasta que se complete'
                : !modelInfo?.can_train
                ? 'No cumples con los requisitos para entrenar un modelo, necesitas al menos 300 lecturas y haber votado al menos con 2 estados diferentes'
                : ''
            }
            bg="white"
            borderRadius={'xl'}
            color="black"
          >
            <Button
              colorScheme="purple"
              mt="5"
              isLoading={componentLoading || isTrainModelButtonLoading}
              isDisabled={!modelInfo?.can_train || modelInfo?.training}
              leftIcon={<BiBrain style={{width:"25px", height:"25px"}}/>}
              onClick={trainModel}
            >
              Entrenar modelo
            </Button>
          </Tooltip>

          {modelInfo?.last_trained && (
            <Text fontStyle={'italic'} fontSize={'sm'} color="gray">
              Ultimo entrenamiento: {modelInfo.last_trained}
            </Text>
          )}

          <Tooltip
            label={
              !modelInfo?.last_trained && 'No has entrenado aun ningún modelo'
            }
            bg="white"
            borderRadius={'xl'}
            color="black"
          >
            <Button
              colorScheme="green"
              isLoading={componentLoading || isPredictionButtonLoading}
              isDisabled={!modelInfo?.last_trained}
              mt="5"
              leftIcon={<BiPencil style={{width:"25px", height:"25px"}}/>}
              onClick={getPrediction}
            >
              Obtener recomendaciones
            </Button>
          </Tooltip>
        </VStack>
      </GridItem>
    </>
  );
};

export default TrainModelBento;
