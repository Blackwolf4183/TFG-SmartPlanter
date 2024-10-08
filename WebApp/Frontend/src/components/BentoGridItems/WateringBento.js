import React,{useState,useEffect} from 'react';
import {
  GridItem,
  HStack,
  Text,
  VStack,
  Box,
  Button,
  Spacer,
} from '@chakra-ui/react';
import { ImDroplet } from 'react-icons/im';
import { FiClock } from 'react-icons/fi';
import useAxios from '../../functions/axiosHook';
import { useToast } from '@chakra-ui/react';
import Cookies from 'js-cookie';
import WateringThresholdSlider from '../Sliders/WateringThresholdSlider';
import WateringTimeSlider from '../Sliders/WateringTimeSlider';
import WateringAmountSlider from '../Sliders/WateringAmountSlider';
import axios from 'axios';

const WateringBento = ({ colSpan, rowSpan }) => {

  //Toast to showcase any possible errors from request
  const requestResultToast = useToast()

  const [url, setUrl] = useState('');
  const [deviceId, setDeviceId] = useState(null)
  const [irrigationType, setIrrigationType] = useState("NONE")
  const [irrigationAmount, setIrrigationAmount] = useState(100)
  const [threshold, setThreshold] = useState(30)
  const [everyHours, setEveryHours] = useState(5)

  const updateIrrigationAmount = (val) => {
    setIrrigationAmount(val)
  }

  const updateThreshold = (val) => {
    setThreshold(val)
  } 

  const updateEveryHours = (val) => {
    setEveryHours(val)
  }

  const { data, loading, error } = useAxios(url);
  
  useEffect(() => {
    if(!loading && data && data.irrigationType && (data.everyHours || data.threshold) && data.irrigationAmount){
      setIrrigationType(data.irrigationType)
      setIrrigationAmount(data.irrigationAmount)
      if(data.threshold) setThreshold(data.threshold)
      if(data.everyHours) setEveryHours(data.everyHours)
    }
  }, [data, loading])

  //Useffect for errors on request
  useEffect(() => {
    if(error && deviceId){
      requestResultToast({
        title: 'Algo ha fallado intentando obtener los datos de riego.',
        status: 'error',
        isClosable: true,
      })
    }
  }, [error, requestResultToast, deviceId])
  

  //Useffect to get cookies and make enpoint calls
  useEffect(() => {
    setTimeout(() => {
      //Get deviceId from cookies and make request by setting url with device_id param
      const deviceId = Cookies.get('deviceId');

      setDeviceId(deviceId);

      if (deviceId === undefined || deviceId === null || deviceId === 'null') return

      setUrl(
        process.env.REACT_APP_BACKEND_URL +
          'plants/irrigation/?device_id=' +
          deviceId
      );
    },250)
  }, []);

  //Irrigation submitting controls

  const [isIrrigationRequestLoading, setIsIrrigationRequestLoading] = useState(false)

  const submitIrrigation = () => {
    //Start irrigation request "loading"
    setIsIrrigationRequestLoading(true)

    //Get deviceId from cookies and make request by setting url with device_id param
    const deviceId = Cookies.get('deviceId');

    const irrigationRequestObject = {
      "deviceId": deviceId,
      "irrigationType": irrigationType,
      "threshold": threshold,
      "everyHours": everyHours,
      "irrigationAmount": irrigationAmount
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
    <GridItem
      colSpan={colSpan}
      rowSpan={rowSpan}
      bg="card"
      h="408px"
      borderRadius={'10'}
      p="30px"
    >
      <HStack>
        <Text fontSize={'xl'}>Riego</Text>
        <Spacer />
        <Text fontWeight={'light'} fontSize={'md'}>
          Elegir tipo de riego
        </Text>
      </HStack>

      <VStack mt="5" w="100%" align="left">
        <HStack spacing="5">
          <Box
            w="40px"
            h="40px"
            borderColor={irrigationType === "THRESHOLD" ? "blue.200": 'rgba(219,219,219,59)'}
            borderWidth={'2px'}
            pt="2"
            align="center"
            borderRadius={10}
            cursor={"pointer"}
            _hover={{
              bgColor:"gray.200",
              transition: "background-color 0.3s ease",
            }}
            onClick={() => setIrrigationType("THRESHOLD")}
          >
            <ImDroplet
              style={{ color: '#5EC0F6', width: '20px', height: '20px' }}
            />
          </Box>
          <Text>Umbral de humedad:</Text>
        </HStack>

        <WateringThresholdSlider disabled={irrigationType !== "THRESHOLD"} threshold={threshold} updateThreshold={updateThreshold}/>

        <HStack spacing="5" mt="5">
          <Box
            w="40px"
            h="40px"
            borderColor={irrigationType === "PROGRAMMED" ? "blue.200": 'rgba(219,219,219,59)'}
            borderWidth={'2px'}
            pt="2"
            align="center"
            borderRadius={10}
            cursor={"pointer"}
            _hover={{
              bgColor:"gray.200",
              transition: "background-color 0.3s ease",
            }}
            onClick={() => setIrrigationType("PROGRAMMED")}
          >
            <FiClock style={{ width: '20px', height: '20px' }} />
          </Box>
          <Text>Intervalo de riego: </Text>
        </HStack>

        <WateringTimeSlider disabled={irrigationType !== "PROGRAMMED"} everyHours={everyHours} updateEveryHours={updateEveryHours}/>

        <Text fontWeight={600} mt="25px">Cantidad de agua para riego:</Text>

        <WateringAmountSlider wateringAmount={irrigationAmount} updateIrrigationAmount={updateIrrigationAmount}/>

        <Button mt="5" colorScheme='blue' isLoading={isIrrigationRequestLoading} onClick={submitIrrigation}>Aplicar cambios</Button>
      </VStack>
    </GridItem>
  );
};

export default WateringBento;
