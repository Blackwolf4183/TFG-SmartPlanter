import React, { useRef,useState } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  useToast,
  background
} from '@chakra-ui/react';
import Cookies from 'js-cookie';
import axios from 'axios';

const ChangePlantConfirmationModalAlert = ({isOpen, onClose, deviceId, plantId, setHasSelectedPlant}) => {
  const cancelRef = useRef();
  const requestResultToast = useToast();

  const [isLoading, setIsLoading] = useState(false);

  const  handleSubmitPlant = async () => {
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
    
    //Close the modal
    onClose();
  }

  return (

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        motionPreset='slideInBottom'
        isCentered
        size={"sm"}
        color="fontColor"
      >
        <AlertDialogOverlay>
          <AlertDialogContent bgColor={'white'} color="fontColor">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Cambiar planta
            </AlertDialogHeader>

            <AlertDialogBody>
              Si cambias de planta, los datos anteriores que hayas recopilado serán eliminados. 
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} colorScheme='black'>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleSubmitPlant} ml={3} isLoading={isLoading}>
                Continuar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
  );
};

export default ChangePlantConfirmationModalAlert;
