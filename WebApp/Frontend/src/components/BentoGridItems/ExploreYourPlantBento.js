import { useState, useEffect } from 'react';
import {
  GridItem,
  Skeleton,
  Text,
  Box,
  SkeletonCircle,
  Image,
  VStack,
} from '@chakra-ui/react';
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

  const [isImageLoading, setIsImageLoading] = useState(true);

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

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
    if (plantInfoError) {
      //403 should not be logged as an error since it just means the user has to select a plant
      if (plantInfoError.response?.status === 403) {
        setPlantComponentInfoLoading(false);
      }
    }
  }, [plantInfoError]);

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
      h="408px"
      borderRadius={'10'}
      p="30px"
    >
      <Text fontSize={'xl'}>Conoce tu planta</Text>

      <VStack>
        <Box maxH={'190px'} overflowY={'scroll'} className="scrollable" pr="2">
          <Skeleton isLoaded={!plantInfoComponentLoading} mt="2.5">
            <Text>
              {plantInfo?.plantDescription ||
                'No se ha encontrado descripción para tu planta'}
            </Text>
          </Skeleton>
        </Box>

        <Box
          w="150px"
          h="150px"
          borderRadius="20px"
          overflow="hidden"
          backgroundColor="gray.200"
          mt="5"
          userSelect={"none"}
        >
          {plantInfoComponentLoading && (
            <SkeletonCircle
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          <Image
            src={plantInfoData?.imageUrl}
            alt={plantInfoData?.commonName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onLoad={handleImageLoad}
            display={isImageLoading ? 'none' : 'block'}
          />
        </Box>
      </VStack>
    </GridItem>
  );
};

export default ExploreYourPlantBento;
