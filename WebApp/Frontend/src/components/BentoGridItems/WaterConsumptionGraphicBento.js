import React, { useEffect, useState } from 'react';
import {
  GridItem,
  Text,
  VStack,
  Spinner,
  HStack,
  Spacer,
  Select,
} from '@chakra-ui/react';
import BarChartComponent from '../Graphics/BarChartComponent';

const WaterConsumptionGraphicBento = ({
  colSpan,
  rowSpan,
  historicalData,
  graphicsLoading,
}) => {
  const [graphicsHistoricalData, setGraphicsHistoricalData] = useState([]);

  useEffect(() => {
    if (historicalData) {
      //Filter out temperature as we don't want it for this graph
      const filteredData = historicalData.map(item => {
        const { temperature, ...rest } = item; // Use object destructuring to remove 'temperature'
        return rest; // Return the object without 'temperature'
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
      //Reset to the start of the day 
      currentDate.setHours(0, 0, 0, 0);

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
      minW={'850px'}
    >
      <HStack>
        <Text fontSize={'xl'}>Gráfico de riego</Text>
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
          <Spinner size={'lg'} mt="130px" />
        </VStack>
      ) : graphicsHistoricalData.length === 0 ? (
        <VStack>
          <Text mt="130px">
            No hay datos que mostrar, empieza a recolectar datos encendiendo tu
            maceta.
          </Text>
        </VStack>
      ) : (
        <BarChartComponent data={graphicsHistoricalData} />
      )}
    </GridItem>
  );
};

export default WaterConsumptionGraphicBento;
