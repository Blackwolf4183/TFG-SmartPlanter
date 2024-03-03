import React, { useEffect, useState } from 'react';
import { Box, GridItem, HStack, Text, VStack } from '@chakra-ui/react';
import useAxios from '../../functions/axiosHook';
import ErrorsSkeleton from '../skeletons/ErrorsSkeleton';
import Cookies from 'js-cookie';
import {formatDate} from '../../functions/utility.js'

const ErrorBento = ({ colSpan, rowSpan }) => {
  const [url, setUrl] = useState('');

  const { data, loading, error } = useAxios(url);

  useEffect(() => {
    setTimeout(() => {
      //Get deviceId from cookies and make request by setting url with device_id param
      const userAuthDataString = Cookies.get('_auth_state');
      const { deviceId } = JSON.parse(userAuthDataString);

      setUrl(
        process.env.REACT_APP_BACKEND_URL + 'errors/?device_id=' + deviceId
      );
    }, 250);
  }, []);

  return (
    /* TODO: add custom scrollbar */
    <GridItem
      colSpan={colSpan}
      rowSpan={rowSpan}
      bg="card"
      h="272px"
      borderRadius={'10'}
      p="30px"
      overflow={"auto"}
      css={{
        '&::-webkit-scrollbar': {
          display: 'none', // Hide the scrollbar for WebKit browsers
        },
        '-ms-overflow-style': 'none', // Hide the scrollbar for IE and Edge
        'scrollbar-width': 'none', // Hide the scrollbar for Firefox
        overflow: 'auto', // Allow content to overflow
      }}
    >
      <Text fontSize={"xl"}>Errores</Text>

      {/* Display error message if an error occurs */}
      {error && (
        <Text color="red.500" mt={4}>
          Algo ha fallado intentando obtener los errores.
        </Text>
      )}
    
      {/* Display data if it's not loading and no error */}
      {!loading && !error && data.errors ? (
        <VStack w="100%" justify={'left'} mt="2" align="left">
          {data.errors.map(errorItem => {
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
                    {errorItem.source + " at " + formatDate(errorItem.errortime)}
                  </Text>
                  <Text fontSize={'12px'} mt="-1">
                    {errorItem.errormessage}
                  </Text>
                </VStack>
              </HStack>
            );
          })}
        </VStack>
      ) : (
        // Display skeleton loader while loading
        <ErrorsSkeleton />
      )}
    </GridItem>
  );
};

export default ErrorBento;
