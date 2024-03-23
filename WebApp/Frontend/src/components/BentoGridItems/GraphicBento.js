import React,{useEffect,useState} from 'react'
import { Box, GridItem,HStack,Heading,Spacer,Text, VStack } from '@chakra-ui/react'
import ChartComponent from '../ChartComponent'
import useAxios from '../../functions/axiosHook'
import Cookies from 'js-cookie'

const GraphicBento = ({colSpan, rowSpan}) => {

  const [url, setUrl] = useState('')
  const [historicalData, setHistoricalData] = useState([])

  //Useffect to get cookies and make enpoint calls
  useEffect(() => {
    setTimeout(() => {
      //Get deviceId from cookies and make request by setting url with device_id param
      const userAuthDataString = Cookies.get('_auth_state');
      const { deviceId } = JSON.parse(userAuthDataString);

      setUrl(
        process.env.REACT_APP_BACKEND_URL +
          'plants/historical-data/?device_id=' +
          deviceId
      );
    },250)
  }, []);

  const { data, loading, error } = useAxios(url);
  
  useEffect(() => {
    if(!loading && data?.data){
      //Cleaning of data
      
      // Set date to JavaScript format in each data object
      const formattedData = data.data.map(item => {
        return {
          ...item,
          timestamp: new Date(item.timestamp)
        };
      });

      setHistoricalData(formattedData)
    }
  }, [data, loading])
  
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
        <Text fontSize={'xl'}>Estadísticas de tu planta</Text>
        <Spacer/>

      </HStack>
      <ChartComponent data={historicalData} />
    </GridItem>
  )
}

export default GraphicBento