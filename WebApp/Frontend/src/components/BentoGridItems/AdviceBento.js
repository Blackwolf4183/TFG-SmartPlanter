import React,{useState,useEffect} from 'react';
import { Box, GridItem, HStack, Text, VStack, useToast } from '@chakra-ui/react';
import useAxios from '../../functions/axiosHook';
import Cookies from 'js-cookie';
import ErrorsSkeleton from '../skeletons/ErrorsSkeleton';

const AdviceBento = ({ colSpan, rowSpan }) => {
  const [url, setUrl] = useState('');

  const { data, loading, error } = useAxios(url);

  const [deviceId, setDeviceId] = useState(null);

  const [advice, setAdvice] = useState([])
  const [componentLoading, setComponentLoading] = useState(true)

  useEffect(() => {
    if(!loading && data !== null){
      setAdvice(data);
      setComponentLoading(false);
    }
  }, [loading, data])
  

  useEffect(() => {
    setTimeout(() => {
      //Get deviceId from cookies and make request by setting url with device_id param
      const userAuthDataString = Cookies.get('_auth_state');
      const { deviceId } = JSON.parse(userAuthDataString);

      setDeviceId(deviceId);

      setUrl(
        process.env.REACT_APP_BACKEND_URL + 'plants/advice?device_id=' + deviceId
      );
    }, 250);
  }, []);

  const requestResultToast = useToast();

  //Useffect for errors on request
  useEffect(() => {
    if (error && deviceId) {
      requestResultToast({
        title: 'Algo ha fallado intentando obtener los consejos.',
        status: 'error',
        isClosable: true,
      });
    }
  }, [error]);

  return (
    <GridItem
      colSpan={colSpan}
      rowSpan={rowSpan}
      bg="card"
      h="408px"
      borderRadius={'10'}
      p="30px"
    >
      <Text fontSize={'xl'}>Consejos</Text>
      <Box
        overflowY="auto"
        overflowX={'hidden'}
        maxHeight="310px"
        mt="2"
        pb="1"
        className="scrollable"
      >
        {/* Display data if it's not loading and no error */}
        {!componentLoading && !error &&  Array.isArray(advice) ? (
          <VStack w="100%" justify={'left'} mt="2" align="left">
            {advice.length === 0 ? (
              <VStack w="100%" h="100%">
                <Text mt="20">No hay consejos para tu planta</Text>
              </VStack>
            ) : (
              advice.map(adviceItem => {
                return (
                  <HStack
                    key={adviceItem.id}
                    h="auto"
                    p="2"
                    w="405px"
                    boxShadow={'rgba(0, 0, 0, 0.16) 0px 1px 4px;'}
                    borderRadius={10}
                  > 
                    <VStack align={'left'} spacing="1">
                      <Text fontSize={'14 px'} fontWeight={'medium'}>{adviceItem.guideType}</Text>
                      <Text  fontSize={'14px'} >
                        {adviceItem.description}
                      </Text>
                    </VStack>
                  </HStack>
                );
              })
            )}
          </VStack>
        ) : (
          // Display skeleton loader while loading
          <ErrorsSkeleton />
        )}
      </Box>
    </GridItem>
  );
};

export default AdviceBento;
