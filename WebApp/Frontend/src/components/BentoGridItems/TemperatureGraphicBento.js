import React, { useState, useEffect } from 'react';
import { GridItem, Text, VStack, Spinner,HStack,Spacer,Select } from '@chakra-ui/react';
import TemperatureChartComponent from '../Graphics/TemperatureChartComponent';

const TemperatureGraphicBento = ({
  colSpan,
  rowSpan,
  historicalData,
  graphicsLoading,
}) => {
  const [graphicsHistoricalData, setGraphicsHistoricalData] = useState([]);

  useEffect(() => {
    if (historicalData) {
      //Get object with only temperature and timestamp
      const filteredData = historicalData.map(item => {
        const {
          soilmoisture,
          airhumidity,
          irrigationamount,
          lightlevel,
          ...rest
        } = item; // Use object destructuring to get 'temperature' and timestamp
        return rest;
      });

      setGraphicsHistoricalData(filteredData);
    }
  }, [historicalData]);

  const filterDataByTime = event => {
    // Get the current date
    const currentDate = new Date();

    if (event.target.value === 'WEEK') {
      // Get the date one week ago
      const oneWeekAgo = new Date(currentDate);
      oneWeekAgo.setDate(currentDate.getDate() - 7);

      setGraphicsHistoricalData(
        historicalData.filter(item => item.timestamp >= oneWeekAgo)
      );
    } else if (event.target.value === 'TODAY') {
      setGraphicsHistoricalData(
        historicalData.filter(item => item.timestamp >= currentDate)
      );
    } else if (event.target.value === 'ALL') {
      setGraphicsHistoricalData(historicalData);
    }
  };

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
        <Text fontSize={'lg'}>Temperatura</Text>
        <Spacer />
        <Select
          w="150px"
          placeholder="Ordenar por:"
          variant="unstyled"
          fontWeight={400}
          onChange={filterDataByTime}
        >
          <option value="TODAY">Hoy</option>
          <option value="WEEK">Última semana</option>
          <option value="ALL">Todo</option>
        </Select>
      </HStack>

      {graphicsLoading ? (
        <VStack>
          <Spinner size={'lg'} mt="80px" />
        </VStack>
      ) : graphicsHistoricalData.length === 0 ? (
        <VStack pl="5" pr="5">
          <Text mt="120px">
            No hay datos que mostrar, empieza a recolectar datos encendiendo tu
            maceta.
          </Text>
        </VStack>
      ) : (
        <TemperatureChartComponent data={graphicsHistoricalData} />
      )}
    </GridItem>
  );
};

export default TemperatureGraphicBento;
