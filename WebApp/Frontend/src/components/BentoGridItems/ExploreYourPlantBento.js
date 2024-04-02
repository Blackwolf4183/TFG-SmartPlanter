import { useState, useEffect } from 'react';
import { GridItem, Skeleton, Text, Box } from '@chakra-ui/react';
import useAxios from '../../functions/axiosHook';
import Cookies from 'js-cookie';

const ExploreYourPlantBento = ({ colSpan, rowSpan }) => {
  //Plant info url
  const [plantInfoUrl, setPlantInfoUrl] = useState('');

  //Loading variables
  const [plantInfoComponentLoading, setPlantComponentInfoLoading] =
    useState(true);

  //Plant info variables
  const [plantInfo, setPlantInfo] = useState(null);

  const {
    data: plantInfoData,
    loading: plantInfoLoading,
    error: plantInfoError,
  } = useAxios(plantInfoUrl);

  //Useffect to get cookies and make enpoint calls
  useEffect(() => {
    setTimeout(() => {
      //Get deviceId from cookies and make request by setting url with device_id param
      const userAuthDataString = Cookies.get('_auth_state');
      const { deviceId } = JSON.parse(userAuthDataString);

      setPlantInfoUrl(
        process.env.REACT_APP_BACKEND_URL + 'plants/info/?device_id=' + deviceId
      );
    }, 250);
  }, []);

  useEffect(() => {
    if(plantInfoError){
      //403 should not be logged as an error since it just means the user has to select a plant
      if(plantInfoError.response?.status === 403){
        setPlantComponentInfoLoading(false);
      }
    }
  }, [plantInfoError])

  //Useffect to set plant info
  useEffect(() => {
    if (!plantInfoLoading && plantInfoData?.plantDescription) {
      setPlantInfo(plantInfoData);
      setPlantComponentInfoLoading(false);
    }
  }, [plantInfoData, plantInfoLoading]);

  return (
    <GridItem
      colSpan={colSpan}
      rowSpan={rowSpan}
      bg="card"
      h="272px"
      borderRadius={'10'}
      p="30px"
    >
      <Text fontSize={'xl'}>Conoce tu planta</Text>

      <Box maxH={'190px'} overflowY={'scroll'} className="scrollable" pr="2">
        <Skeleton isLoaded={!plantInfoComponentLoading} mt="2.5">
          <Text>
            {plantInfo?.plantDescription || 'No se ha encontrado descripción para tu planta'}
          </Text>
        </Skeleton>
      </Box>
    </GridItem>
  );
};

export default ExploreYourPlantBento;
