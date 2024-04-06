import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  GridItem,
  HStack,
  Spacer,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import useAxios from '../../functions/axiosHook';
import ErrorsSkeleton from '../skeletons/ErrorsSkeleton';
import Cookies from 'js-cookie';
import { formatDate } from '../../functions/utility.js';
import axios from 'axios';

const ErrorBento = ({ colSpan, rowSpan }) => {
  const [url, setUrl] = useState('');

  const { data, loading, error } = useAxios(url);

  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      //Get deviceId from cookies and make request by setting url with device_id param
      const userAuthDataString = Cookies.get('_auth_state');
      const { deviceId } = JSON.parse(userAuthDataString);

      setDeviceId(deviceId);

      setUrl(
        process.env.REACT_APP_BACKEND_URL + 'errors/?device_id=' + deviceId
      );
    }, 250);
  }, []);

  const requestResultToast = useToast();

  //Useffect for errors on request
  useEffect(() => {
    if (error && deviceId) {
      requestResultToast({
        title: 'Algo ha fallado intentando obtener los errores.',
        status: 'error',
        isClosable: true,
      });
    }
  }, [error,deviceId,requestResultToast]);

  const [isDeleteErrorButtonLoading, setIsDeleteErrorButtonLoading] = useState(false)

  const handleDeleteErrors = () => {
    setIsDeleteErrorButtonLoading(true);
  
    // Get the JWT from the '_auth' cookie
    const jwt = Cookies.get('_auth');
  
    // Set up the Axios headers with the JWT as a bearer token
    const headers = {
      Authorization: `Bearer ${jwt}`,
    };

    axios.delete(process.env.REACT_APP_BACKEND_URL + 'errors/?device_id=' + deviceId, { headers })
      .then(() => {
        requestResultToast({
          title: 'Se han eliminado correctamente los errores',
          status: 'success',
          isClosable: true,
        })
  
        setTimeout(() => {
          window.location.reload();
        }, 250);
      })
      .catch(() => {
        requestResultToast({
          title: 'Error al realizar la petición',
          status: 'error',
          isClosable: true,
        })
      })
      .finally(() => {
        setIsDeleteErrorButtonLoading(false);
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
      <HStack w="100%">
        <Text fontSize={'xl'}>Errores</Text>
        <Spacer/>
        <Button isLoading={isDeleteErrorButtonLoading} colorScheme='red' size={"sm"} onClick={handleDeleteErrors}>Limpiar errores</Button>
      </HStack>

      <Box
        overflowY="auto"
        overflowX={'hidden'}
        maxHeight="300px"
        mt="5"
        className="scrollable"
      >
        {/* Display data if it's not loading and no error */}
        {!loading && !error && data.errors ? (
          <VStack w="100%" justify={'left'} mt="2" align="left">
            {data.errors.length === 0 ? (
              <VStack w="100%" h="100%" >
                <Text mt="20">No hay registro de errores</Text>
              </VStack>
            ) : (
              data.errors.map(errorItem => {
                return (
                  <HStack
                    key={errorItem.id}
                    h="58px"
                    w="405px"
                    boxShadow={'rgba(0, 0, 0, 0.16) 0px 1px 4px;'}
                    borderRadius={10}
                  >
                    <Box
                      h="70%"
                      w="5px"
                      ml="2"
                      bgColor={'error'}
                      borderRadius={10}
                    />
                    <VStack align={'left'} spacing="1">
                      <Text fontSize={'14px'} fontWeight={'medium'}>
                        {errorItem.source +
                          ' at ' +
                          formatDate(errorItem.errortime)}
                      </Text>
                      <Text fontSize={'12px'} mt="-1">
                        {errorItem.errormessage}
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

export default ErrorBento;
