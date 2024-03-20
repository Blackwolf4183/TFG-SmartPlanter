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
import Cookies from 'js-cookie';
import WateringThresholdSlider from '../WateringThresholdSlider';
import WateringTimeSlider from '../WateringTimeSlider';
import WateringAmountSlider from '../WateringAmountSlider';

const WateringBento = ({ colSpan, rowSpan }) => {
  
  const [url, setUrl] = useState('');
  const [irrigationType, setIrrigationType] = useState("NONE")
  const [irrigationAmount, setIrrigationAmount] = useState(null)
  const [threshold, setThreshold] = useState(null)
  const [everyHours, setEveryHours] = useState(null)

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
      setThreshold(data.threshold)
      setEveryHours(data.everyHours)
    }
  }, [data, loading])
  

  //Useffect to get cookies and make enpoint calls
  useEffect(() => {
    setTimeout(() => {
      //Get deviceId from cookies and make request by setting url with device_id param
      const userAuthDataString = Cookies.get('_auth_state');
      const { deviceId } = JSON.parse(userAuthDataString);

      setUrl(
        process.env.REACT_APP_BACKEND_URL +
          'plants/irrigation/?device_id=' +
          deviceId
      );
    },250)
  }, []);

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
          <Text>Umbral de humedad</Text>
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
          <Text>Hora programada</Text>
        </HStack>

        <WateringTimeSlider disabled={irrigationType !== "PROGRAMMED"} everyHours={everyHours} updateEveryHours={updateEveryHours}/>

        <Text fontWeight={600} mt="25px">Cantidad de agua para riego:</Text>

        <WateringAmountSlider wateringAmount={irrigationAmount} updateIrrigationAmount={updateIrrigationAmount}/>

        {/* TODO: terminar request cuando se haga click en el boton */}
        <Button mt="5" colorScheme='blue'>Aplicar cambios</Button>
      </VStack>
    </GridItem>
  );
};

export default WateringBento;
