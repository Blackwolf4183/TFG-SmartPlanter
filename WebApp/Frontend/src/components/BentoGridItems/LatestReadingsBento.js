import React, { useEffect, useState } from 'react';
import {
  GridItem,
  HStack,
  Spacer,
  VStack,
  Box,
  Text,
  Center,
  useToast,
  Skeleton,
} from '@chakra-ui/react';
import { FaThermometerHalf, FaRegSun } from 'react-icons/fa';
import { RiPlantLine } from "react-icons/ri";
import useAxios from '../../functions/axiosHook';
import Cookies from 'js-cookie';

const LatestReadingsBento = ({ colSpan, rowSpan }) => {
  const [lastestDataUrl, setLastestDataUrl] = useState('');
  const [humidity, setHumidity] = useState('-');
  const [temperature, setTemperature] = useState('-');
  const [lightIntensity, setLightIntensity] = useState('-');
  const [lastUpdated, setLastUpdated] = useState('');
  const [deviceId, setDeviceId] = useState(null)

  const [componentLoading, setComponentLoading] = useState(true)

  const {
    data: lastestPlantData,
    loading: lastestPlantDataLoading,
    error: lastestPlantDataError,
  } = useAxios(lastestDataUrl);

  const requestResultToast = useToast();

  //Useffect for errors on request
  useEffect(() => {
    if(lastestPlantDataError && deviceId){
      requestResultToast({
        title: 'Algo ha fallado intentando obtener las últimas lecturas.',
        status: 'error',
        isClosable: true,
      })
    }
  }, [lastestPlantDataError])

  //Useffect to set latest plant data
  useEffect(() => {
    if (
      !lastestPlantDataLoading &&
      lastestPlantData?.data &&
      lastestPlantData.data.length > 0
    ) {
      const data = lastestPlantData.data[0];
      setHumidity(data.soilmoisture);
      setTemperature(data.temperature);
      setLightIntensity(data.lightlevel);

      const timestamp = new Date(data.timestamp);
      const now = new Date();
      const differenceInMinutes = Math.round((now - timestamp) / (1000 * 60));

      if (differenceInMinutes < 60) {
        setLastUpdated(`Actualizado hace ~${differenceInMinutes} min`);
      } else {
        const differenceInHours = Math.round(differenceInMinutes / 60);
        setLastUpdated(
          `Actualizado hace ~${differenceInHours} hora${
            differenceInHours > 1 ? 's' : ''
          }`
        );
      }

      setComponentLoading(false)
    }

    if (
      !lastestPlantDataLoading &&
      lastestPlantData?.data &&
      lastestPlantData.data.length == 0
    ) {
      setLastUpdated(`No hay datos recientes de tu planta`);
      setComponentLoading(false)
    }
  }, [lastestPlantData, lastestPlantDataLoading]);

  //Useffect to get cookies and make enpoint calls
  useEffect(() => {
    setTimeout(() => {
      //Get deviceId from cookies and make request by setting url with device_id param
      const userAuthDataString = Cookies.get('_auth_state');
      const { deviceId } = JSON.parse(userAuthDataString);

      setDeviceId(deviceId);

      setLastestDataUrl(
        process.env.REACT_APP_BACKEND_URL +
          'plants/latest-data/?device_id=' +
          deviceId
      );
    }, 250);
  }, []);

  return (
    <GridItem
      colSpan={colSpan}
      rowSpan={rowSpan}
      bg="card"
      h="272px"
      borderRadius={'10'}
      p="30px"
    >
      <VStack w="100%">
        <HStack w="100%">
          <Box
            w="48px"
            h="48px"
            borderRadius="100%"
            overflow="hidden"
            backgroundColor="gray.200"
          >
            <img
              src="./plantIllustration.png"
              alt="dummy plant"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>

          {/* TODO: falta enlazar la API de perenual */}
          <VStack align={'left'} spacing="0" pl="2">
            <Text fontWeight={'500'}>Aloe Vera</Text>
            <Text fontWeight={'light'} mt="-1">
              Aloe barbadensis miller
            </Text>
          </VStack>

          <Spacer />
          <Text fontWeight={'ligth'}>
            {componentLoading ? 'Actualizando...' : lastUpdated}
          </Text>
        </HStack>

        <HStack mt="5" spacing="15px">
          {/* Humidity box */}
          <VStack
            w="150px"
            h="125px"
            borderRadius={10}
            bgColor={'darkBg'}
            justify={'center'}
            spacing="0"
            pt="3"
          >
            <HStack w="100%" justify={'center'} spacing="1">
              <Box
                w="14px"
                h="14px"
                bgColor={'rgba(254,254,254,0.44)'}
                borderRadius={'100%'}
              />
              <Box
                w="21px"
                h="21px"
                bgColor={'rgba(254,254,254,0.44)'}
                borderRadius={'100%'}
              />
              <Box w="40px" h="40px" bgColor={'card'} borderRadius={'100%'}>
                <Center mt="2.5">
                  <RiPlantLine
                    style={{ color: '#35ab4d', width: '20px', height: '20px' }}
                  />
                </Center>
              </Box>
              <Box
                w="21px"
                h="21px"
                bgColor={'rgba(254,254,254,0.44)'}
                borderRadius={'100%'}
              />
              <Box
                w="14px"
                h="14px"
                bgColor={'rgba(254,254,254,0.44)'}
                borderRadius={'100%'}
              />
            </HStack>

            <Skeleton isLoaded={!componentLoading} mt="2">
              <Text
                color="white"
                fontWeight={'reegular'}
                fontSize={'15px'}
                
              >
                {humidity}%
              </Text>
            </Skeleton>
            <Text
              color="rgba(255,255,255,0.73)"
              fontWeight={'light'}
              fontSize={'14px'}
              mt="0"
            >
              Humedad
            </Text>
          </VStack>

          {/* Temperature box */}
          <VStack
            w="150px"
            h="125px"
            borderWidth={'2px'}
            borderRadius={10}
            borderColor={'rgba(219,219,219,0.56)'}
            pt="3"
            justify={'center'}
            spacing="0"
          >
            <HStack w="100%" justify={'center'} spacing="1">
              <Box w="35px" h="35px" bgColor={'card'} borderRadius={'100%'}>
                <Center mt="2.5">
                  <FaThermometerHalf
                    style={{ color: 'black', width: '20px', height: '20px' }}
                  />
                </Center>
              </Box>
            </HStack>

            <Skeleton isLoaded={!componentLoading} mt="2">
              <Text fontWeight={'regular'} fontSize={'15px'} >
                {temperature}º
              </Text>
            </Skeleton>
            <Text
              color="rgba(0,0,0,0.73)"
              fontWeight={'light'}
              fontSize={'14px'}
              mt="0"
            >
              Temperatura
            </Text>
          </VStack>

          {/* Light box */}
          <VStack
            w="150px"
            h="125px"
            borderWidth={'2px'}
            borderRadius={10}
            borderColor={'rgba(219,219,219,0.56)'}
            pt="3"
            justify={'center'}
            spacing="0"
          >
            <HStack w="100%" justify={'center'} spacing="1">
              <Box
                w="14px"
                h="14px"
                bgColor={'rgba(251,190,34,0.17)'}
                borderRadius={'100%'}
              />
              <Box
                w="21px"
                h="21px"
                bgColor={'rgba(251,190,34,0.17)'}
                borderRadius={'100%'}
              />
              <Box
                w="40px"
                h="40px"
                bgColor={'rgba(251,190,34,0.17)'}
                borderRadius={'100%'}
              >
                <Center mt="2.5">
                  <FaRegSun
                    style={{ color: '#FBBE22', width: '20px', height: '20px' }}
                  />
                </Center>
              </Box>
              <Box
                w="21px"
                h="21px"
                bgColor={'rgba(251,190,34,0.17)'}
                borderRadius={'100%'}
              />
              <Box
                w="14px"
                h="14px"
                bgColor={'rgba(251,190,34,0.17)'}
                borderRadius={'100%'}
              />
            </HStack>

            <Skeleton isLoaded={!componentLoading} mt="2">
              <Text fontWeight={'regular'} fontSize={'15px'} >
                {lightIntensity}%
              </Text>
            </Skeleton>
            <Text fontWeight={'light'} fontSize={'14px'} mt="0">
              Intensidad lumínica
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </GridItem>
  );
};

export default LatestReadingsBento;
