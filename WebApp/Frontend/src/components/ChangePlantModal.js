import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Input,
  VStack,
  Box,
  useToast,
  InputGroup,
  InputLeftElement,
  Spinner,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import useAxios from '../functions/axiosHook';
import { GoSearch } from 'react-icons/go';
import PlantCard from './PlantCard';

const ChangePlantModal = ({ isOpen, onClose, setHasSelectedPlant }) => {
  const requestResultToast = useToast();

  //Selected plantId
  const [plantId, setPlantId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  //Request for plants data
  const [url, setUrl] = useState('');
  const { data, loading } = useAxios(url);
  const [deviceId, setDeviceId] = useState(null);
  const [isPlantDataLoading, setIsPlantDataLoading] = useState(true);

  const [filteredPlantData, setFilteredPlantData] = useState([]);

  //Get deviceId and set url
  useEffect(() => {
    setTimeout(() => {
      //Get deviceId from cookies and make request by setting url with device_id param
      const deviceId = Cookies.get('deviceId');

      setDeviceId(deviceId);
      
      if (deviceId === undefined || deviceId === null || deviceId === 'null') return
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

    if(plantId === null){
      requestResultToast({
        title: "No has seleccionado una planta",
        status: 'warning',
        isClosable: true,
      });

      return;
    }

    try {
      setIsLoading(true);

      // Get the JWT from the '_auth' cookie
      const jwt = Cookies.get('_auth');

      // Set up the Axios headers with the JWT as a bearer token
      const headers = {
        Authorization: `Bearer ${jwt}`,
      };

      const response = await axios.post(
        process.env.REACT_APP_BACKEND_URL + `plants?device_id=${deviceId}&plant_id=${plantId}`, 
        {},
        { headers }
      );

      if (response.status === 200 || response.status === 201) {

        setHasSelectedPlant(true);

        //Show successful change
        requestResultToast({
          title: "Se ha cambiado la planta exitósamente",
          status: 'success',
          isClosable: true,
        });

        setTimeout(() => {
          
          requestResultToast({
            title: "Se ha aplicado un riego adecuado a tu planta, puedes modificarlo en la caja de \"Riego\"",
            status: 'info',
            isClosable: true,
          });

        }, 150);

      }
    } catch (err) {
      requestResultToast({
        title: "Ha ocurrido un error intentando seleccionar tu planta",
        status: 'error',
        isClosable: true,
      });
    }

    setIsLoading(false);
  };

  //Set selected plant with usestate
  const selectPlant = (id) => {
    setPlantId(id);
  }

  //Update search when something is being written on input
  const handleSearchChange = (event) => {
    if(data){
      const filteredResults = data.filter(plant =>
        plant.commonName.toLowerCase().includes(event.target.value) ||
        plant.scientificName.toLowerCase().includes(event.target.value)
      );

      setFilteredPlantData(filteredResults);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent p="5" bgColor={'white'} color="fontColor">
        <ModalHeader>Escoge tu especie de planta</ModalHeader>
        <ModalCloseButton />
        <ModalBody color="fontColor">
          <VStack mb="10">
            <InputGroup>
              <Input
                type="text"
                placeholder="Elige una especie de planta"
                border="2px solid"
                borderColor={'blackAlpha.300'}
                _hover={{ border: '2px solid blackAlpha.800' }}
                bg="white" 
                borderRadius="lg" 
                pl="40px" 
                onChange={handleSearchChange}
              />
              <InputLeftElement pointerEvents="none" ml="2">
                <GoSearch style={{ width: '20px', height: '20px' }} />
              </InputLeftElement>
            </InputGroup>
            {/* Container of plants */}
            <Box
              maxH={'500px'}
              overflowY={'scroll'}
              className="scrollable"
              p="5"
            >
              {!isPlantDataLoading && Array.isArray(filteredPlantData) ? (
                filteredPlantData.map(plant => <PlantCard plant={plant} key={plant.plantId} selectPlant={selectPlant} plantId={plantId}/>)
              ) : (
                <Spinner />
              )}
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
