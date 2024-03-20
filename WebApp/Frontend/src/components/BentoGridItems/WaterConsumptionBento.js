import React, { useEffect, useState } from 'react';
import {
  Center,
  Flex,
  GridItem,
  Text,
  VStack,
  Skeleton
} from '@chakra-ui/react';
import { ImDroplet } from 'react-icons/im';
import useAxios from '../../functions/axiosHook';
import Cookies from 'js-cookie';

const AverageIntake = ({ colSpan, rowSpan }) => {
  
  const [url, setUrl] = useState('');
  const [consumption, setConsumption] = useState("-L / día")
  const [componentLoading, setComponentLoading] = useState(true)

  const { data, loading, error } = useAxios(url);
  
  //Useffect to set consumption 
  useEffect(() => {
    if(!loading && data?.consumption){

      let consumptionValue = data.consumption / 1000 
      consumptionValue = consumptionValue.toFixed(2)
      setConsumption(consumptionValue + "L / día")
      setComponentLoading(false)
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
          'plants/daily-consumption/?device_id=' +
          deviceId
      );
    },250)
  }, []);
  
  return (
    <GridItem
      colSpan={colSpan}
      rowSpan={rowSpan}
      bg="card"
      h="272px"
      borderRadius={'10'}
    >
      <Center>
        <VStack spacing="5" mt="40px">
          <Text  fontWeight={500} fontSize={'xl'} textAlign={"center"}>
            Consumo <br /> actual
          </Text>
          
          <Skeleton isLoaded={!componentLoading}>
            <Text fontSize={'2xl'} fontWeight={700}>
              {consumption}
            </Text>
          </Skeleton>
          <Flex
            w="60px"
            h="60px"
            borderRadius={'100%'}
            borderWidth={'2px'}
            borderColor={'rgba(219,219,219,59)'}
            alignContent={'center'}
            justifyContent={'center'}
          >
            <Center>
              <ImDroplet
                style={{ color: '#5EC0F6', width: '25px', height: '25px' }}
              />
            </Center>
          </Flex>
        </VStack>
      </Center>
    </GridItem>
  );
};

export default AverageIntake;
