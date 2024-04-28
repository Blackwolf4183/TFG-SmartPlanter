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
} from '@chakra-ui/react';
import Cookies from 'js-cookie';
import useAxios from '../../functions/axiosHook';

const TrainModelBento = ({ colSpan, rowSpan }) => {
  const [url, setUrl] = useState('');
  const [componentLoading, setComponentLoading] = useState(true);
  const [deviceId, setDeviceId] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);

  const { data, loading, error } = useAxios(url);

  const requestResultToast = useToast();

  //Useffect for errors on request
  useEffect(() => {
    if (error && deviceId) {
      requestResultToast({
        title: 'Algo ha fallado intentando obtener información del modelo.',
        status: 'error',
        isClosable: true,
      });
    }
  }, [error, deviceId, requestResultToast]);

  //Useffect to get cookies and make enpoint calls
  useEffect(() => {
    setTimeout(() => {
      //Get deviceId from cookies and make request by setting url with device_id param
      const deviceId = Cookies.get('deviceId');

      setDeviceId(deviceId);

      if (deviceId === undefined || deviceId === null || deviceId === 'null')
        return;

      setUrl(
        process.env.REACT_APP_BACKEND_URL +
          'ml/model-info?device_id=' +
          deviceId
      );
    }, 250);
  }, []);

  useEffect(() => {
    if (!loading && data !== null && data.can_train != null) {
      setModelInfo(data);
      setComponentLoading(false);
    }
  }, [data, loading]);

  return (
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
      <VStack mt="5">
        <Text fontStyle={'italic'}>
          Utiliza los datos recopilados por tu maceta y obtén recomendaciones en
          base ha como a ido evolucionando tu planta.
        </Text>

        <Skeleton isLoaded={!componentLoading} mt="2">
          <HStack mt="5">
            <Text>Lecturas recopiladas hasta ahora:</Text>
            <Text fontWeight={'bold'}>{modelInfo?.sensor_measurements}</Text>
          </HStack>
        </Skeleton>

        <Tooltip
          label={
            modelInfo?.training ?
            'Tu modelo está en progreso de entrenamiento, espera un momento hasta que se complete'
            :
            'No cumples con los requisitos para entrenar un modelo, necesitas al menos 300 lecturas y haber votado al menos con 2 estados diferentes'
          }
          bg="white"
          borderRadius={'xl'}
          color="black"
        >
          <Button
            colorScheme="purple"
            mt="2"
            isLoading={componentLoading}
            isDisabled={modelInfo?.can_train || modelInfo?.training}
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
            !modelInfo?.last_trained &&
            'No has entrenado aun ningún modelo'
          }
          bg="white"
          borderRadius={'xl'}
          color="black"
        >
        <Button
          colorScheme="green"
          isLoading={componentLoading}
          isDisabled={!modelInfo?.last_trained}
        >
          Obtener recomendaciones
        </Button>
        </Tooltip>
      </VStack>
    </GridItem>
  );
};

export default TrainModelBento;
