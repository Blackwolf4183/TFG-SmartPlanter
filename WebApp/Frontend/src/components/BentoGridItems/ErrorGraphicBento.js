import React, { useState, useEffect } from 'react';
import { GridItem, Text, VStack, Spinner } from '@chakra-ui/react';
import useAxios from '../../functions/axiosHook';
import Cookies from 'js-cookie';
import PieChartComponent from '../Graphics/PieChartComponent';

const ErrorGraphicBento = ({ colSpan, rowSpan }) => {
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
    <GridItem
      colSpan={colSpan}
      rowSpan={rowSpan}
      bg="card"
      h="408px"
      borderRadius={'10'}
      p="30px"
    >
      <Text fontSize="lg">Gráfica de errores </Text>

      {!loading && !error && data.errors ? (
        data.errors.length === 0 ? (
          <VStack>
            <Text mt="120px" pl="10" pr="10">
              No hay registro de errores
            </Text>
          </VStack>
        ) : (
          <PieChartComponent data={data.errors} />
        )
      ) : (
        <VStack>
          <Spinner size={'lg'} mt="120px" />
        </VStack>
      )}
    </GridItem>
  );
};

export default ErrorGraphicBento;
