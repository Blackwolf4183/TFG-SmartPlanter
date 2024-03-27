import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Image,
  ModalBody,
  Button,
  Input,
  VStack,
  HStack,
  Box,
  useToast,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  Text,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import useAxios from '../functions/axiosHook';
import { GoSearch } from 'react-icons/go';

const ChangePlantModal = ({ isOpen, onClose }) => {
  const requestResultToast = useToast();

  //Selected plantId
  const [plantId, setPlantId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  //Request for plants data
  const [url, setUrl] = useState('');
  const { data, loading, error } = useAxios(url);
  const [deviceId, setDeviceId] = useState(null);
  const [isPlantDataLoading, setIsPlantDataLoading] = useState(true);

  const [filteredPlantData, setFilteredPlantData] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      //Get deviceId from cookies and make request by setting url with device_id param
      const userAuthDataString = Cookies.get('_auth_state');
      const { deviceId } = JSON.parse(userAuthDataString);

      setDeviceId(deviceId);

      //Set url to retireve plant data
      setUrl(process.env.REACT_APP_BACKEND_URL + 'plants/info/list');
    }, 250);
  }, []);

  useEffect(() => {
    if (!loading && data) {
      setFilteredPlantData(data);
      setIsPlantDataLoading(false);
    }
  }, [data, loading]);

  const handleSubmitPlant = async () => {
    try {
      setIsLoading(true);
      // Get the JWT from the '_auth' cookie
      const jwt = Cookies.get('_auth');

      // Set up the Axios headers with the JWT as a bearer token
      const headers = {
        Authorization: `Bearer ${jwt}`,
      };

      const response = await axios.post(
        process.env.REACT_APP_BACKEND_URL + 'plants',
        { headers }
      );

      if (response.status === 200 || response.status === 201) {
        //TODO: handle successful response
      }
    } catch (err) {
      console.error('Error occurred:', err);
      if (err && err instanceof AxiosError) {
        if (err.response?.data?.message)
          requestResultToast({
            title: err.response.data.message,
            status: 'error',
            isClosable: true,
          });
        else {
          requestResultToast({
            title: err.message,
            status: 'error',
            isClosable: true,
          });
        }
      } else if (err && err instanceof Error) {
        requestResultToast({
          title: err.message,
          status: 'error',
          isClosable: true,
        });
      }
    }

    setIsLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent p="5" bgColor={'white'} color="fontColor">
        <ModalHeader>Escoje tu especie de planta</ModalHeader>
        <ModalBody color="fontColor">
          <VStack mb="10">
            <InputGroup>
              <Input
                type="text"
                placeholder="Elige una especie de planta"
                border="2px solid"
                borderColor={'blackAlpha.300'}
                _hover={{ border: '2px solid blackAlpha.800' }}
                bg="white" // Set background color
                borderRadius="lg" // Apply border radius
                pl="40px" // Add padding for icon
              />
              <InputLeftElement pointerEvents="none" ml="2">
                <GoSearch style={{ width: '20px', height: '20px' }} />
              </InputLeftElement>
            </InputGroup>
            {/* Container of plants */}
            <Box maxH={"500px"} overflowY={"scroll"} className='scrollable' p="5">
              {filteredPlantData.map((plant, index) => (
                <HStack
                  key={index}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="gray.200"
                  p="4"
                  w="300px"
                  boxShadow="md"
                  alignItems="center"
                  mb="4"
                  spacing={"5"}
                  bgColor={"white"}
                >
                  <Box borderRadius="full" overflow="hidden" w="70px" h="70px">
                    <Image
                      src={plant.imageUrl}
                      alt={plant.commonName}
                      w="70px" // Fixed width
                      h="70px" // Fixed height
                      objectFit="cover" // Ensure the entire image is visible
                    />
                  </Box>
                  <VStack spacing="1" align={"left"}>
                    <Text fontWeight="bold">{plant.commonName}</Text>
                    <Text>{plant.scientificName}</Text>
                  </VStack>
                </HStack>
              ))}
            </Box>
            ;
            <Button
              isLoading={isLoading}
              w="100px"
              colorScheme="green"
              mt="5"
              onClick={handleSubmitPlant}
            >
              Seleccionar
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ChangePlantModal;
