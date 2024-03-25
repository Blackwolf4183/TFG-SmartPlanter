import React from 'react';
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
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

const LogToDeviceModal = ({ isOpen, onClose }) => {
  const requestResultToast = useToast();

  const [deviceID, setDeviceID] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleChangeDeviceID = e => {
    setDeviceID(e.target.value);
  };

  const handleChangePassword = e => {
    setPassword(e.target.value);
  };

  const handleSubmitDeviceCredentials = async () => {
    try {
      setIsLoading(true);
      // Get the JWT from the '_auth' cookie
      const jwt = Cookies.get('_auth');

      // Set up the Axios headers with the JWT as a bearer token
      const headers = {
        Authorization: `Bearer ${jwt}`,
      };

      const response = await axios.post(
        process.env.REACT_APP_BACKEND_URL + 'devices/link',
        {
          device_id: deviceID,
          device_password: password,
        },
        { headers }
      );

      if (response.status === 200) {
        //TODO: cerrar modal y siguiente etapa
        //TODO: escribir en las cookies el deviceId para que quede registrado y no vuelva a mostrar formulario
        console.log('Successful response'); // Handle successful response
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
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent p="5" bgColor={'white'} color="fontColor">
        <ModalHeader>Accede a tu planta</ModalHeader>
        <ModalBody color="fontColor">
          <HStack spacing="10">
            <VStack mb="10" align={'left'}>
              <Input
                placeholder="Device ID"
                mt="10"
                size="lg"
                w="200px"
                variant={'flushed'}
                borderColor={'fontColor'}
                autoComplete="off"
                _placeholder={{ color: 'rgba(87,104,95,0.47)' }}
                onChange={handleChangeDeviceID}
              />

              <Input
                placeholder="Contraseña"
                size="lg"
                w="200px"
                variant={'flushed'}
                type="password"
                borderColor={'fontColor'}
                autoComplete="off"
                _placeholder={{ color: 'rgba(87,104,95,0.47)' }}
                onChange={handleChangePassword}
              />

              <Button
                isLoading={isLoading}
                w="100px"
                colorScheme="green"
                mt="5"
                onClick={handleSubmitDeviceCredentials}
              >
                Comenzar
              </Button>
            </VStack>

            <Image mb="5" src="./HappyPlant2.png" />
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LogToDeviceModal;
