import React, { useEffect, useState } from 'react';
import GeneralGraphicBento from './BentoGridItems/GeneralGraphicBento';
import useAxios from '../functions/axiosHook';
import Cookies from 'js-cookie';
import WaterConsumptionGraphicBento from './BentoGridItems/WaterConsumptionGraphicBento';
import TemperatureGraphicBento from './BentoGridItems/TemperatureGraphicBento';
import ErrorGraphicBento from './BentoGridItems/ErrorGraphicBento';

const GraphicsBentoWrapper = () => {
  const [url, setUrl] = useState('');
  const [historicalData, setHistoricalData] = useState([]);
  //Useffect to get cookies and make enpoint calls
  useEffect(() => {
    setTimeout(() => {
      //Get deviceId from cookies and make request by setting url with device_id param
      const userAuthDataString = Cookies.get('_auth_state');
      //TODO: if para evitar parse de undefined
      const { deviceId } = JSON.parse(userAuthDataString);

      setUrl(
        process.env.REACT_APP_BACKEND_URL +
          'plants/historical-data/?device_id=' +
          deviceId
      );
    }, 250);
  }, []);

  const { data, loading, error } = useAxios(url);
  const [graphicsLoading, setGraphicsLoading] = useState(true);

  useEffect(() => {
    if (!loading && data?.data) {

      // Set date to JavaScript format in each data object
      const formattedData = data.data.map(item => {
        return {
          ...item,
          timestamp: new Date(item.timestamp),
        };
      });

      setHistoricalData(formattedData);
      setGraphicsLoading(false)
    }
  }, [data, loading]);

  return (
    <>
      {/* THIRD ROW */}
      <GeneralGraphicBento colSpan={7} rowSpan={2} historicalData={historicalData} graphicsLoading={graphicsLoading}/>

      {/* FOURTH ROW */}
      <ErrorGraphicBento colSpan={3} rowSpan={2}/>
      <TemperatureGraphicBento colSpan={4} rowSpan={2} historicalData={historicalData} graphicsLoading={graphicsLoading}/>

      {/* FIFTH ROW */}
      <WaterConsumptionGraphicBento colSpan={7} rowSpan={2} historicalData={historicalData} graphicsLoading={graphicsLoading}/>

    </>
  );
};

export default GraphicsBentoWrapper;
