import React, { useEffect, useState } from 'react';
import { Box, GridItem, HStack, Text, VStack } from '@chakra-ui/react';
import useAxios from '../../functions/axiosHook';
import ErrorsSkeleton from '../skeletons/ErrorsSkeleton';
import Cookies from 'js-cookie';

const ErrorBento = ({ colSpan, rowSpan }) => {
  const [url, setUrl] = useState('');

  const { data, loading, error } = useAxios(url);

  useEffect(() => {
    setTimeout(() => {
      //Get deviceId from cookies and make request by setting url with device_id param
      const userAuthDataString = Cookies.get('_auth_state');
      const { deviceId } = JSON.parse(userAuthDataString);

      setUrl(process.env.REACT_APP_BACKEND_URL + 'errors/?device_id=' + deviceId);
    }, 250);

  }, []);

  return (
    <GridItem
      colSpan={colSpan}
      rowSpan={rowSpan}
      bg="card"
      h="240px"
      borderRadius={'10'}
      p="30px"
    >
      <Text>Errores</Text>

      {!loading && data ? (
        <VStack w="100%" justify={'left'} mt="2" align="left">
          <HStack
            h="50px"
            w="360px"
            boxShadow={'rgba(0, 0, 0, 0.16) 0px 1px 4px;'}
            borderRadius={10}
          >
            <Box h="70%" w="5px" ml="2" bgColor={'error'} borderRadius={10} />
            <VStack align={'left'} spacing="0">
              <Text fontSize={'10px'} fontWeight={'medium'}>
                Error en el sensor de Humedad
              </Text>
              <Text fontSize={'10px'} mt="-1">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit
              </Text>
            </VStack>
          </HStack>
        </VStack>
      ) : (
        <ErrorsSkeleton />
      )}
    </GridItem>
  );
};

export default ErrorBento;
